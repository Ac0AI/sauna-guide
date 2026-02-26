import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { getAllProducts, getProductBySlug, getRelatedProducts, getCategoryById } from '@/lib/gear'
import { GearCard } from '@/components/listings/GearCard'

export async function generateStaticParams() {
  const products = getAllProducts()
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const category = getCategoryById(product.category)
  const pageUrl = `https://sauna.guide/gear/${slug}`
  const rawDescription = `${product.description} ${product.why}`.replace(/\s+/g, ' ').trim()
  const description = rawDescription.length > 160 ? `${rawDescription.slice(0, 157).trimEnd()}...` : rawDescription
  const ogImage = product.image
    ? (product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/images/gear/products/${product.image}`)
    : '/og-image.jpg'

  return {
    title: `${product.name} Review | Best ${category?.name || 'Sauna'} Gear`,
    description,
    keywords: [
      product.name,
      product.brand,
      'sauna gear',
      'sauna accessory',
      category?.name || 'sauna',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${product.name} - ${product.brand}`,
      description: product.description,
      url: pageUrl,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
  }
}

export default async function GearProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) return notFound()

  const category = getCategoryById(product.category)
  const relatedProducts = getRelatedProducts(product, 3)

  const imageSrc = product.image?.startsWith('http') || product.image?.startsWith('/')
    ? product.image
    : product.image
      ? `/images/gear/products/${product.image}`
      : null

  const pageUrl = `https://sauna.guide/gear/${slug}`
  const plainTextSummary = `${product.richDescription || product.description} ${product.why}`.replace(/\s+/g, ' ').trim()
  const normalizedPrice = product.price.replace(/[^0-9.]/g, '').split('-')[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    sku: product.slug,
    name: product.name,
    category: category?.name,
    description: plainTextSummary,
    image: imageSrc
      ? (imageSrc.startsWith('http') ? imageSrc : `https://sauna.guide${imageSrc}`)
      : undefined,
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      price: normalizedPrice, // Handle ranges like "$50-100" by taking the first number
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Sauna Guide',
      },
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: 1,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    review: product.rating ? {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: product.rating,
        bestRating: '5'
      },
      author: {
        '@type': 'Organization',
        name: 'Sauna Guide'
      }
    } : undefined
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sauna.guide' },
      { '@type': 'ListItem', position: 2, name: 'Gear', item: 'https://sauna.guide/gear' },
      ...(category ? [{ '@type': 'ListItem', position: 3, name: category.name, item: `https://sauna.guide/gear#${category.id}` }] : []),
      { '@type': 'ListItem', position: category ? 4 : 3, name: product.name, item: `https://sauna.guide/gear/${slug}` },
    ],
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${product.name} best for?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: product.why,
        },
      },
      {
        '@type': 'Question',
        name: `How much does ${product.name} cost?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${product.name} is listed at ${product.price}.`,
        },
      },
      {
        '@type': 'Question',
        name: `Who should buy ${product.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: product.whyPeopleLikeIt || product.description,
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

      <main className="max-w-7xl mx-auto px-6 py-32 grow">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center gap-2 text-sauna-slate">
            <li>
              <Link href="/gear" className="hover:text-sauna-ink transition-colors">
                Gear
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            {category && (
              <>
                <li>
                  <Link href={`/gear#${category.id}`} className="hover:text-sauna-ink transition-colors">
                    {category.name}
                  </Link>
                </li>
                <li>
                  <span className="mx-2">/</span>
                </li>
              </>
            )}
            <li className="text-sauna-ink font-medium truncate">{product.name}</li>
          </ol>
        </nav>

        {/* Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="aspect-square bg-linear-to-br from-sauna-linen to-sauna-ash/20 rounded-2xl relative overflow-hidden">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-8"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-sauna-oak/10 flex items-center justify-center mb-4">
                  <span className="text-4xl font-display text-sauna-oak/60">{product.brand.charAt(0)}</span>
                </div>
                <span className="text-lg text-sauna-stone/60 font-medium">{product.brand}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium text-sauna-walnut uppercase tracking-wider">{product.brand}</span>
                {product.rating && (
                  <div className="flex items-center gap-1 bg-sauna-linen px-2 py-1 rounded-sm">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium text-sauna-ink">{product.rating}</span>
                  </div>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-medium text-sauna-ink mb-4">
                {product.name}
              </h1>
              <p className="text-2xl font-semibold text-sauna-walnut">{product.price}</p>
            </div>

            <div className="mb-8">
              <p className="text-lg text-sauna-slate leading-relaxed">
                {product.richDescription || product.description}
              </p>
            </div>

            {/* Why We Recommend */}
            <div className="bg-sauna-linen/50 p-6 rounded-xl mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-sauna-walnut mb-2">
                Why We Recommend It
              </h3>
              <p className="text-sauna-bark">{product.why}</p>
            </div>

            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-sauna-slate mb-3">
                  Specifications
                </h3>
                <dl className="grid grid-cols-2 gap-3">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="bg-sauna-linen/30 px-4 py-3 rounded-lg">
                      <dt className="text-xs text-sauna-stone uppercase tracking-wide mb-1">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="text-sm font-medium text-sauna-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Reddit Sentiment */}
            {product.redditSentiment && (
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100/50 mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                  <span className="text-sm font-medium text-blue-900">Reddit Says</span>
                </div>
                <p className="text-sm text-sauna-slate">{product.redditSentiment}</p>
              </div>
            )}

            {/* Why People Like It */}
            {product.whyPeopleLikeIt && (
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-sauna-slate mb-2">
                  What People Say
                </h3>
                <p className="text-sauna-slate">{product.whyPeopleLikeIt}</p>
              </div>
            )}

            {/* Purchase Links */}
            {product.purchaseLinks.length > 0 && (
              <div className="mt-auto">
                <h3 className="text-sm font-bold uppercase tracking-wider text-sauna-slate mb-4">
                  Where to Buy
                </h3>
                <div className="space-y-3">
                  {product.purchaseLinks.map((link, index) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        index === 0
                          ? 'bg-sauna-ink text-white border-sauna-ink hover:bg-sauna-obsidian'
                          : 'bg-white text-sauna-ink border-sauna-ash/50 hover:border-sauna-oak/30 hover:bg-sauna-linen/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {link.type === 'amazon' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M7 7V5a5 5 0 0110 0v2m-9 0v12m8-12v12M5 19h14" />
                          </svg>
                        )}
                        {link.type === 'manufacturer' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                        {link.type === 'retailer' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        )}
                        <span className="font-medium">{link.name}</span>
                      </div>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-sauna-ash/30 pt-16">
            <h2 className="font-display text-2xl font-medium text-sauna-ink mb-8">
              More from {category?.name || 'This Category'}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((product) => (
                <GearCard key={product.slug} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Newsletter CTA */}
        <section className="mt-16 bg-sauna-oak/10 p-8 md:p-12 rounded-2xl border border-sauna-oak/20 text-center">
          <h2 className="font-display text-2xl font-medium text-sauna-ink mb-4">
            Weekly Sauna Protocols
          </h2>
          <p className="text-sauna-walnut mb-6 max-w-xl mx-auto">
            Every Thursday: why heat heals, where to find it, and five minutes of stillness.
          </p>
          <Link
            href="/#newsletter"
            className="inline-block bg-sauna-ink text-white px-8 py-3 rounded-lg font-medium hover:bg-sauna-obsidian transition-colors"
          >
            Step Inside
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}
