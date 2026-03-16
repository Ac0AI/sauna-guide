#!/usr/bin/env node

/**
 * Creates the 5 quiz custom fields in Beehiiv.
 * Run once: node scripts/setup-beehiiv-quiz-fields.mjs
 *
 * Requires BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID in .env.local
 */

import { readFileSync } from 'fs'

// Parse .env.local without dotenv
const envFile = readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

const API_KEY = process.env.BEEHIIV_API_KEY
const PUB_ID = process.env.BEEHIIV_PUBLICATION_ID

if (!API_KEY || !PUB_ID) {
  console.error('Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID in .env.local')
  process.exit(1)
}

const fields = [
  { display: 'quiz_heat_type', kind: 'string' },
  { display: 'quiz_budget', kind: 'string' },
  { display: 'quiz_timeline', kind: 'string' },
  { display: 'quiz_placement', kind: 'string' },
  { display: 'quiz_motivation', kind: 'string' },
]

async function createField(field) {
  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${PUB_ID}/custom_fields`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(field),
    }
  )

  const data = await res.json()

  if (res.ok) {
    console.log(`  ✓ ${field.display} (id: ${data.data?.id})`)
  } else {
    const msg = data.errors?.[0]?.message || res.statusText
    console.log(`  ✗ ${field.display}: ${msg}`)
  }
}

console.log('Creating Beehiiv custom fields for quiz...\n')

for (const field of fields) {
  await createField(field)
}

console.log('\nDone. Fields are ready for quiz subscriptions.')
