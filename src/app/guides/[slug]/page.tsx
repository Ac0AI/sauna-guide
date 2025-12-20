import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getGuideBySlug, getAllGuides } from '@/lib/guides'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'

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
    title: `${guide.meta.title} | Sauna Guide`,
    description: guide.meta.description,
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = await getGuideBySlug(slug)

  if (!guide) return notFound()

  // Custom components for MDX
  const components = {
    // You can add custom components here (e.g. Callout, Image, etc)
  }

  return (
    <article className="min-h-screen bg-sauna-paper pb-20">
       {/* Navigation */}
       <nav className="bg-sauna-paper border-b border-sauna-ash/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-sauna-bark flex items-center justify-center">
              <svg className="w-4 h-4 text-sauna-sand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <span className="font-display text-lg font-medium text-sauna-ink">Sauna Guide</span>
          </Link>
          <Link href="/guides" className="text-sm font-medium text-sauna-walnut hover:text-sauna-ink">
            ← Back to Guides
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
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
      </main>
    </article>
  )
}