import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
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
    description: 'The practical basics that improve almost every sauna setup, whether you use a public sauna, a home kit, or a cabin build.',
    categoryIds: ['essentials', 'comfort', 'aromatherapy', 'maintenance'],
  },
  {
    id: 'build-and-heat',
    title: 'Build & Heat',
    description: 'The hardware side of the practice: heaters, stoves, and the sauna formats worth considering if you are buying or building.',
    categoryIds: ['heaters', 'wood-stoves', 'outdoor-saunas', 'portable-saunas'],
  },
  {
    id: 'contrast',
    title: 'Contrast Companions',
    description: 'Cold exposure is a real adjacent use case for this site, so we keep a focused set of cold therapy products and nothing broader.',
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

      <main className="max-w-7xl mx-auto px-6 py-32 grow">
        <header className="mb-14">
          <h1 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-4">
            Sauna Accessories
          </h1>
          <p className="text-xl text-sauna-slate max-w-2xl leading-relaxed">
            We trimmed this page down to the products that are actually relevant to sauna use:
            heaters, stones, thermometers, comfort upgrades, maintenance, and a focused cold therapy layer.
          </p>
        </header>

        <section className="mb-16 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-sauna-ash/40 bg-sauna-linen/60 p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sauna-walnut mb-4">
              What Made The Cut
            </p>
            <div className="grid gap-3 text-sauna-slate md:grid-cols-3">
              <p>Directly useful in a real sauna session</p>
              <p>Relevant if you are buying or building your own setup</p>
              <p>Strongly adjacent to contrast therapy, not generic wellness clutter</p>
            </div>
          </div>

        </section>

        <div className="mb-10 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-sauna-linen px-4 py-2 font-medium text-sauna-ink">
            {curatedCategories.length} categories
          </span>
          <span className="rounded-full bg-sauna-linen px-4 py-2 font-medium text-sauna-ink">
            {totalProducts} curated picks
          </span>
          <span className="rounded-full bg-sauna-linen px-4 py-2 font-medium text-sauna-ink">
            buyer-first, not gadget-first
          </span>
        </div>

        <nav className="mb-16 pb-8 border-b border-sauna-ash/30">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-4 py-2 text-sm font-medium text-sauna-slate
                         hover:text-sauna-ink hover:bg-sauna-linen rounded-lg transition-colors"
              >
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        {sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-24 scroll-mt-32">
            <div className="mb-10 max-w-3xl">
              <h2 className="font-display text-3xl font-medium text-sauna-ink mb-3">
                {section.title}
              </h2>
              <p className="text-lg text-sauna-slate leading-relaxed">
                {section.description}
              </p>
            </div>

            {section.categories.map((category) => (
              <div key={category.id} id={category.id} className="mb-20 last:mb-0 scroll-mt-32">
                <div className="mb-8">
                  <h3 className="font-display text-2xl font-medium text-sauna-ink mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sauna-slate">{category.description}</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.products.map((product) => (
                    <GearCard key={product.slug} product={product} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

        <section className="rounded-2xl border border-sauna-ash/40 bg-sauna-linen/50 p-8 text-center">
          <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">
            Looking for something missing?
          </h2>
          <p className="max-w-2xl mx-auto text-sauna-slate leading-relaxed">
            That is probably intentional. We would rather keep this page tight and useful than turn it into a dumping ground for every wellness gadget with a sauna angle.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
