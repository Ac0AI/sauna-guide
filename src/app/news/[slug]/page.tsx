import { notFound } from 'next/navigation'
import type { ComponentPropsWithoutRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { formatGuideAuthorName, getGuideAuthorSchema } from '@/lib/guides'
import { getAllNews, getNewsBySlug, getRelatedNews } from '@/lib/news'

function formatDisplayDate(value?: string) {
  if (!value) return null

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

export async function generateStaticParams() {
  const posts = getAllNews()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getNewsBySlug(slug)

  if (!post) {
    return { title: 'News Edition Not Found' }
  }

  const authorName = formatGuideAuthorName(post.meta.author)
  const socialImage = post.meta.image
    ? [{ url: post.meta.image }]
    : [{ url: '/og-image.jpg', width: 1200, height: 630 }]

  return {
    title: post.meta.title,
    description: post.meta.description,
    authors: [{ name: authorName }],
    alternates: {
      canonical: `https://sauna.guide/news/${slug}`,
    },
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: 'article',
      url: `https://sauna.guide/news/${slug}`,
      images: socialImage,
      publishedTime: post.meta.date,
      modifiedTime: post.meta.lastModified,
      authors: [authorName],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta.title,
      description: post.meta.description,
      images: [post.meta.image || '/og-image.jpg'],
    },
  }
}

export default async function NewsPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getNewsBySlug(slug)

  if (!post) {
    return notFound()
  }

  const authorName = formatGuideAuthorName(post.meta.author)
  const publishedDate = formatDisplayDate(post.meta.date)
  const updatedDate = formatDisplayDate(post.meta.lastModified)
  const showUpdatedDate = Boolean(updatedDate && updatedDate !== publishedDate)
  const relatedPosts = getRelatedNews(post.meta.slug)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.meta.title,
    description: post.meta.description,
    image: post.meta.image ? `https://sauna.guide${post.meta.image}` : undefined,
    datePublished: post.meta.date,
    dateModified: post.meta.lastModified || post.meta.date,
    author: getGuideAuthorSchema(post.meta.author),
    publisher: {
      '@type': 'Organization',
      name: 'Sauna Guide',
      logo: { '@type': 'ImageObject', url: 'https://sauna.guide/images/logo.svg' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://sauna.guide/news/${slug}`,
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sauna.guide' },
      { '@type': 'ListItem', position: 2, name: 'News', item: 'https://sauna.guide/news' },
      { '@type': 'ListItem', position: 3, name: post.meta.title, item: `https://sauna.guide/news/${slug}` },
    ],
  }

  const components = {
    h1: (props: ComponentPropsWithoutRef<'h1'>) => <h2 {...props} />,
  }

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navigation />

      <article className="grow px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <nav className="mb-8 text-sm">
            <Link href="/news" className="text-sauna-slate hover:text-sauna-oak transition-colors">
              ← All News Editions
            </Link>
          </nav>

          <header className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-sauna-walnut">
                Sauna News
              </p>
              <div className="mb-5 flex flex-wrap gap-3 text-sm font-medium uppercase tracking-[0.16em] text-sauna-stone">
                <span>{publishedDate || post.meta.date}</span>
                {showUpdatedDate ? <span>Updated {updatedDate}</span> : null}
                <span>{authorName}</span>
                {post.meta.storyCount ? <span>{post.meta.storyCount} stories</span> : null}
              </div>
              <h1 className="mb-5 font-display text-4xl font-medium leading-tight text-sauna-ink md:text-6xl">
                {post.meta.title}
              </h1>
              <p className="max-w-3xl text-xl leading-relaxed text-sauna-slate">
                {post.meta.description}
              </p>
            </div>

            <aside className="rounded-[28px] border border-sauna-ash/50 bg-white/80 p-6 shadow-[0_20px_60px_rgba(28,25,23,0.05)]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-sauna-walnut">
                This Edition
              </p>
              <ul className="space-y-4 text-sm leading-relaxed text-sauna-slate">
                <li>Sourced from live feeds and curated into one clean read.</li>
                <li>Written to give context, not just repeat headlines.</li>
                <li>Best read with one tab closed and the phone on silent.</li>
              </ul>
              <div className="mt-6 border-t border-sauna-ash/50 pt-6">
                <NewsletterSignup variant="buying-guide" source="news-article" />
              </div>
            </aside>
          </header>

          {post.meta.image ? (
            <div className="mt-10 overflow-hidden rounded-[32px] border border-sauna-ash/40 shadow-[0_24px_80px_rgba(28,25,23,0.08)]">
              <Image
                src={post.meta.image}
                alt={post.meta.title}
                width={1600}
                height={900}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          ) : null}

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="prose prose-lg max-w-none prose-stone
                            prose-headings:font-display prose-headings:font-medium prose-headings:text-sauna-ink
                            prose-p:text-sauna-slate prose-p:leading-relaxed
                            prose-a:text-sauna-walnut prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-sauna-bark
                            prose-strong:text-sauna-dark
                            prose-li:text-sauna-slate">
              <MDXRemote
                source={post.content}
                components={components}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              />
            </div>

            <aside className="space-y-6">
              {post.meta.sources?.length ? (
                <section className="rounded-[28px] border border-sauna-ash/50 bg-sauna-linen/50 p-6">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-sauna-walnut">
                    Sources
                  </p>
                  <div className="space-y-4">
                    {post.meta.sources.map((source) => (
                      <a
                        key={`${source.url}-${source.title}`}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-2xl border border-sauna-ash/50 bg-white px-4 py-4 transition-colors hover:border-sauna-oak/60"
                      >
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-sauna-stone">
                          {source.label}
                        </p>
                        <p className="text-sm font-medium leading-snug text-sauna-ink">
                          {source.title}
                        </p>
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="rounded-[28px] border border-sauna-ash/50 bg-sauna-charcoal p-6 text-sauna-paper">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-sauna-sand/80">
                  Why This Exists
                </p>
                <p className="leading-relaxed text-sauna-paper/78">
                  Too much sauna content is either product marketing in disguise or thin summary sludge.
                  This page is supposed to feel cleaner than that.
                </p>
              </section>
            </aside>
          </div>

          {relatedPosts.length > 0 ? (
            <section className="mt-20">
              <h2 className="mb-6 font-display text-3xl font-medium text-sauna-ink">
                More From Sauna News
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/news/${relatedPost.slug}`}
                    className="rounded-[24px] border border-sauna-ash/40 bg-white p-5 transition-colors hover:border-sauna-oak/50"
                  >
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-sauna-walnut">
                      {formatDisplayDate(relatedPost.date)}
                    </p>
                    <h3 className="mb-2 font-display text-2xl font-medium text-sauna-ink">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-sauna-slate">
                      {relatedPost.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </article>

      <Footer />
    </div>
  )
}
