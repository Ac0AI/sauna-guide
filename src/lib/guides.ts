import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const guidesDirectory = path.join(process.cwd(), 'src/content/guides')

export interface GuideMeta {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tags?: string[]
  image?: string
  lastModified?: string
  buyerHandoff?: boolean
}

export interface GuidePost {
  meta: GuideMeta
  content: string // Raw content for serialization later or reading time calc
}

export interface GuideFaq {
  question: string
  answer: string
}

function getGuideLastModified(fullPath: string): string | undefined {
  try {
    return fs.statSync(fullPath).mtime.toISOString()
  } catch {
    return undefined
  }
}

export function formatGuideAuthorName(author?: string) {
  if (!author || /^Sauna Guide(?: Team)?$/i.test(author.trim())) {
    return 'Sauna Guide Editorial Team'
  }

  return author.trim()
}

export function getGuideAuthorSchema(author?: string) {
  const name = formatGuideAuthorName(author)
  const isEditorialTeam = /Sauna Guide/i.test(name) || /Editorial Team/i.test(name)

  if (isEditorialTeam) {
    return {
      '@type': 'Organization' as const,
      name,
    }
  }

  return {
    '@type': 'Person' as const,
    name,
  }
}

function markdownToPlainText(markdown: string) {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractGuideFaqs(content: string): GuideFaq[] {
  const faqSectionMatch = content.match(
    /##\s+(?:Frequently Asked Questions|FAQ)\s*\n([\s\S]*?)(?=\n##\s+|$)/
  )

  if (!faqSectionMatch) {
    return []
  }

  const section = faqSectionMatch[1]
  const questionPattern = /###\s+(.+)\n([\s\S]*?)(?=\n###\s+|$)/g
  const faqs: GuideFaq[] = []

  for (const match of section.matchAll(questionPattern)) {
    const question = match[1]?.trim()
    const answer = markdownToPlainText(match[2] || '')

    if (!question || !answer) {
      continue
    }

    faqs.push({ question, answer })
  }

  return faqs
}

export function getRelatedGuides(currentSlug: string, count = 3): GuideMeta[] {
  const guides = getAllGuides()
  const currentGuide = guides.find((guide) => guide.slug === currentSlug)

  if (!currentGuide) {
    return guides.filter((guide) => guide.slug !== currentSlug).slice(0, count)
  }

  const currentTags = new Set((currentGuide.tags || []).map((tag) => tag.toLowerCase()))

  return guides
    .filter((guide) => guide.slug !== currentSlug)
    .map((guide) => {
      const overlap = (guide.tags || []).filter((tag) => currentTags.has(tag.toLowerCase())).length
      return { guide, overlap }
    })
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap
      if (a.guide.date < b.guide.date) return 1
      if (a.guide.date > b.guide.date) return -1
      return 0
    })
    .slice(0, count)
    .map(({ guide }) => guide)
}

export function getAllGuides(): GuideMeta[] {
  // Create directory if it doesn't exist to avoid crash
  if (!fs.existsSync(guidesDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(guidesDirectory)
  const guides = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '')
      const fullPath = path.join(guidesDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      const lastModified = getGuideLastModified(fullPath)

      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author,
        tags: data.tags,
        image: data.image,
        buyerHandoff: data.buyerHandoff === true,
        lastModified,
      } as GuideMeta
    })

  // Filter out guides with future dates (scheduled publishing)
  const today = new Date().toISOString().split('T')[0]
  const published = guides.filter((g) => g.date <= today)

  // Sort guides by date (newest first)
  return published.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getGuideBySlug(slug: string) {
  const fullPath = path.join(guidesDirectory, `${slug}.mdx`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  // Block access to scheduled (future-dated) guides
  const today = new Date().toISOString().split('T')[0]
  if (data.date && data.date > today) {
    return null
  }

  const lastModified = getGuideLastModified(fullPath)

  return {
    meta: {
      slug,
      ...data,
      lastModified,
    } as GuideMeta,
    content,
  }
}
