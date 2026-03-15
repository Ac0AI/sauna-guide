#!/usr/bin/env node

/**
 * Analyze guides against Search Console data to find optimization opportunities.
 *
 * Usage:
 *   node --env-file=.env.local scripts/enrich-guides.mjs
 *   node --env-file=.env.local scripts/enrich-guides.mjs --guide sauna-health-benefits
 *   node --env-file=.env.local scripts/enrich-guides.mjs --skip-llm
 */

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { extractStructured } from './lib/llm.mjs'

const GUIDES_DIR = 'src/content/guides'
const GSC_QUERIES_PATH = 'src/data/search-console-queries.json'
const GSC_PAGES_PATH = 'src/data/search-console-pages.json'
const OUTPUT_PATH = 'src/data/guide-optimization-report.json'

function parseArgs() {
  const args = process.argv.slice(2)
  const get = (name) => {
    const idx = args.indexOf(`--${name}`)
    return idx !== -1 ? args[idx + 1] : undefined
  }
  return {
    guide: get('guide'),
    skipLlm: args.includes('--skip-llm'),
    help: args.includes('--help'),
  }
}

function loadGuides() {
  if (!fs.existsSync(GUIDES_DIR)) return []
  const files = fs.readdirSync(GUIDES_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
  return files.map((file) => {
    const content = fs.readFileSync(path.join(GUIDES_DIR, file), 'utf-8')
    const { data: frontmatter, content: body } = matter(content)
    const slug = file.replace(/\.(mdx?|md)$/, '')
    return { slug, file, frontmatter, body, url: `https://sauna.guide/guides/${slug}` }
  })
}

function loadGscData() {
  const queries = fs.existsSync(GSC_QUERIES_PATH)
    ? JSON.parse(fs.readFileSync(GSC_QUERIES_PATH, 'utf-8'))
    : []
  const pages = fs.existsSync(GSC_PAGES_PATH)
    ? JSON.parse(fs.readFileSync(GSC_PAGES_PATH, 'utf-8'))
    : []
  return { queries, pages }
}

async function suggestImprovements(guide, relatedQueries) {
  const systemPrompt = `You are an SEO content optimization assistant for a sauna guide website.
Your job is to suggest specific, actionable improvements based on search data.

RULES:
- Suggest title/description changes only if they better match search intent
- Suggest new content sections only if they address real search queries
- Be specific: "Add a section about X" not "Improve the content"
- Output valid JSON`

  const userPrompt = `## Current guide: ${guide.frontmatter.title}
URL: ${guide.url}
Current meta description: ${guide.frontmatter.description || 'none'}
Current tags: ${(guide.frontmatter.tags || []).join(', ')}

Content headings from the article:
${guide.body.match(/^#{1,3}\s+.+/gm)?.join('\n') || 'No headings found'}

## Search queries with impressions (what people search for):
${relatedQueries.slice(0, 30).map((q) => `- "${q.key}" — ${q.impressions} imp, pos ${q.position}, CTR ${q.ctr}%`).join('\n')}

## Output JSON:
{
  "suggestedTitle": "string or null — only if current title should change",
  "suggestedDescription": "string or null — only if current description should change",
  "missingTopics": ["topics that search queries suggest but the guide doesn't cover"],
  "missingSections": ["specific section headings to add"],
  "faqsToAdd": ["questions from search queries that should be answered"],
  "internalLinksToAdd": ["pages on sauna.guide this guide should link to"],
  "priority": "high | medium | low — based on search opportunity"
}`

  return extractStructured(systemPrompt, userPrompt)
}

async function main() {
  const opts = parseArgs()

  if (opts.help) {
    console.log('Usage: node --env-file=.env.local scripts/enrich-guides.mjs [--guide <slug>] [--skip-llm]')
    process.exit(0)
  }

  const guides = loadGuides()
  const { queries, pages } = loadGscData()

  let targetGuides = guides
  if (opts.guide) {
    targetGuides = guides.filter((g) => g.slug === opts.guide)
    if (targetGuides.length === 0) {
      console.error(`Guide "${opts.guide}" not found`)
      process.exit(1)
    }
  }

  console.log(`\nAnalyzing ${targetGuides.length} guides against ${queries.length} GSC queries...`)

  const results = []

  for (const guide of targetGuides) {
    const pageData = pages.find((p) => p.key.includes(guide.slug))
    const relatedQueries = queries
      .filter((q) => q.impressions > 0)
      .sort((a, b) => b.impressions - a.impressions)

    console.log(`\n  ${guide.frontmatter.title}`)
    console.log(`    GSC: ${pageData ? `${pageData.clicks} clicks, ${pageData.impressions} imp` : 'No data yet'}`)

    if (opts.skipLlm || relatedQueries.length === 0) {
      results.push({
        slug: guide.slug,
        title: guide.frontmatter.title,
        gsc: pageData || null,
        suggestions: null,
        reason: relatedQueries.length === 0 ? 'no_gsc_data' : 'llm_skipped',
      })
      continue
    }

    try {
      const suggestions = await suggestImprovements(guide, relatedQueries)
      results.push({
        slug: guide.slug,
        title: guide.frontmatter.title,
        gsc: pageData || null,
        suggestions,
      })
      console.log(`    Priority: ${suggestions.priority}`)
      if (suggestions.missingSections?.length > 0) {
        console.log(`    Missing sections: ${suggestions.missingSections.join(', ')}`)
      }
    } catch (err) {
      console.log(`    LLM failed: ${err.message}`)
      results.push({ slug: guide.slug, title: guide.frontmatter.title, error: err.message })
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2) + '\n')
  console.log(`\nReport saved to ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error(`Guide optimization failed: ${err.message}`)
  process.exit(1)
})
