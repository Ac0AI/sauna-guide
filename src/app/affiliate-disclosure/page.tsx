import type { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: 'How Sauna Guide handles affiliate relationships and why they do not control editorial recommendations.',
  alternates: {
    canonical: 'https://sauna.guide/affiliate-disclosure',
  },
}

export default function AffiliateDisclosurePage() {
  return (
    <main className="min-h-screen bg-sauna-paper flex flex-col">
      <Navigation />

      <section className="max-w-3xl mx-auto px-6 py-32 grow">
        <header className="mb-12">
          <p className="text-sm uppercase tracking-[0.18em] text-sauna-walnut mb-4">Affiliate Disclosure</p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-4">
            Revenue is allowed. Editorial capture is not.
          </h1>
          <p className="text-xl text-sauna-slate leading-relaxed">
            Some links on Sauna Guide may become affiliate links over time. That does not change the standard we apply to the recommendation itself.
          </p>
        </header>

        <div className="space-y-8 text-sauna-slate leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">What this means in practice</h2>
            <p>
              If a page includes an affiliate link, Sauna Guide may earn a commission if a reader buys through that link.
              The price to the buyer does not usually change, but the site may be compensated by the merchant.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">What this does not mean</h2>
            <p>
              A commission does not guarantee a recommendation. We do not treat every premium product as a winner,
              and we do not treat every budget product as trash. The point of the site is to reduce buyer mistakes, not maximize checkout rates.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">How we keep it honest</h2>
            <p>
              We prefer explicit tradeoffs, clear downside sections, and category fit over generic “best overall” language.
              When a product is overpriced, underbuilt, poorly supported, or mismatched to the likely buyer, that is part of the editorial verdict.
            </p>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  )
}
