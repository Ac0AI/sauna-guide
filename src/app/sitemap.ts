import { MetadataRoute } from 'next'
import saunasData from '@/data/saunas.json'
import { getAllProducts } from '@/lib/gear'
import { getAllManufacturers } from '@/lib/manufacturers'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sauna.guide'
  const buildDate = new Date()

  const getFileModifiedTime = (relativePath: string) => {
    try {
      return fs.statSync(path.join(process.cwd(), relativePath)).mtime
    } catch {
      return undefined
    }
  }

  const getLatestDirectoryModifiedTime = (relativeDir: string, extension?: string) => {
    try {
      const absoluteDir = path.join(process.cwd(), relativeDir)
      const entries = fs.readdirSync(absoluteDir)
      const matchingEntries = extension
        ? entries.filter((entry) => entry.endsWith(extension))
        : entries

      const dates = matchingEntries
        .map((entry) => fs.statSync(path.join(absoluteDir, entry)).mtime)
        .filter((date): date is Date => Boolean(date))

      if (dates.length === 0) {
        return undefined
      }

      return new Date(Math.max(...dates.map((date) => date.getTime())))
    } catch {
      return undefined
    }
  }

  const getLastModified = (...dates: Array<Date | undefined>) => {
    const existingDates = dates.filter((date): date is Date => Boolean(date))

    if (existingDates.length === 0) {
      return buildDate
    }

    return new Date(Math.max(...existingDates.map((date) => date.getTime())))
  }

  const homeLastModified = getLastModified(getFileModifiedTime('src/app/page.tsx'))
  const saunasIndexLastModified = getLastModified(
    getFileModifiedTime('src/app/saunas/page.tsx'),
    getFileModifiedTime('src/data/saunas.json')
  )
  const guidesIndexLastModified = getLastModified(
    getFileModifiedTime('src/app/guides/page.tsx'),
    getLatestDirectoryModifiedTime('src/content/guides', '.mdx')
  )
  const gearIndexLastModified = getLastModified(
    getFileModifiedTime('src/app/gear/page.tsx'),
    getFileModifiedTime('src/data/gear-merged.json')
  )
  const brandsIndexLastModified = getLastModified(
    getFileModifiedTime('src/app/sauna-brands/page.tsx'),
    getFileModifiedTime('src/data/manufacturers.json')
  )
  const challengeLastModified = getLastModified(getFileModifiedTime('src/app/challenge/page.tsx'))
  const newsletterLastModified = getLastModified(getFileModifiedTime('src/app/newsletter/page.tsx'))
  const saunaDetailLastModified = getLastModified(
    getFileModifiedTime('src/app/saunas/[id]/page.tsx'),
    getFileModifiedTime('src/data/saunas.json')
  )
  const gearDetailLastModified = getLastModified(
    getFileModifiedTime('src/app/gear/[slug]/page.tsx'),
    getFileModifiedTime('src/data/gear-merged.json')
  )
  const brandDetailLastModified = getLastModified(
    getFileModifiedTime('src/app/sauna-brands/[slug]/page.tsx'),
    getFileModifiedTime('src/data/manufacturers.json')
  )

  const scoreGearProduct = (product: {
    description?: string
    richDescription?: string
    why?: string
    whyPeopleLikeIt?: string
    redditSentiment?: string
    specs?: Record<string, string>
    image?: string
  }) => {
    const textLength = `${product.richDescription || ''} ${product.description || ''} ${product.why || ''}`.trim().length
    const specsCount = product.specs ? Object.keys(product.specs).length : 0
    let score = 0
    if (textLength >= 300) score += 3
    else if (textLength >= 200) score += 2
    else if (textLength >= 140) score += 1
    if (specsCount >= 3) score += 2
    else if (specsCount > 0) score += 1
    if (product.whyPeopleLikeIt) score += 1
    if (product.redditSentiment) score += 1
    if (product.image) score += 1
    return score
  }

  const scoreSauna = (sauna: {
    description?: string
    features?: string[]
    website?: string
    rating?: number
  }) => {
    let score = 0
    const length = (sauna.description || '').trim().length
    if (length >= 220) score += 2
    else if (length >= 140) score += 1
    if ((sauna.features || []).length >= 4) score += 1
    if (sauna.website) score += 1
    if (sauna.rating && sauna.rating >= 4.7) score += 1
    return score
  }

  // 1. Statiska sidor
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: homeLastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/saunas`,
      lastModified: saunasIndexLastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: guidesIndexLastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gear`,
      lastModified: gearIndexLastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sauna-brands`,
      lastModified: brandsIndexLastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/challenge`,
      lastModified: challengeLastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/newsletter`,
      lastModified: newsletterLastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // 2. Dynamiska Bastu-sidor
  const saunaRoutes: MetadataRoute.Sitemap = saunasData.saunas
    .map((sauna) => {
      const score = scoreSauna(sauna)
      const changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = score >= 4 ? 'monthly' : 'yearly'
      return {
        url: `${baseUrl}/saunas/${sauna.id}`,
        lastModified: saunaDetailLastModified,
        changeFrequency,
        priority: score >= 4 ? 0.8 : score >= 2 ? 0.7 : 0.6,
      }
    })
    .sort((a, b) => b.priority - a.priority)

  // 3. Dynamiska Guider (MDX)
  let guideRoutes: MetadataRoute.Sitemap = []
  try {
    const guidesDirectory = path.join(process.cwd(), 'src/content/guides')
    if (fs.existsSync(guidesDirectory)) {
      const guideFiles = fs.readdirSync(guidesDirectory)
      guideRoutes = guideFiles
        .filter((file) => file.endsWith('.mdx'))
        .map((file) => {
          const fullPath = path.join(guidesDirectory, file)
          const stats = fs.statSync(fullPath)
          return {
            url: `${baseUrl}/guides/${file.replace('.mdx', '')}`,
            lastModified: stats.mtime,
            changeFrequency: 'monthly' as const,
            priority: 0.9,
          }
        })
        .sort((a, b) => {
          const aDate = new Date(a.lastModified || 0).getTime()
          const bDate = new Date(b.lastModified || 0).getTime()
          return bDate - aDate
        })
    }
  } catch (e) {
    console.error('Sitemap error: Could not read guides directory', e)
  }

  // 4. Dynamiska Gear-sidor
  let gearRoutes: MetadataRoute.Sitemap = []
  try {
    const products = getAllProducts()
    gearRoutes = products
      .map((product) => {
        const score = scoreGearProduct(product)
        const changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = score >= 4 ? 'monthly' : 'yearly'
        return {
          url: `${baseUrl}/gear/${product.slug}`,
          lastModified: gearDetailLastModified,
          changeFrequency,
          priority: score >= 4 ? 0.75 : score >= 2 ? 0.65 : 0.55,
        }
      })
      .sort((a, b) => b.priority - a.priority)
  } catch (e) {
    console.error('Sitemap error: Could not read gear data', e)
  }

  // 5. Dynamiska Brand-sidor
  let brandRoutes: MetadataRoute.Sitemap = []
  try {
    const manufacturers = getAllManufacturers()
    brandRoutes = manufacturers.map((m) => ({
      url: `${baseUrl}/sauna-brands/${m.slug}`,
      lastModified: brandDetailLastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
  } catch (e) {
    console.error('Sitemap error: Could not read manufacturers data', e)
  }

  return [...staticRoutes, ...saunaRoutes, ...guideRoutes, ...gearRoutes, ...brandRoutes]
}
