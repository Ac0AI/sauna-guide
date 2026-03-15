export interface EnrichmentSource {
  url: string
  label: string
  fetchedAt: string
}

export interface EnrichmentMeta {
  sources: EnrichmentSource[]
  lastVerified?: string
  qualityScore?: number
  status: 'raw' | 'enriched' | 'reviewed' | 'published'
}

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
    address?: string
    googlePlaceId?: string
  }
  type: 'public' | 'private' | 'hotel' | 'spa'
  features: string[]
  priceRange: '$' | '$$' | '$$$'
  website?: string
  description: string
  images: string[]
  rating?: number

  // Enriched fields
  phone?: string
  bookingUrl?: string
  openingHours?: string
  admission?: string
  reviewCount?: number
  etiquette?: {
    dresscode?: 'nude' | 'textile' | 'mixed'
    towelPolicy?: string
    sessionLength?: string
  }
  editorial?: {
    whySpecial?: string
    whatToExpect?: string
    bestTimeToGo?: string
    whoItsFor?: string
    whoShouldSkip?: string
    highlights?: string[]
    drawbacks?: string[]
    tips?: string[]
  }
  nearbyAlternatives?: string[]
  enrichment?: EnrichmentMeta
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

  // Enriched fields
  whyNot?: string
  bestFor?: string
  avoidIf?: string
  alternatives?: string[]
  comparisonNotes?: string
  editorsPick?: 'best-overall' | 'best-budget' | 'best-premium' | 'skip-unless'
  enrichment?: EnrichmentMeta
}

export interface GearCategory {
  id: string
  name: string
  description: string
  products: GearProduct[]
}
