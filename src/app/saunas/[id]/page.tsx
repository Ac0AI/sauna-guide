import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import saunasData from '@/data/saunas.json'
import { Sauna } from '@/lib/types'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'

export async function generateStaticParams() {
  const saunas = saunasData.saunas as Sauna[]
  return saunas.map((sauna) => ({ id: sauna.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const saunas = saunasData.saunas as Sauna[]
  const sauna = saunas.find((s) => s.id === id)

  if (!sauna) return { title: 'Sauna Not Found' }

  const pageUrl = `https://sauna.guide/saunas/${id}`
  const shortFeatures = sauna.features.slice(0, 3).join(', ')
  const ogImage = sauna.images?.[0]
    ? (sauna.images[0].startsWith('/') ? sauna.images[0] : `/images/saunas-photos/${sauna.images[0]}`)
    : '/og-image.jpg'

  return {
    title: `${sauna.name} Review - Best Saunas in ${sauna.location.city}`,
    description: `${sauna.name} in ${sauna.location.city}, ${sauna.location.country}: ${sauna.description} Highlights: ${shortFeatures}.`,
    keywords: ['sauna', sauna.name, sauna.location.city, sauna.location.country, sauna.type, ...sauna.features],
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${sauna.name} - ${sauna.location.city}, ${sauna.location.country}`,
      description: `Complete guide to ${sauna.name}. ${sauna.type} sauna in ${sauna.location.city}.`,
      url: pageUrl,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${sauna.name} - ${sauna.location.city}, ${sauna.location.country}`,
      description: `Complete guide to ${sauna.name}. ${sauna.type} sauna in ${sauna.location.city}.`,
      images: [ogImage],
    },
  }
}

function getSourceHost(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' }
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.3
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-4 h-4 ${i <= full ? 'text-amber-400' : i === full + 1 && half ? 'text-amber-400' : 'text-sauna-ash'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm font-medium text-sauna-ink ml-1">{rating}</span>
    </div>
  )
}

export default async function SaunaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const saunas = saunasData.saunas as Sauna[]
  const sauna = saunas.find((s) => s.id === id)

  if (!sauna) return notFound()

  const saunaPageUrl = `https://sauna.guide/saunas/${id}`
  const primaryImage = sauna.images?.[0]
  const absoluteImage = primaryImage
    ? (primaryImage.startsWith('http') ? primaryImage : `https://sauna.guide${primaryImage.startsWith('/') ? primaryImage : `/images/saunas-photos/${primaryImage}`}`)
    : undefined

  const relatedSaunas = saunas
    .filter((c) => c.id !== sauna.id && (c.location.country === sauna.location.country || c.type === sauna.type))
    .slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: sauna.name,
    description: sauna.description,
    image: absoluteImage,
    address: {
      '@type': 'PostalAddress',
      addressLocality: sauna.location.city,
      addressCountry: sauna.location.country,
    },
    url: saunaPageUrl,
    mainEntityOfPage: saunaPageUrl,
    sameAs: sauna.website ? [sauna.website] : undefined,
    aggregateRating: sauna.rating ? {
      '@type': 'AggregateRating',
      ratingValue: sauna.rating,
      reviewCount: sauna.reviewCount || 1,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    amenityFeature: sauna.features.map((feature) => ({
      '@type': 'LocationFeatureSpecification',
      name: feature,
      value: true,
    })),
    ...(sauna.location.coordinates && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: sauna.location.coordinates.lat,
        longitude: sauna.location.coordinates.lng,
      },
    }),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sauna.guide' },
      { '@type': 'ListItem', position: 2, name: 'Sauna Directory', item: 'https://sauna.guide/saunas' },
      { '@type': 'ListItem', position: 3, name: sauna.name, item: saunaPageUrl },
    ],
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Where is ${sauna.name} located?`,
        acceptedAnswer: { '@type': 'Answer', text: `${sauna.name} is located in ${sauna.location.city}, ${sauna.location.country}.` },
      },
      {
        '@type': 'Question',
        name: `What type of sauna experience is ${sauna.name}?`,
        acceptedAnswer: { '@type': 'Answer', text: `${sauna.name} is categorized as a ${sauna.type} sauna and highlights ${sauna.features.slice(0, 3).join(', ')}.` },
      },
      {
        '@type': 'Question',
        name: `Is ${sauna.name} worth visiting?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: sauna.rating
            ? `${sauna.name} currently carries a ${sauna.rating}/5 rating in our directory and is known for ${sauna.features.slice(0, 2).join(' and ')}.`
            : `${sauna.name} is known for ${sauna.features.slice(0, 2).join(' and ')} and stands out in ${sauna.location.city}.`,
        },
      },
    ],
  }

  const mapsSearchUrl = sauna.location.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${sauna.location.coordinates.lat},${sauna.location.coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sauna.name + ' ' + sauna.location.city)}`

  const hasHighlights = (sauna.editorial?.highlights?.length || 0) > 0
  const hasDrawbacks = (sauna.editorial?.drawbacks?.length || 0) > 0

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navigation />

      {/* Hero */}
      <div className="relative h-[55vh] min-h-[420px] md:min-h-[500px] w-full bg-sauna-charcoal mt-20">
        {sauna.images[0] ? (
          <Image
            src={sauna.images[0].startsWith('http') || sauna.images[0].startsWith('/') ? sauna.images[0] : `/images/saunas-photos/${sauna.images[0]}`}
            alt={sauna.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-sauna-fog/20 text-8xl font-display">{sauna.name.charAt(0)}</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-sauna-charcoal via-sauna-charcoal/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <Link href="/saunas" className="text-sauna-sand/50 hover:text-sauna-sand transition-colors text-sm tracking-wide uppercase">
                ← All Saunas
              </Link>
            </nav>

            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-sauna-oak/25 rounded-full text-xs font-medium text-sauna-sand tracking-wide uppercase">
                {sauna.type}
              </span>
              <span className="text-sauna-fog/60 text-sm">
                {sauna.location.city}, {sauna.location.country}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-medium text-sauna-paper tracking-tight mb-4">
              {sauna.name}
            </h1>

            {sauna.rating && (
              <div className="flex items-center gap-3">
                <StarRating rating={sauna.rating} />
                {sauna.reviewCount && (
                  <span className="text-sauna-fog/60 text-sm">({sauna.reviewCount.toLocaleString()} reviews)</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 grow w-full">

        {/* Main column */}
        <div className="space-y-12 min-w-0">

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {sauna.features.map(f => (
              <span key={f} className="px-3.5 py-1.5 bg-white border border-sauna-ash/30 rounded-lg text-sm text-sauna-ink font-medium">
                {f}
              </span>
            ))}
          </div>

          {/* About / Why Special */}
          <section>
            <h2 className="font-display text-2xl md:text-3xl font-medium text-sauna-ink mb-5">
              {sauna.editorial?.whySpecial ? 'What Makes It Special' : 'About'}
            </h2>
            <div className="space-y-4 text-sauna-slate leading-relaxed text-base md:text-lg">
              {sauna.editorial?.whySpecial && <p>{sauna.editorial.whySpecial}</p>}
              <p>{sauna.description}</p>
            </div>
          </section>

          {/* What to Expect */}
          {sauna.editorial?.whatToExpect && (
            <section>
              <h2 className="font-display text-xl md:text-2xl font-medium text-sauna-ink mb-4">
                What to Expect
              </h2>
              <p className="text-sauna-slate leading-relaxed text-base md:text-lg">
                {sauna.editorial.whatToExpect}
              </p>
            </section>
          )}

          {/* Highlights & Drawbacks */}
          {(hasHighlights || hasDrawbacks) && (
            <section>
              <h2 className="text-xs tracking-widest uppercase text-sauna-stone mb-6 font-medium">
                At a Glance
              </h2>
              <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-sauna-ash/30">
                {hasHighlights && (
                  <div className="bg-white p-6 md:p-8 md:border-r border-b md:border-b-0 border-sauna-ash/30">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-sauna-ink">Highlights</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {sauna.editorial!.highlights!.map((h, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-sauna-slate leading-relaxed">
                          <span className="text-emerald-500 mt-0.5 shrink-0 font-bold">+</span>{h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {hasDrawbacks && (
                  <div className="bg-white p-6 md:p-8">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-sauna-ink">Good to Know</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {sauna.editorial!.drawbacks!.map((d, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-sauna-slate leading-relaxed">
                          <span className="text-amber-500 mt-0.5 shrink-0 font-bold">&minus;</span>{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Practical Information */}
          <section>
            <h2 className="text-xs tracking-widest uppercase text-sauna-stone mb-4 font-medium">
              Practical Information
            </h2>
            <div className="rounded-2xl border border-sauna-ash/30 overflow-hidden">
              <dl className="divide-y divide-sauna-ash/20">
                {sauna.admission && (
                  <div className="flex justify-between items-start p-4 bg-white">
                    <dt className="text-sm text-sauna-slate">Admission</dt>
                    <dd className="text-sm font-medium text-sauna-ink text-right max-w-[60%]">{sauna.admission}</dd>
                  </div>
                )}
                {sauna.openingHours && (
                  <div className="flex justify-between items-start p-4 bg-white">
                    <dt className="text-sm text-sauna-slate">Hours</dt>
                    <dd className="text-sm text-sauna-ink text-right max-w-[65%] leading-relaxed">{sauna.openingHours}</dd>
                  </div>
                )}
                {sauna.etiquette?.dresscode && (
                  <div className="flex justify-between items-start p-4 bg-white">
                    <dt className="text-sm text-sauna-slate">Dress Code</dt>
                    <dd className="text-sm font-medium text-sauna-ink capitalize">{sauna.etiquette.dresscode}</dd>
                  </div>
                )}
                {sauna.etiquette?.towelPolicy && (
                  <div className="flex justify-between items-start p-4 bg-white">
                    <dt className="text-sm text-sauna-slate">Towel Policy</dt>
                    <dd className="text-sm text-sauna-ink text-right max-w-[60%]">{sauna.etiquette.towelPolicy}</dd>
                  </div>
                )}
                {sauna.phone && (
                  <div className="flex justify-between items-start p-4 bg-white">
                    <dt className="text-sm text-sauna-slate">Phone</dt>
                    <dd className="text-sm font-medium text-sauna-ink">{sauna.phone}</dd>
                  </div>
                )}
              </dl>
            </div>
          </section>

          {/* Who It's For */}
          {(sauna.editorial?.whoItsFor || sauna.editorial?.whoShouldSkip) && (
            <section className="grid md:grid-cols-2 gap-4">
              {sauna.editorial?.whoItsFor && (
                <div className="p-6 bg-white rounded-2xl border border-sauna-ash/30">
                  <h3 className="text-xs tracking-widest uppercase text-sauna-stone mb-3 font-medium">Best For</h3>
                  <p className="text-sm text-sauna-slate leading-relaxed">{sauna.editorial.whoItsFor}</p>
                </div>
              )}
              {sauna.editorial?.whoShouldSkip && (
                <div className="p-6 bg-white rounded-2xl border border-sauna-ash/30">
                  <h3 className="text-xs tracking-widest uppercase text-sauna-stone mb-3 font-medium">Maybe Skip If</h3>
                  <p className="text-sm text-sauna-slate leading-relaxed">{sauna.editorial.whoShouldSkip}</p>
                </div>
              )}
            </section>
          )}

          {/* Insider Tips */}
          {sauna.editorial?.tips && sauna.editorial.tips.length > 0 && (
            <section>
              <h2 className="text-xs tracking-widest uppercase text-sauna-stone mb-4 font-medium">
                Insider Tips
              </h2>
              <div className="space-y-3">
                {sauna.editorial.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-sauna-ash/20">
                    <span className="w-6 h-6 rounded-full bg-sauna-oak/10 text-sauna-oak flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-sauna-slate leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sources */}
          {sauna.enrichment?.sources && sauna.enrichment.sources.length > 0 && (
            <section>
              <details className="group rounded-2xl border border-sauna-ash/30 bg-white overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-3.5 text-sm font-medium text-sauna-slate marker:hidden hover:bg-sauna-linen/50 transition-colors">
                  <span>Sources ({sauna.enrichment.sources.length}){sauna.enrichment.lastVerified ? ` · Updated ${sauna.enrichment.lastVerified}` : ''}</span>
                  <svg className="w-4 h-4 text-sauna-stone transition-transform group-open:rotate-180 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 pt-1 flex flex-wrap gap-2 border-t border-sauna-ash/20">
                  {sauna.enrichment.sources.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-sauna-ash/40 bg-sauna-linen/30 px-3 py-1.5 text-xs font-medium text-sauna-slate transition-colors hover:border-sauna-oak/40 hover:text-sauna-ink"
                    >
                      <span>{s.label}</span>
                      <span className="text-sauna-stone/50">·</span>
                      <span className="text-sauna-stone">{getSourceHost(s.url)}</span>
                    </a>
                  ))}
                </div>
              </details>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Location card */}
          <div className="bg-white p-5 rounded-2xl border border-sauna-ash/30">
            <h3 className="text-xs tracking-widest uppercase text-sauna-stone mb-4 font-medium">Location</h3>

            <a
              href={mapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-[4/3] rounded-xl mb-4 overflow-hidden bg-sauna-linen relative group"
            >
              <div className="w-full h-full flex items-center justify-center bg-sauna-charcoal relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')] opacity-30" />
                <div className="text-center relative">
                  <svg className="w-8 h-8 text-sauna-oak mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                  </svg>
                  <span className="text-xs text-sauna-fog font-medium block">{sauna.location.city}</span>
                  <span className="text-[10px] text-sauna-fog/50 mt-0.5 block">View on Google Maps</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-center pb-3">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium bg-black/60 px-3 py-1 rounded-full">
                  Open in Maps
                </span>
              </div>
            </a>

            {sauna.location.address && (
              <p className="text-sm text-sauna-ink mb-1">{sauna.location.address}</p>
            )}
            <p className="text-sm font-medium text-sauna-ink">{sauna.location.city}, {sauna.location.country}</p>

            <div className="flex flex-col gap-2 mt-5">
              {sauna.website && (
                <a href={sauna.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-sauna-charcoal text-sauna-paper text-center rounded-xl text-sm font-medium hover:bg-sauna-ink transition-colors">
                  Visit Website
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
              {sauna.bookingUrl && (
                <a href={sauna.bookingUrl} target="_blank" rel="noopener noreferrer"
                  className="block w-full py-3 bg-sauna-oak text-sauna-paper text-center rounded-xl text-sm font-medium hover:bg-sauna-walnut transition-colors">
                  Book Now
                </a>
              )}
            </div>
          </div>

          {/* Quick facts */}
          {(sauna.admission || sauna.rating) && (
            <div className="bg-white p-5 rounded-2xl border border-sauna-ash/30">
              <h3 className="text-xs tracking-widest uppercase text-sauna-stone mb-4 font-medium">Quick Facts</h3>
              <dl className="space-y-3">
                {sauna.rating && (
                  <div>
                    <dt className="text-xs text-sauna-slate mb-1">Rating</dt>
                    <dd><StarRating rating={sauna.rating} /></dd>
                  </div>
                )}
                {sauna.admission && (
                  <div>
                    <dt className="text-xs text-sauna-slate mb-1">Admission</dt>
                    <dd className="text-sm font-medium text-sauna-ink">{sauna.admission}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-sauna-slate mb-1">Type</dt>
                  <dd className="text-sm font-medium text-sauna-ink capitalize">{sauna.type}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Newsletter CTA */}
          <div className="relative p-6 bg-sauna-charcoal rounded-2xl text-sauna-paper overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')] opacity-40" />
            <div className="relative">
              <h3 className="font-display text-lg font-medium mb-2">Planning a home sauna?</h3>
              <p className="text-sauna-fog text-sm mb-4">
                Free 3-part guide: costs, types, and what everyone gets wrong.
              </p>
              <NewsletterSignup variant="buying-guide" source="sauna-listing" />
            </div>
          </div>
        </aside>
      </main>

      {/* Related saunas */}
      {relatedSaunas.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-16 w-full">
          <h2 className="text-xs tracking-widest uppercase text-sauna-stone mb-5 font-medium">Related Saunas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedSaunas.map((related) => (
              <Link
                key={related.id}
                href={`/saunas/${related.id}`}
                className="group p-4 bg-white rounded-xl border border-sauna-ash/30 hover:border-sauna-oak/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-sauna-oak font-medium uppercase tracking-wider">{related.type}</span>
                </div>
                <h3 className="font-medium text-sauna-ink text-sm group-hover:text-sauna-walnut transition-colors mb-1">
                  {related.name}
                </h3>
                <p className="text-xs text-sauna-slate">
                  {related.location.city}, {related.location.country}
                </p>
                {related.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-amber-400 text-xs">★</span>
                    <span className="text-xs font-medium text-sauna-ink">{related.rating}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
