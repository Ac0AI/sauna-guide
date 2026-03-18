import type { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'About Sauna Guide',
  description: 'What Sauna Guide is, how we choose what to publish, and why the site is intentionally independent.',
  alternates: {
    canonical: 'https://sauna.guide/about',
  },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-sauna-paper flex flex-col">
      <Navigation />

      <section className="max-w-3xl mx-auto px-6 py-32 grow">
        <header className="mb-12">
          <p className="text-sm uppercase tracking-[0.18em] text-sauna-walnut mb-4">About</p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-4">
            An editorial sauna site, not a storefront.
          </h1>
          <p className="text-xl text-sauna-slate leading-relaxed">
            Sauna Guide exists to help people make better decisions about sauna practice, home sauna buying, and the brands and gear surrounding both.
          </p>
        </header>

        <div className="space-y-8 text-sauna-slate leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">What we publish</h2>
            <p>
              We cover sauna guides, home sauna buying decisions, heater and brand comparisons, relevant accessories,
              and a selective directory of sauna destinations worth knowing about.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">Why this site exists</h2>
            <p>
              Most sauna advice online is tied to a catalog. The same site telling you what to buy is usually trying to sell it.
              Sauna Guide is built to be useful before it is commercial. That means clearer downsides, more skepticism, and less pressure to turn every page into a ranking of winners.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">How we think</h2>
            <p>
              We care about practical accuracy more than hype. On buying pages, we focus on cost, installation, heater quality, materials, support, and long-term fit.
              On health and safety pages, we default to conservative guidance and cite primary or clearly attributable sources whenever possible.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">What we are not</h2>
            <p>
              We are not your doctor, your contractor, or your electrician. Sauna Guide provides editorial guidance to help you ask better questions and avoid obvious mistakes.
              Final purchase, safety, and installation decisions still belong with qualified professionals and the manufacturer documentation.
            </p>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  )
}
