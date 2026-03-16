import { getAllManufacturers } from '@/lib/manufacturers'
import type { QuizAnswers, QuizResult, RecommendedBrand } from './types'

interface SaunaCategory {
  type: string
  headline: string
  baseReasoning: string
  costMultiplier: number
  installNotes: string[]
}

function determineSaunaCategory(answers: QuizAnswers): SaunaCategory {
  const { heatType, placement, capacity } = answers

  if (heatType === 'infrared' || (heatType === 'open-to-both' && capacity === '1-2' && placement === 'indoor')) {
    if (placement === 'outdoor') {
      return {
        type: 'infrared-outdoor',
        headline: 'An outdoor infrared cabin is your match.',
        baseReasoning: 'Infrared heat works well outdoors with minimal setup.',
        costMultiplier: 1.2,
        installNotes: [
          'Needs a weatherproof enclosure or covered area',
          'Standard outdoor electrical hookup (usually 20A)',
          'Level surface required - concrete pad or deck',
        ],
      }
    }
    return {
      type: 'infrared-indoor',
      headline: 'An indoor infrared sauna is your match.',
      baseReasoning: 'Infrared panels heat your body directly at lower air temperatures. Perfect for indoor spaces with minimal ventilation needs.',
      costMultiplier: 0.8,
      installNotes: [
        'Most plug into a standard 120V outlet',
        'Minimal ventilation needed - a cracked door works',
        'Fits in a spare room, basement, or large bathroom',
        'No special flooring required',
      ],
    }
  }

  if (placement === 'outdoor') {
    if (capacity === '5+') {
      return {
        type: 'barrel-outdoor-large',
        headline: 'A large barrel or cabin sauna is your match.',
        baseReasoning: 'For outdoor social sessions with 5+ people, a barrel or cabin sauna gives you the space and atmosphere.',
        costMultiplier: 1.5,
        installNotes: [
          'Needs a level foundation (gravel pad, concrete, or deck)',
          'Electrical: 240V dedicated circuit (hire a licensed electrician)',
          'Check local building codes and setback requirements',
          'Consider proximity to a cold plunge or shower area',
          'Wood-fired option eliminates electrical needs entirely',
        ],
      }
    }
    return {
      type: 'barrel-outdoor',
      headline: 'A barrel sauna is your match.',
      baseReasoning: 'Barrel saunas are the most popular outdoor option. The curved shape heats efficiently, looks beautiful, and comes as a kit you can assemble yourself.',
      costMultiplier: 1.1,
      installNotes: [
        'Level gravel pad or concrete base (minimum 4 inches)',
        'Electrical: 240V/30A dedicated circuit for electric heater',
        'Keep 3+ feet clearance from structures and fences',
        'Wood-fired option is popular for off-grid setups',
        'Consider drainage for rain and snowmelt',
      ],
    }
  }

  // Traditional indoor
  if (capacity === '5+') {
    return {
      type: 'traditional-indoor-large',
      headline: 'A custom-built indoor sauna room is your match.',
      baseReasoning: 'For 5+ people indoors, you need a dedicated sauna room. This is the premium option with the most authentic experience.',
      costMultiplier: 1.8,
      installNotes: [
        'Dedicated room with proper vapor barrier and insulation',
        'Electrical: 240V/40-50A circuit for large heater (6-9kW)',
        'Proper ventilation: intake near floor, exhaust near ceiling',
        'Waterproof flooring with drain (tile or concrete)',
        'Check building permits - some jurisdictions require them',
        'Professional installation strongly recommended',
      ],
    }
  }

  return {
    type: 'traditional-indoor',
    headline: 'A traditional indoor sauna is your match.',
    baseReasoning: 'Nothing beats the authentic Finnish experience. Hot rocks, löyly (steam), and the ritual of building heat.',
    costMultiplier: 1.0,
    installNotes: [
      'Electrical: 240V/30A dedicated circuit (hire a licensed electrician)',
      'Ventilation: intake vent near floor, exhaust near ceiling',
      'Waterproof the floor area (tile or pan with drain)',
      'Insulate walls and ceiling with foil vapor barrier',
      'Pre-built kits available for standard room dimensions',
    ],
  }
}

function getCostRange(answers: QuizAnswers, category: SaunaCategory): { low: number; high: number } {
  const baseCosts: Record<string, { low: number; high: number }> = {
    '3k-5k': { low: 3000, high: 5000 },
    '5k-10k': { low: 5000, high: 10000 },
    '10k-15k': { low: 10000, high: 15000 },
    '15k+': { low: 15000, high: 25000 },
  }

  const base = baseCosts[answers.budget || '5k-10k']
  return {
    low: Math.round(base.low * category.costMultiplier),
    high: Math.round(base.high * category.costMultiplier),
  }
}

function rankBrands(answers: QuizAnswers, category: SaunaCategory): RecommendedBrand[] {
  const allBrands = getAllManufacturers()

  // Filter by type relevance
  const typeMap: Record<string, string[]> = {
    'infrared-indoor': ['infrared', 'red-light'],
    'infrared-outdoor': ['infrared'],
    'barrel-outdoor': ['barrel', 'barrel-cabin', 'outdoor'],
    'barrel-outdoor-large': ['barrel', 'barrel-cabin', 'outdoor'],
    'traditional-indoor': ['traditional', 'luxury'],
    'traditional-indoor-large': ['traditional', 'luxury'],
  }

  const relevantTypes = typeMap[category.type] || ['traditional']
  let candidates = allBrands.filter(b => relevantTypes.includes(b.type))

  // If we have too few candidates, include all
  if (candidates.length < 2) {
    candidates = allBrands.filter(b =>
      b.type === 'traditional' || relevantTypes.includes(b.type)
    )
  }

  // Filter by price tier based on budget
  const budgetTierMap: Record<string, string[]> = {
    '3k-5k': ['budget', 'mid-range'],
    '5k-10k': ['mid-range', 'premium'],
    '10k-15k': ['premium', 'luxury'],
    '15k+': ['premium', 'luxury'],
  }

  const budgetTiers = budgetTierMap[answers.budget || '5k-10k']
  const tierFiltered = candidates.filter(b => b.priceTier && budgetTiers.includes(b.priceTier))

  // Use tier-filtered if we have enough, otherwise keep all candidates
  if (tierFiltered.length >= 2) {
    candidates = tierFiltered
  }

  // Score brands based on priority
  const priorityBrands: Record<string, string[]> = {
    design: ['huum', 'klafs', 'tyl'],
    performance: ['harvia', 'finnleo', 'narvi'],
    value: ['almost-heaven-saunas', 'barrel-sauna-co', 'polar-saunas'],
    trust: ['harvia', 'finnleo', 'sunlighten', 'clearlight-saunas'],
  }

  const preferred = priorityBrands[answers.priority || 'value'] || []

  const scored = candidates.map(b => {
    let score = 0
    if (preferred.includes(b.slug)) score += 10
    if (b.priceTier && budgetTiers.includes(b.priceTier)) score += 5
    if (b.bestFor) score += 2
    if (b.keyModels && b.keyModels.length > 0) score += 1
    if (b.buyerVerdict) score += 1
    return { brand: b, score }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, 3).map(({ brand }) => ({
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo,
    bestFor: brand.bestFor,
    keyModels: brand.keyModels,
    buyerVerdict: brand.buyerVerdict,
    priceTier: brand.priceTier,
  }))
}

function buildReasoning(answers: QuizAnswers, category: SaunaCategory): string {
  const parts = [category.baseReasoning]

  const motivationMap: Record<string, string> = {
    health: 'Since health benefits are your primary motivation, you\'ll want a setup that reaches proper sauna temperatures (80-100°C for traditional, 50-65°C for infrared).',
    relaxation: 'You\'re looking for a personal retreat. The ritual matters as much as the heat.',
    social: 'With entertaining in mind, size and atmosphere take priority.',
    'cold-contrast': 'For hot-cold contrast protocols, quick heat-up time and proximity to cold water matter.',
  }

  if (answers.motivation && motivationMap[answers.motivation]) {
    parts.push(motivationMap[answers.motivation])
  }

  const budgetMap: Record<string, string> = {
    '3k-5k': 'At this budget, pre-built kits and entry-level brands deliver solid value without cutting corners on what matters.',
    '5k-10k': 'This is the sweet spot. You get quality materials, reliable heaters, and brands with real warranty backing.',
    '10k-15k': 'At this level, you\'re choosing between premium brands. Expect better wood, quieter heaters, and refined design.',
    '15k+': 'With this budget, you can go custom. Hand-picked materials, designer brands, and professional installation included.',
  }

  if (answers.budget && budgetMap[answers.budget]) {
    parts.push(budgetMap[answers.budget])
  }

  return parts.join(' ')
}

function buildNextSteps(answers: QuizAnswers, category: SaunaCategory): string[] {
  const steps: string[] = []

  steps.push('Measure your space (width, depth, ceiling height)')

  if (category.type.includes('outdoor')) {
    steps.push('Check local zoning and setback requirements')
    steps.push('Plan your foundation (gravel pad or concrete)')
  } else {
    steps.push('Verify ceiling height (7\' minimum for most kits)')
    steps.push('Locate your electrical panel and plan the circuit run')
  }

  if (category.type.includes('traditional')) {
    steps.push('Get an electrician quote for a 240V dedicated circuit')
    steps.push('Plan ventilation (intake and exhaust vent placement)')
  }

  if (answers.timeline === 'ready-now') {
    steps.push('Request quotes from your top 2 brand choices')
    steps.push('Book an electrician before ordering (they\'re busy)')
  } else if (answers.timeline === 'within-3-months') {
    steps.push('Order samples or visit a showroom if possible')
    steps.push('Start getting electrician quotes')
  } else {
    steps.push('Read our detailed guides on your specific setup')
    steps.push('Join the Thursday letter for weekly buying insights')
  }

  return steps
}

export function getQuizResult(answers: QuizAnswers): QuizResult {
  const category = determineSaunaCategory(answers)
  const brands = rankBrands(answers, category)
  const costRange = getCostRange(answers, category)
  const reasoning = buildReasoning(answers, category)
  const nextSteps = buildNextSteps(answers, category)

  return {
    type: category.type,
    headline: category.headline,
    reasoning,
    brands,
    costRange,
    nextSteps,
    installNotes: category.installNotes,
  }
}
