import { SaunaCard } from '@/components/listings/SaunaCard'
import saunasData from '@/data/saunas.json'
import Link from 'next/link'
import { Sauna } from '@/lib/types'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'Sauna Directory | The Best Saunas Worldwide',
  description: 'Discover the most authentic and iconic saunas across the globe. From Finnish smoke saunas to luxury thermal baths.',
  alternates: {
    canonical: 'https://sauna.guide/saunas',
  },
  openGraph: {
    title: 'Sauna Directory | The Best Saunas Worldwide',
    description: 'Discover the most authentic and iconic saunas across the globe. From Finnish smoke saunas to luxury thermal baths.',
    url: 'https://sauna.guide/saunas',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}

export default function SaunasPage() {
  const saunas = saunasData.saunas as Sauna[]

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-32 flex-grow">
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

      <Footer />
    </div>
  )
}
