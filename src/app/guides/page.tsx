import Link from 'next/link'
import { getAllGuides } from '@/lib/guides'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'

export const metadata = {
  title: 'Sauna Protocols & Guides | Sauna Guide',
  description: 'Evidence-based protocols, gear reviews, and deep dives into heat therapy culture.',
}

export default function GuidesIndexPage() {
  const guides = getAllGuides()

  return (
    <div className="min-h-screen bg-sauna-paper">
      {/* Navigation */}
      <nav className="bg-sauna-paper border-b border-sauna-ash/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-sauna-bark flex items-center justify-center">
              <svg className="w-4 h-4 text-sauna-sand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <span className="font-display text-lg font-medium text-sauna-ink">Sauna Guide</span>
          </Link>
          <div className="flex gap-6 text-sm font-medium uppercase tracking-wider">
            <Link href="/saunas" className="text-sauna-slate hover:text-sauna-ink transition-colors">Directory</Link>
            <Link href="/guides" className="text-sauna-walnut border-b-2 border-sauna-walnut">Guides</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-16 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-6">
            Protocols & Perspectives
          </h1>
          <p className="text-xl text-sauna-slate max-w-2xl mx-auto leading-relaxed">
            Deep dives into the science of heat, cultural traditions, 
            and practical guides for your practice.
          </p>
        </header>

        <div className="space-y-12">
          {guides.map((guide) => (
            <article key={guide.slug} className="group relative grid md:grid-cols-4 gap-6 items-start border-b border-sauna-ash/50 pb-12 last:border-0">
              <div className="md:col-span-1 text-sm text-sauna-oak font-medium pt-1">
                {guide.date}
              </div>
              <div className="md:col-span-3">
                <Link href={`/guides/${guide.slug}`}>
                  <h2 className="text-2xl font-display font-medium text-sauna-ink mb-3 group-hover:text-sauna-heat transition-colors">
                    {guide.title}
                  </h2>
                </Link>
                <p className="text-sauna-slate leading-relaxed mb-4">
                  {guide.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {guide.tags?.map(tag => (
                    <span key={tag} className="text-xs uppercase tracking-wider font-bold text-sauna-stone bg-sauna-linen px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
          
          {guides.length === 0 && (
            <div className="text-center py-20 text-sauna-slate">
              <p>No guides published yet. Check back soon!</p>
            </div>
          )}
        </div>

        <div className="mt-20 p-8 bg-sauna-linen rounded-2xl border border-sauna-ash/50 text-center">
            <h3 className="font-display text-2xl font-medium text-sauna-ink mb-4">Never miss a protocol</h3>
            <p className="text-sauna-slate mb-8">Join 10,000+ others getting our weekly heat briefing.</p>
            <NewsletterSignup variant="inline" />
        </div>
      </main>
    </div>
  )
}