#!/usr/bin/env node

/**
 * Enrich brand (manufacturer) pages with buyer-relevant data.
 *
 * Usage:
 *   node --env-file=.env.local scripts/enrich-brands.mjs
 *   node --env-file=.env.local scripts/enrich-brands.mjs --slug harvia
 *   node --env-file=.env.local scripts/enrich-brands.mjs --limit 3
 *   node --env-file=.env.local scripts/enrich-brands.mjs --dry-run
 */

import fs from 'node:fs'
import { scrapeUrl } from './lib/apify.mjs'
import { normalizeBrandData } from './lib/llm.mjs'
import { scoreBrand } from './lib/scoring.mjs'

const BRANDS_PATH = 'src/data/manufacturers.json'
const LOG_PATH = 'src/data/enrichment-log-brands.json'

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
    skipLlm: args.includes('--skip-llm'),
    help: args.includes('--help'),
  }
}

async function collectBrandSources(brand) {
  const sources = []

  if (brand.website) {
    try {
      console.log(`    Scraping: ${brand.website}`)
      const pages = await scrapeUrl(brand.website, { maxPages: 5 })
      for (const page of pages) {
        sources.push({
          url: page.url,
          label: 'Official website',
          text: page.text,
          fetchedAt: page.fetchedAt,
        })
      }
    } catch (err) {
      console.log(`    Scrape failed: ${err.message}`)
    }
  }

  return sources
}

function mergeBrandEnrichment(existing, enriched, sources) {
  const merged = { ...existing }

  for (const key of ['priceTier', 'bestFor', 'supportWarranty', 'buyerVerdict']) {
    if (enriched[key] && !existing[key]) {
      merged[key] = enriched[key]
    }
  }

  for (const key of ['cautionPoints', 'strengths', 'weaknesses', 'keyModels']) {
    if (enriched[key]?.length > 0 && (!existing[key] || existing[key].length === 0)) {
      merged[key] = enriched[key]
    }
  }

  merged.enrichment = {
    sources: sources.map((s) => ({ url: s.url, label: s.label, fetchedAt: s.fetchedAt })),
    lastVerified: new Date().toISOString().split('T')[0],
    qualityScore: scoreBrand(merged).score,
    status: 'enriched',
  }

  return merged
}

async function main() {
  const opts = parseArgs()

  if (opts.help) {
    console.log('Usage: node --env-file=.env.local scripts/enrich-brands.mjs [--slug <slug>] [--limit <n>] [--dry-run] [--skip-llm]')
    process.exit(0)
  }

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

  console.log(`\nEnriching ${brands.length} brands...`)

  const log = []

  for (const brand of brands) {
    const before = scoreBrand(brand)
    console.log(`\n  ${brand.name} (score: ${before.score}/100)`)

    const sources = await collectBrandSources(brand)
    console.log(`    Collected ${sources.length} sources`)

    if (sources.length === 0) {
      log.push({ slug: brand.slug, name: brand.name, status: 'skipped', reason: 'no_sources' })
      continue
    }

    let enriched = {}
    if (!opts.skipLlm) {
      try {
        console.log('    Running LLM normalization...')
        enriched = await normalizeBrandData(sources, brand)
      } catch (err) {
        console.log(`    LLM failed: ${err.message}`)
        log.push({ slug: brand.slug, name: brand.name, status: 'llm_error', error: err.message })
        continue
      }
    }

    const merged = mergeBrandEnrichment(brand, enriched, sources)
    const after = scoreBrand(merged)
    console.log(`    Score: ${before.score} -> ${after.score} (+${after.score - before.score})`)

    if (!opts.dryRun) {
      const idx = data.manufacturers.findIndex((b) => slugify(b.name) === brand.slug)
      if (idx !== -1) {
        const { slug: _slug, ...rest } = merged
        data.manufacturers[idx] = rest
      }
    }

    log.push({
      slug: brand.slug,
      name: brand.name,
      status: 'enriched',
      scoreBefore: before.score,
      scoreAfter: after.score,
    })
  }

  if (!opts.dryRun) {
    fs.writeFileSync(BRANDS_PATH, JSON.stringify(data, null, 2) + '\n')
    console.log(`\nSaved to ${BRANDS_PATH}`)
  }

  fs.writeFileSync(LOG_PATH, JSON.stringify({ runAt: new Date().toISOString(), log }, null, 2) + '\n')
  console.log(`Log saved to ${LOG_PATH}`)
}

main().catch((err) => {
  console.error(`\nBrand enrichment failed: ${err.message}`)
  process.exit(1)
})
