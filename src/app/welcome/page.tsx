import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Welcome to Sauna Guide',
  description: 'You\'re in. Check your inbox for your first letter.',
  robots: 'noindex, nofollow',
}

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-sauna-cream">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">

          {/* Confirmation */}
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-4">
              You&apos;re in.
            </h1>
            <p className="text-xl text-sauna-slate">
              Your first letter arrives Thursday.
            </p>
          </div>

          {/* Guide Cards - Prominent */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <Link
              href="/guides/longevity-sauna-protocol"
              className="group bg-sauna-paper p-5 rounded-xl border border-sauna-sand/30 hover:border-sauna-oak/50 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3">🔬</div>
              <h3 className="font-medium text-sauna-ink mb-1 group-hover:text-sauna-bark transition-colors">
                The Science of Heat
              </h3>
              <p className="text-sm text-sauna-slate">
                How sauna builds longevity
              </p>
            </Link>

            <Link
              href="/saunas"
              className="group bg-sauna-paper p-5 rounded-xl border border-sauna-sand/30 hover:border-sauna-oak/50 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3">🗺️</div>
              <h3 className="font-medium text-sauna-ink mb-1 group-hover:text-sauna-bark transition-colors">
                Find a Sauna
              </h3>
              <p className="text-sm text-sauna-slate">
                40+ places worth the journey
              </p>
            </Link>

            <Link
              href="/guides"
              className="group bg-sauna-paper p-5 rounded-xl border border-sauna-sand/30 hover:border-sauna-oak/50 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3">📖</div>
              <h3 className="font-medium text-sauna-ink mb-1 group-hover:text-sauna-bark transition-colors">
                All Guides
              </h3>
              <p className="text-sm text-sauna-slate">
                Learn the practice
              </p>
            </Link>
          </div>

          {/* Safelist - Compact */}
          <div className="bg-sauna-ink text-sauna-paper rounded-xl p-6 text-left max-w-xl mx-auto">
            <h2 className="font-medium text-lg mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-sauna-sand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Make sure you get our emails
            </h2>
            <div className="space-y-2 text-sm text-sauna-paper/80">
              <p><strong className="text-sauna-paper">1.</strong> Check your inbox (and Promotions/Spam)</p>
              <p><strong className="text-sauna-paper">2.</strong> Add <span className="text-sauna-sand">saunaguide@mail.beehiiv.com</span> to contacts</p>
              <p><strong className="text-sauna-paper">3.</strong> Reply <span className="inline-block bg-sauna-sand/20 text-sauna-sand px-1.5 py-0.5 rounded text-xs font-medium">Löyly</span> to your welcome email</p>
            </div>
          </div>

        </div>
      </section>

      {/* Quote */}
      <section className="py-12 md:py-16 bg-sauna-paper">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <blockquote className="font-display text-2xl md:text-3xl text-sauna-ink mb-4 italic">
            &quot;In the sauna, one must conduct himself as one would in church.&quot;
          </blockquote>
          <cite className="text-sauna-slate not-italic">— Finnish proverb</cite>

          <p className="mt-10 text-sauna-slate">
            See you Thursday.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
