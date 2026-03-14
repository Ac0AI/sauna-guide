import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home Sauna Buying Guide 2026 | Honest Reviews & Comparisons',
  description: 'Find the perfect home sauna with our honest, expert-tested buying guides. Compare infrared, barrel & traditional saunas. Unbiased reviews since 2025.',
  alternates: {
    canonical: 'https://sauna.guide',
  },
  openGraph: {
    title: 'Home Sauna Buying Guide 2026 | Honest Reviews & Comparisons',
    description: 'Find the perfect home sauna with our honest, expert-tested buying guides. Compare infrared, barrel & traditional saunas. Unbiased reviews since 2025.',
    url: 'https://sauna.guide',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Navigation />

      {/* 1. Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-sauna.jpg"
            alt="Interior of a home sauna with warm wood tones"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={85}
          />
          <div className="absolute inset-0 bg-sauna-charcoal/70" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-sauna-paper mb-6
                        leading-[1.1] tracking-tight animate-fade-up drop-shadow-lg">
            We don&apos;t sell saunas.<br />
            <span className="text-sauna-sand">We save you from buying the wrong one.</span>
          </h1>

          <p className="text-lg md:text-xl text-sauna-paper/90 mb-10 animate-fade-up max-w-2xl mx-auto leading-relaxed"
             style={{ animationDelay: '0.1s' }}>
            The honest guide to getting a home sauna. What it actually costs, what actually matters, and what everyone gets wrong. Free. Independent. No BS.
          </p>

          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <NewsletterSignup variant="buying-guide-hero" />
          </div>

          <p className="text-sm text-sauna-paper/50 mt-5 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            3 short emails. 5 min each. Read by people who&apos;d rather do it right than do it twice.
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 border border-sauna-paper/30 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1 h-2 bg-sauna-paper/40 rounded-full" />
          </div>
        </div>
      </section>

      {/* 2. Problem Section */}
      <section className="py-20 md:py-28 bg-sauna-linen relative">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-sm uppercase tracking-widest text-sauna-walnut mb-4">Sound familiar?</p>
          <h2 className="font-display text-3xl md:text-4xl font-medium text-sauna-ink mb-10">
            You&apos;ve had 47 tabs open for three weeks.
          </h2>

          <div className="space-y-6 text-lg text-sauna-slate leading-relaxed mb-14">
            <p>
              You started with a simple question: &ldquo;Can I get a sauna at home?&rdquo; Now you&apos;re deep in Reddit threads at 11pm comparing Harvia heaters and wondering if you need a 240V panel upgrade.
            </p>
            <p>
              Here&apos;s the thing. Most &ldquo;guides&rdquo; out there are written by companies that sell saunas. Their &ldquo;best sauna&rdquo; list always features their own products. Their cost estimates leave out the $2,000 electrical work you&apos;ll discover after you&apos;ve already committed.
            </p>
            <p>
              The average home sauna project runs 30-40% over budget. Not because saunas are expensive. Because the information out there is designed to sell, not to help.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <MistakeCard
              title="The $3,000 surprise"
              body="Most people don't realize they need a 240V panel upgrade until the sauna is already sitting in their driveway. That's a $2,000-3,000 electrician bill nobody warned you about."
            />
            <MistakeCard
              title="The wrong wood"
              body="Cedar smells amazing. It also warps in humid climates. Western red cedar and thermally treated spruce are completely different decisions. Most guides don't even mention this."
            />
            <MistakeCard
              title="The sauna nobody uses"
              body="Almost half of home saunas get used less than once a month after the first year. It's not about the sauna. It's about where you put it and how long it takes to heat up."
            />
          </div>
        </div>
      </section>

      {/* 3. The Guide Preview */}
      <section id="guide" className="py-20 md:py-28 bg-sauna-ink text-sauna-paper relative">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl font-medium text-sauna-paper mb-4">
            Three emails. That&apos;s it.
          </h2>
          <p className="text-lg text-sauna-paper/70 mb-14">
            Everything you need to make a confident decision. No fluff, no upsells.
          </p>

          <div className="space-y-8 mb-14">
            <GuideStep
              number={1}
              title="What it actually costs"
              description="The real numbers for 2026. The unit, the installation, the electrical, the permits, the energy bill. We break down budgets at every price point so you know exactly what you're getting into before you spend a dollar."
            />
            <GuideStep
              number={2}
              title="Which type fits your life"
              description="Infrared or traditional? Indoor or outdoor? Build it yourself or buy a kit? There's no &quot;best&quot; sauna. There's the right one for your space, your climate, and how you'll actually use it. We'll help you figure that out."
            />
            <GuideStep
              number={3}
              title="What everyone gets wrong (and what to buy)"
              description="The 12 mistakes we see over and over in forums and Reddit threads. Plus honest product picks based on the heaters, kits, and saunas we've spent the most time comparing. Clear, practical, and buyer-first."
            />
          </div>

          <div className="bg-sauna-charcoal/50 rounded-xl p-8">
            <NewsletterSignup variant="buying-guide" />
          </div>
        </div>
      </section>

      {/* 4. Authority Section */}
      <section className="py-20 md:py-28 bg-sauna-charcoal text-sauna-paper relative">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl font-medium text-sauna-paper mb-10 text-center">
            Why listen to us? We don&apos;t have a sauna to sell you.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <TrustCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
              title="No skin in the game"
              body="We don't manufacture saunas. We're not backed by a sauna brand. When we say a $4,000 barrel sauna may fit better than a $12,000 custom build, it's because we care more about fit, tradeoffs, and real-world use than price tags."
            />
            <TrustCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
              title="We did the homework"
              body="In-depth guides, product comparisons, and real time spent studying how home sauna buyers get tripped up. We spent the hours so you don't have to."
            />
            <TrustCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>}
              title="We're the Reddit thread you wish existed"
              body="We cite our sources. When we're not sure about something, we say so. When a product is good but overpriced, we say that too. If you've been reading r/sauna at midnight trying to figure this out, you're our people."
            />
          </div>
        </div>
      </section>

      {/* 5. Social Proof */}
      <section className="py-20 md:py-28 bg-sauna-linen relative">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-sm uppercase tracking-widest text-sauna-walnut mb-4 text-center">Questions we see every week</p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <ForumQuote
              text="We were quoted $8K for installation on a $5K sauna. Nobody warned us about the electrical requirements."
            />
            <ForumQuote
              text="I wish I'd known about the difference between dry and wet sauna before I bought. Would have chosen completely different."
            />
            <ForumQuote
              text="Six months of research and I still can't decide. There's too much conflicting information out there."
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:gap-x-4 text-sauna-walnut text-sm font-medium mb-8">
            <span>Independent</span>
            <span className="text-sauna-ash">·</span>
            <span>Buyer-first</span>
            <span className="text-sauna-ash">·</span>
            <span>No sales bias</span>
          </div>

          <p className="text-center text-lg text-sauna-slate">
            Sound familiar? That&apos;s exactly why we made this guide.
          </p>
        </div>
      </section>

      {/* 6. Places Worth The Journey */}
      <section className="py-20 md:py-28 bg-sauna-paper relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-sauna-walnut mb-3">While you decide</p>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-sauna-ink mb-4">
              Places worth the journey
            </h2>
            <p className="text-lg text-sauna-slate max-w-2xl mx-auto">
              The world&apos;s best saunas. For inspiration, or for your next trip.
            </p>
          </div>

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

      {/* 7. Closing Quote */}
      <section className="py-20 md:py-28 bg-sauna-ink text-sauna-paper">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl font-medium mb-4 leading-relaxed">
            &ldquo;The sauna is the poor man&apos;s pharmacy.&rdquo;
          </blockquote>
          <p className="text-sauna-sand text-lg mb-10">Finnish proverb</p>

          <p className="text-xl text-sauna-paper/80 leading-relaxed">
            The best sauna is the one you actually build.<br />
            We&apos;ll help you pick the right one.
          </p>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section id="newsletter" className="py-20 md:py-28 bg-sauna-paper relative">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium text-sauna-ink mb-6 leading-tight">
            Your sauna starts with one email.
          </h2>

          <p className="text-lg text-sauna-slate mb-10 max-w-xl mx-auto leading-relaxed">
            Three short reads. No selling. No spam. Just the stuff you actually need to know before you spend $5,000 to $25,000 on a box that gets really hot.
          </p>

          <NewsletterSignup variant="buying-guide" />

          <p className="text-sm text-sauna-slate mt-6">
            Free forever. Unsubscribe whenever. First email shows up in a few minutes.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function MistakeCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-6 bg-sauna-paper rounded-xl border border-sauna-ash/50 shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 mb-4">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-sauna-ink mb-2">{title}</h3>
      <p className="text-sm text-sauna-slate leading-relaxed">{body}</p>
    </div>
  )
}

function GuideStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 w-10 h-10 rounded-full bg-sauna-sand/20 flex items-center justify-center text-sauna-sand font-display font-medium text-lg">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-sauna-paper mb-2">Email {number}: &ldquo;{title}&rdquo;</h3>
        <p className="text-sauna-paper/70 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function TrustCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="p-6 bg-sauna-ink/80 rounded-xl border border-sauna-paper/10">
      <div className="w-10 h-10 rounded-lg bg-sauna-sand/15 flex items-center justify-center text-sauna-sand mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-sauna-paper mb-3">{title}</h3>
      <p className="text-sm text-sauna-paper/70 leading-relaxed">{body}</p>
    </div>
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

function ForumQuote({ text }: { text: string }) {
  return (
    <div className="p-5 bg-sauna-paper rounded-xl border border-sauna-ash/50 shadow-sm">
      <div className="pl-2 border-l-2 border-sauna-oak/20 mb-3">
        <p className="text-sauna-slate text-sm leading-relaxed">&ldquo;{text}&rdquo;</p>
      </div>
      <span className="text-xs text-sauna-stone italic">from real sauna buyers</span>
    </div>
  )
}
