import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { NewsCard } from '@/components/listings/NewsCard'
import { getAllNews } from '@/lib/news'

export const metadata: Metadata = {
  title: 'Sauna News: Weekly Briefings on Heat, Culture & Builds',
  description: 'A weekly Sauna Guide briefing on sauna culture, new builds, heat science, and the stories worth paying attention to.',
  alternates: {
    canonical: 'https://sauna.guide/news',
  },
  openGraph: {
    title: 'Sauna News: Weekly Briefings on Heat, Culture & Builds',
    description: 'A weekly Sauna Guide briefing on sauna culture, new builds, heat science, and the stories worth paying attention to.',
    url: 'https://sauna.guide/news',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sauna News',
    description: 'Weekly briefings from the world of heat, culture, and builds.',
    images: ['/og-image.jpg'],
  },
}

function formatDisplayDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

export default function NewsIndexPage() {
  const posts = getAllNews()
  const latestPost = posts[0]
  const archive = posts.slice(1)
  const archivePosts = archive.length > 0 ? archive : latestPost ? [latestPost] : []

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Sauna News',
    url: 'https://sauna.guide/news',
    hasPart: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://sauna.guide/news/${post.slug}`,
      name: post.title,
    })),
  }

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <Navigation />

      <main className="grow">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(196,181,160,0.32),_transparent_38%),linear-gradient(180deg,_#201b18_0%,_#2f2823_48%,_#f5f3ef_48%,_#fafaf8_100%)] px-6 pb-20 pt-32 md:pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <p className="mb-4 text-sm uppercase tracking-[0.24em] text-sauna-sand/80">
                Sauna News
              </p>
              <h1 className="font-display text-5xl font-medium leading-[0.95] text-sauna-paper md:text-7xl">
                The weekly briefing from the world of heat.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-sauna-paper/78">
                Culture, builds, bathhouse momentum, and the science stories worth keeping an eye on.
                Short, sourced, and written in the Sauna Guide voice.
              </p>
            </div>

            {latestPost ? (
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <Link
                  href={`/news/${latestPost.slug}`}
                  className="group relative overflow-hidden rounded-[32px] border border-sauna-paper/12 bg-sauna-charcoal shadow-[0_24px_90px_rgba(0,0,0,0.24)]"
                >
                  {latestPost.image && (
                    <Image
                      src={latestPost.image}
                      alt={latestPost.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-sauna-night via-sauna-night/50 to-transparent" />
                  <div className="relative flex min-h-[480px] flex-col justify-end p-8 md:p-10">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-sauna-paper/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sauna-bark">
                        Latest Edition
                      </span>
                      {latestPost.storyCount ? (
                        <span className="rounded-full bg-sauna-charcoal/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sauna-paper ring-1 ring-white/10">
                          {latestPost.storyCount} stories
                        </span>
                      ) : null}
                    </div>
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-sauna-sand/80">
                      {formatDisplayDate(latestPost.date)}
                    </p>
                    <h2 className="mb-4 max-w-3xl font-display text-4xl font-medium leading-tight text-sauna-paper md:text-5xl">
                      {latestPost.title}
                    </h2>
                    <p className="max-w-2xl text-lg leading-relaxed text-sauna-paper/82">
                      {latestPost.description}
                    </p>
                  </div>
                </Link>

                <div className="rounded-[32px] border border-sauna-ash/60 bg-sauna-paper/95 p-7 shadow-[0_20px_70px_rgba(28,25,23,0.08)] md:p-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-sauna-walnut">
                    What You Get
                  </p>
                  <div className="space-y-5 text-sauna-slate">
                    <div>
                      <h3 className="mb-1 font-display text-2xl font-medium text-sauna-ink">The short version</h3>
                      <p className="leading-relaxed">
                        One edition a week. The signal, not the sludge.
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-1 font-display text-2xl font-medium text-sauna-ink">A buyer-first lens</h3>
                      <p className="leading-relaxed">
                        We separate meaningful developments from dressed-up marketing.
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-1 font-display text-2xl font-medium text-sauna-ink">A warmer voice</h3>
                      <p className="leading-relaxed">
                        This is news with context, not a wire feed in cedar wrapping paper.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-[28px] bg-sauna-linen p-6">
                    <p className="mb-4 font-display text-2xl font-medium text-sauna-ink">
                      Want the Thursday letter too?
                    </p>
                    <p className="mb-6 leading-relaxed text-sauna-slate">
                      The weekly note on why heat heals, where to find it, and five minutes of stillness.
                    </p>
                    <NewsletterSignup variant="buying-guide" source="news-page" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[32px] border border-sauna-ash/60 bg-sauna-paper/92 p-10 shadow-[0_24px_90px_rgba(28,25,23,0.08)]">
                <h2 className="mb-3 font-display text-4xl font-medium text-sauna-ink">
                  First edition lands soon.
                </h2>
                <p className="max-w-2xl text-lg leading-relaxed text-sauna-slate">
                  We are setting the rhythm now. Check back next week for the first briefing.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-sauna-walnut">
                  Archive
                </p>
                <h2 className="font-display text-4xl font-medium text-sauna-ink">
                  Weekly editions
                </h2>
              </div>
              <p className="max-w-md text-right text-sm leading-relaxed text-sauna-slate">
                Built for readers who want a clean read on where the sauna world is actually moving.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {archivePosts.map((post) => (
                <NewsCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
