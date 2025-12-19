import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-sauna-paper/90 backdrop-blur-md border-b border-sauna-ash/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-sauna-bark flex items-center justify-center
                            group-hover:bg-sauna-walnut transition-colors duration-300">
              <svg className="w-5 h-5 text-sauna-sand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <span className="font-display text-xl font-medium text-sauna-ink tracking-tight">Sauna Guide</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/saunas" className="text-sauna-slate hover:text-sauna-ink transition-colors text-sm font-medium tracking-wide uppercase">
              Directory
            </Link>
            <Link href="/guides" className="text-sauna-slate hover:text-sauna-ink transition-colors text-sm font-medium tracking-wide uppercase">
              Guides
            </Link>
            <Link href="#newsletter" className="px-5 py-2.5 bg-sauna-ink text-sauna-paper rounded-lg text-sm font-medium
                                                 hover:bg-sauna-charcoal transition-colors duration-300">
              Get The Briefing
            </Link>
          </div>
        </div>
      </nav>

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
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="animate-fade-up">
            <span className="inline-block px-4 py-1.5 bg-sauna-paper/15 border border-sauna-paper/30 rounded-full
                            text-sauna-paper text-sm font-medium mb-8 backdrop-blur-sm tracking-wide">
              Every Thursday · 5 min read · Free forever
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-sauna-paper mb-6
                        leading-[1.1] tracking-tight animate-fade-up"
              style={{ animationDelay: '0.1s' }}>
            Master the Science of Heat<br />
            <span className="text-sauna-sand">in 5 Minutes a Week</span>
          </h1>

          <p className="text-lg md:text-xl text-sauna-paper/80 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up"
             style={{ animationDelay: '0.2s' }}>
            Join 10,000+ founders, executives, and high performers who get weekly
            protocols, research breakdowns, and equipment insights. No fluff. Just what works.
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

      {/* Social Proof Bar */}
      <section className="bg-sauna-linen py-6 border-b border-sauna-ash/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i}
                       className="w-8 h-8 rounded-full bg-sauna-oak/20
                                  border-2 border-sauna-linen flex items-center justify-center
                                  text-sauna-walnut text-xs font-medium">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sauna-ink">
                <span className="font-semibold">10,000+</span>
                <span className="text-sauna-slate ml-1">high performers</span>
              </div>
            </div>

            <div className="h-5 w-px bg-sauna-ash hidden md:block" />

            <div className="text-sauna-ink">
              <span className="font-semibold">Every Thursday</span>
              <span className="text-sauna-slate ml-1">at 7am</span>
            </div>

            <div className="h-5 w-px bg-sauna-ash hidden md:block" />

            <div className="flex items-center gap-1.5 text-sauna-ink">
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">4.9/5</span>
              <span className="text-sauna-slate">reader rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 md:py-28 bg-sauna-paper relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-medium text-sauna-ink mb-4">
              What you&apos;ll get every Thursday
            </h2>
            <p className="text-lg text-sauna-slate max-w-2xl mx-auto">
              No 3-hour podcasts. No bro-science. Just the research-backed practices that actually move the needle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ValueCard
              icon="🔬"
              title="The Research Brief"
              description="One breakthrough finding from peer-reviewed journals, explained in plain language"
            />
            <ValueCard
              icon="📋"
              title="Protocol of the Week"
              description="An actionable practice you can implement immediately, with exact parameters"
            />
            <ValueCard
              icon="🎯"
              title="Equipment Intel"
              description="Unbiased analysis of saunas and gear. What's worth the investment, what's marketing"
            />
            <ValueCard
              icon="🌍"
              title="Global Discoveries"
              description="Hidden gems, new openings, and destination-worthy thermal experiences worldwide"
            />
          </div>
        </div>
      </section>

      {/* Image + Benefits Section */}
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
              {/* Floating stat card */}
              <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-sauna-paper rounded-xl p-4 md:p-5 shadow-lg border border-sauna-ash/50">
                <div className="text-2xl font-semibold text-sauna-ink">40+ hrs</div>
                <div className="text-sm text-sauna-slate">of research, distilled<br/>into 5 minutes</div>
              </div>
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-sauna-oak/10 text-sauna-walnut text-sm font-medium mb-5 rounded">
                Why 10,000+ subscribe
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-medium text-sauna-ink mb-6 leading-tight">
                Stop guessing.<br/>Start optimizing.
              </h2>
              <p className="text-lg text-sauna-slate mb-8 leading-relaxed">
                Most people use saunas wrong. Wrong temperature. Wrong duration. Wrong timing.
                We translate the latest research into protocols you can actually use.
              </p>

              <div className="space-y-4">
                <BenefitRow text="Optimal protocols for longevity, recovery, and cognitive performance" />
                <BenefitRow text="Equipment reviews that save you from expensive mistakes" />
                <BenefitRow text="The science behind heat shock proteins, explained simply" />
                <BenefitRow text="Contrast therapy sequences for maximum hormetic benefit" />
              </div>

              <Link href="#newsletter" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-sauna-ink text-sauna-paper rounded-lg
                                                   font-medium hover:bg-sauna-charcoal transition-colors">
                Get The Thursday Briefing
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-sauna-paper relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-medium text-sauna-ink mb-4">
              More than a newsletter
            </h2>
            <p className="text-lg text-sauna-slate max-w-2xl mx-auto">
              Your complete resource for mastering heat therapy
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
              title="Sauna Directory"
              description="Find world-class saunas near you. Curated for quality, not quantity."
              href="/saunas"
              cta="Explore Directory"
            />

            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              title="Protocol Library"
              description="Step-by-step guides for every goal. Backed by research, tested in practice."
              href="/guides"
              cta="Browse Protocols"
            />

            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              title="Weekly Briefing"
              description="The newsletter that 10,000+ trust for their heat therapy intelligence."
              href="#newsletter"
              cta="Subscribe Free"
            />
          </div>
        </div>
      </section>

      {/* Newsletter Preview Section */}
      <section className="py-20 md:py-28 bg-sauna-ink text-sauna-paper">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/3' }}>
                <img
                  src="/images/sauna-protocols.jpg"
                  alt="Modern home sauna with clean Scandinavian design"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="inline-block px-3 py-1 bg-sauna-paper/10 text-sauna-sand text-sm font-medium mb-5 rounded">
                What readers are saying
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-medium mb-8 leading-tight">
                &ldquo;The only newsletter I actually read every week&rdquo;
              </h2>

              <div className="space-y-6 mb-8">
                <Testimonial
                  quote="Finally, sauna science without the 3-hour podcast commitment. This is exactly what busy professionals need."
                  author="Marcus T."
                  role="CEO, Tech Startup"
                />
                <Testimonial
                  quote="Bought a $12K sauna based on their equipment analysis. Zero regrets. They saved me from an expensive mistake."
                  author="Sarah K."
                  role="Physician"
                />
              </div>

              <Link href="#newsletter" className="inline-flex items-center gap-2 px-6 py-3 bg-sauna-paper text-sauna-ink rounded-lg
                                                   font-medium hover:bg-sauna-linen transition-colors">
                Join 10,000+ Readers
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="newsletter" className="py-20 md:py-28 bg-sauna-paper relative">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block px-3 py-1 bg-sauna-oak/10 text-sauna-walnut text-sm font-medium mb-5 rounded">
            Free forever · Unsubscribe anytime
          </span>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium text-sauna-ink mb-5 leading-tight">
            Get smarter about heat<br/>in 5 minutes a week
          </h2>

          <p className="text-lg text-sauna-slate mb-8 max-w-xl mx-auto">
            Every Thursday: one research breakthrough, one actionable protocol,
            and the equipment intel you need. Join 10,000+ who already subscribe.
          </p>

          <NewsletterSignup variant="inline" />

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-sauna-stone">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Takes 5 min to read
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No spam, ever
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              One-click unsubscribe
            </span>
          </div>
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
                The weekly briefing for people serious about heat therapy.
                Research-backed protocols. Zero fluff.
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

function Testimonial({
  quote,
  author,
  role,
}: {
  quote: string
  author: string
  role: string
}) {
  return (
    <div className="bg-sauna-charcoal rounded-lg p-4">
      <p className="text-sauna-birch/90 text-sm leading-relaxed mb-2">&ldquo;{quote}&rdquo;</p>
      <p className="text-sauna-sand text-sm font-medium">{author} <span className="text-sauna-fog font-normal">· {role}</span></p>
    </div>
  )
}
