export interface Sauna {
  id: string
  name: string
  location: {
    city: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  type: 'public' | 'private' | 'hotel' | 'spa'
  features: string[]
  priceRange: '$' | '$$' | '$$$'
  website?: string
  description: string
  images: string[]
  rating?: number
}

export interface Guide {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tags: string[]
  content: string
}

export interface NewsletterSubscription {
  email: string
  subscribedAt: string
}

export interface PurchaseLink {
  name: string
  url: string
  type: 'amazon' | 'manufacturer' | 'retailer'
}

export interface GearProduct {
  slug: string
  name: string
  brand: string
  category: string
  price: string
  description: string
  richDescription?: string
  why: string
  whyPeopleLikeIt?: string
  redditSentiment?: string
  specs?: Record<string, string>
  image?: string
  purchaseLinks: PurchaseLink[]
  rating?: number
  featured?: boolean
}

export interface GearCategory {
  id: string
  name: string
  description: string
  products: GearProduct[]
}
