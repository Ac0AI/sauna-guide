import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import saunasData from '@/data/saunas.json'
import { Sauna } from '@/lib/types'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'

// This is required for static site generation (SSG) of dynamic routes
export async function generateStaticParams() {
  const saunas = saunasData.saunas as Sauna[]
  return saunas.map((sauna) => ({
    id: sauna.id,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const saunas = saunasData.saunas as Sauna[]
  const sauna = saunas.find((s) => s.id === id)

  if (!sauna) {
    return {
      title: 'Sauna Not Found',
    }
  }

  const pageUrl = `https://sauna.guide/saunas/${id}`
  const shortFeatures = sauna.features.slice(0, 3).join(', ')
  const ogImage = sauna.images?.[0]
    ? (sauna.images[0].startsWith('/') ? sauna.images[0] : `/images/saunas-photos/${sauna.images[0]}`)
    : '/og-image.jpg'

  return {
    title: `${sauna.name} Review - Best Saunas in ${sauna.location.city}`,
    description: `${sauna.name} in ${sauna.location.city}, ${sauna.location.country}: ${sauna.description} Highlights: ${shortFeatures}.`,
    keywords: [
      'sauna',
      sauna.name,
      sauna.location.city,
      sauna.location.country,
      sauna.type,
      ...sauna.features,
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${sauna.name} - ${sauna.location.city}, ${sauna.location.country}`,
      description: `Complete guide to ${sauna.name}. ${sauna.type} sauna in ${sauna.location.city}.`,
      url: pageUrl,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${sauna.name} - ${sauna.location.city}, ${sauna.location.country}`,
      description: `Complete guide to ${sauna.name}. ${sauna.type} sauna in ${sauna.location.city}.`,
      images: [ogImage],
    },
  }
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
    .filter((candidate) => candidate.id !== sauna.id && (candidate.location.country === sauna.location.country || candidate.type === sauna.type))
    .slice(0, 3)

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
      reviewCount: 1,
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
      { '@type': 'ListItem', position: 3, name: sauna.name, item: `https://sauna.guide/saunas/${id}` },
    ],
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Where is ${sauna.name} located?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${sauna.name} is located in ${sauna.location.city}, ${sauna.location.country}.`,
        },
      },
      {
        '@type': 'Question',
        name: `What type of sauna experience is ${sauna.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${sauna.name} is categorized as a ${sauna.type} sauna and highlights ${sauna.features.slice(0, 3).join(', ')}.`,
        },
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

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navigation />

      {/* Hero Header */}
      <div className="relative h-[60vh] min-h-[500px] w-full bg-sauna-charcoal mt-20">
        {sauna.images[0] ? (
          <Image
            src={sauna.images[0].startsWith('http') || sauna.images[0].startsWith('/') ? sauna.images[0] : `/images/saunas-photos/${sauna.images[0]}`}
            alt={sauna.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sauna-ash/20">
            <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-sauna-charcoal via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-sauna-sand text-sm font-bold uppercase tracking-widest mb-3">
                            <span>{sauna.type}</span>
                            <span>•</span>
                            <span>{sauna.location.city}, {sauna.location.country}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-medium text-sauna-paper mb-4">
                            {sauna.name}
                        </h1>
                        <div className="flex flex-wrap gap-2">
                            {sauna.features.map(f => (
                                <span key={f} className="px-3 py-1 rounded-full bg-sauna-paper/10 backdrop-blur-md text-sauna-paper text-sm border border-sauna-paper/20">
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 grow">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
            {/* About / Why Special */}
            <section>
                <h2 className="text-2xl font-display text-sauna-ink mb-6">
                    {sauna.editorial?.whySpecial ? 'What Makes It Special' : 'About this Sauna'}
                </h2>
                <div className="prose prose-lg prose-stone text-sauna-slate leading-relaxed">
                    {sauna.editorial?.whySpecial && <p>{sauna.editorial.whySpecial}</p>}
                    <p>{sauna.description}</p>
                    {sauna.editorial?.whatToExpect && (
                        <>
                            <h3>What to Expect</h3>
                            <p>{sauna.editorial.whatToExpect}</p>
                        </>
                    )}
                </div>
            </section>

            {/* Highlights & Drawbacks */}
            {(sauna.editorial?.highlights?.length || sauna.editorial?.drawbacks?.length) ? (
                <section className="grid md:grid-cols-2 gap-6">
                    {sauna.editorial?.highlights && sauna.editorial.highlights.length > 0 && (
                        <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                            <h3 className="font-medium text-emerald-900 mb-3">Highlights</h3>
                            <ul className="space-y-2">
                                {sauna.editorial.highlights.map((h, i) => (
                                    <li key={i} className="flex items-start gap-2 text-emerald-800 text-sm">
                                        <span className="mt-0.5">+</span>{h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {sauna.editorial?.drawbacks && sauna.editorial.drawbacks.length > 0 && (
                        <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
                            <h3 className="font-medium text-amber-900 mb-3">Good to Know</h3>
                            <ul className="space-y-2">
                                {sauna.editorial.drawbacks.map((d, i) => (
                                    <li key={i} className="flex items-start gap-2 text-amber-800 text-sm">
                                        <span className="mt-0.5">-</span>{d}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            ) : null}

            {/* Practical Info */}
            <section className="p-6 bg-sauna-linen rounded-xl border border-sauna-ash/30">
                <h3 className="font-display text-xl font-medium text-sauna-ink mb-4">Practical Information</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div>
                        <dt className="font-medium text-sauna-slate">Type</dt>
                        <dd className="text-sauna-ink capitalize">{sauna.type}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-sauna-slate">Location</dt>
                        <dd className="text-sauna-ink">{sauna.location.city}, {sauna.location.country}</dd>
                    </div>
                    {sauna.admission && (
                        <div>
                            <dt className="font-medium text-sauna-slate">Admission</dt>
                            <dd className="text-sauna-ink">{sauna.admission}</dd>
                        </div>
                    )}
                    {sauna.openingHours && (
                        <div>
                            <dt className="font-medium text-sauna-slate">Opening Hours</dt>
                            <dd className="text-sauna-ink">{sauna.openingHours}</dd>
                        </div>
                    )}
                    {sauna.etiquette?.dresscode && (
                        <div>
                            <dt className="font-medium text-sauna-slate">Dress Code</dt>
                            <dd className="text-sauna-ink capitalize">{sauna.etiquette.dresscode}</dd>
                        </div>
                    )}
                    {sauna.etiquette?.towelPolicy && (
                        <div>
                            <dt className="font-medium text-sauna-slate">Towel Policy</dt>
                            <dd className="text-sauna-ink">{sauna.etiquette.towelPolicy}</dd>
                        </div>
                    )}
                    {sauna.rating && (
                        <div>
                            <dt className="font-medium text-sauna-slate">Rating</dt>
                            <dd className="text-sauna-ink">{sauna.rating}/5{sauna.reviewCount ? ` (${sauna.reviewCount} reviews)` : ''}</dd>
                        </div>
                    )}
                    {sauna.phone && (
                        <div>
                            <dt className="font-medium text-sauna-slate">Phone</dt>
                            <dd className="text-sauna-ink">{sauna.phone}</dd>
                        </div>
                    )}
                </dl>
                <div className="flex flex-wrap gap-2 mt-4">
                    {sauna.features.map(f => (
                        <span key={f} className="px-3 py-1 rounded-full bg-sauna-paper text-sauna-ink text-sm border border-sauna-ash/30">
                            {f}
                        </span>
                    ))}
                </div>
            </section>

            {/* Who It's For */}
            {(sauna.editorial?.whoItsFor || sauna.editorial?.whoShouldSkip) ? (
                <section className="grid md:grid-cols-2 gap-6">
                    {sauna.editorial?.whoItsFor && (
                        <div className="p-6 bg-white rounded-xl border border-sauna-ash/30">
                            <h3 className="font-medium text-sauna-ink mb-2">Best For</h3>
                            <p className="text-sauna-slate text-sm">{sauna.editorial.whoItsFor}</p>
                        </div>
                    )}
                    {sauna.editorial?.whoShouldSkip && (
                        <div className="p-6 bg-white rounded-xl border border-sauna-ash/30">
                            <h3 className="font-medium text-sauna-ink mb-2">Maybe Skip If</h3>
                            <p className="text-sauna-slate text-sm">{sauna.editorial.whoShouldSkip}</p>
                        </div>
                    )}
                </section>
            ) : null}

            {/* Tips */}
            {sauna.editorial?.tips && sauna.editorial.tips.length > 0 && (
                <section className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-3">Insider Tips</h3>
                    <ul className="space-y-2">
                        {sauna.editorial.tips.map((tip, i) => (
                            <li key={i} className="text-blue-800 text-sm">{tip}</li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Sources */}
            {sauna.enrichment?.sources && sauna.enrichment.sources.length > 0 && (
                <section className="text-xs text-sauna-slate/60 border-t border-sauna-ash/20 pt-4">
                    <p className="font-medium mb-1">Sources &amp; verification</p>
                    <ul className="space-y-0.5">
                        {sauna.enrichment.sources.map((s, i) => (
                            <li key={i}>
                                <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {s.label}
                                </a>
                                {s.fetchedAt && ` — verified ${s.fetchedAt.split('T')[0]}`}
                            </li>
                        ))}
                    </ul>
                    {sauna.enrichment.lastVerified && (
                        <p className="mt-1">Last updated: {sauna.enrichment.lastVerified}</p>
                    )}
                </section>
            )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
            {/* Location */}
            <div className="bg-sauna-linen p-6 rounded-xl border border-sauna-ash/50">
                <h3 className="text-lg font-medium text-sauna-ink mb-4">Location</h3>
                {sauna.location.coordinates ? (
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${sauna.location.coordinates.lat},${sauna.location.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-video rounded-lg mb-4 overflow-hidden bg-sauna-ash/10 relative group"
                    >
                        <img
                            src={`https://maps.googleapis.com/maps/api/staticmap?center=${sauna.location.coordinates.lat},${sauna.location.coordinates.lng}&zoom=14&size=600x300&scale=2&markers=color:red%7C${sauna.location.coordinates.lat},${sauna.location.coordinates.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}`}
                            alt={`Map of ${sauna.name}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                                Open in Google Maps
                            </span>
                        </div>
                    </a>
                ) : (
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sauna.name + ' ' + sauna.location.city)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-video bg-sauna-ash/10 rounded-lg mb-4 flex items-center justify-center hover:bg-sauna-ash/20 transition-colors"
                    >
                        <div className="text-center">
                            <svg className="w-8 h-8 text-sauna-oak/40 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                            </svg>
                            <span className="text-xs text-sauna-slate">View on Google Maps</span>
                        </div>
                    </a>
                )}
                {sauna.location.address && (
                    <p className="text-sauna-ink text-sm mb-1">{sauna.location.address}</p>
                )}
                <p className="text-sauna-ink font-medium">{sauna.location.city}</p>
                <p className="text-sauna-slate text-sm">{sauna.location.country}</p>
                <div className="flex flex-col gap-2 mt-4">
                    {sauna.website && (
                        <a href={sauna.website} target="_blank" rel="noopener noreferrer"
                            className="block w-full py-3 bg-sauna-ink text-sauna-paper text-center rounded-lg font-medium hover:bg-sauna-charcoal transition-colors">
                            Visit Website
                        </a>
                    )}
                    {sauna.bookingUrl && (
                        <a href={sauna.bookingUrl} target="_blank" rel="noopener noreferrer"
                            className="block w-full py-3 bg-sauna-oak text-sauna-paper text-center rounded-lg font-medium hover:bg-sauna-oak/90 transition-colors">
                            Book Now
                        </a>
                    )}
                </div>
            </div>

            {/* CTA */}
            <div className="bg-sauna-oak/10 p-6 rounded-xl border border-sauna-oak/20">
                <h3 className="text-lg font-medium text-sauna-ink mb-2">Planning a home sauna?</h3>
                <p className="text-sauna-walnut text-sm mb-4">
                    Free 3-part guide: costs, types, and what everyone gets wrong.
                </p>
                <NewsletterSignup variant="buying-guide" source="sauna-listing" />
            </div>
        </div>
      </main>

      {relatedSaunas.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-12">
          <h2 className="text-2xl font-display text-sauna-ink mb-4">Related Saunas</h2>
          <div className="flex flex-wrap gap-3">
            {relatedSaunas.map((related) => (
              <Link
                key={related.id}
                href={`/saunas/${related.id}`}
                className="inline-flex items-center rounded-lg border border-sauna-ash/60 bg-sauna-linen px-4 py-2 text-sm text-sauna-ink hover:border-sauna-oak/40"
              >
                {related.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
