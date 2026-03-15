/**
 * Shared Apify API client for enrichment scripts.
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
