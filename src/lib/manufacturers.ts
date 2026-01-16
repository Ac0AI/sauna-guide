import manufacturersData from '@/data/manufacturers.json'

export interface Manufacturer {
  name: string
  slug: string
  country: string
  founded?: number
  website: string
  type: 'traditional' | 'infrared' | 'barrel' | 'barrel-cabin' | 'outdoor' | 'luxury' | 'red-light' | 'portable'
  products: string[]
  market: string
  public?: boolean
  stock?: string
  owned_by?: string
  unique_angle: string
  content_opportunities: string[]
  social?: {
    instagram?: string
    linkedin?: string
  }
  partnership_status: string
  notes: string
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getAllManufacturers(): Manufacturer[] {
  return manufacturersData.manufacturers.map(m => ({
    ...m,
    slug: slugify(m.name),
    type: m.type as Manufacturer['type'],
  }))
}

export function getManufacturerBySlug(slug: string): Manufacturer | undefined {
  const manufacturers = getAllManufacturers()
  return manufacturers.find(m => m.slug === slug)
}

export function getManufacturersByType(type: Manufacturer['type']): Manufacturer[] {
  return getAllManufacturers().filter(m => m.type === type)
}

export function getManufacturerTypes(): { type: Manufacturer['type']; count: number; label: string }[] {
  const typeLabels: Record<string, string> = {
    'traditional': 'Traditional Finnish',
    'infrared': 'Infrared',
    'barrel': 'Barrel Saunas',
    'barrel-cabin': 'Barrel & Cabin',
    'outdoor': 'Outdoor',
    'luxury': 'Luxury',
    'red-light': 'Red Light / Biohacking',
    'portable': 'Portable & Budget',
  }

  const manufacturers = getAllManufacturers()
  const typeCounts = manufacturers.reduce((acc, m) => {
    acc[m.type] = (acc[m.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(typeCounts).map(([type, count]) => ({
    type: type as Manufacturer['type'],
    count,
    label: typeLabels[type] || type,
  }))
}

export function getFeaturedManufacturers(): Manufacturer[] {
  // Return the most notable brands for featuring
  const featured = ['harvia', 'sunlighten', 'clearlight-saunas', 'almost-heaven-saunas', 'huum', 'klafs']
  const all = getAllManufacturers()
  return featured
    .map(slug => all.find(m => m.slug === slug))
    .filter((m): m is Manufacturer => m !== undefined)
}
