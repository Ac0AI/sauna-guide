import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { getCategories } from '@/lib/gear'
import { GearCard } from '@/components/listings/GearCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Best Sauna Gear & Accessories 2026 | Reviews & Guide',
  description: 'Discover top-rated sauna accessories, from authentic Finnish buckets and ladles to infrared blankets and cold plunges. Expert reviews, specs, and buying guide.',
  keywords: ['sauna gear', 'sauna accessories', 'best sauna thermometer', 'sauna hat', 'cold plunge', 'infrared sauna blanket', 'sauna heater', 'finnish sauna'],
  alternates: {
    canonical: 'https://sauna.guide/gear',
  },
  openGraph: {
    title: 'Best Sauna Gear & Accessories 2026 | Reviews & Guide',
    description: 'Discover top-rated sauna accessories, from authentic Finnish buckets and ladles to infrared blankets and cold plunges. Expert reviews, specs, and buying guide.',
    url: 'https://sauna.guide/gear',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}

export default function GearPage() {
  const categories = getCategories()
  const totalProducts = categories.reduce((sum, cat) => sum + cat.products.length, 0)
  const products = categories.flatMap((category) => category.products)
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Sauna Gear Directory',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://sauna.guide/gear/${product.slug}`,
      name: product.name,
    })),
  }

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-32 grow">
        <header className="mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-4">
            Gear Guide
          </h1>
          <p className="text-xl text-sauna-slate max-w-2xl leading-relaxed">
            A curated collection of {totalProducts}+ essential accessories.
            From traditional rituals to modern recovery.
          </p>
        </header>

        {/* Quick Nav */}
        <nav className="mb-16 pb-8 border-b border-sauna-ash/30">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="px-4 py-2 text-sm font-medium text-sauna-slate
                         hover:text-sauna-ink hover:bg-sauna-linen rounded-lg transition-colors"
              >
                {category.name}
              </a>
            ))}
          </div>
        </nav>

        {/* Categories */}
        {categories.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="mb-20"
          >
            <div className="mb-8">
              <h2 className="font-display text-2xl font-medium text-sauna-ink mb-2">
                {category.name}
              </h2>
              <p className="text-sauna-slate">{category.description}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.products.map((product) => (
                <GearCard key={product.slug} product={product} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  )
}
