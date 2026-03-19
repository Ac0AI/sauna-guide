import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllManufacturers, getManufacturerBySlug } from '@/lib/manufacturers'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const manufacturers = getAllManufacturers()
  return manufacturers.map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const manufacturer = getManufacturerBySlug(slug)

  if (!manufacturer) {
    return { title: 'Brand Not Found' }
  }

  return {
    title: `${manufacturer.name} Saunas`,
    description: `${manufacturer.unique_angle} Learn about ${manufacturer.name} saunas from ${manufacturer.country}.`,
    alternates: {
      canonical: `https://sauna.guide/sauna-brands/${slug}`,
    },
    openGraph: {
      title: `${manufacturer.name} Saunas | Sauna Guide`,
      description: `${manufacturer.unique_angle} Learn about ${manufacturer.name} saunas from ${manufacturer.country}.`,
      url: `https://sauna.guide/sauna-brands/${slug}`,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${manufacturer.name} Saunas | Sauna Guide`,
      description: `${manufacturer.unique_angle} Learn about ${manufacturer.name} saunas from ${manufacturer.country}.`,
      images: ['/og-image.jpg'],
    },
  }
}

const typeLabels: Record<string, string> = {
  'traditional': 'Traditional Finnish Saunas',
  'infrared': 'Infrared Saunas',
  'barrel': 'Barrel Saunas',
  'barrel-cabin': 'Barrel & Cabin Saunas',
  'outdoor': 'Outdoor Saunas',
  'luxury': 'Luxury Saunas',
  'red-light': 'Red Light / Near-Infrared',
  'portable': 'Portable Saunas',
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase())
}

function getSourceLabel(url: string, label?: string) {
  if (label && label !== 'Official website') {
    return label
  }

  try {
    const parsed = new URL(url)
    const segments = parsed.pathname
      .split('/')
      .filter(Boolean)
      .filter((segment) => !/^[a-z]{2}(?:-[a-z]{2})?$/i.test(segment))

    if (segments.length === 0) {
      return 'Homepage'
    }

    const raw = segments[segments.length - 1]
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[-_]+/g, ' ')

    return titleCase(raw)
  } catch {
    return label || 'Source'
  }
}

function getSourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function getVerifiedDate(sources: Array<{ fetchedAt?: string }>) {
  const timestamps = sources
    .map((source) => (source.fetchedAt ? new Date(source.fetchedAt).getTime() : NaN))
    .filter((value) => !Number.isNaN(value))

  if (timestamps.length === 0) {
    return null
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(Math.max(...timestamps)))
}

function getSourcesSummary(
  sources: Array<{ url: string }>,
  website: string,
  verifiedDate: string | null
) {
  const officialHost = getSourceHost(website)
  const allOfficial = officialHost && sources.every((source) => getSourceHost(source.url) === officialHost)
  const label = allOfficial ? `Official sources (${sources.length})` : `Sources (${sources.length})`

  return verifiedDate ? `${label} · Verified ${verifiedDate}` : label
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params
  const manufacturer = getManufacturerBySlug(slug)

  if (!manufacturer) {
    notFound()
  }

  const sources = manufacturer.enrichment?.sources
    ? Array.from(
        new Map(
          manufacturer.enrichment.sources.map((source) => [source.url, source])
        ).values()
      )
    : []
  const verifiedDate = getVerifiedDate(sources)

  const brandJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: manufacturer.name,
    url: manufacturer.website,
    description: manufacturer.unique_angle,
    ...(manufacturer.country && {
      address: {
        '@type': 'PostalAddress',
        addressCountry: manufacturer.country,
      },
    }),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sauna.guide' },
      { '@type': 'ListItem', position: 2, name: 'Sauna Brands', item: 'https://sauna.guide/sauna-brands' },
      { '@type': 'ListItem', position: 3, name: manufacturer.name, item: `https://sauna.guide/sauna-brands/${slug}` },
    ],
  }

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 py-32 grow">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link href="/sauna-brands" className="text-sauna-slate hover:text-sauna-oak transition-colors">
            ← All Brands
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-sauna-linen rounded-full text-sm text-sauna-slate">
              {typeLabels[manufacturer.type] || manufacturer.type}
            </span>
            <span className="text-sauna-slate text-sm">
              {manufacturer.country}
              {manufacturer.founded && ` · Founded ${manufacturer.founded}`}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-medium text-sauna-ink mb-6">
            {manufacturer.name}
          </h1>

          <p className="text-xl text-sauna-slate leading-relaxed">
            {manufacturer.unique_angle}
          </p>
        </header>

        {/* Quick facts */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-5 bg-white rounded-xl border border-sauna-ash/30">
            <h3 className="text-sm font-medium text-sauna-slate mb-2">Headquarters</h3>
            <p className="text-lg text-sauna-ink">{manufacturer.country}</p>
          </div>
          <div className="p-5 bg-white rounded-xl border border-sauna-ash/30">
            <h3 className="text-sm font-medium text-sauna-slate mb-2">Market Focus</h3>
            <p className="text-lg text-sauna-ink capitalize">{manufacturer.market.replace(/-/g, ' ')}</p>
          </div>
          <div className="p-5 bg-white rounded-xl border border-sauna-ash/30">
            <h3 className="text-sm font-medium text-sauna-slate mb-2">Category</h3>
            <p className="text-lg text-sauna-ink">{typeLabels[manufacturer.type]}</p>
          </div>
        </div>

        {/* Products */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-medium text-sauna-ink mb-6">
            What They Make
          </h2>
          <div className="flex flex-wrap gap-3">
            {manufacturer.products.map((product) => (
              <span
                key={product}
                className="px-4 py-2 bg-sauna-linen rounded-lg text-sauna-ink capitalize"
              >
                {product.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </section>

        {/* Why consider */}
        <section className="mb-12 p-8 bg-sauna-linen rounded-2xl">
          <h2 className="font-display text-2xl font-medium text-sauna-ink mb-4">
            Why Consider {manufacturer.name}?
          </h2>
          <p className="text-sauna-slate mb-6">{manufacturer.notes}</p>

          {manufacturer.content_opportunities && manufacturer.content_opportunities.length > 0 && (
            <>
              <h3 className="font-medium text-sauna-ink mb-3">Known For:</h3>
              <ul className="space-y-2">
                {manufacturer.content_opportunities.map((opp, i) => (
                  <li key={i} className="flex items-start gap-3 text-sauna-slate">
                    <span className="text-sauna-oak mt-1">•</span>
                    {opp}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* Strengths & Weaknesses */}
        {(manufacturer.strengths?.length || manufacturer.weaknesses?.length) ? (
            <section className="mb-12 grid md:grid-cols-2 gap-6">
                {manufacturer.strengths && manufacturer.strengths.length > 0 && (
                    <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                        <h3 className="font-medium text-emerald-900 mb-3">Strengths</h3>
                        <ul className="space-y-2">
                            {manufacturer.strengths.map((s, i) => (
                                <li key={i} className="text-emerald-800 text-sm flex items-start gap-2">
                                    <span className="mt-0.5">+</span>{s}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {manufacturer.weaknesses && manufacturer.weaknesses.length > 0 && (
                    <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
                        <h3 className="font-medium text-amber-900 mb-3">Watch Out For</h3>
                        <ul className="space-y-2">
                            {manufacturer.weaknesses.map((w, i) => (
                                <li key={i} className="text-amber-800 text-sm flex items-start gap-2">
                                    <span className="mt-0.5">-</span>{w}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
        ) : null}

        {/* Buyer Verdict */}
        {manufacturer.buyerVerdict && (
            <section className="mb-12 p-6 bg-white rounded-xl border-2 border-sauna-oak/30">
                <h2 className="font-display text-xl font-medium text-sauna-ink mb-3">Our Verdict</h2>
                <p className="text-sauna-slate leading-relaxed">{manufacturer.buyerVerdict}</p>
                {manufacturer.priceTier && (
                    <p className="mt-3 text-sm text-sauna-slate">
                        Price tier: <span className="font-medium text-sauna-ink capitalize">{manufacturer.priceTier}</span>
                    </p>
                )}
                {manufacturer.bestFor && (
                    <p className="text-sm text-sauna-slate">
                        Best for: <span className="font-medium text-sauna-ink">{manufacturer.bestFor}</span>
                    </p>
                )}
            </section>
        )}

        {/* Key Models */}
        {manufacturer.keyModels && manufacturer.keyModels.length > 0 && (
            <section className="mb-12">
                <h2 className="font-display text-2xl font-medium text-sauna-ink mb-4">Key Models</h2>
                <div className="flex flex-wrap gap-3">
                    {manufacturer.keyModels.map((model, i) => (
                        <span key={i} className="px-4 py-2 bg-sauna-linen rounded-lg text-sauna-ink text-sm border border-sauna-ash/30">
                            {model}
                        </span>
                    ))}
                </div>
            </section>
        )}

        {/* Public company info */}
        {manufacturer.public && manufacturer.stock && (
          <section className="mb-12 p-6 bg-white rounded-xl border border-sauna-ash/30">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-medium text-sauna-ink">Publicly Traded</h3>
            </div>
            <p className="text-sauna-slate">
              {manufacturer.name} is publicly traded as <strong>{manufacturer.stock}</strong>.
              This means financial transparency and regular market updates.
            </p>
          </section>
        )}

        {/* Sources */}
        {sources.length > 0 && (
            <section className="mb-12 border-t border-sauna-ash/20 pt-5">
                <details className="group rounded-2xl border border-sauna-ash/30 bg-sauna-linen/30 px-4 py-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-sauna-slate marker:hidden">
                        <span>{getSourcesSummary(sources, manufacturer.website, verifiedDate)}</span>
                        <span className="text-sauna-stone transition-transform group-open:rotate-180">⌄</span>
                    </summary>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {sources.map((source) => (
                            <a
                                key={source.url}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-sauna-ash/40 bg-white px-3 py-1.5 text-xs font-medium text-sauna-slate transition-colors hover:border-sauna-oak/40 hover:text-sauna-ink"
                                title={source.url}
                            >
                                <span>{getSourceLabel(source.url, source.label)}</span>
                                <span className="text-sauna-stone/70">·</span>
                                <span className="text-sauna-stone">{getSourceHost(source.url)}</span>
                            </a>
                        ))}
                    </div>
                </details>
            </section>
        )}

        {/* External links */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-medium text-sauna-ink mb-6">
            Learn More
          </h2>
          <div className="flex flex-wrap gap-4">
            <a
              href={manufacturer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sauna-ink text-sauna-paper rounded-xl font-medium hover:bg-sauna-charcoal transition-colors"
            >
              Visit {manufacturer.name} →
            </a>
            {manufacturer.social?.instagram && (
              <a
                href={`https://instagram.com/${manufacturer.social.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-sauna-ash rounded-xl font-medium text-sauna-ink hover:border-sauna-oak transition-colors"
              >
                Instagram {manufacturer.social.instagram}
              </a>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="p-8 bg-linear-to-br from-sauna-charcoal to-sauna-ink rounded-2xl text-sauna-paper">
          <h3 className="font-display text-2xl font-medium mb-4">
            Get the unbiased buying guide
          </h3>
          <p className="text-sauna-paper/70 mb-6 max-w-lg">
            Three short emails. Real costs, honest product picks, and the mistakes we see people make. Independent and free.
          </p>
          <NewsletterSignup variant="buying-guide" source="brand-page" className="max-w-md" />
        </section>
      </main>

      <Footer />
    </div>
  )
}
