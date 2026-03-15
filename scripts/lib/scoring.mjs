/**
 * QA scoring for enriched pages.
 * Score 0-100 based on field completeness, source coverage, and decision usefulness.
 */

// --- Sauna scoring ---

const SAUNA_FIELD_WEIGHTS = {
  description: 5,
  'location.address': 5,
  'location.coordinates': 3,
  website: 3,
  rating: 2,
  reviewCount: 2,
  phone: 2,
  openingHours: 4,
  admission: 4,
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
  'enrichment.sources': 8,
  'enrichment.lastVerified': 3,
  images: 5,
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

  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0
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
