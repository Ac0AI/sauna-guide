import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const newsDirectory = path.join(process.cwd(), 'src/content/news')

export interface NewsSource {
  label: string
  url: string
  title: string
}

export interface NewsMeta {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tags?: string[]
  image?: string
  sources?: NewsSource[]
  storyCount?: number
  lastModified?: string
}

export interface NewsPost {
  meta: NewsMeta
  content: string
}

function getNewsLastModified(fullPath: string): string | undefined {
  try {
    return fs.statSync(fullPath).mtime.toISOString()
  } catch {
    return undefined
  }
}

export function getAllNews(): NewsMeta[] {
  if (!fs.existsSync(newsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(newsDirectory)
  const news = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '')
      const fullPath = path.join(newsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      const lastModified = getNewsLastModified(fullPath)

      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author,
        tags: data.tags,
        image: data.image,
        sources: data.sources,
        storyCount: data.storyCount,
        lastModified,
      } as NewsMeta
    })

  const today = new Date().toISOString().split('T')[0]
  const published = news.filter((post) => post.date <= today)

  return published.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  const fullPath = path.join(newsDirectory, `${slug}.mdx`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const today = new Date().toISOString().split('T')[0]

  if (data.date && data.date > today) {
    return null
  }

  return {
    meta: {
      slug,
      ...data,
      lastModified: getNewsLastModified(fullPath),
    } as NewsMeta,
    content,
  }
}

export function getRelatedNews(currentSlug: string, count = 3): NewsMeta[] {
  const posts = getAllNews()
  const current = posts.find((post) => post.slug === currentSlug)

  if (!current) {
    return posts.filter((post) => post.slug !== currentSlug).slice(0, count)
  }

  const currentTags = new Set((current.tags || []).map((tag) => tag.toLowerCase()))

  return posts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => ({
      post,
      overlap: (post.tags || []).filter((tag) => currentTags.has(tag.toLowerCase())).length,
    }))
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap
      if (a.post.date < b.post.date) return 1
      if (a.post.date > b.post.date) return -1
      return 0
    })
    .slice(0, count)
    .map(({ post }) => post)
}
