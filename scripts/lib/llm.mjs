/**
 * Shared Claude API client for LLM-based data normalization.
 *
 * RULE: LLM structures and summarizes. It never invents facts.
 * Every prompt must include source material. Every output must be parseable JSON.
 */

import { Anthropic } from '@posthog/ai'
import { PostHog } from 'posthog-node'
import { jsonrepair } from 'jsonrepair'

let client = null
let phClient = null

function getPostHogClient() {
  if (!phClient) {
    phClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
      flushAt: 1,
      flushInterval: 0,
    })
    // Flush on script exit
    process.on('beforeExit', async () => {
      await phClient.shutdown()
    })
  }
  return phClient
}

function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY. Set it in .env.local')
      process.exit(1)
    }
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      posthog: getPostHogClient(),
    })
  }
  return client
}

/**
 * Send a structured prompt to Claude and parse JSON response.
 */
export async function extractStructured(systemPrompt, userPrompt, { model = 'claude-3-haiku-20240307', maxTokens = 4096, temperature = 0, posthogTraceId, posthogProperties } = {}) {
  const resolvedModel = process.env.ANTHROPIC_MODEL || model
  const anthropic = getClient()

  const response = await anthropic.messages.create({
    model: resolvedModel,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    posthogDistinctId: 'enrichment-script',
    posthogTraceId,
    posthogProperties,
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
    try {
      return JSON.parse(jsonrepair(jsonStr))
    } catch {
      console.error('LLM returned non-JSON:', text.slice(0, 500))
      throw new Error(`Failed to parse LLM response as JSON: ${err.message}`)
    }
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

  return extractStructured(systemPrompt, userPrompt, {
    posthogProperties: { task: 'normalize_sauna', source_count: rawSources.length },
  })
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

  return extractStructured(systemPrompt, userPrompt, {
    posthogProperties: { task: 'normalize_brand', source_count: rawSources.length },
  })
}
