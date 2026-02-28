import gearData from '@/data/gear-merged.json'
import type { GearProduct, GearCategory } from './types'
import fs from 'fs'
import path from 'path'

interface RawProduct {
  name: string
  brand: string
  price: string
  description: string
  richDescription?: string
  why: string
  whyPeopleLikeIt?: string
  redditSentiment?: string | null
  specs?: Record<string, string> | null
  image?: string
  link?: string
  slug?: string
  purchaseLinks?: { name: string; url: string; type: 'amazon' | 'manufacturer' | 'retailer' }[]
  rating?: number
  featured?: boolean
}

interface RawCategory {
  id: string
  name: string
  description: string
  products: RawProduct[]
}

const publicDir = path.join(process.cwd(), 'public')
const defaultProductImageDir = '/images/gear/products'
const knownImageExtensions = ['.png', '.jpg', '.jpeg', '.webp']

function resolveProductImage(image?: string): string | undefined {
  if (!image) return undefined

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  const normalizedPath = image.startsWith('/') ? image : `${defaultProductImageDir}/${image}`
  const absolutePath = path.join(publicDir, normalizedPath.replace(/^\//, ''))

  if (fs.existsSync(absolutePath)) {
    return normalizedPath
  }

  // If the exact file is missing, try common image extensions for the same basename.
  const parsed = path.parse(normalizedPath)
  if (parsed.ext) {
    for (const ext of knownImageExtensions) {
      if (ext === parsed.ext) continue
      const candidatePath = `${parsed.dir}/${parsed.name}${ext}`
      const candidateAbsolutePath = path.join(publicDir, candidatePath.replace(/^\//, ''))
      if (fs.existsSync(candidateAbsolutePath)) {
        return candidatePath
      }
    }
  }

  return undefined
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function transformProduct(product: RawProduct, categoryId: string): GearProduct {
  // Generate slug from name if not present
  const slug = product.slug || slugify(product.name)

  // Convert old link format to purchaseLinks array
  const purchaseLinks = product.purchaseLinks || (product.link ? [{
    name: 'Amazon',
    url: product.link,
    type: 'amazon' as const
  }] : [])

  return {
    slug,
    name: product.name,
    brand: product.brand,
    category: categoryId,
    price: product.price,
    description: product.description,
    richDescription: product.richDescription,
    why: product.why,
    whyPeopleLikeIt: product.whyPeopleLikeIt,
    redditSentiment: product.redditSentiment || undefined,
    specs: product.specs || undefined,
    image: resolveProductImage(product.image),
    purchaseLinks,
    rating: product.rating,
    featured: product.featured
  }
}

export function getAllProducts(): GearProduct[] {
  const categories = gearData.categories as RawCategory[]
  return categories.flatMap(cat =>
    cat.products.map(p => transformProduct(p, cat.id))
  )
}

export function getProductBySlug(slug: string): GearProduct | undefined {
  return getAllProducts().find(p => p.slug === slug)
}

export function getProductsByCategory(categoryId: string): GearProduct[] {
  return getAllProducts().filter(p => p.category === categoryId)
}

export function getCategories(): GearCategory[] {
  const categories = gearData.categories as RawCategory[]
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    products: cat.products.map(p => transformProduct(p, cat.id))
  }))
}

export function getCategoryById(id: string): GearCategory | undefined {
  return getCategories().find(cat => cat.id === id)
}

export function getRelatedProducts(product: GearProduct, limit = 3): GearProduct[] {
  return getProductsByCategory(product.category)
    .filter(p => p.slug !== product.slug)
    .slice(0, limit)
}

export function getFeaturedProducts(limit = 6): GearProduct[] {
  const products = getAllProducts()
  // First try featured products, then fall back to highest rated
  const featured = products.filter(p => p.featured)
  if (featured.length >= limit) {
    return featured.slice(0, limit)
  }

  // Fill with highest rated products
  const byRating = products
    .filter(p => p.rating && !p.featured)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))

  return [...featured, ...byRating].slice(0, limit)
}
