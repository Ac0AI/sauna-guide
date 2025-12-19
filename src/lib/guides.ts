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
}

export interface GuidePost {
  meta: GuideMeta
  content: string // Raw content for serialization later or reading time calc
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

      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author,
        tags: data.tags,
      } as GuideMeta
    })

  // Sort guides by date (newest first)
  return guides.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getGuideBySlug(slug: string) {
  const fullPath = path.join(guidesDirectory, `${slug}.mdx`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  
  return {
    meta: {
      slug,
      ...data,
    } as GuideMeta,
    content,
  }
}