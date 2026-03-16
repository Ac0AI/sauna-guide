#!/usr/bin/env node

/**
 * Deep-enrich brands with comprehensive buyer content.
 * Overwrites thin existing content with richer, more specific data.
 *
 * Usage:
 *   node --env-file=.env.local scripts/deep-enrich-brands.mjs
 *   node --env-file=.env.local scripts/deep-enrich-brands.mjs --slug harvia
 *   node --env-file=.env.local scripts/deep-enrich-brands.mjs --limit 3
 */

import fs from 'node:fs'
import Anthropic from '@anthropic-ai/sdk'
import { scrapeUrl } from './lib/apify.mjs'
import { scoreBrand } from './lib/scoring.mjs'

const BRANDS_PATH = 'src/data/manufacturers.json'
const client = new Anthropic()

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function parseArgs() {
  const args = process.argv.slice(2)
  const get = (name) => {
    const idx = args.indexOf(`--${name}`)
    return idx !== -1 ? args[idx + 1] : undefined
  }
  return {
    slug: get('slug'),
    limit: get('limit') ? parseInt(get('limit'), 10) : undefined,
    dryRun: args.includes('--dry-run'),
  }
}

const systemPrompt = `You are a sauna industry expert writing for an independent buying guide website.
Write detailed, honest, buyer-focused content.

RULES:
- Be specific — mention actual product names, price ranges, materials
- Include honest weaknesses — every brand has them
- Write for someone deciding between this brand and alternatives
- Each text field should be 2-4 substantive sentences
- Strengths must be specific facts, not marketing language
- Weaknesses must be real limitations buyers care about (availability, price, support gaps)
- cautionPoints: things to verify before purchasing
- keyModels: include a brief 5-10 word description for each model
- Output valid JSON only, no markdown wrapping`

async function deepEnrichBrand(brand) {
  let siteContent = ''
  if (brand.website) {
    try {
      const pages = await scrapeUrl(brand.website, { maxPages: 5 })
      siteContent = pages.map((p) => p.text.slice(0, 2000)).join('\n\n---\n\n')
    } catch (err) {
      console.log(`    Scrape failed: ${err.message}`)
    }
  }

  const res = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
    max_tokens: 2048,
    temperature: 0.2,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Brand: ${brand.name}
Country: ${brand.country} | Founded: ${brand.founded || 'unknown'} | Type: ${brand.type}
Products: ${brand.products.join(', ')}
Market: ${brand.market}

${siteContent ? '## Website content:\n' + siteContent.slice(0, 4000) : ''}

Write comprehensive buyer content as JSON:
{
  "unique_angle": "2-3 sentence positioning — what makes this brand genuinely different",
  "notes": "3-4 sentence overview with specific details about history, approach, reputation in the market",
  "priceTier": "budget | mid-range | premium | luxury",
  "bestFor": "2-3 sentences — specific buyer profiles this brand serves best, with examples",
  "buyerVerdict": "3-4 sentence honest editorial verdict — who should buy, who shouldn't, main trade-offs",
  "strengths": ["5 specific strengths with details"],
  "weaknesses": ["3-4 honest weaknesses or real limitations"],
  "cautionPoints": ["2-3 things buyers should verify or watch out for before purchasing"],
  "keyModels": ["4-6 entries like: 'ModelName — brief description'"],
  "supportWarranty": "2-3 sentences about warranty terms, dealer network, customer support reputation"
}`,
    }],
  })

  const text = res.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')

  const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) || [null, text]
  return JSON.parse(match[1].trim())
}

async function main() {
  const opts = parseArgs()
  const data = JSON.parse(fs.readFileSync(BRANDS_PATH, 'utf-8'))
  let brands = data.manufacturers.map((b) => ({ ...b, slug: slugify(b.name) }))

  if (opts.slug) {
    brands = brands.filter((b) => b.slug === opts.slug)
    if (brands.length === 0) {
      console.error(`Brand "${opts.slug}" not found.`)
      process.exit(1)
    }
  }

  if (opts.limit) brands = brands.slice(0, opts.limit)

  console.log(`\nDeep enriching ${brands.length} brands...\n`)

  for (const brand of brands) {
    const before = scoreBrand(brand)
    process.stdout.write(`  ${brand.name} (${before.score}/100)...`)

    try {
      const enriched = await deepEnrichBrand(brand)

      // Find original in data and overwrite with richer content
      const idx = data.manufacturers.findIndex((b) => slugify(b.name) === brand.slug)
      if (idx === -1) continue

      const target = data.manufacturers[idx]
      for (const key of ['unique_angle', 'notes', 'priceTier', 'bestFor', 'buyerVerdict', 'supportWarranty']) {
        if (enriched[key]) target[key] = enriched[key]
      }
      for (const key of ['strengths', 'weaknesses', 'cautionPoints', 'keyModels']) {
        if (enriched[key]?.length) target[key] = enriched[key]
      }

      target.enrichment = target.enrichment || {}
      target.enrichment.lastVerified = new Date().toISOString().split('T')[0]
      target.enrichment.status = 'reviewed'
      target.enrichment.qualityScore = scoreBrand(target).score

      console.log(` -> ${target.enrichment.qualityScore}/100`)
    } catch (err) {
      console.log(` ERROR: ${err.message.slice(0, 80)}`)
    }
  }

  if (!opts.dryRun) {
    fs.writeFileSync(BRANDS_PATH, JSON.stringify(data, null, 2) + '\n')
    console.log(`\nSaved to ${BRANDS_PATH}`)
  }
}

main().catch((err) => {
  console.error(`Deep enrichment failed: ${err.message}`)
  process.exit(1)
})
