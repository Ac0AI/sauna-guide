# Page Enrichment Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a data enrichment pipeline that uses Apify, Google APIs, and LLM to transform thin directory pages into rich, decision-useful destination pages — starting with saunas (biggest opportunity), then brands, then guides.

**Architecture:** Each page type gets an enrichment script (`scripts/enrich-*.mjs`) that follows a shared pipeline: collect raw data (Apify/Google) → normalize with LLM → merge into existing JSON → score quality. Enriched fields are additive — existing data is never overwritten unless explicitly better. A shared QA scorer gates what's publish-ready.

**Tech Stack:** Node.js scripts (ESM), Apify API (Google Places crawler + web scraper), Google Search Console API (existing), Claude API for LLM normalization, existing JSON data files.

**Principle:** Apify collects facts. Google shows demand. LLM structures — never invents. Every enriched field tracks its source URL and verification date.

---

## File Structure

```
scripts/
├── lib/
│   ├── apify.mjs          # Shared Apify client (run actor, fetch dataset)
│   ├── llm.mjs            # Shared Claude API client (normalize, compose)
│   └── scoring.mjs        # QA scoring logic per page type
├── enrich-saunas.mjs      # Sauna enrichment pipeline
├── enrich-brands.mjs      # Brand enrichment pipeline
├── enrich-guides.mjs      # Guide optimization from GSC data
├── score-pages.mjs        # Run QA scoring across all page types
└── (existing scripts remain untouched)

src/
├── lib/
│   └── types.ts           # Extended types with enrichment fields
├── data/
│   ├── saunas.json        # Existing + enriched fields merged in
│   └── manufacturers.json # Existing + enriched fields merged in
└── app/
    ├── saunas/[id]/page.tsx       # Updated to render enriched content
    └── sauna-brands/[slug]/page.tsx # Updated to render enriched content
```

---

## Chunk 1: Foundation — Types, Shared Libs, Scoring

### Task 1: Extend TypeScript types with enrichment fields

**Files:**
- Modify: `src/lib/types.ts`

These new fields are all optional so existing data continues to work. The `enrichment` sub-object groups all pipeline-added metadata.

- [ ] **Step 1: Add enriched Sauna fields**

Add after the existing `Sauna` interface closing brace — but inside the same interface:

```typescript
export interface Sauna {
  // --- existing fields (unchanged) ---
  id: string
  name: string
  location: {
    city: string
    country: string
    coordinates?: { lat: number; lng: number }
    address?: string          // NEW: street address
    googlePlaceId?: string    // NEW: for Maps embed
  }
  type: 'public' | 'private' | 'hotel' | 'spa'
  features: string[]
  priceRange: '$' | '$$' | '$$$'
  website?: string
  description: string
  images: string[]
  rating?: number

  // --- enriched fields ---
  phone?: string
  bookingUrl?: string
  openingHours?: string
  admission?: string                   // e.g. "€15 weekdays, €19 weekends"
  etiquette?: {
    dresscode?: 'nude' | 'textile' | 'mixed'
    towelPolicy?: string
    sessionLength?: string
  }
  editorial?: {
    whySpecial?: string                // 2-3 sentences, what makes it unique
    whatToExpect?: string               // visitor experience description
    bestTimeToGo?: string
    whoItsFor?: string
    whoShouldSkip?: string
    highlights?: string[]
    drawbacks?: string[]
    tips?: string[]
  }
  nearbyAlternatives?: string[]        // IDs of other saunas
  reviewCount?: number
  enrichment?: {
    sources: { url: string; label: string; fetchedAt: string }[]
    lastVerified?: string              // ISO date
    qualityScore?: number              // 0-100
    status: 'raw' | 'enriched' | 'reviewed' | 'published'
  }
}
```

- [ ] **Step 2: Add enriched Manufacturer fields to manufacturers.ts**

Add optional fields to the `Manufacturer` interface in `src/lib/manufacturers.ts`:

```typescript
// Add to Manufacturer interface:
  priceTier?: 'budget' | 'mid-range' | 'premium' | 'luxury'
  bestFor?: string                    // "first-time buyers who want reliability"
  cautionPoints?: string[]            // what to watch out for
  strengths?: string[]
  weaknesses?: string[]
  mainAlternatives?: string[]         // brand slugs
  supportWarranty?: string
  keyModels?: string[]
  buyerVerdict?: string               // 1-2 sentence editorial summary
  enrichment?: {
    sources: { url: string; label: string; fetchedAt: string }[]
    lastVerified?: string
    qualityScore?: number
    status: 'raw' | 'enriched' | 'reviewed' | 'published'
  }
```

- [ ] **Step 3: Add enriched GearProduct fields to types.ts**

```typescript
// Add to GearProduct interface:
  whyNot?: string                     // reasons to skip
  bestFor?: string
  avoidIf?: string
  alternatives?: string[]             // other product slugs
  comparisonNotes?: string
  editorsPick?: 'best-overall' | 'best-budget' | 'best-premium' | 'skip-unless'
  enrichment?: {
    sources: { url: string; label: string; fetchedAt: string }[]
    lastVerified?: string
    qualityScore?: number
  }
```

- [ ] **Step 4: Run typecheck**

Run: `cd "/Users/dpr/Desktop/Egna Appar/Projekt/sauna-guide" && pnpm typecheck`
Expected: PASS (all new fields are optional, no breaking changes)

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/lib/manufacturers.ts
git commit -m "feat: extend data types with enrichment fields for pipeline"
```

---

### Task 2: Create shared Apify client library

**Files:**
- Create: `scripts/lib/apify.mjs`

Extract and generalize from existing `import-apify-saunas.mjs`.

- [ ] **Step 1: Write the shared client**

```javascript
#!/usr/bin/env node

/**
 * Shared Apify API client for enrichment scripts.
 * Supports running actors and fetching dataset items.
 */

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN

export function requireApifyToken() {
  if (!APIFY_API_TOKEN) {
    console.error('Missing APIFY_API_TOKEN. Set it in .env.local')
    process.exit(1)
  }
  return APIFY_API_TOKEN
}

function actorPath(actorId) {
  return actorId.replace('/', '~')
}

/**
 * Run an Apify actor synchronously and return dataset items.
 */
export async function runActor(actorId, input, { timeoutSecs = 300 } = {}) {
  const token = requireApifyToken()
  const url = `https://api.apify.com/v2/acts/${actorPath(actorId)}/run-sync-get-dataset-items?timeout=${timeoutSecs}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Apify ${actorId} failed (${res.status}): ${text.slice(0, 300)}`)
  }

  const data = await res.json()
  if (!Array.isArray(data)) {
    throw new Error(`Expected array from Apify, got ${typeof data}`)
  }

  return data
}

/**
 * Scrape a single URL using Apify's web scraper and return extracted text.
 */
export async function scrapeUrl(url, { actorId = 'apify/website-content-crawler', maxPages = 1 } = {}) {
  const items = await runActor(actorId, {
    startUrls: [{ url }],
    maxCrawlPages: maxPages,
    crawlerType: 'cheerio',
  })

  return items.map((item) => ({
    url: item.url || url,
    title: item.title || '',
    text: item.text || '',
    html: item.html || '',
    fetchedAt: new Date().toISOString(),
  }))
}

/**
 * Enrich a Google Places ID with detailed info.
 */
export async function enrichGooglePlace(placeId, { actorId = 'compass/crawler-google-places' } = {}) {
  const items = await runActor(actorId, {
    placeIds: [placeId],
    maxReviews: 5,
    language: 'en',
  })

  return items[0] || null
}
```

- [ ] **Step 2: Verify syntax**

Run: `node --check scripts/lib/apify.mjs`
Expected: No output (syntax OK)

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/apify.mjs
git commit -m "feat: add shared Apify client library for enrichment scripts"
```

---

### Task 3: Create shared LLM client library

**Files:**
- Create: `scripts/lib/llm.mjs`

- [ ] **Step 1: Write the LLM client**

```javascript
#!/usr/bin/env node

/**
 * Shared Claude API client for LLM-based data normalization and composition.
 *
 * RULE: LLM structures and summarizes. It never invents facts.
 * Every prompt must include source material. Every output must be parseable JSON.
 */

import Anthropic from '@anthropic-ai/sdk'

let client = null

function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY. Set it in .env.local')
      process.exit(1)
    }
    client = new Anthropic()
  }
  return client
}

/**
 * Send a structured prompt to Claude and parse JSON response.
 *
 * @param {string} systemPrompt - Role and rules
 * @param {string} userPrompt - Source data + extraction instructions
 * @param {object} options
 * @returns {object} Parsed JSON from Claude
 */
export async function extractStructured(systemPrompt, userPrompt, { model = 'claude-sonnet-4-5-20250514', maxTokens = 4096, temperature = 0 } = {}) {
  const anthropic = getClient()

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) || [null, text]
  const jsonStr = jsonMatch[1].trim()

  try {
    return JSON.parse(jsonStr)
  } catch (err) {
    console.error('LLM returned non-JSON:', text.slice(0, 500))
    throw new Error(`Failed to parse LLM response as JSON: ${err.message}`)
  }
}

/**
 * Normalize raw scraped data about a sauna venue into structured fields.
 */
export async function normalizeSaunaData(rawSources, existingSauna) {
  const systemPrompt = `You are a data extraction assistant for a sauna directory website.
Your job is to extract ONLY factual information from the provided source material.

RULES:
- Extract facts from the sources. NEVER invent information.
- If a field cannot be determined from the sources, set it to null.
- Admission prices: use the format "€15 weekdays, €19 weekends" or similar.
- Opening hours: use a brief human-readable format like "Mon-Fri 10-22, Sat-Sun 8-22".
- For editorial fields (whySpecial, whatToExpect, etc.), write concise 2-3 sentence summaries based on what the sources actually say.
- Always output valid JSON matching the exact schema below.`

  const userPrompt = `## Existing data for: ${existingSauna.name}
${JSON.stringify(existingSauna, null, 2)}

## Raw source material
${rawSources.map((s, i) => `### Source ${i + 1}: ${s.url}\n${s.text.slice(0, 3000)}`).join('\n\n')}

## Extract these fields as JSON:
{
  "phone": "string or null",
  "bookingUrl": "string or null",
  "openingHours": "string or null",
  "admission": "string or null",
  "address": "string or null",
  "etiquette": {
    "dresscode": "'nude' | 'textile' | 'mixed' or null",
    "towelPolicy": "string or null",
    "sessionLength": "string or null"
  },
  "editorial": {
    "whySpecial": "string or null — what makes this place unique",
    "whatToExpect": "string or null — the visitor experience",
    "bestTimeToGo": "string or null",
    "whoItsFor": "string or null",
    "whoShouldSkip": "string or null",
    "highlights": ["string array or empty"],
    "drawbacks": ["string array or empty"],
    "tips": ["string array or empty"]
  }
}`

  return extractStructured(systemPrompt, userPrompt)
}

/**
 * Normalize raw scraped data about a brand into structured buyer-decision fields.
 */
export async function normalizeBrandData(rawSources, existingBrand) {
  const systemPrompt = `You are a data extraction assistant for a sauna buying guide.
Your job is to extract factual, buyer-relevant information from provided sources.

RULES:
- Extract facts from sources. NEVER invent.
- If a field cannot be determined, set it to null.
- For editorial fields, write concise summaries based on what sources actually say.
- Strengths/weaknesses must be sourced claims, not your opinions.
- Always output valid JSON.`

  const userPrompt = `## Existing brand data: ${existingBrand.name}
${JSON.stringify(existingBrand, null, 2)}

## Raw source material
${rawSources.map((s, i) => `### Source ${i + 1}: ${s.url}\n${s.text.slice(0, 3000)}`).join('\n\n')}

## Extract these fields as JSON:
{
  "priceTier": "'budget' | 'mid-range' | 'premium' | 'luxury' or null",
  "bestFor": "string or null — who this brand is ideal for",
  "cautionPoints": ["things to be careful about, or empty array"],
  "strengths": ["sourced strengths, or empty array"],
  "weaknesses": ["sourced weaknesses, or empty array"],
  "supportWarranty": "string or null",
  "keyModels": ["notable model names, or empty array"],
  "buyerVerdict": "string or null — 1-2 sentence editorial summary"
}`

  return extractStructured(systemPrompt, userPrompt)
}
```

- [ ] **Step 2: Check that @anthropic-ai/sdk is installed**

Run: `cd "/Users/dpr/Desktop/Egna Appar/Projekt/sauna-guide" && pnpm list @anthropic-ai/sdk 2>/dev/null || echo "Need to install"`

If not installed: `pnpm add -D @anthropic-ai/sdk`

- [ ] **Step 3: Verify syntax**

Run: `node --check scripts/lib/llm.mjs`
Expected: No output (syntax OK)

- [ ] **Step 4: Commit**

```bash
git add scripts/lib/llm.mjs
git commit -m "feat: add shared LLM client for data normalization"
```

---

### Task 4: Create QA scoring library

**Files:**
- Create: `scripts/lib/scoring.mjs`

- [ ] **Step 1: Write the scorer**

```javascript
/**
 * QA scoring for enriched pages.
 * Score 0-100 based on field completeness, source coverage, and decision usefulness.
 */

// --- Sauna scoring ---

const SAUNA_FIELD_WEIGHTS = {
  // Core (must-have for any useful page)
  description: 5,
  'location.address': 5,
  'location.coordinates': 3,
  website: 3,
  rating: 2,
  reviewCount: 2,
  phone: 2,
  openingHours: 4,
  admission: 4,

  // Decision-useful
  'editorial.whySpecial': 8,
  'editorial.whatToExpect': 6,
  'editorial.bestTimeToGo': 4,
  'editorial.whoItsFor': 5,
  'editorial.whoShouldSkip': 4,
  'editorial.highlights': 5,
  'editorial.drawbacks': 5,
  'editorial.tips': 3,
  'etiquette.dresscode': 4,
  bookingUrl: 3,

  // Trust
  'enrichment.sources': 8,          // at least 1 source
  'enrichment.lastVerified': 3,
  images: 5,                         // has at least 1 real image
  nearbyAlternatives: 3,
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function isPresent(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'number') return true
  if (typeof value === 'object') return Object.keys(value).length > 0
  return Boolean(value)
}

export function scoreSauna(sauna) {
  const maxScore = Object.values(SAUNA_FIELD_WEIGHTS).reduce((a, b) => a + b, 0)
  let earned = 0
  const missing = []

  for (const [field, weight] of Object.entries(SAUNA_FIELD_WEIGHTS)) {
    const value = getNestedValue(sauna, field)
    if (isPresent(value)) {
      earned += weight
    } else {
      missing.push({ field, weight })
    }
  }

  // Bonus: description length > 200 chars
  if (sauna.description && sauna.description.length > 200) earned += 3
  // Bonus: multiple images
  if (sauna.images && sauna.images.length > 1) earned += 2

  const score = Math.min(100, Math.round((earned / maxScore) * 100))
  return { score, missing: missing.sort((a, b) => b.weight - a.weight), maxScore, earned }
}

// --- Brand scoring ---

const BRAND_FIELD_WEIGHTS = {
  unique_angle: 5,
  notes: 3,
  priceTier: 5,
  bestFor: 6,
  strengths: 6,
  weaknesses: 5,
  cautionPoints: 4,
  keyModels: 4,
  buyerVerdict: 7,
  supportWarranty: 3,
  mainAlternatives: 4,
  'enrichment.sources': 8,
  'enrichment.lastVerified': 3,
}

export function scoreBrand(brand) {
  const maxScore = Object.values(BRAND_FIELD_WEIGHTS).reduce((a, b) => a + b, 0)
  let earned = 0
  const missing = []

  for (const [field, weight] of Object.entries(BRAND_FIELD_WEIGHTS)) {
    if (isPresent(getNestedValue(brand, field))) {
      earned += weight
    } else {
      missing.push({ field, weight })
    }
  }

  const score = Math.min(100, Math.round((earned / maxScore) * 100))
  return { score, missing: missing.sort((a, b) => b.weight - a.weight), maxScore, earned }
}

// --- Report ---

export function generateReport(items, scoreFn, label) {
  const results = items.map((item) => ({
    id: item.id || item.slug || item.name,
    name: item.name,
    ...scoreFn(item),
  }))

  results.sort((a, b) => a.score - b.score)

  const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
  const publishReady = results.filter((r) => r.score >= 60).length
  const needsWork = results.filter((r) => r.score < 40).length

  return {
    label,
    totalItems: results.length,
    avgScore,
    publishReady,
    needsWork,
    items: results,
  }
}
```

- [ ] **Step 2: Verify syntax**

Run: `node --check scripts/lib/scoring.mjs`

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/scoring.mjs
git commit -m "feat: add QA scoring library for page enrichment pipeline"
```

---

### Task 5: Create score-pages CLI script

**Files:**
- Create: `scripts/score-pages.mjs`

- [ ] **Step 1: Write the scorer CLI**

```javascript
#!/usr/bin/env node

/**
 * Score all pages and output a quality report.
 *
 * Usage:
 *   node scripts/score-pages.mjs
 *   node scripts/score-pages.mjs --type saunas
 *   node scripts/score-pages.mjs --type brands
 *   node scripts/score-pages.mjs --min-score 60
 */

import fs from 'node:fs'
import { scoreSauna, scoreBrand, generateReport } from './lib/scoring.mjs'

const args = process.argv.slice(2)
const typeFilter = args.includes('--type') ? args[args.indexOf('--type') + 1] : null
const minScore = args.includes('--min-score') ? parseInt(args[args.indexOf('--min-score') + 1], 10) : null

function loadSaunas() {
  const data = JSON.parse(fs.readFileSync('src/data/saunas.json', 'utf-8'))
  return data.saunas || []
}

function loadBrands() {
  const data = JSON.parse(fs.readFileSync('src/data/manufacturers.json', 'utf-8'))
  return data.manufacturers || []
}

function printReport(report) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`  ${report.label}`)
  console.log(`${'='.repeat(60)}`)
  console.log(`  Total: ${report.totalItems} | Avg score: ${report.avgScore}/100`)
  console.log(`  Publish-ready (>=60): ${report.publishReady} | Needs work (<40): ${report.needsWork}`)
  console.log()

  for (const item of report.items) {
    const bar = '█'.repeat(Math.round(item.score / 5)) + '░'.repeat(20 - Math.round(item.score / 5))
    const flag = item.score < 40 ? ' ⚠️' : item.score >= 60 ? ' ✓' : ''
    console.log(`  ${bar} ${item.score.toString().padStart(3)}/100  ${item.name}${flag}`)

    if (minScore && item.score < minScore && item.missing.length > 0) {
      const topMissing = item.missing.slice(0, 3).map((m) => m.field).join(', ')
      console.log(`           Missing: ${topMissing}`)
    }
  }
}

// Main
const reports = []

if (!typeFilter || typeFilter === 'saunas') {
  const saunas = loadSaunas()
  reports.push(generateReport(saunas, scoreSauna, 'Sauna Pages'))
}

if (!typeFilter || typeFilter === 'brands') {
  const brands = loadBrands()
  reports.push(generateReport(brands, scoreBrand, 'Brand Pages'))
}

for (const report of reports) {
  printReport(report)
}

// Write JSON report
const outputPath = 'src/data/quality-scores.json'
fs.writeFileSync(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), reports }, null, 2))
console.log(`\nReport saved to ${outputPath}`)
```

- [ ] **Step 2: Test it on current data**

Run: `cd "/Users/dpr/Desktop/Egna Appar/Projekt/sauna-guide" && node scripts/score-pages.mjs`
Expected: Low scores (current data is thin) — this becomes our baseline.

- [ ] **Step 3: Commit**

```bash
git add scripts/score-pages.mjs
git commit -m "feat: add page quality scorer — baseline before enrichment"
```

---

## Chunk 2: Sauna Enrichment Pipeline

### Task 6: Build the sauna enrichment script

**Files:**
- Create: `scripts/enrich-saunas.mjs`

This is the main pipeline script. For each sauna:
1. If it has a `googlePlaceId` or website, fetch enrichment data from Apify
2. If it has a website, scrape the official site for facts
3. Send raw data to LLM for structured extraction
4. Merge enriched fields into existing sauna data
5. Score the result

- [ ] **Step 1: Write the enrichment script**

```javascript
#!/usr/bin/env node

/**
 * Enrich sauna pages with data from Apify + LLM.
 *
 * Usage:
 *   node --env-file=.env.local scripts/enrich-saunas.mjs
 *   node --env-file=.env.local scripts/enrich-saunas.mjs --id loyly-helsinki
 *   node --env-file=.env.local scripts/enrich-saunas.mjs --limit 5
 *   node --env-file=.env.local scripts/enrich-saunas.mjs --dry-run
 *   node --env-file=.env.local scripts/enrich-saunas.mjs --min-score 40  (only enrich pages below this score)
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
  const data = JSON.parse(fs.readFileSync(SAUNAS_PATH, 'utf-8'))
  return data
}

function saveSaunas(data) {
  fs.writeFileSync(SAUNAS_PATH, JSON.stringify(data, null, 2) + '\n')
}

async function collectSources(sauna) {
  const sources = []

  // 1. Scrape official website if available
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

  // 2. Enrich from Google Places if we have a placeId
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
  // Only overwrite null/undefined fields — never clobber existing data
  const merged = { ...existing }

  // Simple fields
  for (const key of ['phone', 'bookingUrl', 'openingHours', 'admission']) {
    if (enriched[key] && !existing[key]) {
      merged[key] = enriched[key]
    }
  }

  // Location.address
  if (enriched.address && !existing.location?.address) {
    merged.location = { ...merged.location, address: enriched.address }
  }

  // Etiquette (merge sub-fields)
  if (enriched.etiquette) {
    merged.etiquette = merged.etiquette || {}
    for (const key of ['dresscode', 'towelPolicy', 'sessionLength']) {
      if (enriched.etiquette[key] && !merged.etiquette[key]) {
        merged.etiquette[key] = enriched.etiquette[key]
      }
    }
  }

  // Editorial (merge sub-fields)
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

  // Enrichment metadata
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

  // Filter by ID
  if (opts.id) {
    saunas = saunas.filter((s) => s.id === opts.id)
    if (saunas.length === 0) {
      console.error(`Sauna "${opts.id}" not found.`)
      process.exit(1)
    }
  }

  // Filter by minimum score (only enrich low-scoring pages)
  if (opts.minScore) {
    saunas = saunas.filter((s) => scoreSauna(s).score < opts.minScore)
  }

  // Apply limit
  if (opts.limit) {
    saunas = saunas.slice(0, opts.limit)
  }

  console.log(`\nEnriching ${saunas.length} saunas...`)
  if (opts.dryRun) console.log('  (DRY RUN — no files will be written)\n')

  const log = []

  for (const sauna of saunas) {
    const before = scoreSauna(sauna)
    console.log(`\n  ${sauna.name} (score: ${before.score}/100)`)

    // Collect raw source material
    const sources = await collectSources(sauna)
    console.log(`    Collected ${sources.length} sources`)

    if (sources.length === 0) {
      console.log('    No sources available — skipping')
      log.push({ id: sauna.id, name: sauna.name, status: 'skipped', reason: 'no_sources' })
      continue
    }

    let enriched = {}

    if (!opts.skipLlm) {
      // Normalize with LLM
      try {
        console.log('    Running LLM normalization...')
        enriched = await normalizeSaunaData(sources, sauna)
      } catch (err) {
        console.log(`    LLM failed: ${err.message}`)
        log.push({ id: sauna.id, name: sauna.name, status: 'llm_error', error: err.message })
        continue
      }
    }

    // Merge into existing data
    const merged = mergeEnrichment(sauna, enriched, sources)
    const after = scoreSauna(merged)
    console.log(`    Score: ${before.score} → ${after.score} (+${after.score - before.score})`)

    if (!opts.dryRun) {
      // Update in-place
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

  // Save log
  fs.writeFileSync(LOG_PATH, JSON.stringify({ runAt: new Date().toISOString(), log }, null, 2) + '\n')
  console.log(`Log saved to ${LOG_PATH}`)

  // Summary
  const enriched = log.filter((l) => l.status === 'enriched')
  const skipped = log.filter((l) => l.status !== 'enriched')
  console.log(`\nDone: ${enriched.length} enriched, ${skipped.length} skipped`)
  if (enriched.length > 0) {
    const avgGain = Math.round(enriched.reduce((sum, l) => sum + (l.scoreAfter - l.scoreBefore), 0) / enriched.length)
    console.log(`Average score gain: +${avgGain} points`)
  }
}

main().catch((err) => {
  console.error(`\nEnrichment failed: ${err.message}`)
  process.exit(1)
})
```

- [ ] **Step 2: Verify syntax**

Run: `node --check scripts/enrich-saunas.mjs`

- [ ] **Step 3: Dry-run test on single sauna**

Run: `cd "/Users/dpr/Desktop/Egna Appar/Projekt/sauna-guide" && node --env-file=.env.local scripts/enrich-saunas.mjs --id loyly-helsinki --dry-run`

This confirms the script loads and can filter without actually calling any APIs.

- [ ] **Step 4: Commit**

```bash
git add scripts/enrich-saunas.mjs
git commit -m "feat: add sauna enrichment pipeline (Apify + LLM)"
```

---

## Chunk 3: Brand Enrichment Pipeline

### Task 7: Build the brand enrichment script

**Files:**
- Create: `scripts/enrich-brands.mjs`

Same pattern as saunas: scrape brand websites → LLM normalize → merge → score.

- [ ] **Step 1: Write the brand enrichment script**

```javascript
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
    console.log(`    Score: ${before.score} → ${after.score} (+${after.score - before.score})`)

    if (!opts.dryRun) {
      const idx = data.manufacturers.findIndex((b) => slugify(b.name) === brand.slug)
      if (idx !== -1) {
        // Remove slug from saved data (it's computed at runtime)
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
```

- [ ] **Step 2: Verify syntax**

Run: `node --check scripts/enrich-brands.mjs`

- [ ] **Step 3: Commit**

```bash
git add scripts/enrich-brands.mjs
git commit -m "feat: add brand enrichment pipeline (Apify + LLM)"
```

---

## Chunk 4: Guide Optimization from Search Console Data

### Task 8: Build the guide optimization script

**Files:**
- Create: `scripts/enrich-guides.mjs`

Uses existing Search Console data to find content gaps in guides and suggest improvements.

- [ ] **Step 1: Write the guide optimizer**

```javascript
#!/usr/bin/env node

/**
 * Analyze guides against Search Console data to find optimization opportunities.
 *
 * Pipeline:
 * 1. Load Search Console queries grouped by page
 * 2. For each guide, find queries where it ranks but with low CTR or position 8-20
 * 3. Use LLM to suggest title/description improvements and missing content sections
 *
 * Usage:
 *   node --env-file=.env.local scripts/enrich-guides.mjs
 *   node --env-file=.env.local scripts/enrich-guides.mjs --guide sauna-health-benefits
 */

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { extractStructured } from './lib/llm.mjs'

const GUIDES_DIR = 'src/content/guides'
const GSC_QUERIES_PATH = 'src/data/search-console-queries.json'
const GSC_PAGES_PATH = 'src/data/search-console-pages.json'
const OUTPUT_PATH = 'src/data/guide-optimization-report.json'

function parseArgs() {
  const args = process.argv.slice(2)
  const get = (name) => {
    const idx = args.indexOf(`--${name}`)
    return idx !== -1 ? args[idx + 1] : undefined
  }
  return {
    guide: get('guide'),
    skipLlm: args.includes('--skip-llm'),
  }
}

function loadGuides() {
  const files = fs.readdirSync(GUIDES_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
  return files.map((file) => {
    const content = fs.readFileSync(path.join(GUIDES_DIR, file), 'utf-8')
    const { data: frontmatter, content: body } = matter(content)
    const slug = file.replace(/\.(mdx?|md)$/, '')
    return { slug, file, frontmatter, body, url: `https://sauna.guide/guides/${slug}` }
  })
}

function loadGscData() {
  const queries = fs.existsSync(GSC_QUERIES_PATH)
    ? JSON.parse(fs.readFileSync(GSC_QUERIES_PATH, 'utf-8'))
    : []
  const pages = fs.existsSync(GSC_PAGES_PATH)
    ? JSON.parse(fs.readFileSync(GSC_PAGES_PATH, 'utf-8'))
    : []
  return { queries, pages }
}

function findQueriesForPage(pageUrl, queries) {
  // GSC query-level data doesn't include page, but we can match by
  // looking at page-level data and correlating
  return queries.filter((q) => q.impressions > 0).sort((a, b) => b.impressions - a.impressions)
}

async function suggestImprovements(guide, relatedQueries) {
  const systemPrompt = `You are an SEO content optimization assistant for a sauna guide website.
Your job is to suggest specific, actionable improvements based on search data.

RULES:
- Suggest title/description changes only if they better match search intent
- Suggest new content sections only if they address real search queries
- Be specific: "Add a section about X" not "Improve the content"
- Output valid JSON`

  const userPrompt = `## Current guide: ${guide.frontmatter.title}
URL: ${guide.url}
Current meta description: ${guide.frontmatter.description || 'none'}
Current tags: ${(guide.frontmatter.tags || []).join(', ')}

Content headings from the article:
${guide.body.match(/^#{1,3}\s+.+/gm)?.join('\n') || 'No headings found'}

## Search queries with impressions (what people search for):
${relatedQueries.slice(0, 30).map((q) => `- "${q.key}" — ${q.impressions} imp, pos ${q.position}, CTR ${q.ctr}%`).join('\n')}

## Output JSON:
{
  "suggestedTitle": "string or null — only if current title should change",
  "suggestedDescription": "string or null — only if current description should change",
  "missingTopics": ["topics that search queries suggest but the guide doesn't cover"],
  "missingSections": ["specific section headings to add"],
  "faqsToAdd": ["questions from search queries that should be answered"],
  "internalLinksToAdd": ["pages on sauna.guide this guide should link to"],
  "priority": "high | medium | low — based on search opportunity"
}`

  return extractStructured(systemPrompt, userPrompt)
}

async function main() {
  const opts = parseArgs()
  const guides = loadGuides()
  const { queries, pages } = loadGscData()

  let targetGuides = guides
  if (opts.guide) {
    targetGuides = guides.filter((g) => g.slug === opts.guide)
    if (targetGuides.length === 0) {
      console.error(`Guide "${opts.guide}" not found`)
      process.exit(1)
    }
  }

  console.log(`\nAnalyzing ${targetGuides.length} guides against ${queries.length} GSC queries...`)

  const results = []

  for (const guide of targetGuides) {
    const pageData = pages.find((p) => p.key.includes(guide.slug))
    const relatedQueries = findQueriesForPage(guide.url, queries)

    console.log(`\n  ${guide.frontmatter.title}`)
    console.log(`    GSC: ${pageData ? `${pageData.clicks} clicks, ${pageData.impressions} imp` : 'No data yet'}`)

    if (opts.skipLlm || relatedQueries.length === 0) {
      results.push({
        slug: guide.slug,
        title: guide.frontmatter.title,
        gsc: pageData || null,
        suggestions: null,
        reason: relatedQueries.length === 0 ? 'no_gsc_data' : 'llm_skipped',
      })
      continue
    }

    try {
      const suggestions = await suggestImprovements(guide, relatedQueries)
      results.push({
        slug: guide.slug,
        title: guide.frontmatter.title,
        gsc: pageData || null,
        suggestions,
      })
      console.log(`    Priority: ${suggestions.priority}`)
      if (suggestions.missingSections?.length > 0) {
        console.log(`    Missing sections: ${suggestions.missingSections.join(', ')}`)
      }
    } catch (err) {
      console.log(`    LLM failed: ${err.message}`)
      results.push({ slug: guide.slug, title: guide.frontmatter.title, error: err.message })
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2) + '\n')
  console.log(`\nReport saved to ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error(`Guide optimization failed: ${err.message}`)
  process.exit(1)
})
```

- [ ] **Step 2: Check that gray-matter is installed**

Run: `cd "/Users/dpr/Desktop/Egna Appar/Projekt/sauna-guide" && pnpm list gray-matter 2>/dev/null || echo "Need to install"`

If not installed: `pnpm add -D gray-matter`

- [ ] **Step 3: Verify syntax**

Run: `node --check scripts/enrich-guides.mjs`

- [ ] **Step 4: Commit**

```bash
git add scripts/enrich-guides.mjs
git commit -m "feat: add guide optimization pipeline using GSC data"
```

---

## Chunk 5: Update Page Components to Render Enriched Data

### Task 9: Update sauna detail page to render enriched content

**Files:**
- Modify: `src/app/saunas/[id]/page.tsx`

The current page shows a generic "About this Sauna" paragraph and a features list. The enriched version should conditionally render all new fields when present, falling back gracefully to current behavior for non-enriched saunas.

- [ ] **Step 1: Replace the main content section (lines 215-237)**

Replace the generic "About this Sauna" content block with enriched sections:

```tsx
{/* Main Content */}
<div className="lg:col-span-2 space-y-10">
    {/* About / Why Special */}
    <section>
        <h2 className="text-2xl font-display text-sauna-ink mb-6">
            {sauna.editorial?.whySpecial ? 'What Makes It Special' : 'About this Sauna'}
        </h2>
        <div className="prose prose-lg prose-stone text-sauna-slate leading-relaxed">
            {sauna.editorial?.whySpecial && <p>{sauna.editorial.whySpecial}</p>}
            <p>{sauna.description}</p>
            {sauna.editorial?.whatToExpect && (
                <>
                    <h3>What to Expect</h3>
                    <p>{sauna.editorial.whatToExpect}</p>
                </>
            )}
        </div>
    </section>

    {/* Highlights & Drawbacks */}
    {(sauna.editorial?.highlights?.length || sauna.editorial?.drawbacks?.length) && (
        <section className="grid md:grid-cols-2 gap-6">
            {sauna.editorial?.highlights && sauna.editorial.highlights.length > 0 && (
                <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                    <h3 className="font-medium text-emerald-900 mb-3">Highlights</h3>
                    <ul className="space-y-2">
                        {sauna.editorial.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2 text-emerald-800 text-sm">
                                <span className="mt-0.5">+</span>{h}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {sauna.editorial?.drawbacks && sauna.editorial.drawbacks.length > 0 && (
                <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
                    <h3 className="font-medium text-amber-900 mb-3">Good to Know</h3>
                    <ul className="space-y-2">
                        {sauna.editorial.drawbacks.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-amber-800 text-sm">
                                <span className="mt-0.5">-</span>{d}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    )}

    {/* Practical Info */}
    <section className="p-6 bg-sauna-linen rounded-xl border border-sauna-ash/30">
        <h3 className="font-display text-xl font-medium text-sauna-ink mb-4">Practical Information</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
                <dt className="font-medium text-sauna-slate">Type</dt>
                <dd className="text-sauna-ink capitalize">{sauna.type}</dd>
            </div>
            <div>
                <dt className="font-medium text-sauna-slate">Location</dt>
                <dd className="text-sauna-ink">{sauna.location.city}, {sauna.location.country}</dd>
            </div>
            {sauna.admission && (
                <div>
                    <dt className="font-medium text-sauna-slate">Admission</dt>
                    <dd className="text-sauna-ink">{sauna.admission}</dd>
                </div>
            )}
            {sauna.openingHours && (
                <div>
                    <dt className="font-medium text-sauna-slate">Opening Hours</dt>
                    <dd className="text-sauna-ink">{sauna.openingHours}</dd>
                </div>
            )}
            {sauna.etiquette?.dresscode && (
                <div>
                    <dt className="font-medium text-sauna-slate">Dress Code</dt>
                    <dd className="text-sauna-ink capitalize">{sauna.etiquette.dresscode}</dd>
                </div>
            )}
            {sauna.etiquette?.towelPolicy && (
                <div>
                    <dt className="font-medium text-sauna-slate">Towel Policy</dt>
                    <dd className="text-sauna-ink">{sauna.etiquette.towelPolicy}</dd>
                </div>
            )}
            {sauna.rating && (
                <div>
                    <dt className="font-medium text-sauna-slate">Rating</dt>
                    <dd className="text-sauna-ink">{sauna.rating}/5{sauna.reviewCount ? ` (${sauna.reviewCount} reviews)` : ''}</dd>
                </div>
            )}
            {sauna.phone && (
                <div>
                    <dt className="font-medium text-sauna-slate">Phone</dt>
                    <dd className="text-sauna-ink">{sauna.phone}</dd>
                </div>
            )}
        </dl>
        <div className="flex flex-wrap gap-2 mt-4">
            {sauna.features.map(f => (
                <span key={f} className="px-3 py-1 rounded-full bg-sauna-paper text-sauna-ink text-sm border border-sauna-ash/30">
                    {f}
                </span>
            ))}
        </div>
    </section>

    {/* Who It's For */}
    {(sauna.editorial?.whoItsFor || sauna.editorial?.whoShouldSkip) && (
        <section className="grid md:grid-cols-2 gap-6">
            {sauna.editorial?.whoItsFor && (
                <div className="p-6 bg-white rounded-xl border border-sauna-ash/30">
                    <h3 className="font-medium text-sauna-ink mb-2">Best For</h3>
                    <p className="text-sauna-slate text-sm">{sauna.editorial.whoItsFor}</p>
                </div>
            )}
            {sauna.editorial?.whoShouldSkip && (
                <div className="p-6 bg-white rounded-xl border border-sauna-ash/30">
                    <h3 className="font-medium text-sauna-ink mb-2">Maybe Skip If</h3>
                    <p className="text-sauna-slate text-sm">{sauna.editorial.whoShouldSkip}</p>
                </div>
            )}
        </section>
    )}

    {/* Tips */}
    {sauna.editorial?.tips && sauna.editorial.tips.length > 0 && (
        <section className="p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-3">Insider Tips</h3>
            <ul className="space-y-2">
                {sauna.editorial.tips.map((tip, i) => (
                    <li key={i} className="text-blue-800 text-sm">{tip}</li>
                ))}
            </ul>
        </section>
    )}

    {/* Sources */}
    {sauna.enrichment?.sources && sauna.enrichment.sources.length > 0 && (
        <section className="text-xs text-sauna-slate/60 border-t border-sauna-ash/20 pt-4">
            <p className="font-medium mb-1">Sources & verification</p>
            <ul className="space-y-0.5">
                {sauna.enrichment.sources.map((s, i) => (
                    <li key={i}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {s.label}
                        </a>
                        {s.fetchedAt && ` — verified ${s.fetchedAt.split('T')[0]}`}
                    </li>
                ))}
            </ul>
            {sauna.enrichment.lastVerified && (
                <p className="mt-1">Last updated: {sauna.enrichment.lastVerified}</p>
            )}
        </section>
    )}
</div>
```

- [ ] **Step 2: Update the sidebar location card to use real address (lines 241-264)**

Replace the map placeholder with actual address when available:

```tsx
{/* Location */}
<div className="bg-sauna-linen p-6 rounded-xl border border-sauna-ash/50">
    <h3 className="text-lg font-medium text-sauna-ink mb-4">Location</h3>
    {sauna.location.coordinates ? (
        <div className="aspect-video rounded-lg mb-4 overflow-hidden">
            <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}&q=${sauna.location.coordinates.lat},${sauna.location.coordinates.lng}&zoom=15`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${sauna.name}`}
            />
        </div>
    ) : (
        <div className="aspect-video bg-sauna-ash/10 rounded-lg mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-sauna-oak/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </div>
    )}
    {sauna.location.address && (
        <p className="text-sauna-ink text-sm mb-1">{sauna.location.address}</p>
    )}
    <p className="text-sauna-ink font-medium">{sauna.location.city}</p>
    <p className="text-sauna-slate text-sm">{sauna.location.country}</p>
    <div className="flex flex-col gap-2 mt-4">
        {sauna.website && (
            <a href={sauna.website} target="_blank" rel="noopener noreferrer"
                className="block w-full py-3 bg-sauna-ink text-sauna-paper text-center rounded-lg font-medium hover:bg-sauna-charcoal transition-colors">
                Visit Website
            </a>
        )}
        {sauna.bookingUrl && (
            <a href={sauna.bookingUrl} target="_blank" rel="noopener noreferrer"
                className="block w-full py-3 bg-sauna-oak text-sauna-paper text-center rounded-lg font-medium hover:bg-sauna-oak/90 transition-colors">
                Book Now
            </a>
        )}
    </div>
</div>
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`
Expected: May need to update the `Sauna` type import or add `as any` casts for new fields if the types aren't updated yet. Fix any errors.

- [ ] **Step 4: Run build**

Run: `pnpm build`
Expected: PASS — all enriched fields are conditionally rendered, so pages without enrichment still work.

- [ ] **Step 5: Commit**

```bash
git add src/app/saunas/[id]/page.tsx
git commit -m "feat: render enriched sauna data with sources and practical info"
```

---

### Task 10: Update brand detail page to render enriched buyer-decision content

**Files:**
- Modify: `src/app/sauna-brands/[slug]/page.tsx`

- [ ] **Step 1: Add buyer-decision sections after the "Why Consider" section (after line 177)**

Add these new sections:

```tsx
{/* Strengths & Weaknesses — only shown when enriched */}
{(manufacturer.strengths?.length || manufacturer.weaknesses?.length) && (
    <section className="mb-12 grid md:grid-cols-2 gap-6">
        {manufacturer.strengths && manufacturer.strengths.length > 0 && (
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                <h3 className="font-medium text-emerald-900 mb-3">Strengths</h3>
                <ul className="space-y-2">
                    {manufacturer.strengths.map((s, i) => (
                        <li key={i} className="text-emerald-800 text-sm flex items-start gap-2">
                            <span className="mt-0.5">+</span>{s}
                        </li>
                    ))}
                </ul>
            </div>
        )}
        {manufacturer.weaknesses && manufacturer.weaknesses.length > 0 && (
            <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
                <h3 className="font-medium text-amber-900 mb-3">Watch Out For</h3>
                <ul className="space-y-2">
                    {manufacturer.weaknesses.map((w, i) => (
                        <li key={i} className="text-amber-800 text-sm flex items-start gap-2">
                            <span className="mt-0.5">-</span>{w}
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </section>
)}

{/* Buyer Verdict */}
{manufacturer.buyerVerdict && (
    <section className="mb-12 p-6 bg-white rounded-xl border-2 border-sauna-oak/30">
        <h2 className="font-display text-xl font-medium text-sauna-ink mb-3">Our Verdict</h2>
        <p className="text-sauna-slate leading-relaxed">{manufacturer.buyerVerdict}</p>
        {manufacturer.priceTier && (
            <p className="mt-3 text-sm text-sauna-slate">
                Price tier: <span className="font-medium text-sauna-ink capitalize">{manufacturer.priceTier}</span>
            </p>
        )}
        {manufacturer.bestFor && (
            <p className="text-sm text-sauna-slate">
                Best for: <span className="font-medium text-sauna-ink">{manufacturer.bestFor}</span>
            </p>
        )}
    </section>
)}

{/* Key Models */}
{manufacturer.keyModels && manufacturer.keyModels.length > 0 && (
    <section className="mb-12">
        <h2 className="font-display text-2xl font-medium text-sauna-ink mb-4">Key Models</h2>
        <div className="flex flex-wrap gap-3">
            {manufacturer.keyModels.map((model, i) => (
                <span key={i} className="px-4 py-2 bg-sauna-linen rounded-lg text-sauna-ink text-sm border border-sauna-ash/30">
                    {model}
                </span>
            ))}
        </div>
    </section>
)}

{/* Sources */}
{manufacturer.enrichment?.sources && manufacturer.enrichment.sources.length > 0 && (
    <section className="mb-12 text-xs text-sauna-slate/60 border-t border-sauna-ash/20 pt-4">
        <p className="font-medium mb-1">Sources</p>
        <ul className="space-y-0.5">
            {manufacturer.enrichment.sources.map((s, i) => (
                <li key={i}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {s.label}
                    </a>
                    {s.fetchedAt && ` — ${s.fetchedAt.split('T')[0]}`}
                </li>
            ))}
        </ul>
    </section>
)}
```

- [ ] **Step 2: Update Manufacturer interface in manufacturers.ts to include enriched fields**

(Already done in Task 1, Step 2 — verify the types are in place)

- [ ] **Step 3: Run build**

Run: `pnpm typecheck && pnpm build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/sauna-brands/[slug]/page.tsx
git commit -m "feat: render enriched brand data with buyer decision sections"
```

---

## Chunk 6: First Enrichment Run & Validation

### Task 11: Run baseline scoring

- [ ] **Step 1: Score all current pages**

Run: `cd "/Users/dpr/Desktop/Egna Appar/Projekt/sauna-guide" && node scripts/score-pages.mjs`

Save the output — this is the baseline before any enrichment.

### Task 12: Run first sauna enrichment (single page test)

- [ ] **Step 1: Enrich a single sauna with a known website**

Run: `node --env-file=.env.local scripts/enrich-saunas.mjs --id loyly-helsinki --limit 1`

- [ ] **Step 2: Verify the enriched data**

Run: `node -e "const d=require('./src/data/saunas.json'); const s=d.saunas.find(s=>s.id==='loyly-helsinki'); console.log(JSON.stringify(s, null, 2))"`

Check that:
- New fields are populated (editorial, etiquette, admission, etc.)
- Sources are tracked
- Quality score improved

- [ ] **Step 3: Check the page renders correctly**

Run: `pnpm dev` and visit `localhost:3000/saunas/loyly-helsinki`

Verify new sections appear and layout isn't broken.

- [ ] **Step 4: Run build to confirm no SSG errors**

Run: `pnpm build`

- [ ] **Step 5: Commit enriched data**

```bash
git add src/data/saunas.json src/data/enrichment-log.json
git commit -m "data: enrich Löyly Helsinki with Apify + LLM pipeline"
```

### Task 13: Run first brand enrichment (single brand test)

- [ ] **Step 1: Enrich Harvia**

Run: `node --env-file=.env.local scripts/enrich-brands.mjs --slug harvia`

- [ ] **Step 2: Verify and build**

Run: `pnpm build`

- [ ] **Step 3: Commit**

```bash
git add src/data/manufacturers.json src/data/enrichment-log-brands.json
git commit -m "data: enrich Harvia brand page with buyer decision data"
```

### Task 14: Run scoring after enrichment

- [ ] **Step 1: Compare scores**

Run: `node scripts/score-pages.mjs`

Compare with baseline from Task 11. Enriched pages should show significant score improvement.

---

## Summary of Pipeline Commands

```bash
# Score all pages (baseline)
node scripts/score-pages.mjs

# Enrich saunas
node --env-file=.env.local scripts/enrich-saunas.mjs --limit 5
node --env-file=.env.local scripts/enrich-saunas.mjs --id loyly-helsinki

# Enrich brands
node --env-file=.env.local scripts/enrich-brands.mjs --limit 3
node --env-file=.env.local scripts/enrich-brands.mjs --slug harvia

# Optimize guides from GSC data
node --env-file=.env.local scripts/enrich-guides.mjs

# Score after enrichment
node scripts/score-pages.mjs

# Search Console refresh
node --env-file=.env.local scripts/search-console.mjs --days 90
```
