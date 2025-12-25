
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import Image from 'next/image'

export const metadata = {
  title: 'The 30-Day Sauna Reset | Guided Protocol',
  description: 'Restore your baseline in 4 weeks. A guided sauna protocol to reduce stress, improve sleep, and build resilience.',
}

export default function ChallengePage() {
  return (
    <main className="min-h-screen bg-sauna-paper text-sauna-ink overflow-hidden selection:bg-sauna-sand/30">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        {/* Background - Split design */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-sauna-charcoal/90 mix-blend-multiply z-10" />
            <Image
            src="/images/sauna-protocols.jpg" // Using an existing image as placeholder
            alt="Person relaxing in sauna"
            fill
            priority
            className="object-cover opacity-60 grayscale"
            quality={90}
            />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-sauna-paper max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sauna-sand/20 text-sauna-sand rounded-full text-xs font-medium tracking-wider uppercase mb-6 backdrop-blur-sm border border-sauna-sand/20">
              <span className="w-1.5 h-1.5 rounded-full bg-sauna-sand animate-pulse" />
              Starts When You Are Ready
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium mb-8 leading-[0.9]">
              The 30-Day <br />
              <span className="text-sauna-sand">Reset.</span>
            </h1>

            <p className="text-xl md:text-2xl text-sauna-paper/80 mb-10 leading-relaxed max-w-lg">
              Most of us have lost our baseline. <br />
              We are chronically stressed, poorly rested, and overstimulated.
            </p>

            <p className="text-lg text-sauna-paper/60 mb-12 max-w-lg">
              Heat is the antidote. In 4 weeks, we guide you back to equilibrium through heat, cold, and breath.
            </p>

            <div className="bg-sauna-charcoal/40 backdrop-blur-md p-1 rounded-xl border border-sauna-paper/10 inline-block w-full max-w-md">
                <NewsletterSignup variant="minimal" className="w-full" />
                <p className="text-xs text-center text-sauna-paper/40 mt-3 pb-2">
                    Free guided protocol. Sent to your inbox.
                </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Protocol Structure */}
      <section className="py-24 bg-sauna-paper relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-6">
              The Path.
            </h2>
            <p className="text-xl text-sauna-slate leading-relaxed">
              We don't throw you into the deep end. We build capacity. <br/>
              Week by week, we layer on intensity and complexity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <WeekCard 
                number="01"
                title="Foundation"
                theme="Heat Tolerance"
                desc="Re-learning how to sit still. Basic heat exposure protocols. Establishing the habit."
            />
            <WeekCard 
                number="02"
                title="Expansion"
                theme="Breath & Duration"
                desc="Introducing breathwork to manage the heat. Extending duration. Finding the edge."
            />
            <WeekCard 
                number="03"
                title="Contrast"
                theme="Heat + Cold"
                desc="The magic happens in the transition. Introducing cold exposure cycles for vascular flexibility."
            />
            <WeekCard 
                number="04"
                title="Integration"
                theme="The Lifestyle"
                desc="Advanced protocols (hormetic stress). How to keep the benefits without the constant effort."
            />
          </div>
        </div>
      </section>

      {/* The Invite Section */}
      <section className="py-24 bg-sauna-linen border-y border-sauna-ash/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-medium text-sauna-ink mb-6">
                Better Together.
            </h2>
            <p className="text-lg text-sauna-slate mb-10 max-w-2xl mx-auto">
                Research shows that accountability partners increase adherence by 80%. 
                Don't do this alone.
            </p>
            
            <div className="inline-flex flex-col sm:flex-row gap-4 items-center justify-center">
                <button className="px-8 py-4 bg-sauna-ink text-sauna-paper font-medium rounded-xl hover:bg-sauna-charcoal transition-all shadow-lg hover:shadow-xl w-full sm:w-auto">
                    Copy Link to Share
                </button>
                <p className="text-sm text-sauna-slate/60">
                    Or just forward the first email to a friend.
                </p>
            </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function WeekCard({ number, title, theme, desc }: { number: string, title: string, theme: string, desc: string }) {
    return (
        <div className="border-t border-sauna-ink/20 pt-6 group hover:border-sauna-ink transition-colors duration-500">
            <span className="text-6xl font-display text-sauna-ash/50 font-medium block mb-4 group-hover:text-sauna-oak/30 transition-colors">
                {number}
            </span>
            <h3 className="text-xl font-bold text-sauna-ink mb-1">{title}</h3>
            <p className="text-xs uppercase tracking-widest text-sauna-oak mb-4">{theme}</p>
            <p className="text-sauna-slate text-sm leading-relaxed border-l-2 border-transparent pl-0 group-hover:pl-4 group-hover:border-sauna-sand transition-all duration-300">
                {desc}
            </p>
        </div>
    )
}
