import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Welcome to Sauna Guide',
  description: 'You\'re in. Your first email is on its way.',
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
              Your first email is on its way.
            </p>
          </div>

          {/* What's Coming Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="bg-sauna-paper p-5 rounded-xl border border-sauna-sand/30">
              <div className="w-8 h-8 rounded-full bg-sauna-sand/20 flex items-center justify-center text-sauna-sand font-display font-medium mb-3 mx-auto">
                1
              </div>
              <h3 className="font-medium text-sauna-ink mb-1">
                What it actually costs
              </h3>
              <p className="text-sm text-sauna-slate">
                The real numbers for every budget
              </p>
            </div>

            <div className="bg-sauna-paper p-5 rounded-xl border border-sauna-sand/30">
              <div className="w-8 h-8 rounded-full bg-sauna-sand/20 flex items-center justify-center text-sauna-sand font-display font-medium mb-3 mx-auto">
                2
              </div>
              <h3 className="font-medium text-sauna-ink mb-1">
                Which type fits your life
              </h3>
              <p className="text-sm text-sauna-slate">
                Infrared vs traditional, indoor vs outdoor
              </p>
            </div>

            <div className="bg-sauna-paper p-5 rounded-xl border border-sauna-sand/30">
              <div className="w-8 h-8 rounded-full bg-sauna-sand/20 flex items-center justify-center text-sauna-sand font-display font-medium mb-3 mx-auto">
                3
              </div>
              <h3 className="font-medium text-sauna-ink mb-1">
                What everyone gets wrong
              </h3>
              <p className="text-sm text-sauna-slate">
                The 12 mistakes we see over and over
              </p>
            </div>
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
              <p><strong className="text-sauna-paper">3.</strong> Reply <span className="inline-block bg-sauna-sand/20 text-sauna-sand px-1.5 py-0.5 rounded-sm text-xs font-medium">Löyly</span> to your welcome email</p>
            </div>
          </div>

        </div>
      </section>

      {/* While You Wait */}
      <section className="py-12 md:py-16 bg-sauna-paper">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-2xl md:text-3xl text-sauna-ink mb-6">
            While you wait
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/gear"
              className="text-sauna-walnut hover:text-sauna-ink transition-colors font-medium"
            >
              Browse gear reviews →
            </Link>
            <span className="hidden sm:inline text-sauna-ash">·</span>
            <Link
              href="/guides"
              className="text-sauna-walnut hover:text-sauna-ink transition-colors font-medium"
            >
              Read the guides →
            </Link>
            <span className="hidden sm:inline text-sauna-ash">·</span>
            <Link
              href="/saunas"
              className="text-sauna-walnut hover:text-sauna-ink transition-colors font-medium"
            >
              Explore saunas →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
