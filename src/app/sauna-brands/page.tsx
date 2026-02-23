import Link from 'next/link'
import { getAllManufacturers, getManufacturerTypes } from '@/lib/manufacturers'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

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
  },
}

const typeColors: Record<string, string> = {
  'traditional': 'bg-amber-100 text-amber-800',
  'infrared': 'bg-red-100 text-red-800',
  'barrel': 'bg-orange-100 text-orange-800',
  'barrel-cabin': 'bg-orange-100 text-orange-800',
  'outdoor': 'bg-green-100 text-green-800',
  'luxury': 'bg-purple-100 text-purple-800',
  'red-light': 'bg-pink-100 text-pink-800',
  'portable': 'bg-blue-100 text-blue-800',
}

const typeLabels: Record<string, string> = {
  'traditional': 'Traditional',
  'infrared': 'Infrared',
  'barrel': 'Barrel',
  'barrel-cabin': 'Barrel & Cabin',
  'outdoor': 'Outdoor',
  'luxury': 'Luxury',
  'red-light': 'Red Light',
  'portable': 'Portable',
}

export default function SaunaBrandsPage() {
  const manufacturers = getAllManufacturers()
  const types = getManufacturerTypes()

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <Navigation />

      <main className="max-w-6xl mx-auto px-6 py-32 flex-grow">
        <header className="mb-16 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-6">
            Sauna Brands
          </h1>
          <p className="text-xl text-sauna-slate max-w-2xl mx-auto leading-relaxed">
            From Finnish heritage to modern innovation. <br />
            Find the maker that fits your practice.
          </p>
        </header>

        {/* Type filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {types.map(({ type, count, label }) => (
            <span
              key={type}
              className={`px-4 py-2 rounded-full text-sm font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}
            >
              {label} ({count})
            </span>
          ))}
        </div>

        {/* Brand grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {manufacturers.map((manufacturer) => (
            <Link
              key={manufacturer.slug}
              href={`/sauna-brands/${manufacturer.slug}`}
              className="group block p-6 bg-white rounded-2xl border border-sauna-ash/30 hover:border-sauna-oak/50 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-sauna-ink group-hover:text-sauna-oak transition-colors">
                    {manufacturer.name}
                  </h2>
                  <p className="text-sm text-sauna-slate">
                    {manufacturer.country}
                    {manufacturer.founded && ` · Est. ${manufacturer.founded}`}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[manufacturer.type] || 'bg-gray-100'}`}>
                  {typeLabels[manufacturer.type] || manufacturer.type}
                </span>
              </div>

              <p className="text-sauna-slate text-sm mb-4 line-clamp-2">
                {manufacturer.unique_angle}
              </p>

              <div className="flex flex-wrap gap-2">
                {manufacturer.products.slice(0, 3).map((product) => (
                  <span
                    key={product}
                    className="px-2 py-1 bg-sauna-linen rounded text-xs text-sauna-slate"
                  >
                    {product.replace(/-/g, ' ')}
                  </span>
                ))}
                {manufacturer.products.length > 3 && (
                  <span className="px-2 py-1 text-xs text-sauna-slate">
                    +{manufacturer.products.length - 3} more
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

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
