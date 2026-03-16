#!/usr/bin/env node

/**
 * Curate gear: remove irrelevant products, enrich remaining with buyer content.
 */

import fs from 'node:fs'
import Anthropic from '@anthropic-ai/sdk'

const GEAR_PATH = 'src/data/gear-merged.json'
const client = new Anthropic()

// Products to REMOVE — not sauna-relevant enough
const REMOVE_SLUGS = new Set([
  // Tracking & Wearables — biohacker gear, not sauna gear
  'oura-ring-4',
  'whoop-4-0',
  'sauna-tracker-app',
  'athlytic-app',
  // Recovery Tools — general fitness, not sauna-specific
  'theragun-prime',
  'theragun-pro-plus',
  'hypervolt',
  // Red Light — separate category, not sauna gear
  'mitopro-1500-plus',
  'joovv-solo',
  'hooga-hg300',
  // Infrared Blankets — not really sauna gear
  'higherdose-infrared-blanket',
  'mihigh-infrared-blanket',
  'sunlighten-solo-system',
  // Tech — generic speakers and lights
  'ultimate-ears-wonderboom-2',
  'bose-soundlink-micro',
  'ip68-led-strip-lights',
  'himalayan-salt-lamp',
])

// Categories to REMOVE entirely
const REMOVE_CATEGORIES = new Set([
  'tracking',
  'recovery',
  'red-light',
  'infrared',
  'tech',
])

const systemPrompt = `You are a sauna gear expert writing for an independent buying guide.
Write honest, specific product descriptions for sauna enthusiasts.

RULES:
- Be specific about materials, dimensions, use cases
- Include honest downsides
- Write for someone choosing between similar products
- Output valid JSON only`

async function enrichProduct(product, category) {
  const res = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
    max_tokens: 1024,
    temperature: 0.2,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Product: ${product.name} by ${product.brand}
Category: ${category}
Price: ${product.price}
Current description: ${product.description}
Current why: ${product.why}
Specs: ${JSON.stringify(product.specs || {})}

Write enriched product content as JSON:
{
  "description": "2-3 sentence product description with specific details",
  "richDescription": "3-4 sentence detailed description including materials, dimensions, standout features",
  "why": "1 sentence — the main reason to buy this",
  "whyNot": "1 sentence — main reason to skip or look elsewhere",
  "bestFor": "who this product is ideal for",
  "avoidIf": "who should pick something else",
  "whyPeopleLikeIt": "what real users praise most"
}`,
    }],
  })

  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('')
  const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) || [null, text]
  return JSON.parse(match[1].trim())
}

async function main() {
  const data = JSON.parse(fs.readFileSync(GEAR_PATH, 'utf-8'))

  // Step 1: Remove irrelevant categories and products
  const beforeCount = data.categories.reduce((sum, c) => sum + c.products.length, 0)

  data.categories = data.categories.filter((c) => !REMOVE_CATEGORIES.has(c.id))

  for (const cat of data.categories) {
    cat.products = cat.products.filter((p) => !REMOVE_SLUGS.has(p.slug))
  }

  // Remove empty categories
  data.categories = data.categories.filter((c) => c.products.length > 0)

  const afterCount = data.categories.reduce((sum, c) => sum + c.products.length, 0)
  console.log(`Curated: ${beforeCount} -> ${afterCount} products (removed ${beforeCount - afterCount})`)

  // Step 2: Enrich remaining products that lack rich content
  let enriched = 0
  for (const cat of data.categories) {
    console.log(`\n${cat.name} (${cat.products.length} products):`)
    for (const product of cat.products) {
      const needsEnrich = !product.whyNot || !product.bestFor || !product.richDescription
      if (!needsEnrich) {
        console.log(`  ${product.name} — already rich`)
        continue
      }

      process.stdout.write(`  ${product.name}...`)
      try {
        const content = await enrichProduct(product, cat.name)
        if (content.description) product.description = content.description
        if (content.richDescription) product.richDescription = content.richDescription
        if (content.why) product.why = content.why
        if (content.whyNot) product.whyNot = content.whyNot
        if (content.bestFor) product.bestFor = content.bestFor
        if (content.avoidIf) product.avoidIf = content.avoidIf
        if (content.whyPeopleLikeIt) product.whyPeopleLikeIt = content.whyPeopleLikeIt
        enriched++
        console.log(' OK')
      } catch (err) {
        console.log(` ERROR: ${err.message.slice(0, 60)}`)
      }
    }
  }

  data.totalProducts = afterCount
  data.lastUpdated = new Date().toISOString().split('T')[0]

  fs.writeFileSync(GEAR_PATH, JSON.stringify(data, null, 2) + '\n')
  console.log(`\nDone: ${enriched} products enriched, ${afterCount} total`)
  console.log(`Saved to ${GEAR_PATH}`)
}

main().catch((err) => {
  console.error(`Curation failed: ${err.message}`)
  process.exit(1)
})
