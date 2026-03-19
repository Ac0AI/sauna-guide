#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import Parser from 'rss-parser'
import { extractStructured } from './lib/llm.mjs'
import { generateGeminiImage } from './lib/gemini-image.mjs'

const parser = new Parser()

const DEFAULT_LOOKBACK_DAYS = 14
const DEFAULT_STORY_LIMIT = 5
const MAX_CANDIDATES = 18
const FEED_NAMES = [
  'SaunaTimes Newsletter',
  'Relax Saunas',
  'SaunaTimes',
  'Almost Heaven Saunas Blog',
  'r/Sauna',
]

function getArgValue(flag) {
  const index = process.argv.indexOf(flag)
  if (index === -1 || index === process.argv.length - 1) {
    return null
  }

  return process.argv[index + 1]
}

function hasFlag(flag) {
  return process.argv.includes(flag)
}

function stripHtml(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(value, maxLength) {
  if (!value || value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1).trim()}…`
}

function escapeYaml(value = '') {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function toIsoDate(value) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

function formatDisplayDate(value) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

function sanitizeTag(tag) {
  return String(tag || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSourceCap(sourceName) {
  if (sourceName === 'r/Sauna') {
    return 2
  }

  return 3
}

function loadContentSources() {
  const filePath = path.join(process.cwd(), 'src', 'data', 'content-sources.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function pickFeedSources(contentSources) {
  const sourcePool = [
    ...contentSources.newsletters,
    ...contentSources.blogs,
    ...contentSources.reddit,
  ]

  return FEED_NAMES
    .map((name) => sourcePool.find((source) => source.name === name && source.rss))
    .filter(Boolean)
}

async function fetchFeedItems(source) {
  const response = await fetch(source.rss, {
    headers: {
      'user-agent': 'Mozilla/5.0 SaunaGuideBot/1.0 (+https://sauna.guide)',
      accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const xml = await response.text()
  const feed = await parser.parseString(xml)

  return (feed.items || []).map((item) => {
    const published = toIsoDate(item.isoDate || item.pubDate || item.published || item.created)
    const summary = stripHtml(
      item.contentSnippet ||
      item.content ||
      item.summary ||
      item['content:encoded'] ||
      item.description ||
      ''
    )

    return {
      sourceName: source.name,
      sourceUrl: source.url,
      sourceFeed: source.rss,
      sourceFocus: source.focus || [],
      title: stripHtml(item.title || ''),
      url: item.link || item.guid || '',
      published,
      summary: truncate(summary, 420),
    }
  })
}

function filterCandidateItems(items, { lookbackDays, storyLimit }) {
  const now = new Date()
  const lookbackCutoff = new Date(now)
  lookbackCutoff.setDate(now.getDate() - lookbackDays)

  const extendedCutoff = new Date(now)
  extendedCutoff.setDate(now.getDate() - 45)

  const deduped = items
    .filter((item) => item.title && item.url && item.published)
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
    .filter((item, index, list) => (
      list.findIndex((other) => other.url === item.url || other.title === item.title) === index
    ))

  const recent = deduped.filter((item) => new Date(item.published) >= lookbackCutoff)

  const sourceBalanced = (pool) => {
    const buckets = new Map()

    for (const item of pool) {
      if (!buckets.has(item.sourceName)) {
        buckets.set(item.sourceName, [])
      }
      buckets.get(item.sourceName).push(item)
    }

    const sourceOrder = [
      ...FEED_NAMES.filter((name) => buckets.has(name)),
      ...Array.from(buckets.keys()).filter((name) => !FEED_NAMES.includes(name)),
    ]

    const balanced = []
    const maxRounds = Math.max(...Array.from(buckets.keys()).map((sourceName) => getSourceCap(sourceName)))

    for (let round = 0; round < maxRounds && balanced.length < MAX_CANDIDATES; round += 1) {
      for (const sourceName of sourceOrder) {
        const bucket = buckets.get(sourceName) || []
        if (round < getSourceCap(sourceName) && bucket[round]) {
          balanced.push(bucket[round])
        }
        if (balanced.length >= MAX_CANDIDATES) {
          break
        }
      }
    }

    return balanced
  }

  if (recent.length >= storyLimit * 2) {
    return sourceBalanced(recent)
  }

  return sourceBalanced(deduped
    .filter((item) => new Date(item.published) >= extendedCutoff)
  )
}

async function buildBrief(candidateItems, issueDate, storyLimit) {
  const brandVoice = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'brand-voice.json'), 'utf8')
  )

  const baseSystemPrompt = `You are an editorial briefing assistant for Sauna Guide.
You turn source items into a weekly sauna news edition.

Rules:
- Use ONLY the provided source material. Never invent facts, dates, studies, or claims.
- Pick exactly ${storyLimit} items that feel timely and varied.
- Keep the writing in Sauna Guide's brand voice: warm, atmospheric, curious, not salesy, not bro-science.
- The title must start with "Sauna News:".
- The description must sound specific and editorial. Avoid generic promo language like "dive into" or "discover".
- Summaries should be crisp and bullet-ready.
- Prefer a mix of culture, build/buyer, science, and community when possible.
- Include at most 1 community/forum item unless the source mix is too thin to do otherwise.
- Use at least 3 distinct sources.
- Use no more than 2 items from the same source.
- Each story must map to exactly one source item. Do not merge multiple source items into one story.
- If an item is promotional, say so clearly and keep the tone measured.
- Preserve sourceUrl exactly as provided.
- The imagePrompt must describe one strong editorial scene for a horizontal hero image. No text. No logos. No collage.`

  const baseUserPrompt = `Issue date: ${issueDate}
Brand voice:
${JSON.stringify({
  promise: brandVoice.promise,
  tone: brandVoice.tone,
  vocabulary: brandVoice.vocabulary,
  signature_phrases: brandVoice.signature_phrases,
  core_belief: brandVoice.core_belief,
}, null, 2)}

Candidate source items:
${JSON.stringify(candidateItems, null, 2)}

Return valid JSON with this exact shape:
{
  "title": "string",
  "description": "string, max 155 chars",
  "intro": ["paragraph one", "paragraph two"],
  "keyPoints": ["short bullet", "short bullet", "short bullet", "short bullet", "short bullet"],
  "closing": "string",
  "imagePrompt": "string",
  "stories": [
    {
      "headline": "string",
      "whatHappened": "string",
      "whyItMatters": "string",
      "sourceLabel": "string",
      "sourceUrl": "string",
      "sourceTitle": "string",
      "publishedDate": "YYYY-MM-DD",
      "tags": ["string", "string"]
    }
  ]
}`

  const retryHints = [
    '',
    '\nExtra output rule: Return strict JSON only. Do not use quotation marks inside sentence strings unless escaped. Avoid fancy punctuation.',
    '\nExtra output rule: Return strict minified JSON only. Prefer short, plain sentences and avoid nested punctuation that could break JSON.',
  ]

  let lastError = null

  for (const hint of retryHints) {
    try {
      return await extractStructured(`${baseSystemPrompt}${hint}`, `${baseUserPrompt}${hint}`, {
        maxTokens: 4096,
      })
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

function validateBrief(brief) {
  if (!brief || typeof brief !== 'object') {
    throw new Error('LLM returned an empty brief')
  }

  if (!Array.isArray(brief.stories)) {
    throw new Error('LLM brief did not include stories')
  }

  if (!Array.isArray(brief.intro) || brief.intro.length < 1) {
    throw new Error('LLM brief did not include intro paragraphs')
  }

  if (!Array.isArray(brief.keyPoints) || brief.keyPoints.length < 3) {
    throw new Error('LLM brief did not include enough key points')
  }
}

function buildFrontmatter({ title, description, issueDate, imagePath, tags, sources, storyCount }) {
  const lines = [
    '---',
    `title: "${escapeYaml(title)}"`,
    `description: "${escapeYaml(description)}"`,
    `date: "${issueDate}"`,
    'author: "Sauna Guide"',
    'tags:',
    ...tags.map((tag) => `  - "${escapeYaml(tag)}"`),
    `image: "${escapeYaml(imagePath)}"`,
    `storyCount: ${storyCount}`,
    'sources:',
    ...sources.flatMap((source) => [
      '  -',
      `    label: "${escapeYaml(source.label)}"`,
      `    url: "${escapeYaml(source.url)}"`,
      `    title: "${escapeYaml(source.title)}"`,
    ]),
    '---',
    '',
  ]

  return lines.join('\n')
}

function buildMdxBody({ title, intro, keyPoints, stories, closing }) {
  const lines = [
    `# ${title}`,
    '',
    ...intro.flatMap((paragraph) => [paragraph.trim(), '']),
    '## The Short Version',
    '',
    ...keyPoints.map((point) => `- ${point.trim()}`),
    '',
    '## What Happened This Week',
    '',
  ]

  for (const story of stories) {
    lines.push(`### ${story.headline.trim()}`)
    lines.push('')
    lines.push(`- **What happened:** ${story.whatHappened.trim()}`)
    lines.push(`- **Why it matters:** ${story.whyItMatters.trim()}`)
    lines.push(`- **Source:** [${story.sourceLabel.trim()}](${story.sourceUrl.trim()})`)
    lines.push('')
  }

  lines.push('## Step Inside')
  lines.push('')
  lines.push(closing.trim())
  lines.push('')
  if (!/Every Thursday|why heat heals/i.test(closing)) {
    lines.push('Every Thursday, we share why heat heals, where to find it, and five minutes of stillness.')
    lines.push('')
  }
  lines.push('[Step inside](/newsletter)')
  lines.push('')

  return lines.join('\n')
}

async function main() {
  const issueDate = getArgValue('--date') || new Date().toISOString().slice(0, 10)
  const lookbackDays = Number(getArgValue('--days') || DEFAULT_LOOKBACK_DAYS)
  const storyLimit = Number(getArgValue('--limit') || DEFAULT_STORY_LIMIT)
  const skipImage = hasFlag('--skip-image')
  const force = hasFlag('--force')

  const slug = `sauna-news-${issueDate}`
  const outputFile = path.join(process.cwd(), 'src', 'content', 'news', `${slug}.mdx`)
  const outputImage = path.join(process.cwd(), 'public', 'images', 'news', `${slug}.jpg`)
  const rawBriefFile = path.join(process.cwd(), 'src', 'data', 'news-briefs', `${slug}.json`)

  if (fs.existsSync(outputFile) && !force) {
    throw new Error(`News issue already exists: ${outputFile}. Re-run with --force to overwrite.`)
  }

  const contentSources = loadContentSources()
  const feedSources = pickFeedSources(contentSources)

  if (feedSources.length === 0) {
    throw new Error('No news feed sources found')
  }

  console.log(`\nCollecting candidate items for ${formatDisplayDate(issueDate)}...\n`)

  const itemResults = await Promise.all(feedSources.map(async (source) => {
    try {
      const items = await fetchFeedItems(source)
      console.log(`✓ ${source.name}: ${items.length} feed items`)
      return items
    } catch (error) {
      console.log(`✗ ${source.name}: ${error.message}`)
      return []
    }
  }))

  const candidateItems = filterCandidateItems(itemResults.flat(), { lookbackDays, storyLimit })

  if (candidateItems.length < storyLimit) {
    throw new Error(`Only found ${candidateItems.length} candidate items. Widen the source mix or lookback window.`)
  }

  const brief = await buildBrief(candidateItems, issueDate, storyLimit)
  validateBrief(brief)

  if (brief.stories.length < storyLimit) {
    throw new Error(`LLM returned ${brief.stories.length} stories. Expected ${storyLimit}.`)
  }

  const limitedStories = brief.stories.slice(0, storyLimit)
  const tags = Array.from(new Set([
    'Sauna News',
    ...limitedStories.flatMap((story) => Array.isArray(story.tags) ? story.tags.map(sanitizeTag) : []),
  ].filter(Boolean))).slice(0, 6)

  const sources = limitedStories.map((story) => ({
    label: story.sourceLabel,
    url: story.sourceUrl,
    title: story.sourceTitle,
  }))

  const imagePath = `/images/news/${slug}.jpg`
  const description = truncate(String(brief.description || '').trim(), 155)

  const frontmatter = buildFrontmatter({
    title: brief.title,
    description,
    issueDate,
    imagePath,
    tags,
    sources,
    storyCount: limitedStories.length,
  })
  const body = buildMdxBody({
    title: brief.title,
    intro: brief.intro,
    keyPoints: brief.keyPoints.slice(0, 6),
    stories: limitedStories,
    closing: brief.closing,
  })

  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.mkdirSync(path.dirname(rawBriefFile), { recursive: true })
  fs.writeFileSync(outputFile, `${frontmatter}${body}`)
  fs.writeFileSync(rawBriefFile, JSON.stringify({
    issueDate,
    slug,
    candidateItems,
    brief: {
      ...brief,
      stories: limitedStories,
    },
  }, null, 2))

  console.log(`\n✓ Wrote issue: ${path.relative(process.cwd(), outputFile)}`)
  console.log(`✓ Wrote brief cache: ${path.relative(process.cwd(), rawBriefFile)}`)

  if (!skipImage) {
    const imagePrompt = `${brief.imagePrompt.trim()}. Editorial feature image for Sauna Guide. Warm cedar, steam, stone, and quiet atmosphere. Horizontal 16:9 composition. Premium magazine photography. No text, no logos, no collage.`
    const imageResult = await generateGeminiImage({
      prompt: imagePrompt,
      outputPath: outputImage,
    })
    console.log(`✓ Wrote image: ${path.relative(process.cwd(), imageResult.outputPath)}`)
  }

  console.log('\nSelected stories:')
  for (const story of limitedStories) {
    console.log(`- ${story.headline} (${story.sourceLabel})`)
  }
  console.log('')
}

main().catch((error) => {
  console.error(`\nFailed to generate sauna news: ${error.message}\n`)
  process.exit(1)
})
