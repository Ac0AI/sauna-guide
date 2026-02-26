import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import saunasData from '@/data/saunas.json'
import { Sauna } from '@/lib/types'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

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
      images: sauna.images?.[0] ? [{ url: sauna.images[0].startsWith('/') ? sauna.images[0] : `/images/saunas-photos/${sauna.images[0]}` }] : [{ url: '/og-image.jpg', width: 1200, height: 630 }],
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
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-display text-sauna-ink mb-6">About this Sauna</h2>
            <div className="prose prose-lg prose-stone text-sauna-slate leading-relaxed">
                <p>{sauna.description}</p>
                <p>
                    Experience the unique atmosphere of {sauna.name}, a standout destination in {sauna.location.city}&apos;s wellness scene. 
                    Whether you are a seasoned sauna enthusiast or a beginner, this location offers a curated heat experience 
                    reflecting the local traditions of {sauna.location.country}.
                </p>
                <h3>What to expect</h3>
                <ul>
                    {sauna.features.map(feature => (
                        <li key={feature}>{feature}</li>
                    ))}
                </ul>
                <h3>Quick facts</h3>
                <ul>
                    <li><strong>Type:</strong> {sauna.type}</li>
                    <li><strong>Location:</strong> {sauna.location.city}, {sauna.location.country}</li>
                    {sauna.rating && <li><strong>Rating:</strong> {sauna.rating}/5</li>}
                    <li><strong>Top features:</strong> {sauna.features.slice(0, 3).join(', ')}</li>
                </ul>
            </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
            {/* Map Placeholder */}
            <div className="bg-sauna-linen p-6 rounded-xl border border-sauna-ash/50">
                <h3 className="text-lg font-medium text-sauna-ink mb-4">Location</h3>
                <div className="aspect-video bg-sauna-ash/10 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-sauna-oak/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <p className="text-sauna-ink font-medium">{sauna.location.city}</p>
                <p className="text-sauna-slate text-sm">{sauna.location.country}</p>
                {sauna.website && (
                     <a 
                        href={sauna.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-4 block w-full py-3 bg-sauna-ink text-sauna-paper text-center rounded-lg font-medium hover:bg-sauna-charcoal transition-colors"
                     >
                        Visit Website
                     </a>
                )}
            </div>

            {/* CTA */}
             <div className="bg-sauna-oak/10 p-6 rounded-xl border border-sauna-oak/20">
                <h3 className="text-lg font-medium text-sauna-ink mb-2">Weekly Protocols</h3>
                <p className="text-sauna-walnut text-sm mb-4">
                    Get our free weekly newsletter with sauna protocols and science.
                </p>
                <Link href="/#newsletter" className="text-sauna-heat font-bold text-sm hover:underline">
                    Step inside →
                </Link>
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
