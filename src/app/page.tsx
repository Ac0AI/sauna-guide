import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { Navigation } from '@/components/layout/Navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <img
              src="/images/hero-sauna.jpg"
              alt="Authentic Finnish sauna interior with aged cedar wood"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-sauna-charcoal/70 via-sauna-bark/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-sauna-paper mb-8
                        leading-[1.1] tracking-tight animate-fade-up">
            Close the door.<br />
            <span className="text-sauna-sand">Let everything go.</span>
          </h1>

          <div className="space-y-4 text-lg md:text-xl text-sauna-paper/85 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up"
             style={{ animationDelay: '0.1s' }}>
            <p>There&apos;s a room with no notifications.</p>
            <p>Where you can&apos;t scroll. Can&apos;t be reached. Don&apos;t need to perform.</p>
            <p className="text-sauna-sand/90">Just heat. Silence. Breath.</p>
          </div>

          <p className="text-base text-sauna-paper/60 mb-8 max-w-xl mx-auto animate-fade-up"
             style={{ animationDelay: '0.2s' }}>
            Once a week, we send a letter from that room. Not tips. Not hacks.<br />
            Just a reminder that there&apos;s another way to live.
          </p>

          <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <NewsletterSignup />
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
      <section className="py-20 md:py-28 bg-sauna-paper relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-medium text-sauna-ink mb-4">
              What&apos;s inside each letter
            </h2>
            <p className="text-lg text-sauna-slate max-w-2xl mx-auto">
              A few minutes of reading. A week of warmth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ValueCard
              icon="◈"
              title="One Thing That Works"
              description="A practice worth trying. Tested by time, backed by research."
            />
            <ValueCard
              icon="◉"
              title="A Place Worth Visiting"
              description="Saunas around the world that understand what this is really about."
            />
            <ValueCard
              icon="◇"
              title="Something to Consider"
              description="The science, the history, the philosophy. Context that deepens the practice."
            />
            <ValueCard
              icon="○"
              title="The Quiet Part"
              description="Reflections on slowing down. Permission to take time for yourself."
            />
          </div>
        </div>
      </section>

      {/* Image + Philosophy Section */}
      <section className="py-20 md:py-28 bg-sauna-linen relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="relative w-full rounded-2xl overflow-hidden shadow-xl" style={{ aspectRatio: '4/3' }}>
                <img
                  src="/images/contrast-therapy.jpg"
                  alt="Traditional outdoor sauna by a Nordic lake"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <h2 className="font-display text-3xl md:text-4xl font-medium text-sauna-ink mb-6 leading-tight">
                Not a hack.<br/>A practice.
              </h2>
              <p className="text-lg text-sauna-slate mb-8 leading-relaxed">
                The Finns don&apos;t &ldquo;optimize&rdquo; their sauna sessions. They don&apos;t track HRV or count minutes.
                They sit. They breathe. They&apos;ve done this for a thousand years.
              </p>
              <p className="text-lg text-sauna-slate mb-8 leading-relaxed">
                We believe the research matters — but so does the ritual. This newsletter holds both.
              </p>

              <div className="space-y-4 text-sauna-slate">
                <BenefitRow text="Protocols that work, without losing the soul of the practice" />
                <BenefitRow text="Places where they still do it right" />
                <BenefitRow text="The why behind the heat" />
              </div>

              <Link href="#newsletter" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-sauna-ink text-sauna-paper rounded-lg
                                                   font-medium hover:bg-sauna-charcoal transition-colors">
                Step inside
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
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

          <div className="mt-16 pt-16 border-t border-sauna-paper/10">
            <p className="text-sauna-birch/80 text-lg mb-8 max-w-2xl mx-auto">
              Thousands of years of wisdom. One letter a week.
            </p>
            <Link href="#newsletter" className="inline-flex items-center gap-2 px-6 py-3 bg-sauna-paper text-sauna-ink rounded-lg
                                                   font-medium hover:bg-sauna-linen transition-colors">
              Step inside
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="newsletter" className="py-20 md:py-28 bg-sauna-paper relative">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium text-sauna-ink mb-6 leading-tight">
            Slower. Hotter. Older.
          </h2>

          <div className="space-y-3 text-lg text-sauna-slate mb-10 max-w-xl mx-auto">
            <p>Humans have gathered around hot stones for millennia.</p>
            <p>The Finns call the steam <em>löyly</em> — it once meant &ldquo;spirit.&rdquo;</p>
          </div>

          <p className="text-base text-sauna-stone mb-8">
            Once a week, a letter from the heat. Free forever.
          </p>

          <NewsletterSignup variant="inline" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sauna-charcoal text-sauna-paper py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-sauna-bark flex items-center justify-center">
                  <svg className="w-5 h-5 text-sauna-sand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <span className="font-display text-xl font-medium">Sauna Guide</span>
              </div>
              <p className="text-sauna-fog max-w-sm leading-relaxed">
                A weekly letter from the heat. For those who understand
                that the sauna is not a hack — it&apos;s a way to live.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-sauna-sand">Explore</h4>
              <ul className="space-y-2 text-sauna-fog">
                <li><Link href="/saunas" className="hover:text-sauna-paper transition-colors">Sauna Directory</Link></li>
                <li><Link href="/guides" className="hover:text-sauna-paper transition-colors">Protocol Library</Link></li>
                <li><Link href="/guides/contrast-therapy" className="hover:text-sauna-paper transition-colors">Contrast Therapy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-sauna-sand">Company</h4>
              <ul className="space-y-2 text-sauna-fog">
                <li><Link href="/about" className="hover:text-sauna-paper transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-sauna-paper transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-sauna-paper transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-sauna-bark flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sauna-stone text-sm">
              &copy; {new Date().getFullYear()} Sauna Guide. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sauna-stone hover:text-sauna-paper transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-sauna-stone hover:text-sauna-paper transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="p-6 bg-sauna-linen rounded-xl border border-sauna-ash/50">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-base font-semibold text-sauna-ink mb-2">{title}</h3>
      <p className="text-sm text-sauna-slate leading-relaxed">{description}</p>
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

      <div className="flex items-center text-sauna-oak text-sm font-medium group-hover:gap-2 gap-1.5 transition-all">
        {cta}
        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

function BenefitRow({ text }: { text: string }) {
  return (
    <div className="flex gap-3 items-start">
      <svg className="w-5 h-5 text-sauna-oak mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-sauna-slate">{text}</span>
    </div>
  )
}

