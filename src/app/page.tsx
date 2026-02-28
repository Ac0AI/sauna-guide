import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sauna Guide - Discover the Art of Heat & Wellness',
  description: 'Your complete guide to saunas worldwide. Science-backed protocols, curated destinations, and a weekly letter on why heat heals. Step inside.',
  alternates: {
    canonical: 'https://sauna.guide',
  },
  openGraph: {
    title: 'Sauna Guide - Discover the Art of Heat & Wellness',
    description: 'Science-backed protocols, curated destinations, and a weekly letter on why heat heals.',
    url: 'https://sauna.guide',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Image - Priority loading for LCP */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-sauna.jpg"
            alt="Authentic Finnish sauna interior with aged cedar wood"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={85}
          />
          <div className="absolute inset-0 bg-linear-to-r from-sauna-charcoal/70 via-sauna-bark/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="bg-sauna-charcoal/40 backdrop-blur-xs rounded-2xl p-8 md:p-12">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-sauna-paper mb-6
                          leading-[1.1] tracking-tight animate-fade-up drop-shadow-lg">
              Restore your<br />
              <span className="text-sauna-sand">baseline.</span>
            </h1>

            <p className="text-lg md:text-xl text-sauna-paper/90 mb-10 animate-fade-up max-w-2xl mx-auto leading-relaxed"
               style={{ animationDelay: '0.1s' }}>
              Modern life is stressful. Heat is the antidote. <br className="hidden md:block" />
              Join the guided 4-week protocol to build resilience.
            </p>

            <div className="animate-fade-up flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '0.2s' }}>
              <Link 
                href="/challenge" 
                className="px-8 py-4 bg-sauna-sand text-sauna-charcoal font-medium text-lg rounded-xl hover:bg-white transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
              >
                Start the 30-Day Reset
              </Link>
              <Link 
                href="#newsletter" 
                className="px-8 py-4 bg-sauna-paper/10 backdrop-blur-xs border border-sauna-paper/20 text-sauna-paper font-medium text-lg rounded-xl hover:bg-sauna-paper/20 transition-colors"
              >
                Read the Newsletter
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 border border-sauna-paper/30 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1 h-2 bg-sauna-paper/40 rounded-full" />
          </div>
        </div>
      </section>

      {/* What's Inside Section */}
      <section className="py-20 md:py-28 bg-sauna-ink text-sauna-paper relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-medium text-sauna-paper mb-4">
              What&apos;s inside each letter
            </h2>
            <p className="text-lg text-sauna-paper/70 max-w-2xl mx-auto">
              Short enough to read. Useful enough to keep.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ValueCard
              icon="brain"
              title="The Main Thing"
              description="One idea worth your attention. Protocols, science, or stories that change how you think about heat."
            />
            <ValueCard
              icon="gear"
              title="The Gear Pick"
              description="We're all suckers for gadgets. Here's the gear that actually works."
            />
            <ValueCard
              icon="map"
              title="A Place Worth Visiting"
              description="Beautiful saunas around the world. Fuel for the wanderlust."
            />
            <ValueCard
              icon="pause"
              title="The Permission Slip"
              description="A moment of stillness. The whole point, really."
            />
          </div>
        </div>
      </section>

      {/* Places Worth The Journey - Visual Inspiration */}
      <section className="py-20 md:py-28 bg-sauna-linen relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-sauna-walnut mb-3">From the archive</p>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-sauna-ink mb-4">
              Places worth the journey
            </h2>
            <p className="text-lg text-sauna-slate max-w-2xl mx-auto">
              Every week, we uncover spaces that understand what this is really about.
            </p>
          </div>

          {/* Inspiring sauna grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <SaunaCard
              image="/images/saunas-photos/loyly-helsinki.jpg"
              name="Loyly"
              location="Helsinki"
              feature="Architectural icon on the Baltic"
              href="/saunas/loyly-helsinki"
            />
            <SaunaCard
              image="/images/saunas-photos/salt-oslo.jpg"
              name="SALT"
              location="Oslo"
              feature="Art meets sauna on the fjord"
              href="/saunas/salt-oslo"
            />
            <SaunaCard
              image="/images/saunas-photos/icebergs-pool.jpg"
              name="Icebergs"
              location="Sydney"
              feature="Waves crash over the pool"
              href="/saunas/icebergs-pool"
            />
            <SaunaCard
              image="/images/saunas-photos/aqua-dome.jpg"
              name="Aqua Dome"
              location="Austria"
              feature="Floating bowls in the Alps"
              href="/saunas/aqua-dome"
            />
          </div>

          <div className="text-center">
            <Link href="/saunas" className="inline-flex items-center gap-2 px-6 py-3 bg-sauna-ink text-sauna-paper rounded-lg
                                                     font-medium hover:bg-sauna-charcoal transition-colors group">
              Explore all locations
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section className="py-20 md:py-28 bg-sauna-paper relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-medium text-sauna-ink mb-4">
              Go deeper
            </h2>
            <p className="text-lg text-sauna-slate max-w-2xl mx-auto">
              The letter is just the beginning.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="Find a Sauna"
              description="Places worth the journey. Curated, not scraped."
              href="/saunas"
              cta="Browse locations"
            />

            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              title="Learn the Practice"
              description="Guides for those who want to understand, not just do."
              href="/guides"
              cta="Read guides"
            />

            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              title="The Weekly Letter"
              description="A moment of stillness in your inbox. Every Thursday."
              href="#newsletter"
              cta="Step inside"
            />
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 md:py-28 bg-sauna-ink text-sauna-paper">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl font-medium mb-8 leading-relaxed">
            &ldquo;The sauna is the poor man&apos;s pharmacy.&rdquo;
          </blockquote>
          <p className="text-sauna-sand text-lg">— Finnish proverb</p>

        </div>
      </section>

      {/* Final CTA Section */}
      <section id="newsletter" className="py-20 md:py-28 bg-sauna-paper relative">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium text-sauna-ink mb-6 leading-tight">
            Step inside.
          </h2>

          <div className="space-y-3 text-lg text-sauna-slate mb-10 max-w-xl mx-auto">
            <p>Every Thursday: the science of heat, places worth the journey,</p>
            <p>and a few minutes of calm before the weekend.</p>
          </div>

          <NewsletterSignup variant="inline" />

          <p className="text-sm text-sauna-slate mt-6">
            Free. Every Thursday. 5-minute read.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: 'brain' | 'gear' | 'map' | 'pause'
  title: string
  description: string
}) {
  const icons = {
    brain: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    gear: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    map: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    pause: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <div className="p-6 bg-sauna-charcoal/50 rounded-xl border border-sauna-paper/10">
      <div className="w-10 h-10 rounded-lg bg-sauna-sand/20 flex items-center justify-center text-sauna-sand mb-4">
        {icons[icon]}
      </div>
      <h3 className="text-base font-semibold text-sauna-paper mb-2">{title}</h3>
      <p className="text-sm text-sauna-paper/70 leading-relaxed">{description}</p>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  href,
  cta,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  cta: string
}) {
  return (
    <Link
      href={href}
      className="group block p-8 bg-sauna-linen rounded-xl border border-sauna-ash/50
                 hover:border-sauna-oak/30 hover:bg-sauna-cream transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-lg bg-sauna-oak/10 flex items-center justify-center
                      text-sauna-walnut mb-5 group-hover:bg-sauna-oak/20 transition-colors">
        {icon}
      </div>

      <h3 className="text-lg font-medium text-sauna-ink mb-2 group-hover:text-sauna-walnut transition-colors">
        {title}
      </h3>

      <p className="text-sauna-slate leading-relaxed mb-4">
        {description}
      </p>

      <div className="flex items-center text-sauna-walnut text-sm font-medium group-hover:gap-2 gap-1.5 transition-all">
        {cta}
        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

function SaunaCard({
  image,
  name,
  location,
  feature,
  href,
}: {
  image: string
  name: string
  location: string
  feature: string
  href: string
}) {
  return (
    <Link href={href} className="group relative aspect-3/4 rounded-xl overflow-hidden">
      <Image
        src={image}
        alt={`${name} in ${location}`}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-linear-to-t from-sauna-charcoal/80 via-sauna-charcoal/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-sauna-sand text-xs uppercase tracking-wider mb-1">{location}</p>
        <h3 className="text-sauna-paper font-display text-lg font-medium mb-1">{name}</h3>
        <p className="text-sauna-paper/70 text-sm leading-snug">{feature}</p>
      </div>
    </Link>
  )
}
