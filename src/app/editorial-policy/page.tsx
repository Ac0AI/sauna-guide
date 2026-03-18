import type { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Editorial Policy',
  description: 'How Sauna Guide researches, updates, and reviews editorial content across buying, brand, gear, and safety pages.',
  alternates: {
    canonical: 'https://sauna.guide/editorial-policy',
  },
}

export default function EditorialPolicyPage() {
  return (
    <main className="min-h-screen bg-sauna-paper flex flex-col">
      <Navigation />

      <section className="max-w-3xl mx-auto px-6 py-32 grow">
        <header className="mb-12">
          <p className="text-sm uppercase tracking-[0.18em] text-sauna-walnut mb-4">Editorial Policy</p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-4">
            Clear standards, explicit tradeoffs.
          </h1>
          <p className="text-xl text-sauna-slate leading-relaxed">
            We prefer useful over comprehensive, and accurate over flattering.
          </p>
        </header>

        <div className="space-y-8 text-sauna-slate leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">Research approach</h2>
            <p>
              We use a mix of manufacturer documentation, product pages, public specifications, primary research, public health guidance,
              and editorial synthesis. For health and safety content, we prioritize primary studies and established medical guidance over wellness marketing.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">How we evaluate products and brands</h2>
            <p>
              We judge products and brands on fit, not on abstract prestige. A great heater for a dedicated backyard build can still be a bad recommendation for an apartment buyer.
              When a brand is hard to source, overpriced, poorly supported, or too marketing-heavy, we say so directly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">Updates and corrections</h2>
            <p>
              We update guides when product availability changes, new research materially changes the answer, or a page is otherwise outdated.
              If a factual issue is reported, we correct it as quickly as possible and prefer updating the page over silently letting stale guidance linger.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">Health and safety content</h2>
            <p>
              Sauna is powerful enough that bad guidance can matter. Our safety content is written conservatively and is meant to help readers decide when to slow down,
              get clearance, or skip the heat. It is not individualized medical advice.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">What independence means here</h2>
            <p>
              Independence does not mean having no commercial interests. It means not letting those interests dictate the verdict.
              If a cheaper option is the better option, that should be the recommendation.
            </p>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  )
}
