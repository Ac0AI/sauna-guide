import { MetadataRoute } from 'next'
import saunasData from '@/data/saunas.json'
import { getAllProducts } from '@/lib/gear'
import { getAllManufacturers } from '@/lib/manufacturers'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sauna.guide'

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
    {
      url: `${baseUrl}/gear`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sauna-brands`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/challenge`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // 2. Dynamiska Bastu-sidor
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

  // 4. Dynamiska Gear-sidor
  let gearRoutes: MetadataRoute.Sitemap = []
  try {
    const products = getAllProducts()
    gearRoutes = products.map((product) => ({
      url: `${baseUrl}/gear/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
  } catch (e) {
    console.error('Sitemap error: Could not read gear data', e)
  }

  // 5. Dynamiska Brand-sidor
  let brandRoutes: MetadataRoute.Sitemap = []
  try {
    const manufacturers = getAllManufacturers()
    brandRoutes = manufacturers.map((m) => ({
      url: `${baseUrl}/sauna-brands/${m.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
  } catch (e) {
    console.error('Sitemap error: Could not read manufacturers data', e)
  }

  return [...staticRoutes, ...saunaRoutes, ...guideRoutes, ...gearRoutes, ...brandRoutes]
}
