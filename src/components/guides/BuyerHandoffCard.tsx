import Link from 'next/link'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'

interface BuyerHandoffCardProps {
  slug: string
}

export default function BuyerHandoffCard({ slug }: BuyerHandoffCardProps) {
  const tracking = `utm_source=guide&utm_medium=internal&utm_campaign=buyer_handoff&utm_content=${slug}`

  return (
    <section className="mt-16 rounded-3xl border border-sauna-ash/50 bg-sauna-linen/60 p-8 md:p-10">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-display text-3xl font-medium text-sauna-ink mb-4">
          Buying a home sauna?
        </h2>
        <p className="text-sauna-slate leading-relaxed mb-8">
          Get the buyer-first email guide before you spend a dollar. We cover real budgets, the right sauna type for your space, and the mistakes that make projects run over budget.
        </p>

        <div className="max-w-md mx-auto">
          <NewsletterSignup
            variant="buying-guide"
            source={`guide-buyer-handoff-${slug}`}
          />
        </div>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          <Link
            href={`/guides/ultimate-home-sauna-buying-guide?${tracking}`}
            className="rounded-2xl border border-sauna-ash/50 bg-white px-4 py-4 text-sm text-sauna-slate transition-colors hover:border-sauna-oak/50 hover:text-sauna-ink"
          >
            Start with the full home sauna buying guide.
          </Link>
          <Link
            href={`/guides/home-sauna-cost-guide-2026?${tracking}`}
            className="rounded-2xl border border-sauna-ash/50 bg-white px-4 py-4 text-sm text-sauna-slate transition-colors hover:border-sauna-oak/50 hover:text-sauna-ink"
          >
            See the real 2026 cost breakdown before you commit.
          </Link>
          <Link
            href={`/quiz?${tracking}`}
            className="rounded-2xl border border-sauna-ash/50 bg-white px-4 py-4 text-sm text-sauna-slate transition-colors hover:border-sauna-oak/50 hover:text-sauna-ink"
          >
            Not sure which type fits your home? Take the 2-minute quiz.
          </Link>
        </div>
      </div>
    </section>
  )
}
