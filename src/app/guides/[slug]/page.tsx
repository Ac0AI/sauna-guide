import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { ComponentPropsWithoutRef } from 'react'
import { formatGuideAuthorName, getGuideAuthorSchema, getGuideBySlug, getAllGuides } from '@/lib/guides'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import QuizCTA from '@/components/quiz/QuizCTA'

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

// This generates static pages at build time
export async function generateStaticParams() {
  const guides = getAllGuides()
  return guides.map((guide) => ({
    slug: guide.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = await getGuideBySlug(slug)

  if (!guide) return { title: 'Guide Not Found' }

  const authorName = formatGuideAuthorName(guide.meta.author)
  const socialImage = guide.meta.image
    ? [{ url: guide.meta.image }]
    : [{ url: '/og-image.jpg', width: 1200, height: 630 }]

  return {
    title: guide.meta.title,
    description: guide.meta.description,
    authors: [{ name: authorName }],
    alternates: {
      canonical: `https://sauna.guide/guides/${slug}`,
    },
    openGraph: {
      title: guide.meta.title,
      description: guide.meta.description,
      type: 'article',
      url: `https://sauna.guide/guides/${slug}`,
      images: socialImage,
      publishedTime: guide.meta.date,
      modifiedTime: guide.meta.lastModified,
      authors: [authorName],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.meta.title,
      description: guide.meta.description,
      images: [guide.meta.image || '/og-image.jpg'],
    },
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = await getGuideBySlug(slug)

  if (!guide) return notFound()

  const authorName = formatGuideAuthorName(guide.meta.author)
  const publishedDate = formatDisplayDate(guide.meta.date)
  const updatedDate = formatDisplayDate(guide.meta.lastModified)
  const showUpdatedDate = Boolean(updatedDate && updatedDate !== publishedDate)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.meta.title,
    description: guide.meta.description,
    image: guide.meta.image ? `https://sauna.guide${guide.meta.image}` : undefined,
    datePublished: guide.meta.date,
    dateModified: guide.meta.lastModified || guide.meta.date,
    author: getGuideAuthorSchema(guide.meta.author),
    publisher: {
      '@type': 'Organization',
      name: 'Sauna Guide',
      logo: { '@type': 'ImageObject', url: 'https://sauna.guide/images/logo.svg' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://sauna.guide/guides/${slug}`,
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sauna.guide' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://sauna.guide/guides' },
      { '@type': 'ListItem', position: 3, name: guide.meta.title, item: `https://sauna.guide/guides/${slug}` },
    ],
  }

  // Custom components for MDX
  const components = {
    h1: (props: ComponentPropsWithoutRef<'h1'>) => <h2 {...props} />,
    QuizCTA,
  }

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navigation />

      <article className="max-w-3xl mx-auto px-6 py-32 grow">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link href="/guides" className="text-sauna-slate hover:text-sauna-oak transition-colors">
            ← All Guides
          </Link>
        </nav>
        <header className="mb-10 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-sauna-walnut font-medium mb-4 uppercase tracking-wider">
                <span>{publishedDate || guide.meta.date}</span>
                {showUpdatedDate && (
                  <>
                    <span>•</span>
                    <span>Updated {updatedDate}</span>
                  </>
                )}
                <span>•</span>
                <span>{authorName}</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-sauna-ink mb-6 leading-tight">
                {guide.meta.title}
            </h1>
            <p className="text-xl text-sauna-slate leading-relaxed">
                {guide.meta.description}
            </p>
        </header>

        {guide.meta.image && (
          <div className="mb-12 -mx-6 md:mx-0 md:rounded-2xl overflow-hidden">
            <Image
              src={guide.meta.image}
              alt={guide.meta.title}
              width={1200}
              height={675}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        )}

        <div className="prose prose-lg prose-stone mx-auto
                        prose-headings:font-display prose-headings:font-medium prose-headings:text-sauna-ink
                        prose-p:text-sauna-slate prose-p:leading-relaxed
                        prose-a:text-sauna-walnut prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-sauna-bark
                        prose-strong:text-sauna-dark
                        prose-li:text-sauna-slate
                        prose-table:w-full prose-table:border-collapse
                        prose-th:bg-sauna-linen prose-th:text-sauna-ink prose-th:font-medium prose-th:text-left prose-th:p-3 prose-th:border prose-th:border-sauna-ash
                        prose-td:p-3 prose-td:border prose-td:border-sauna-ash prose-td:text-sauna-slate">
           <MDXRemote
             source={guide.content}
             components={components}
             options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
           />
        </div>

        <div className="mt-16 pt-10 border-t border-sauna-ash/50 text-center">
             <h3 className="font-display text-2xl font-medium text-sauna-ink mb-3">
                Thinking about a home sauna?
            </h3>
            <p className="text-sauna-slate mb-6">
                Get our free 3-part guide. Real costs, real reviews, zero sales bias.
            </p>
            <NewsletterSignup variant="buying-guide" source="guide-article" />
        </div>
      </article>

      <Footer />
    </div>
  )
}
