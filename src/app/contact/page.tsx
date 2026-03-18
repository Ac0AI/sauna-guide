import type { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Contact Sauna Guide',
  description: 'How to contact Sauna Guide for corrections, feedback, partnerships, or editorial questions.',
  alternates: {
    canonical: 'https://sauna.guide/contact',
  },
}

const contactEmail = 'saunaguide@mail.beehiiv.com'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-sauna-paper flex flex-col">
      <Navigation />

      <section className="max-w-3xl mx-auto px-6 py-32 grow">
        <header className="mb-12">
          <p className="text-sm uppercase tracking-[0.18em] text-sauna-walnut mb-4">Contact</p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-4">
            Corrections, feedback, and sensible questions welcome.
          </h1>
          <p className="text-xl text-sauna-slate leading-relaxed">
            The cleanest way to reach Sauna Guide is by email.
          </p>
        </header>

        <div className="rounded-2xl border border-sauna-ash/40 bg-sauna-linen/40 p-8 mb-10">
          <p className="text-sm uppercase tracking-[0.18em] text-sauna-walnut mb-3">Email</p>
          <a
            href={`mailto:${contactEmail}`}
            className="font-display text-2xl text-sauna-ink hover:text-sauna-walnut transition-colors"
          >
            {contactEmail}
          </a>
        </div>

        <div className="space-y-8 text-sauna-slate leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">Best reasons to write</h2>
            <p>
              Report a factual error, suggest a guide we should write, flag a brand or support issue, or share context that materially improves a buying or safety page.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-3">Partnerships and products</h2>
            <p>
              If you are a manufacturer or operator reaching out about a product, launch, or collaboration, include the exact model, market, and what makes it notable.
              Generic PR blasts are low priority. Useful details are high priority.
            </p>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  )
}
