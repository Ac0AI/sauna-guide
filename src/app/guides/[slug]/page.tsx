import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getGuideBySlug, getAllGuides } from '@/lib/guides'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

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

  return {
    title: guide.meta.title,
    description: guide.meta.description,
    alternates: {
      canonical: `https://sauna.guide/guides/${slug}`,
    },
    openGraph: {
      title: guide.meta.title,
      description: guide.meta.description,
      type: 'article',
      url: `https://sauna.guide/guides/${slug}`,
      images: guide.meta.image ? [{ url: guide.meta.image }] : [{ url: '/og-image.jpg', width: 1200, height: 630 }],
      publishedTime: guide.meta.date,
      authors: guide.meta.author ? [guide.meta.author] : undefined,
    },
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = await getGuideBySlug(slug)

  if (!guide) return notFound()

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.meta.title,
    description: guide.meta.description,
    image: guide.meta.image ? `https://sauna.guide${guide.meta.image}` : undefined,
    datePublished: guide.meta.date,
    author: {
      '@type': 'Person',
      name: guide.meta.author || 'Sauna Guide',
    },
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
    // You can add custom components here (e.g. Callout, Image, etc)
  }

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navigation />

      <article className="max-w-3xl mx-auto px-6 py-32 flex-grow">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link href="/guides" className="text-sauna-slate hover:text-sauna-oak transition-colors">
            ← All Guides
          </Link>
        </nav>
        <header className="mb-10 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-sauna-oak font-medium mb-4 uppercase tracking-wider">
                <span>{guide.meta.date}</span>
                <span>•</span>
                <span>{guide.meta.author}</span>
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
                        prose-a:text-sauna-heat prose-a:no-underline hover:prose-a:underline
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

        <div className="mt-16 pt-10 border-t border-sauna-ash/50">
             <h3 className="font-display text-2xl font-medium text-sauna-ink mb-6 text-center">
                Get the briefing
            </h3>
            <NewsletterSignup variant="inline" />
        </div>
      </article>

      <Footer />
    </div>
  )
}