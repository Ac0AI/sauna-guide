#!/usr/bin/env node

/**
 * Hydrate existing saunas with Google Places data (website, placeId, address, phone, etc.)
 * This is the missing "collect" step — run this BEFORE enrich-saunas.mjs.
 *
 * Usage:
 *   node --env-file=.env.local scripts/hydrate-saunas.mjs
 *   node --env-file=.env.local scripts/hydrate-saunas.mjs --limit 5
 *   node --env-file=.env.local scripts/hydrate-saunas.mjs --id loyly-helsinki
 *   node --env-file=.env.local scripts/hydrate-saunas.mjs --dry-run
 */

import fs from 'node:fs'
import { runActor, requireApifyToken } from './lib/apify.mjs'

const SAUNAS_PATH = 'src/data/saunas.json'
const ACTOR_ID = 'compass/crawler-google-places'

function parseArgs() {
  const args = process.argv.slice(2)
  const get = (name) => {
    const idx = args.indexOf(`--${name}`)
    return idx !== -1 ? args[idx + 1] : undefined
  }
  return {
    id: get('id'),
    limit: get('limit') ? parseInt(get('limit'), 10) : undefined,
    dryRun: args.includes('--dry-run'),
    help: args.includes('--help'),
  }
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function matchScore(apifyItem, sauna) {
  const apifyName = normalizeText(apifyItem.title)
  const saunaName = normalizeText(sauna.name)

  // Exact or near-exact name match
  if (apifyName === saunaName) return 100
  if (apifyName.includes(saunaName) || saunaName.includes(apifyName)) return 80

  // Partial word overlap
  const aWords = new Set(apifyName.split(' '))
  const sWords = new Set(saunaName.split(' '))
  const overlap = [...sWords].filter((w) => aWords.has(w) && w.length > 2).length
  const score = Math.round((overlap / Math.max(sWords.size, 1)) * 60)
  return score
}

async function searchForSauna(sauna) {
  const searchQuery = `${sauna.name} ${sauna.location.city}`
  console.log(`    Searching: "${searchQuery}"`)

  const items = await runActor(ACTOR_ID, {
    searchStringsArray: [searchQuery],
    locationQuery: `${sauna.location.city}, ${sauna.location.country}`,
    maxCrawledPlacesPerSearch: 3,
    language: 'en',
  }, { timeoutSecs: 120 })

  if (!items.length) return null

  // Find best match
  let bestMatch = null
  let bestScore = 0

  for (const item of items) {
    const score = matchScore(item, sauna)
    if (score > bestScore) {
      bestScore = score
      bestMatch = item
    }
  }

  if (bestScore < 40) {
    console.log(`    No confident match (best: ${bestScore}/100 for "${bestMatch?.title}")`)
    return null
  }

  console.log(`    Matched: "${bestMatch.title}" (confidence: ${bestScore}/100)`)
  return bestMatch
}

function hydrateFromPlace(sauna, place) {
  const hydrated = { ...sauna }

  // Website
  if (place.website && !sauna.website) {
    hydrated.website = place.website
  }

  // Google Place ID
  if (place.placeId && !sauna.location?.googlePlaceId) {
    hydrated.location = {
      ...hydrated.location,
      googlePlaceId: place.placeId,
    }
  }

  // Coordinates
  const lat = place.location?.lat ?? place.latitude
  const lng = place.location?.lng ?? place.longitude
  if (typeof lat === 'number' && typeof lng === 'number' && !sauna.location?.coordinates) {
    hydrated.location = {
      ...hydrated.location,
      coordinates: { lat, lng },
    }
  }

  // Address
  const address = place.address || place.street || place.addressParsed?.streetAddress
  if (address && !sauna.location?.address) {
    hydrated.location = {
      ...hydrated.location,
      address,
    }
  }

  // Phone
  if (place.phone && !sauna.phone) {
    hydrated.phone = place.phone
  }

  // Rating + review count
  const rating = place.totalScore ?? place.rating
  if (typeof rating === 'number') {
    hydrated.rating = Math.round(rating * 10) / 10
  }
  const reviewCount = place.reviewsCount ?? place.reviews
  if (typeof reviewCount === 'number') {
    hydrated.reviewCount = reviewCount
  }

  // Opening hours
  if (place.openingHours && !sauna.openingHours) {
    // Format opening hours from Google's structure
    if (typeof place.openingHours === 'string') {
      hydrated.openingHours = place.openingHours
    } else if (Array.isArray(place.openingHours)) {
      hydrated.openingHours = place.openingHours
        .map((h) => (typeof h === 'string' ? h : h.day ? `${h.day}: ${h.hours}` : ''))
        .filter(Boolean)
        .join(', ')
    }
  }

  return hydrated
}

async function main() {
  const opts = parseArgs()

  if (opts.help) {
    console.log('Usage: node --env-file=.env.local scripts/hydrate-saunas.mjs [--id <id>] [--limit <n>] [--dry-run]')
    process.exit(0)
  }

  requireApifyToken()

  const data = JSON.parse(fs.readFileSync(SAUNAS_PATH, 'utf-8'))
  let saunas = data.saunas

  if (opts.id) {
    saunas = saunas.filter((s) => s.id === opts.id)
    if (saunas.length === 0) {
      console.error(`Sauna "${opts.id}" not found.`)
      process.exit(1)
    }
  }

  // Only hydrate saunas missing key data
  const needsHydration = saunas.filter((s) => !s.website || !s.location?.googlePlaceId)
  console.log(`\n${needsHydration.length} of ${saunas.length} saunas need hydration`)

  let toProcess = needsHydration
  if (opts.limit) toProcess = toProcess.slice(0, opts.limit)

  console.log(`Processing ${toProcess.length} saunas...\n`)

  let hydrated = 0
  let skipped = 0
  let failed = 0

  for (const sauna of toProcess) {
    console.log(`  ${sauna.name} (${sauna.location.city}, ${sauna.location.country})`)

    try {
      const place = await searchForSauna(sauna)

      if (!place) {
        skipped++
        continue
      }

      const updated = hydrateFromPlace(sauna, place)
      const newFields = []
      if (updated.website && !sauna.website) newFields.push('website')
      if (updated.location?.googlePlaceId && !sauna.location?.googlePlaceId) newFields.push('placeId')
      if (updated.location?.coordinates && !sauna.location?.coordinates) newFields.push('coords')
      if (updated.location?.address && !sauna.location?.address) newFields.push('address')
      if (updated.phone && !sauna.phone) newFields.push('phone')
      if (updated.openingHours && !sauna.openingHours) newFields.push('hours')
      if (updated.reviewCount && !sauna.reviewCount) newFields.push('reviews')

      console.log(`    Added: ${newFields.join(', ') || 'nothing new'}`)

      if (!opts.dryRun && newFields.length > 0) {
        const idx = data.saunas.findIndex((s) => s.id === sauna.id)
        if (idx !== -1) data.saunas[idx] = updated
      }

      hydrated++
    } catch (err) {
      console.log(`    Error: ${err.message}`)
      failed++
    }

    // Small delay to be nice to API
    await new Promise((r) => setTimeout(r, 1000))
  }

  if (!opts.dryRun) {
    fs.writeFileSync(SAUNAS_PATH, JSON.stringify(data, null, 2) + '\n')
  }

  console.log(`\nDone: ${hydrated} hydrated, ${skipped} skipped, ${failed} failed`)
  if (!opts.dryRun) console.log(`Saved to ${SAUNAS_PATH}`)
}

main().catch((err) => {
  console.error(`Hydration failed: ${err.message}`)
  process.exit(1)
})
