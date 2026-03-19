import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
    title: `${manufacturer.name} Saunas - Honest Review & Buyer's Guide`,
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

const priceTierDisplay: Record<string, { label: string; dots: number }> = {
  'budget': { label: 'Budget-Friendly', dots: 1 },
  'mid-range': { label: 'Mid-Range', dots: 2 },
  'premium': { label: 'Premium', dots: 3 },
  'luxury': { label: 'Luxury', dots: 4 },
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

function PriceDots({ tier }: { tier: string }) {
  const info = priceTierDisplay[tier]
  if (!info) return null
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i <= info.dots ? 'bg-sauna-oak' : 'bg-sauna-ash'
          }`}
        />
      ))}
      <span className="ml-1.5 text-sm text-sauna-slate">{info.label}</span>
    </div>
  )
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

  const hasComparison = (manufacturer.strengths?.length || 0) > 0 || (manufacturer.weaknesses?.length || 0) > 0

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-sauna-charcoal overflow-hidden">
        {/* Subtle grain overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')] opacity-50" />

        <div className="max-w-5xl mx-auto px-6 pt-28 pb-16 md:pt-36 md:pb-20 relative">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link href="/sauna-brands" className="text-sauna-sand/60 hover:text-sauna-sand transition-colors text-sm tracking-wide uppercase">
              ← All Brands
            </Link>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-5">
                <span className="px-3 py-1 bg-sauna-oak/20 rounded-full text-xs font-medium text-sauna-sand tracking-wide uppercase">
                  {typeLabels[manufacturer.type] || manufacturer.type}
                </span>
                {manufacturer.founded && (
                  <span className="text-sauna-fog/60 text-sm">
                    Est. {manufacturer.founded}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-5 mb-6">
                {manufacturer.logo && (
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl p-2.5 flex items-center justify-center shrink-0">
                    <Image
                      src={manufacturer.logo}
                      alt={`${manufacturer.name} logo`}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <h1 className="font-display text-4xl md:text-6xl font-medium text-sauna-paper tracking-tight">
                  {manufacturer.name}
                </h1>
              </div>

              <p className="text-lg md:text-xl text-sauna-fog leading-relaxed max-w-2xl">
                {manufacturer.unique_angle}
              </p>
            </div>

            {/* Quick stats - desktop only */}
            <div className="hidden md:flex flex-col gap-3 text-right shrink-0">
              <div className="text-sauna-fog/50 text-xs tracking-wide uppercase">Headquarters</div>
              <div className="text-sauna-paper text-lg">{manufacturer.country}</div>
              {manufacturer.priceTier && (
                <>
                  <div className="text-sauna-fog/50 text-xs tracking-wide uppercase mt-2">Price Range</div>
                  <PriceDots tier={manufacturer.priceTier} />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16 grow w-full">

        {/* Mobile quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-12 md:hidden">
          <div className="text-center p-4 bg-sauna-linen rounded-xl">
            <div className="text-xs text-sauna-slate mb-1 tracking-wide uppercase">HQ</div>
            <div className="text-sm font-medium text-sauna-ink">{manufacturer.country}</div>
          </div>
          <div className="text-center p-4 bg-sauna-linen rounded-xl">
            <div className="text-xs text-sauna-slate mb-1 tracking-wide uppercase">Market</div>
            <div className="text-sm font-medium text-sauna-ink capitalize">{manufacturer.market.replace(/-/g, ' ')}</div>
          </div>
          <div className="text-center p-4 bg-sauna-linen rounded-xl">
            <div className="text-xs text-sauna-slate mb-1 tracking-wide uppercase">Price</div>
            <div className="text-sm font-medium text-sauna-ink capitalize">{manufacturer.priceTier || '-'}</div>
          </div>
        </div>

        {/* What They Make - horizontal scroll on mobile */}
        <section className="mb-14">
          <h2 className="text-xs tracking-widest uppercase text-sauna-stone mb-4 font-medium">
            Product Range
          </h2>
          <div className="flex flex-wrap gap-2">
            {manufacturer.products.map((product) => (
              <span
                key={product}
                className="px-4 py-2.5 bg-white border border-sauna-ash/40 rounded-lg text-sm text-sauna-ink capitalize font-medium"
              >
                {product.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </section>

        {/* Buyer Verdict - the hero card */}
        {manufacturer.buyerVerdict && (
          <section className="mb-14">
            <div className="relative p-8 md:p-10 bg-sauna-linen rounded-2xl border border-sauna-ash/30 overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-sauna-oak" />
              <h2 className="font-display text-2xl md:text-3xl font-medium text-sauna-ink mb-4">
                Our Verdict
              </h2>
              <p className="text-sauna-slate leading-relaxed text-base md:text-lg mb-6">
                {manufacturer.buyerVerdict}
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {manufacturer.priceTier && (
                  <div>
                    <span className="text-xs tracking-wide uppercase text-sauna-stone block mb-1">Price Tier</span>
                    <PriceDots tier={manufacturer.priceTier} />
                  </div>
                )}
                {manufacturer.bestFor && (
                  <div className="max-w-md">
                    <span className="text-xs tracking-wide uppercase text-sauna-stone block mb-1">Best For</span>
                    <span className="text-sm text-sauna-ink">{manufacturer.bestFor}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Strengths & Weaknesses - redesigned comparison */}
        {hasComparison && (
          <section className="mb-14">
            <h2 className="text-xs tracking-widest uppercase text-sauna-stone mb-6 font-medium">
              Strengths & Considerations
            </h2>
            <div className="grid md:grid-cols-2 gap-0 md:gap-0 rounded-2xl overflow-hidden border border-sauna-ash/30">
              {/* Strengths */}
              {manufacturer.strengths && manufacturer.strengths.length > 0 && (
                <div className="bg-white p-6 md:p-8 md:border-r border-b md:border-b-0 border-sauna-ash/30">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-sauna-ink text-lg">Strengths</h3>
                  </div>
                  <ul className="space-y-3">
                    {manufacturer.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-sauna-slate leading-relaxed">
                        <span className="text-emerald-500 mt-1 shrink-0 font-bold">+</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Watch Out For */}
              {manufacturer.weaknesses && manufacturer.weaknesses.length > 0 && (
                <div className="bg-white p-6 md:p-8">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-sauna-ink text-lg">Watch Out For</h3>
                  </div>
                  <ul className="space-y-3">
                    {manufacturer.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-sauna-slate leading-relaxed">
                        <span className="text-amber-500 mt-1 shrink-0 font-bold">&minus;</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Why Consider - editorial section */}
        <section className="mb-14">
          <h2 className="font-display text-2xl md:text-3xl font-medium text-sauna-ink mb-5">
            Why Consider {manufacturer.name}?
          </h2>
          <p className="text-sauna-slate leading-relaxed text-base md:text-lg mb-8 max-w-3xl">
            {manufacturer.notes}
          </p>

          {manufacturer.content_opportunities && manufacturer.content_opportunities.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {manufacturer.content_opportunities.map((opp, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-sauna-ash/20">
                  <span className="w-6 h-6 rounded-full bg-sauna-oak/10 text-sauna-oak flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-sauna-slate leading-relaxed">{opp}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Key Models */}
        {manufacturer.keyModels && manufacturer.keyModels.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xs tracking-widest uppercase text-sauna-stone mb-4 font-medium">
              Key Models
            </h2>
            <div className="space-y-0 rounded-2xl overflow-hidden border border-sauna-ash/30">
              {manufacturer.keyModels.map((model, i) => {
                const [name, ...descParts] = model.split(' — ')
                const desc = descParts.join(' — ')
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-4 p-4 md:p-5 bg-white ${
                      i < manufacturer.keyModels!.length - 1 ? 'border-b border-sauna-ash/20' : ''
                    }`}
                  >
                    <span className="text-sauna-oak font-display text-lg font-medium shrink-0 w-8 text-center">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="font-medium text-sauna-ink text-sm md:text-base">
                        {name}
                      </span>
                      {desc && (
                        <p className="text-sm text-sauna-slate mt-0.5 leading-relaxed">{desc}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Support & Warranty */}
        {manufacturer.supportWarranty && (
          <section className="mb-14">
            <h2 className="text-xs tracking-widest uppercase text-sauna-stone mb-4 font-medium">
              Support & Warranty
            </h2>
            <div className="p-6 bg-white rounded-2xl border border-sauna-ash/30">
              <p className="text-sm text-sauna-slate leading-relaxed">{manufacturer.supportWarranty}</p>
            </div>
          </section>
        )}

        {/* Public company info */}
        {manufacturer.public && manufacturer.stock && (
          <section className="mb-14">
            <div className="flex items-center gap-4 p-5 bg-white rounded-xl border border-sauna-ash/30">
              <div className="w-10 h-10 rounded-full bg-sauna-linen flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-sauna-oak" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sauna-ink text-sm">Publicly Traded</p>
                <p className="text-sauna-slate text-sm">
                  Listed as <strong>{manufacturer.stock}</strong> - financial transparency and regular market updates.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <section className="mb-14">
            <details className="group rounded-2xl border border-sauna-ash/30 bg-white overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-sm font-medium text-sauna-slate marker:hidden hover:bg-sauna-linen/50 transition-colors">
                <span>{getSourcesSummary(sources, manufacturer.website, verifiedDate)}</span>
                <svg className="w-4 h-4 text-sauna-stone transition-transform group-open:rotate-180 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 pt-2 flex flex-wrap gap-2 border-t border-sauna-ash/20">
                {sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-sauna-ash/40 bg-sauna-linen/30 px-3 py-1.5 text-xs font-medium text-sauna-slate transition-colors hover:border-sauna-oak/40 hover:text-sauna-ink"
                    title={source.url}
                  >
                    <span>{getSourceLabel(source.url, source.label)}</span>
                    <span className="text-sauna-stone/50">·</span>
                    <span className="text-sauna-stone">{getSourceHost(source.url)}</span>
                  </a>
                ))}
              </div>
            </details>
          </section>
        )}

        {/* CTA section */}
        <div className="flex flex-col md:flex-row gap-6 mb-14">
          {/* External links */}
          <div className="flex-1">
            <h2 className="text-xs tracking-widest uppercase text-sauna-stone mb-4 font-medium">
              Learn More
            </h2>
            <div className="flex flex-wrap gap-3">
              <a
                href={manufacturer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-sauna-charcoal text-sauna-paper rounded-xl font-medium text-sm hover:bg-sauna-ink transition-colors"
              >
                Visit {manufacturer.name}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
              {manufacturer.social?.instagram && (
                <a
                  href={`https://instagram.com/${manufacturer.social.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-sauna-ash rounded-xl font-medium text-sm text-sauna-ink hover:border-sauna-oak/50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  {manufacturer.social.instagram}
                </a>
              )}
              {manufacturer.social?.linkedin && (
                <a
                  href={`https://linkedin.com/company/${manufacturer.social.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-sauna-ash rounded-xl font-medium text-sm text-sauna-ink hover:border-sauna-oak/50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Newsletter CTA */}
        <section className="relative p-8 md:p-12 bg-sauna-charcoal rounded-2xl text-sauna-paper overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')] opacity-40" />
          <div className="relative">
            <h3 className="font-display text-2xl md:text-3xl font-medium mb-3">
              Get the unbiased buying guide
            </h3>
            <p className="text-sauna-fog mb-8 max-w-lg">
              Three short emails. Real costs, honest product picks, and the mistakes we see people make. Independent and free.
            </p>
            <NewsletterSignup variant="buying-guide" source="brand-page" className="max-w-md" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
