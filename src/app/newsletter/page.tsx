import type { Metadata } from 'next'
import Link from 'next/link'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'

export const metadata: Metadata = {
  title: 'Newsletter | Sauna Guide',
  description: 'Every Thursday: why heat heals, where to find it, and five minutes of stillness.',
  alternates: {
    canonical: 'https://sauna.guide/newsletter',
  },
  openGraph: {
    title: 'Newsletter | Sauna Guide',
    description: 'Every Thursday: why heat heals, where to find it, and five minutes of stillness.',
    url: 'https://sauna.guide/newsletter',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}

export default function NewsletterPage() {
  return (
    <main className="min-h-screen bg-sauna-paper flex flex-col">
      <Navigation />

      <section className="pt-32 pb-20 px-6 grow">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest text-sauna-walnut mb-4">
            Weekly Letter
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-6 leading-tight">
            Step inside.
          </h1>
          <p className="text-lg text-sauna-slate mb-10">
            Every Thursday: the science of heat, places worth the journey, and a few minutes of stillness.
          </p>

          <NewsletterSignup
            variant="inline"
            source="newsletter-page"
            className="mb-5"
          />

          <p className="text-sm text-sauna-slate">
            Free forever. 5-minute read.
          </p>

          <div className="mt-10 text-sm">
            <Link href="/guides" className="text-sauna-walnut hover:text-sauna-ink transition-colors">
              Read the guides while you wait →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

