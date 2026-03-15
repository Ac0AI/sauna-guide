#!/usr/bin/env node

/**
 * Enrich sauna pages with data from Apify + LLM.
 *
 * Usage:
 *   node --env-file=.env.local scripts/enrich-saunas.mjs
 *   node --env-file=.env.local scripts/enrich-saunas.mjs --id loyly-helsinki
 *   node --env-file=.env.local scripts/enrich-saunas.mjs --limit 5
 *   node --env-file=.env.local scripts/enrich-saunas.mjs --dry-run
 *   node --env-file=.env.local scripts/enrich-saunas.mjs --min-score 40
 */

import fs from 'node:fs'
import { scrapeUrl, enrichGooglePlace } from './lib/apify.mjs'
import { normalizeSaunaData } from './lib/llm.mjs'
import { scoreSauna } from './lib/scoring.mjs'

const SAUNAS_PATH = 'src/data/saunas.json'
const LOG_PATH = 'src/data/enrichment-log.json'

function parseArgs() {
  const args = process.argv.slice(2)
  const get = (name) => {
    const idx = args.indexOf(`--${name}`)
    return idx !== -1 ? args[idx + 1] : undefined
  }
  return {
    id: get('id'),
    limit: get('limit') ? parseInt(get('limit'), 10) : undefined,
    minScore: get('min-score') ? parseInt(get('min-score'), 10) : undefined,
    dryRun: args.includes('--dry-run'),
    skipLlm: args.includes('--skip-llm'),
    help: args.includes('--help'),
  }
}

function loadSaunas() {
  return JSON.parse(fs.readFileSync(SAUNAS_PATH, 'utf-8'))
}

function saveSaunas(data) {
  fs.writeFileSync(SAUNAS_PATH, JSON.stringify(data, null, 2) + '\n')
}

async function collectSources(sauna) {
  const sources = []

  if (sauna.website) {
    try {
      console.log(`    Scraping website: ${sauna.website}`)
      const pages = await scrapeUrl(sauna.website, { maxPages: 3 })
      for (const page of pages) {
        sources.push({
          url: page.url,
          label: 'Official website',
          text: page.text,
          fetchedAt: page.fetchedAt,
        })
      }
    } catch (err) {
      console.log(`    Website scrape failed: ${err.message}`)
    }
  }

  if (sauna.location?.googlePlaceId) {
    try {
      console.log(`    Fetching Google Places data...`)
      const place = await enrichGooglePlace(sauna.location.googlePlaceId)
      if (place) {
        sources.push({
          url: place.url || `https://maps.google.com/?cid=${sauna.location.googlePlaceId}`,
          label: 'Google Places',
          text: JSON.stringify({
            address: place.address,
            phone: place.phone,
            openingHours: place.openingHours,
            rating: place.totalScore,
            reviewCount: place.reviewsCount,
            categories: place.categories,
            website: place.website,
          }),
          fetchedAt: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.log(`    Google Places fetch failed: ${err.message}`)
    }
  }

  return sources
}

function mergeEnrichment(existing, enriched, sources) {
  const merged = { ...existing }

  for (const key of ['phone', 'bookingUrl', 'openingHours', 'admission']) {
    if (enriched[key] && !existing[key]) {
      merged[key] = enriched[key]
    }
  }

  if (enriched.address && !existing.location?.address) {
    merged.location = { ...merged.location, address: enriched.address }
  }

  if (enriched.etiquette) {
    merged.etiquette = merged.etiquette || {}
    for (const key of ['dresscode', 'towelPolicy', 'sessionLength']) {
      if (enriched.etiquette[key] && !merged.etiquette[key]) {
        merged.etiquette[key] = enriched.etiquette[key]
      }
    }
  }

  if (enriched.editorial) {
    merged.editorial = merged.editorial || {}
    for (const key of ['whySpecial', 'whatToExpect', 'bestTimeToGo', 'whoItsFor', 'whoShouldSkip']) {
      if (enriched.editorial[key] && !merged.editorial[key]) {
        merged.editorial[key] = enriched.editorial[key]
      }
    }
    for (const key of ['highlights', 'drawbacks', 'tips']) {
      if (enriched.editorial[key]?.length > 0 && (!merged.editorial[key] || merged.editorial[key].length === 0)) {
        merged.editorial[key] = enriched.editorial[key]
      }
    }
  }

  merged.enrichment = {
    sources: sources.map((s) => ({ url: s.url, label: s.label, fetchedAt: s.fetchedAt })),
    lastVerified: new Date().toISOString().split('T')[0],
    qualityScore: scoreSauna(merged).score,
    status: 'enriched',
  }

  return merged
}

async function main() {
  const opts = parseArgs()

  if (opts.help) {
    console.log('Usage: node --env-file=.env.local scripts/enrich-saunas.mjs [--id <id>] [--limit <n>] [--min-score <n>] [--dry-run] [--skip-llm]')
    process.exit(0)
  }

  const data = loadSaunas()
  let saunas = data.saunas

  if (opts.id) {
    saunas = saunas.filter((s) => s.id === opts.id)
    if (saunas.length === 0) {
      console.error(`Sauna "${opts.id}" not found.`)
      process.exit(1)
    }
  }

  if (opts.minScore) {
    saunas = saunas.filter((s) => scoreSauna(s).score < opts.minScore)
  }

  if (opts.limit) {
    saunas = saunas.slice(0, opts.limit)
  }

  console.log(`\nEnriching ${saunas.length} saunas...`)
  if (opts.dryRun) console.log('  (DRY RUN — no files will be written)\n')

  const log = []

  for (const sauna of saunas) {
    const before = scoreSauna(sauna)
    console.log(`\n  ${sauna.name} (score: ${before.score}/100)`)

    const sources = await collectSources(sauna)
    console.log(`    Collected ${sources.length} sources`)

    if (sources.length === 0) {
      console.log('    No sources available — skipping')
      log.push({ id: sauna.id, name: sauna.name, status: 'skipped', reason: 'no_sources' })
      continue
    }

    let enriched = {}

    if (!opts.skipLlm) {
      try {
        console.log('    Running LLM normalization...')
        enriched = await normalizeSaunaData(sources, sauna)
      } catch (err) {
        console.log(`    LLM failed: ${err.message}`)
        log.push({ id: sauna.id, name: sauna.name, status: 'llm_error', error: err.message })
        continue
      }
    }

    const merged = mergeEnrichment(sauna, enriched, sources)
    const after = scoreSauna(merged)
    console.log(`    Score: ${before.score} -> ${after.score} (+${after.score - before.score})`)

    if (!opts.dryRun) {
      const idx = data.saunas.findIndex((s) => s.id === sauna.id)
      if (idx !== -1) data.saunas[idx] = merged
    }

    log.push({
      id: sauna.id,
      name: sauna.name,
      status: 'enriched',
      scoreBefore: before.score,
      scoreAfter: after.score,
      sourcesUsed: sources.length,
    })
  }

  if (!opts.dryRun) {
    saveSaunas(data)
    console.log(`\nSaved enriched data to ${SAUNAS_PATH}`)
  }

  fs.writeFileSync(LOG_PATH, JSON.stringify({ runAt: new Date().toISOString(), log }, null, 2) + '\n')
  console.log(`Log saved to ${LOG_PATH}`)

  const enrichedCount = log.filter((l) => l.status === 'enriched')
  const skippedCount = log.filter((l) => l.status !== 'enriched')
  console.log(`\nDone: ${enrichedCount.length} enriched, ${skippedCount.length} skipped`)
  if (enrichedCount.length > 0) {
    const avgGain = Math.round(enrichedCount.reduce((sum, l) => sum + (l.scoreAfter - l.scoreBefore), 0) / enrichedCount.length)
    console.log(`Average score gain: +${avgGain} points`)
  }
}

main().catch((err) => {
  console.error(`\nEnrichment failed: ${err.message}`)
  process.exit(1)
})
