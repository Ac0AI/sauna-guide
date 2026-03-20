#!/usr/bin/env node

import fs from 'node:fs'
import { google } from 'googleapis'

const SITE_URL = process.env.SEARCH_CONSOLE_SITE_URL || 'sc-domain:sauna.guide'
const KEY_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH
const DEFAULT_SITEMAP_URL = process.env.PUBLIC_SITE_URL || 'https://sauna.guide'

if (!KEY_PATH) {
  console.error('❌ Missing GOOGLE_SERVICE_ACCOUNT_KEY_PATH in environment.')
  process.exit(1)
}

const args = process.argv.slice(2)
const sitemapUrls = args.length > 0
  ? args
  : [`${DEFAULT_SITEMAP_URL.replace(/\/$/, '')}/sitemap.xml`]

const keyFile = JSON.parse(fs.readFileSync(KEY_PATH, 'utf-8'))

const auth = new google.auth.GoogleAuth({
  credentials: keyFile,
  scopes: ['https://www.googleapis.com/auth/webmasters'],
})

const searchconsole = google.searchconsole({ version: 'v1', auth })

async function main() {
  for (const sitemapUrl of sitemapUrls) {
    await searchconsole.sitemaps.submit({
      siteUrl: SITE_URL,
      feedpath: sitemapUrl,
    })

    console.log(`✅ Submitted sitemap: ${sitemapUrl}`)
  }
}

main().catch((error) => {
  console.error('❌ Failed to submit sitemap.')
  console.error(error.message || error)
  process.exit(1)
})
