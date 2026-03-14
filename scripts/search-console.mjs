#!/usr/bin/env node

/**
 * Google Search Console API — fetch search analytics for sauna.guide
 *
 * Setup:
 * 1. Create a Google Cloud project & enable "Search Console API"
 * 2. Create a Service Account, download JSON key
 * 3. In Search Console, add the service account email as a user (Full or Restricted)
 * 4. Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH in .env.local
 *
 * Usage:
 *   node --env-file=.env.local scripts/search-console.mjs
 *   node --env-file=.env.local scripts/search-console.mjs --days 90
 *   node --env-file=.env.local scripts/search-console.mjs --type page
 */

import fs from 'node:fs'
import path from 'node:path'
import { google } from 'googleapis'

// ── Config ──────────────────────────────────────────────────────────────────

// Search Console uses "sc-domain:" prefix for domain properties
const SITE_URL = process.env.SEARCH_CONSOLE_SITE_URL || 'sc-domain:sauna.guide'
const KEY_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH

const OUTPUT_DIR = 'src/data'
const OUTPUT_QUERIES = path.join(OUTPUT_DIR, 'search-console-queries.json')
const OUTPUT_PAGES = path.join(OUTPUT_DIR, 'search-console-pages.json')
const OUTPUT_REPORT = path.join(OUTPUT_DIR, 'search-console-report.json')

// ── CLI args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)

function getArg(name, fallback) {
  const idx = args.indexOf(`--${name}`)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback
}

const DAYS = parseInt(getArg('days', '28'), 10)
const ROW_LIMIT = parseInt(getArg('limit', '1000'), 10)

if (args.includes('--help')) {
  console.log(`
Google Search Console data fetcher for sauna.guide

Usage:
  node --env-file=.env.local scripts/search-console.mjs [options]

Options:
  --days <n>     Number of days to look back (default: 28)
  --limit <n>    Max rows per query (default: 1000)
  --help         Show this help

Output:
  ${OUTPUT_QUERIES}   — Top search queries (clicks, impressions, CTR, position)
  ${OUTPUT_PAGES}     — Top pages performance
  ${OUTPUT_REPORT}    — Combined report with insights
`)
  process.exit(0)
}

// ── Auth ────────────────────────────────────────────────────────────────────

if (!KEY_PATH) {
  console.error('❌ Missing GOOGLE_SERVICE_ACCOUNT_KEY_PATH in environment.')
  console.error('   Set it in .env.local to the path of your service account JSON key.')
  process.exit(1)
}

const keyFile = JSON.parse(fs.readFileSync(KEY_PATH, 'utf-8'))

const auth = new google.auth.GoogleAuth({
  credentials: keyFile,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
})

const searchconsole = google.searchconsole({ version: 'v1', auth })

// ── Helpers ─────────────────────────────────────────────────────────────────

function dateStr(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

async function fetchAnalytics(dimensions, rowLimit = ROW_LIMIT) {
  const res = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: dateStr(DAYS),
      endDate: dateStr(1), // yesterday
      dimensions,
      rowLimit,
      dataState: 'final',
    },
  })
  return (res.data.rows || []).map((row) => ({
    key: row.keys.join(' | '),
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: Math.round(row.ctr * 10000) / 100, // percentage
    position: Math.round(row.position * 10) / 10,
  }))
}

function findQuickWins(queries) {
  // High impressions but low CTR = improve title/description
  return queries
    .filter((q) => q.impressions >= 50 && q.ctr < 3 && q.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20)
}

function findRisingStars(queries) {
  // Position 8-20 with decent impressions = push to first page
  return queries
    .filter((q) => q.position >= 8 && q.position <= 20 && q.impressions >= 20)
    .sort((a, b) => a.position - b.position)
    .slice(0, 20)
}

function findTopPerformers(queries) {
  return queries
    .filter((q) => q.clicks >= 1)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 20)
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🔍 Fetching Search Console data for ${SITE_URL}`)
  console.log(`   Period: last ${DAYS} days (${dateStr(DAYS)} → ${dateStr(1)})`)
  console.log()

  // Fetch query and page data in parallel
  const [queries, pages] = await Promise.all([
    fetchAnalytics(['query']),
    fetchAnalytics(['page']),
  ])

  console.log(`📊 Found ${queries.length} queries, ${pages.length} pages`)

  // Compute totals
  const totals = queries.reduce(
    (acc, q) => ({
      clicks: acc.clicks + q.clicks,
      impressions: acc.impressions + q.impressions,
    }),
    { clicks: 0, impressions: 0 }
  )
  totals.ctr = totals.impressions > 0
    ? Math.round((totals.clicks / totals.impressions) * 10000) / 100
    : 0

  // Insights
  const quickWins = findQuickWins(queries)
  const risingStars = findRisingStars(queries)
  const topPerformers = findTopPerformers(queries)

  // Build report
  const report = {
    fetchedAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    period: { days: DAYS, startDate: dateStr(DAYS), endDate: dateStr(1) },
    totals,
    insights: {
      quickWins: {
        description: 'High impressions, low CTR — improve title & meta description',
        items: quickWins,
      },
      risingStars: {
        description: 'Position 8-20 with impressions — push to first page',
        items: risingStars,
      },
      topPerformers: {
        description: 'Queries driving the most clicks',
        items: topPerformers,
      },
    },
    topPages: pages.sort((a, b) => b.clicks - a.clicks).slice(0, 30),
  }

  // Write output files
  fs.writeFileSync(OUTPUT_QUERIES, JSON.stringify(queries, null, 2))
  fs.writeFileSync(OUTPUT_PAGES, JSON.stringify(pages, null, 2))
  fs.writeFileSync(OUTPUT_REPORT, JSON.stringify(report, null, 2))

  console.log()
  console.log(`✅ Saved:`)
  console.log(`   ${OUTPUT_QUERIES} (${queries.length} queries)`)
  console.log(`   ${OUTPUT_PAGES} (${pages.length} pages)`)
  console.log(`   ${OUTPUT_REPORT} (combined report)`)

  // Print summary
  console.log()
  console.log('── Summary ──────────────────────────────────────')
  console.log(`   Total clicks:      ${totals.clicks}`)
  console.log(`   Total impressions: ${totals.impressions}`)
  console.log(`   Average CTR:       ${totals.ctr}%`)
  console.log()

  if (topPerformers.length > 0) {
    console.log('── Top Queries ──────────────────────────────────')
    topPerformers.slice(0, 10).forEach((q, i) => {
      console.log(`   ${i + 1}. "${q.key}" — ${q.clicks} clicks, pos ${q.position}`)
    })
    console.log()
  }

  if (quickWins.length > 0) {
    console.log('── Quick Wins (improve CTR) ─────────────────────')
    quickWins.slice(0, 5).forEach((q) => {
      console.log(`   "${q.key}" — ${q.impressions} imp, ${q.ctr}% CTR, pos ${q.position}`)
    })
    console.log()
  }

  if (risingStars.length > 0) {
    console.log('── Rising Stars (push to page 1) ────────────────')
    risingStars.slice(0, 5).forEach((q) => {
      console.log(`   "${q.key}" — pos ${q.position}, ${q.impressions} impressions`)
    })
  }
}

main().catch((err) => {
  console.error('❌ Error:', err.message)
  if (err.message.includes('403')) {
    console.error('\n   Make sure the service account email is added as a user in Search Console.')
    console.error('   Go to: https://search.google.com/search-console → Settings → Users and permissions')
  }
  process.exit(1)
})
