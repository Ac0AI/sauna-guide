#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const SITE_URL = process.env.SITE_URL || 'https://sauna.guide'
const INDEXNOW_ENDPOINT = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow'
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '4a1eb509-18a2-4d8d-a46e-7f2b9f5cbb5d'
const KEY_FILENAME = `${INDEXNOW_KEY}.txt`
const KEY_LOCATION = `${SITE_URL}/${KEY_FILENAME}`
const KEY_PATH = path.join(process.cwd(), 'public', KEY_FILENAME)

function normalizeUrl(input) {
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input
  }

  const normalizedPath = input.startsWith('/') ? input : `/${input}`
  return `${SITE_URL}${normalizedPath}`
}

function readUrlsFromArgs(args) {
  const uniqueUrls = new Set()

  for (const arg of args) {
    if (!arg.trim()) continue
    uniqueUrls.add(normalizeUrl(arg.trim()))
  }

  return Array.from(uniqueUrls)
}

async function submitIndexNow(urlList) {
  const host = new URL(SITE_URL).host
  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  })

  const text = await response.text()

  if (!response.ok && response.status !== 202) {
    throw new Error(`IndexNow failed with ${response.status}: ${text || 'No response body'}`)
  }

  console.log(`IndexNow accepted ${urlList.length} URL(s) with status ${response.status}.`)
  if (text) {
    console.log(text)
  }
}

async function main() {
  if (!fs.existsSync(KEY_PATH)) {
    throw new Error(`Missing key file at ${KEY_PATH}`)
  }

  const args = process.argv.slice(2)
  const urlList = readUrlsFromArgs(args)

  if (urlList.length === 0) {
    console.error('Usage: node scripts/indexnow.mjs /guides/foo /guides/bar')
    process.exit(1)
  }

  await submitIndexNow(urlList)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
