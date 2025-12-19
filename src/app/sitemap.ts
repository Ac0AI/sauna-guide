import { MetadataRoute } from 'next'
import saunasData from '@/data/saunas.json'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sauna.guide' // Byt ut mot din riktiga domän när du går live

  // 1. Statiska sidor
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/saunas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  // 2. Dynamiska Bastu-sidor (Programmatic SEO)
  const saunaRoutes: MetadataRoute.Sitemap = saunasData.saunas.map((sauna) => ({
    url: `${baseUrl}/saunas/${sauna.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // 3. Dynamiska Guider (MDX)
  let guideRoutes: MetadataRoute.Sitemap = []
  try {
    const guidesDirectory = path.join(process.cwd(), 'src/content/guides')
    // Kontrollera att mappen finns innan vi läser
    if (fs.existsSync(guidesDirectory)) {
      const guideFiles = fs.readdirSync(guidesDirectory)
      guideRoutes = guideFiles
        .filter((file) => file.endsWith('.mdx'))
        .map((file) => ({
          url: `${baseUrl}/guides/${file.replace('.mdx', '')}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.9,
        }))
    }
  } catch (e) {
    console.error('Sitemap error: Could not read guides directory', e)
  }

  return [...staticRoutes, ...saunaRoutes, ...guideRoutes]
}
