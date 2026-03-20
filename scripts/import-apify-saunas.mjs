#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN

const DEFAULT_ACTOR_ID = 'compass/crawler-google-places'
const DEFAULT_CONFIG_PATH = 'scripts/apify-sauna-searches.json'
const DEFAULT_OUTPUT_PATH = 'src/data/saunas-apify-candidates.json'
const DEFAULT_MAX_PLACES_PER_QUERY = 8
const DEFAULT_LANGUAGE = 'en'

function printHelp() {
  console.log(`
Import sauna venue candidates from Apify into a review-friendly JSON file.

Usage:
  node --env-file=.env.local scripts/import-apify-saunas.mjs
  node --env-file=.env.local scripts/import-apify-saunas.mjs --limit 1
  node --env-file=.env.local scripts/import-apify-saunas.mjs --location "Helsinki, Finland" --queries "public sauna,smoke sauna"
  node --env-file=.env.local scripts/import-apify-saunas.mjs --config scripts/apify-sauna-searches.json --output tmp/saunas.json

Options:
  --config <path>       JSON config with { "searches": [...] }
  --output <path>       Output file. Default: ${DEFAULT_OUTPUT_PATH}
  --actor <id>          Apify actor id. Default: ${DEFAULT_ACTOR_ID}
  --limit <n>           Only run the first N searches from config
  --max-places <n>      Override max places per query
  --language <code>     Override language for all searches
  --location <text>     Run a single location without config
  --queries <csv>       Comma-separated search queries for --location
  --dry-run             Print the actor inputs but do not call Apify
  --help                Show this message
`.trim())
}

function parseArgs(argv) {
  const options = {
    actor: DEFAULT_ACTOR_ID,
    config: DEFAULT_CONFIG_PATH,
    output: DEFAULT_OUTPUT_PATH,
    dryRun: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    switch (arg) {
      case '--config':
        options.config = argv[index + 1]
        index += 1
        break
      case '--output':
        options.output = argv[index + 1]
        index += 1
        break
      case '--actor':
        options.actor = argv[index + 1]
        index += 1
        break
      case '--limit':
        options.limit = Number.parseInt(argv[index + 1], 10)
        index += 1
        break
      case '--max-places':
        options.maxPlaces = Number.parseInt(argv[index + 1], 10)
        index += 1
        break
      case '--language':
        options.language = argv[index + 1]
        index += 1
        break
      case '--location':
        options.location = argv[index + 1]
        index += 1
        break
      case '--queries':
        options.queries = argv[index + 1]
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
        index += 1
        break
      case '--dry-run':
        options.dryRun = true
        break
      case '--help':
      case '-h':
        options.help = true
        break
      default:
        console.error(`Unknown argument: ${arg}`)
        options.help = true
        return options
    }
  }

  return options
}

function loadSearches(options) {
  if (options.location) {
    if (!options.queries?.length) {
      throw new Error('Using --location requires --queries "query one,query two".')
    }

    return [
      {
        label: options.location,
        location: options.location,
        queries: options.queries,
        maxPlacesPerQuery: options.maxPlaces || DEFAULT_MAX_PLACES_PER_QUERY,
        language: options.language || DEFAULT_LANGUAGE,
      },
    ]
  }

  const configPath = path.resolve(process.cwd(), options.config)
  if (!fs.existsSync(configPath)) {
    throw new Error(`Search config not found: ${options.config}`)
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  if (!Array.isArray(config.searches) || config.searches.length === 0) {
    throw new Error(`Config file must contain a non-empty "searches" array: ${options.config}`)
  }

  const searches = config.searches.map((search) => ({
    label: search.label || search.location,
    location: search.location,
    queries: Array.isArray(search.queries) ? search.queries.filter(Boolean) : [],
    maxPlacesPerQuery: options.maxPlaces || search.maxPlacesPerQuery || DEFAULT_MAX_PLACES_PER_QUERY,
    language: options.language || search.language || DEFAULT_LANGUAGE,
  }))

  if (options.limit && Number.isFinite(options.limit)) {
    return searches.slice(0, options.limit)
  }

  return searches
}

function actorIdToApiPath(actorId) {
  return actorId.replace('/', '~')
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function slugify(value) {
  return normalizeText(value).replace(/\s+/g, '-')
}

function titleCase(value) {
  return String(value || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function readExistingSaunas() {
  const filePath = path.resolve(process.cwd(), 'src/data/saunas.json')
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  return Array.isArray(data.saunas) ? data.saunas : []
}

function getCountryName(countryCode, fallbackCountry) {
  if (fallbackCountry) return fallbackCountry
  if (!countryCode) return undefined

  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' })
    return displayNames.of(String(countryCode).toUpperCase()) || countryCode
  } catch {
    return countryCode
  }
}

function parsePriceRange(value) {
  if (!value) return '$$'
  const dollarCount = String(value).match(/\$/g)?.length || 0
  if (dollarCount >= 3) return '$$$'
  if (dollarCount === 2) return '$$'
  if (dollarCount === 1) return '$'
  return '$$'
}

function getCity(item, fallbackLocation) {
  if (item.city) return item.city
  if (item.addressParsed?.city) return item.addressParsed.city

  if (!fallbackLocation) return 'Unknown'

  const [city] = fallbackLocation.split(',')
  return city?.trim() || 'Unknown'
}

function getCountry(item, fallbackLocation) {
  const parsedCountry = item.addressParsed?.country || item.country
  return getCountryName(item.countryCode, parsedCountry || fallbackLocation?.split(',').at(-1)?.trim()) || 'Unknown'
}

function getCoordinates(item) {
  const lat = item.location?.lat ?? item.latitude
  const lng = item.location?.lng ?? item.longitude

  if (typeof lat === 'number' && typeof lng === 'number') {
    return { lat, lng }
  }

  return undefined
}

function getRating(item) {
  const rating = item.totalScore ?? item.rating
  return typeof rating === 'number' ? Math.round(rating * 10) / 10 : undefined
}

function getReviewCount(item) {
  const count = item.reviewsCount ?? item.reviews ?? item.reviewCount
  return typeof count === 'number' ? count : undefined
}

function getSourceCategories(item) {
  const values = []

  if (item.categoryName) values.push(item.categoryName)
  if (Array.isArray(item.categories)) values.push(...item.categories)
  if (item.category) values.push(item.category)

  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))]
}

function classifyType(item) {
  const haystack = normalizeText([
    item.title,
    item.categoryName,
    Array.isArray(item.categories) ? item.categories.join(' ') : '',
  ].join(' '))

  if (/(hotel|resort|lodge)/.test(haystack)) return 'hotel'
  if (/(spa|bathhouse|banya|onsen|thermal|therme|wellness|hamam)/.test(haystack)) return 'spa'
  if (/(private suite|private sauna|members club)/.test(haystack)) return 'private'
  return 'public'
}

function looksLikeSaunaVenue(item) {
  const haystack = normalizeText([
    item.title,
    item.categoryName,
    Array.isArray(item.categories) ? item.categories.join(' ') : '',
  ].join(' '))

  const positiveSignals = /(sauna|spa|bathhouse|banya|onsen|thermal|therme|wellness|steam bath|hot spring)/
  const negativeSignals = /(contractor|builder|construction|installer|repair|wholesale|supplier|equipment|store|shop|dealer|service|manufacturer)/

  return positiveSignals.test(haystack) && !negativeSignals.test(haystack)
}

function deriveFeatures(item, type) {
  const features = []
  const categories = getSourceCategories(item)

  for (const category of categories) {
    const cleaned = titleCase(category.replace(/[_-]+/g, ' '))
    if (!cleaned || cleaned.length > 32) continue
    if (normalizeText(cleaned) === normalizeText(type)) continue
    features.push(cleaned)
    if (features.length >= 4) break
  }

  const rating = getRating(item)
  if (rating && rating >= 4.7 && features.length < 5) {
    features.push('Highly Rated')
  }

  return [...new Set(features)].slice(0, 5)
}

function buildDescription({ name, city, country, type, categoryName, rating, reviewCount, address }) {
  const typeLabel = categoryName || `${type} sauna venue`
  const parts = [`${name} is a ${typeLabel} in ${city}, ${country}.`]

  if (rating && reviewCount) {
    parts.push(`It currently shows a ${rating}/5 rating from ${reviewCount} Google reviews.`)
  } else if (rating) {
    parts.push(`It currently shows a ${rating}/5 rating on Google.`)
  }

  if (address) {
    parts.push(`The listing points to ${address}.`)
  }

  return parts.join(' ')
}

function getImageUrls(item) {
  const candidates = [
    ...(Array.isArray(item.imageUrls) ? item.imageUrls : []),
    ...(Array.isArray(item.images) ? item.images : []),
  ]

  return [...new Set(candidates.filter((value) => typeof value === 'string' && value.startsWith('http')))].slice(0, 3)
}

function buildMatchKeys(sauna) {
  const keys = new Set()
  const nameKey = normalizeText(sauna.name)
  const cityKey = normalizeText(sauna.location?.city)
  const countryKey = normalizeText(sauna.location?.country)

  if (nameKey && cityKey) keys.add(`${nameKey}|${cityKey}`)
  if (nameKey && cityKey && countryKey) keys.add(`${nameKey}|${cityKey}|${countryKey}`)

  if (sauna.website) {
    try {
      const host = new URL(sauna.website).hostname.replace(/^www\./, '')
      keys.add(`website|${host}`)
    } catch {
      // Ignore invalid URLs in source data
    }
  }

  return keys
}

function mapItemToCandidate(item, search) {
  const city = getCity(item, search.location)
  const country = getCountry(item, search.location)
  const type = classifyType(item)
  const rating = getRating(item)
  const reviewCount = getReviewCount(item)
  const categoryName = item.categoryName || getSourceCategories(item)[0] || 'sauna venue'
  const address = item.address || item.street || item.addressParsed?.streetAddress

  const sauna = {
    id: slugify([item.title || 'sauna', city, country].filter(Boolean).join(' ')),
    name: item.title || 'Unknown Sauna',
    location: {
      city,
      country,
      ...(getCoordinates(item) ? { coordinates: getCoordinates(item) } : {}),
    },
    type,
    features: deriveFeatures(item, type),
    priceRange: parsePriceRange(item.price),
    ...(item.website ? { website: item.website } : {}),
    description: buildDescription({
      name: item.title || 'Unknown Sauna',
      city,
      country,
      type,
      categoryName,
      rating,
      reviewCount,
      address,
    }),
    images: getImageUrls(item),
    ...(rating ? { rating } : {}),
  }

  return {
    sauna,
    source: {
      placeId: item.placeId || null,
      searchLabel: search.label,
      searchLocation: search.location,
      searchQueries: search.queries,
      categoryName,
      categories: getSourceCategories(item),
      rating,
      reviewCount,
      mapsUrl: item.url || null,
      website: item.website || null,
      address: address || null,
    },
  }
}

async function runActor(actorId, input) {
  const response = await fetch(`https://api.apify.com/v2/acts/${actorIdToApiPath(actorId)}/run-sync-get-dataset-items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${APIFY_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Apify request failed (${response.status}): ${errorText.slice(0, 300)}`)
  }

  const data = await response.json()
  if (!Array.isArray(data)) {
    throw new Error('Expected Apify to return an array of dataset items.')
  }

  return data
}

function ensureDirectory(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath)
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true })
  return absolutePath
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.help) {
    printHelp()
    process.exit(0)
  }

  const searches = loadSearches(options)
  const existingSaunas = readExistingSaunas()
  const existingKeys = new Set(existingSaunas.flatMap((sauna) => [...buildMatchKeys(sauna)]))

  const searchInputs = searches.map((search) => ({
    label: search.label,
    input: {
      searchStringsArray: search.queries,
      locationQuery: search.location,
      maxCrawledPlacesPerSearch: search.maxPlacesPerQuery,
      language: search.language,
    },
  }))

  if (options.dryRun) {
    console.log(JSON.stringify(searchInputs, null, 2))
    process.exit(0)
  }

  if (!APIFY_API_TOKEN) {
    console.error('Missing APIFY_API_TOKEN. Add it to .env.local or export it before running.')
    console.error('Example: node --env-file=.env.local scripts/import-apify-saunas.mjs')
    process.exit(1)
  }

  const batchKeys = new Set()
  const candidates = []
  const duplicates = []
  const rejected = []
  const searchStats = []
  let totalRawItems = 0

  for (const search of searches) {
    const input = {
      searchStringsArray: search.queries,
      locationQuery: search.location,
      maxCrawledPlacesPerSearch: search.maxPlacesPerQuery,
      language: search.language,
    }

    console.log(`\nRunning Apify search: ${search.label}`)
    console.log(`  location: ${search.location}`)
    console.log(`  queries: ${search.queries.join(', ')}`)

    const items = await runActor(options.actor, input)
    totalRawItems += items.length

    let acceptedForSearch = 0
    let duplicatesForSearch = 0
    let rejectedForSearch = 0

    for (const item of items) {
      if (!looksLikeSaunaVenue(item)) {
        rejected.push({
          reason: 'not_a_sauna_venue',
          source: {
            title: item.title || null,
            categoryName: item.categoryName || null,
            categories: getSourceCategories(item),
            mapsUrl: item.url || null,
            address: item.address || null,
            searchLabel: search.label,
          },
        })
        rejectedForSearch += 1
        continue
      }

      const mapped = mapItemToCandidate(item, search)
      const matchKeys = buildMatchKeys(mapped.sauna)
      const existingMatch = [...matchKeys].find((key) => existingKeys.has(key))
      const batchMatch = item.placeId
        ? batchKeys.has(`place|${item.placeId}`)
        : [...matchKeys].some((key) => batchKeys.has(key))

      if (existingMatch || batchMatch) {
        duplicates.push({
          reason: existingMatch ? 'existing_sauna' : 'duplicate_in_import',
          matchedOn: existingMatch || (item.placeId ? `place|${item.placeId}` : [...matchKeys][0] || null),
          ...mapped,
        })
        duplicatesForSearch += 1
        continue
      }

      if (item.placeId) {
        batchKeys.add(`place|${item.placeId}`)
      }

      for (const key of matchKeys) {
        batchKeys.add(key)
      }

      candidates.push(mapped)
      acceptedForSearch += 1
    }

    searchStats.push({
      label: search.label,
      location: search.location,
      queries: search.queries,
      rawItems: items.length,
      accepted: acceptedForSearch,
      duplicates: duplicatesForSearch,
      rejected: rejectedForSearch,
    })
  }

  const output = {
    generatedAt: new Date().toISOString(),
    actorId: options.actor,
    summary: {
      searchesRun: searches.length,
      rawItems: totalRawItems,
      candidates: candidates.length,
      duplicates: duplicates.length,
      rejected: rejected.length,
    },
    searches: searchStats,
    candidates,
    duplicates,
    rejected,
  }

  const outputPath = ensureDirectory(options.output)
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`)

  console.log('\nImport complete.')
  console.log(`  searches run: ${searches.length}`)
  console.log(`  raw items: ${totalRawItems}`)
  console.log(`  new candidates: ${candidates.length}`)
  console.log(`  duplicates: ${duplicates.length}`)
  console.log(`  rejected: ${rejected.length}`)
  console.log(`  output: ${path.relative(process.cwd(), outputPath)}`)
}

main().catch((error) => {
  console.error(`\nImport failed: ${error.message}`)
  process.exit(1)
})
