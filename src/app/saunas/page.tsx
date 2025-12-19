import { SaunaCard } from '@/components/listings/SaunaCard'
import saunasData from '@/data/saunas.json'
import Link from 'next/link'
import { Sauna } from '@/lib/types'

export const metadata = {
  title: 'Sauna Directory | The Best Saunas Worldwide',
  description: 'Discover the most authentic and iconic saunas across the globe. From Finnish smoke saunas to luxury thermal baths.',
}

export default function SaunasPage() {
  const saunas = saunasData.saunas as Sauna[]

  return (
    <div className="min-h-screen bg-sauna-paper">
      {/* Navigation - keeping it simple for now, would ideally be a shared component */}
      <nav className="bg-sauna-paper border-b border-sauna-ash/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-sauna-bark flex items-center justify-center">
              <svg className="w-4 h-4 text-sauna-sand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <span className="font-display text-lg font-medium text-sauna-ink">Sauna Guide</span>
          </Link>
          <div className="flex gap-6 text-sm font-medium uppercase tracking-wider">
            <Link href="/saunas" className="text-sauna-walnut border-b-2 border-sauna-walnut">Directory</Link>
            <Link href="/guides" className="text-sauna-slate hover:text-sauna-ink transition-colors">Guides</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <header className="mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-4">
            Sauna Directory
          </h1>
          <p className="text-xl text-sauna-slate max-w-2xl leading-relaxed">
            A curated collection of the world's most exceptional saunas.
            From ancient traditions to modern thermal sanctuaries.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {saunas.map((sauna) => (
            <SaunaCard key={sauna.id} sauna={sauna} />
          ))}
        </div>
      </main>

      <footer className="bg-sauna-charcoal text-sauna-paper py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sauna-stone text-sm">
            &copy; {new Date().getFullYear()} Sauna Guide. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
