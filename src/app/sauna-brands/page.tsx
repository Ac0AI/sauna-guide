import { getAllManufacturers, getManufacturerTypes } from '@/lib/manufacturers'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { BrandGrid } from './BrandGrid'
import Link from 'next/link'

export const metadata = {
  title: 'Sauna Brands & Manufacturers | Find Your Perfect Sauna',
  description: 'Explore the world\'s leading sauna manufacturers. From Finnish heritage brands like Harvia to innovative infrared makers like Sunlighten.',
  alternates: {
    canonical: 'https://sauna.guide/sauna-brands',
  },
  openGraph: {
    title: 'Sauna Brands & Manufacturers | Find Your Perfect Sauna',
    description: 'Explore the world\'s leading sauna manufacturers. From Finnish heritage brands like Harvia to innovative infrared makers like Sunlighten.',
    url: 'https://sauna.guide/sauna-brands',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}

export default function SaunaBrandsPage() {
  const manufacturers = getAllManufacturers()
  const types = getManufacturerTypes()
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Sauna Brands',
    itemListElement: manufacturers.map((brand, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://sauna.guide/sauna-brands/${brand.slug}`,
      name: brand.name,
    })),
  }

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-32 grow">
        <header className="mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-4">
            Sauna Brands
          </h1>
          <p className="text-xl text-sauna-slate max-w-2xl leading-relaxed">
            From Finnish heritage to modern innovation.
            Find the maker that fits your practice.
          </p>
        </header>

        <BrandGrid manufacturers={manufacturers} types={types} />

        {/* CTA section */}
        <div className="mt-20 p-8 bg-sauna-linen rounded-2xl border border-sauna-ash/50 text-center">
          <h3 className="font-display text-2xl font-medium text-sauna-ink mb-4">
            Not sure which brand is right for you?
          </h3>
          <p className="text-sauna-slate mb-6 max-w-lg mx-auto">
            Our guides help you decide based on your space, budget, and practice style — not marketing claims.
          </p>
          <Link
            href="/guides"
            className="inline-block px-6 py-3 bg-sauna-ink text-sauna-paper rounded-xl font-medium hover:bg-sauna-charcoal transition-colors"
          >
            Read Our Buying Guides
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
