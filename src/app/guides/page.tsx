import Link from 'next/link'
import { getAllGuides } from '@/lib/guides'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { GuideCard } from '@/components/listings/GuideCard'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'Sauna Protocols & Guides',
  description: 'Evidence-based protocols, gear reviews, and deep dives into heat therapy culture. From contrast therapy to Finnish traditions.',
  alternates: {
    canonical: 'https://sauna.guide/guides',
  },
  openGraph: {
    title: 'Sauna Protocols & Guides | Sauna Guide',
    description: 'Evidence-based protocols, gear reviews, and deep dives into heat therapy culture.',
    url: 'https://sauna.guide/guides',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}

export default function GuidesIndexPage() {
  const guides = getAllGuides()

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-32 flex-grow">
        <header className="mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-4">
            Protocols & Perspectives
          </h1>
          <p className="text-xl text-sauna-slate max-w-2xl leading-relaxed">
            Deep dives into the science of heat, cultural traditions,
            and practical guides for your practice.
          </p>
        </header>

        <div className="space-y-10">
          {guides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}

          {guides.length === 0 && (
            <div className="text-center py-20 text-sauna-slate">
              <p>No guides published yet. Check back soon!</p>
            </div>
          )}
        </div>

        <div className="mt-20 p-8 bg-sauna-linen rounded-2xl border border-sauna-ash/50 text-center">
            <h3 className="font-display text-2xl font-medium text-sauna-ink mb-4">Never miss a protocol</h3>
            <p className="text-sauna-slate mb-8">Every Thursday: why heat heals, where to find it, and five minutes of stillness.</p>
            <NewsletterSignup variant="inline" />
        </div>
      </main>

      <Footer />
    </div>
  )
}
