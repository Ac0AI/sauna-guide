import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { getCategories } from '@/lib/gear'
import { GearCard } from '@/components/listings/GearCard'
import type { GearCategory } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sauna Accessories 2026 | Heaters, Essentials & Cold Therapy',
  description: 'Curated sauna accessories guide: heaters, stones, thermometers, sauna hats, maintenance, and cold therapy essentials. Only products that belong in a real sauna setup.',
  keywords: ['sauna accessories', 'sauna essentials', 'sauna heater', 'sauna thermometer', 'sauna stones', 'cold plunge', 'sauna hat', 'finnish sauna'],
  alternates: {
    canonical: 'https://sauna.guide/accessories',
  },
  openGraph: {
    title: 'Sauna Accessories 2026 | Heaters, Essentials & Cold Therapy',
    description: 'Curated sauna accessories: heaters, stones, thermometers, sauna hats, maintenance, and cold therapy essentials.',
    url: 'https://sauna.guide/accessories',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sauna Accessories 2026 | Heaters, Essentials & Cold Therapy',
    description: 'Curated sauna accessories: heaters, stones, thermometers, sauna hats, maintenance, and cold therapy essentials.',
    images: ['/og-image.jpg'],
  },
}

const CURATED_GEAR_SECTIONS = [
  {
    id: 'start-here',
    title: 'Start Here',
    subtitle: 'The Essentials',
    description: 'The practical basics that improve almost every sauna setup, whether you use a public sauna, a home kit, or a cabin build.',
    categoryIds: ['essentials', 'comfort', 'aromatherapy', 'maintenance'],
  },
  {
    id: 'build-and-heat',
    title: 'Build & Heat',
    subtitle: 'Hardware',
    description: 'The hardware side of the practice: heaters, stoves, and the sauna formats worth considering if you are buying or building.',
    categoryIds: ['heaters', 'wood-stoves', 'outdoor-saunas', 'portable-saunas'],
  },
  {
    id: 'contrast',
    title: 'Contrast Companions',
    subtitle: 'Cold Therapy',
    description: 'Cold exposure after heat. We keep a focused set of cold therapy products and nothing broader.',
    categoryIds: ['cold-therapy'],
  },
] as const

function getCuratedSections(categories: GearCategory[]) {
  const categoriesById = new Map(categories.map((category) => [category.id, category]))

  return CURATED_GEAR_SECTIONS.map((section) => ({
    ...section,
    categories: section.categoryIds
      .map((categoryId) => categoriesById.get(categoryId))
      .filter((category): category is GearCategory => Boolean(category)),
  })).filter((section) => section.categories.length > 0)
}

export default function GearPage() {
  const categories = getCategories()
  const sections = getCuratedSections(categories)
  const curatedCategories = sections.flatMap((section) => section.categories)
  const totalProducts = curatedCategories.reduce((sum, cat) => sum + cat.products.length, 0)
  const products = curatedCategories.flatMap((category) => category.products)
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Curated Sauna Accessories Guide',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://sauna.guide/accessories/${product.slug}`,
      name: product.name,
    })),
  }

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <Navigation />

      {/* Hero */}
      <section className="relative bg-sauna-charcoal overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="max-w-6xl mx-auto px-6 pt-28 pb-14 md:pt-36 md:pb-18 relative">
          <p className="text-sauna-sand/50 text-xs tracking-[0.25em] uppercase mb-4 font-medium">
            Curated Collection
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-medium text-sauna-paper tracking-tight mb-5">
            Sauna Accessories
          </h1>
          <p className="text-lg md:text-xl text-sauna-fog leading-relaxed max-w-2xl">
            {totalProducts} products across {curatedCategories.length} categories. Only things that belong in a real sauna setup.
          </p>
        </div>
      </section>

      {/* Section nav */}
      <div className="sticky top-[64px] z-30 bg-sauna-paper/95 backdrop-blur-sm border-b border-sauna-ash/30">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-1 overflow-x-auto py-3 -mx-2 scrollbar-none">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-4 py-2 text-sm font-medium text-sauna-slate whitespace-nowrap
                         hover:text-sauna-ink hover:bg-sauna-linen rounded-lg transition-colors shrink-0"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 grow w-full">

        {sections.map((section, sectionIndex) => (
          <section key={section.id} id={section.id} className="mb-20 last:mb-8 scroll-mt-32">
            {/* Section header */}
            <div className="mb-10 flex items-start gap-6">
              <div className="hidden md:flex w-12 h-12 rounded-xl bg-sauna-charcoal items-center justify-center shrink-0 mt-1">
                <span className="text-sauna-paper font-display text-xl font-medium">{sectionIndex + 1}</span>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-sauna-oak font-medium mb-2 md:hidden">
                  Part {sectionIndex + 1}
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-medium text-sauna-ink mb-2">
                  {section.title}
                </h2>
                <p className="text-base md:text-lg text-sauna-slate leading-relaxed max-w-2xl">
                  {section.description}
                </p>
              </div>
            </div>

            {section.categories.map((category) => (
              <div key={category.id} id={category.id} className="mb-16 last:mb-0 scroll-mt-32">
                <div className="mb-6 flex items-baseline gap-3">
                  <h3 className="font-display text-xl md:text-2xl font-medium text-sauna-ink">
                    {category.name}
                  </h3>
                  <span className="text-xs text-sauna-stone font-medium">
                    {category.products.length} {category.products.length === 1 ? 'pick' : 'picks'}
                  </span>
                </div>
                {category.description && (
                  <p className="text-sauna-slate text-sm mb-6 max-w-2xl leading-relaxed">{category.description}</p>
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {category.products.map((product) => (
                    <GearCard key={product.slug} product={product} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

        {/* Newsletter CTA */}
        <section className="relative p-8 md:p-12 bg-sauna-charcoal rounded-2xl text-sauna-paper overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')] opacity-40" />
          <div className="relative">
            <h3 className="font-display text-2xl md:text-3xl font-medium mb-3">
              Get the unbiased buying guide
            </h3>
            <p className="text-sauna-fog mb-8 max-w-lg">
              Three short emails. Real costs, honest product picks, and the mistakes we see people make. Independent and free.
            </p>
            <NewsletterSignup variant="buying-guide" source="accessories-page" className="max-w-md" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
