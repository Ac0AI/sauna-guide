#!/usr/bin/env node

/**
 * Google Indexing API — push all sauna.guide URLs to Google's crawl queue
 *
 * Setup:
 * 1. Enable "Indexing API" in Google Cloud Console (project: superb-flag-421918)
 *    https://console.cloud.google.com/apis/library/indexing.googleapis.com
 * 2. Service account must be added as owner in Search Console
 *
 * Usage:
 *   node --env-file=.env.local scripts/submit-indexing.mjs
 *   node --env-file=.env.local scripts/submit-indexing.mjs --dry-run
 *   node --env-file=.env.local scripts/submit-indexing.mjs --type URL_UPDATED
 *   node --env-file=.env.local scripts/submit-indexing.mjs --type URL_DELETED
 */

import fs from 'node:fs'
import path from 'node:path'
import { google } from 'googleapis'

// ── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = 'https://sauna.guide'
const KEY_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH

// ── CLI args ────────────────────────────────────────────────────────────────

const LOG_FILE = path.join('src/data', 'indexing-log.json')

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const RESUME = args.includes('--resume')
const NOTIFICATION_TYPE = args.includes('--type')
  ? args[args.indexOf('--type') + 1]
  : 'URL_UPDATED'

if (args.includes('--help')) {
  console.log(`
Google Indexing API — submit URLs for sauna.guide

Usage:
  node --env-file=.env.local scripts/submit-indexing.mjs [options]

Options:
  --dry-run         List URLs without submitting
  --resume          Skip URLs already submitted (reads indexing-log.json)
  --type <type>     URL_UPDATED (default) or URL_DELETED
  --help            Show this help
`)
  process.exit(0)
}

// ── Auth ────────────────────────────────────────────────────────────────────

if (!KEY_PATH) {
  console.error('❌ Missing GOOGLE_SERVICE_ACCOUNT_KEY_PATH in environment.')
  process.exit(1)
}

const keyFile = JSON.parse(fs.readFileSync(KEY_PATH, 'utf-8'))

const auth = new google.auth.GoogleAuth({
  credentials: keyFile,
  scopes: ['https://www.googleapis.com/auth/indexing'],
})

const indexing = google.indexing({ version: 'v3', auth })

// ── Collect all URLs ────────────────────────────────────────────────────────

function collectUrls() {
  const urls = []

  // 1. Static routes
  const staticPaths = [
    '/',
    '/saunas',
    '/guides',
    '/accessories',
    '/sauna-brands',
    '/challenge',
    '/newsletter',
  ]
  for (const p of staticPaths) {
    urls.push(`${BASE_URL}${p}`)
  }

  // 2. Sauna detail pages
  try {
    const saunasData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'src/data/saunas.json'), 'utf-8')
    )
    for (const sauna of saunasData.saunas) {
      urls.push(`${BASE_URL}/saunas/${sauna.id}`)
    }
  } catch (e) {
    console.warn('⚠️  Could not read saunas.json:', e.message)
  }

  // 3. Guide pages (MDX files)
  try {
    const guidesDir = path.join(process.cwd(), 'src/content/guides')
    const files = fs.readdirSync(guidesDir).filter((f) => f.endsWith('.mdx'))
    for (const file of files) {
      urls.push(`${BASE_URL}/guides/${file.replace('.mdx', '')}`)
    }
  } catch (e) {
    console.warn('⚠️  Could not read guides directory:', e.message)
  }

  // 4. Gear product pages (nested under categories)
  try {
    const gearData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'src/data/gear-merged.json'), 'utf-8')
    )
    for (const category of gearData.categories || []) {
      for (const product of category.products || []) {
        if (product.slug) {
          urls.push(`${BASE_URL}/accessories/${product.slug}`)
        }
      }
    }
  } catch (e) {
    console.warn('⚠️  Could not read gear-merged.json:', e.message)
  }

  // 5. Brand/manufacturer pages (slugify from name)
  try {
    const mfrData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'src/data/manufacturers.json'), 'utf-8')
    )
    for (const m of mfrData.manufacturers || []) {
      const slug = m.slug || m.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      if (slug) {
        urls.push(`${BASE_URL}/sauna-brands/${slug}`)
      }
    }
  } catch (e) {
    console.warn('⚠️  Could not read manufacturers.json:', e.message)
  }

  return urls
}

// ── Submit URLs ─────────────────────────────────────────────────────────────

async function submitUrl(url) {
  const res = await indexing.urlNotifications.publish({
    requestBody: {
      url,
      type: NOTIFICATION_TYPE,
    },
  })
  return res.data
}

// Load previously submitted URLs for --resume
function getAlreadySubmitted() {
  try {
    const log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
    return new Set(
      log.results
        .filter((r) => r.status === 'ok')
        .map((r) => r.url)
    )
  } catch {
    return new Set()
  }
}

// Batch with concurrency limit and early abort on quota exhaustion
async function submitBatch(urls, concurrency = 5) {
  let submitted = 0
  let errors = 0
  let quotaExhausted = false
  const results = []

  for (let i = 0; i < urls.length; i += concurrency) {
    if (quotaExhausted) {
      // Mark remaining as skipped
      for (const url of urls.slice(i)) {
        results.push({ url, status: 'skipped', error: 'quota exhausted' })
      }
      break
    }

    const batch = urls.slice(i, i + concurrency)
    const promises = batch.map(async (url) => {
      if (quotaExhausted) {
        return { url, status: 'skipped', error: 'quota exhausted' }
      }
      try {
        const result = await submitUrl(url)
        submitted++
        return { url, status: 'ok', notifyTime: result.urlNotificationMetadata?.latestUpdate?.notifyTime }
      } catch (e) {
        errors++
        const status = e.response?.status || e.code || 'unknown'
        const message = e.response?.data?.error?.message || e.message
        if (e.response?.status === 429) {
          quotaExhausted = true
        }
        return { url, status: 'error', error: `${status}: ${message}` }
      }
    })

    const batchResults = await Promise.all(promises)
    results.push(...batchResults)

    // Progress
    const total = submitted + errors
    process.stdout.write(`\r   📡 ${total}/${urls.length} submitted (${errors} errors)`)

    // Small delay between batches to be nice to the API
    if (i + concurrency < urls.length && !quotaExhausted) {
      await new Promise((r) => setTimeout(r, 200))
    }
  }

  console.log() // newline after progress
  const skipped = results.filter((r) => r.status === 'skipped').length
  return { submitted, errors, skipped, results }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  let urls = collectUrls()

  console.log(`🔗 Collected ${urls.length} URLs from sauna.guide`)
  console.log(`   Type: ${NOTIFICATION_TYPE}`)

  // Resume: skip already submitted URLs
  let previousResults = []
  if (RESUME) {
    const alreadyDone = getAlreadySubmitted()
    if (alreadyDone.size > 0) {
      // Keep previous successful results for the merged log
      try {
        const prevLog = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
        previousResults = prevLog.results.filter((r) => r.status === 'ok')
      } catch { /* ignore */ }
      urls = urls.filter((u) => !alreadyDone.has(u))
      console.log(`   ⏭️  Skipping ${alreadyDone.size} already submitted, ${urls.length} remaining`)
    }
  }
  console.log()

  if (urls.length === 0) {
    console.log('✅ All URLs already submitted!')
    return
  }

  if (DRY_RUN) {
    console.log('── Dry Run (URLs that would be submitted) ──────')
    for (const url of urls) {
      console.log(`   ${url}`)
    }
    console.log()
    console.log(`   Total: ${urls.length} URLs`)
    return
  }

  console.log('── Submitting to Google Indexing API ─────────────')
  const { submitted, errors, skipped, results } = await submitBatch(urls)

  console.log()
  console.log('── Results ──────────────────────────────────────')
  console.log(`   ✅ Submitted: ${submitted}`)
  console.log(`   ❌ Errors:    ${errors}`)
  if (skipped > 0) {
    console.log(`   ⏭️  Skipped:   ${skipped} (quota exhausted — run again tomorrow with --resume)`)
  }
  console.log()

  // Show non-quota errors
  const realErrors = results.filter((r) => r.status === 'error' && !r.error.includes('429'))
  if (realErrors.length > 0) {
    console.log('── Errors ───────────────────────────────────────')
    for (const r of realErrors) {
      console.log(`   ${r.url}`)
      console.log(`     → ${r.error}`)
    }
    console.log()
  }

  // Merge with previous results and save
  const mergedResults = [...previousResults, ...results.filter((r) => r.status === 'ok')]
  const allResults = [...mergedResults, ...results.filter((r) => r.status !== 'ok')]
  const log = {
    submittedAt: new Date().toISOString(),
    type: NOTIFICATION_TYPE,
    totalUrls: collectUrls().length,
    submitted: mergedResults.length,
    remaining: allResults.filter((r) => r.status !== 'ok').length,
    results: allResults,
  }
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2))
  console.log(`📝 Log saved to ${LOG_FILE}`)

  if (skipped > 0) {
    console.log()
    console.log('💡 Run again tomorrow to submit remaining URLs:')
    console.log('   node --env-file=.env.local scripts/submit-indexing.mjs --resume')
  }
}

main().catch((err) => {
  console.error('❌ Error:', err.message)
  if (err.message.includes('403')) {
    console.error('\n   Make sure:')
    console.error('   1. Indexing API is enabled in Google Cloud Console')
    console.error('   2. Service account is added as OWNER in Search Console')
  }
  process.exit(1)
})
