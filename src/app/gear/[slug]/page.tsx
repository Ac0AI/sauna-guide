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

  return {
    title: `${product.name} Review | Best ${category?.name || 'Sauna'} Gear`,
    description: `${product.description} ${product.why}`,
    openGraph: {
      title: `${product.name} - ${product.brand}`,
      description: product.description,
      images: product.image ? [product.image] : undefined,
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

  return (
    <div className="min-h-screen bg-sauna-paper flex flex-col">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-32 flex-grow">
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
          <div className="aspect-square bg-gradient-to-br from-sauna-linen to-sauna-ash/20 rounded-2xl relative overflow-hidden">
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
                <span className="text-sm font-medium text-sauna-oak uppercase tracking-wider">{product.brand}</span>
                {product.rating && (
                  <div className="flex items-center gap-1 bg-sauna-linen px-2 py-1 rounded">
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
              <h3 className="text-sm font-bold uppercase tracking-wider text-sauna-oak mb-2">
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
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.13.063.108.039.261-.073.46l-.095.15c-.035.057-.076.122-.12.19-.186.291-.398.616-.64.968-.387.566-.83 1.065-1.326 1.5l-.148.125c-.18.156-.37.27-.565.347a1.06 1.06 0 01-.4.092c-.063 0-.13-.01-.2-.027a.556.556 0 01-.205-.092c-.79-.556-1.676-1.036-2.662-1.437-.05-.02-.092-.04-.128-.054a.562.562 0 01-.095-.048c-.158-.084-.284-.212-.379-.384a1.067 1.067 0 01-.143-.538c0-.18.044-.348.132-.505a.986.986 0 01.356-.375c.085-.054.217-.124.396-.21.302-.145.594-.272.876-.383.21-.083.47-.179.78-.286.31-.107.59-.195.84-.262.388-.1.686-.162.895-.183l.282-.025c.226-.02.46-.028.697-.028.61 0 1.224.088 1.844.264.144.04.29.09.437.15l.223.095c.034.014.065.028.096.042l.052.022c.143.065.242.135.297.21.101.135.11.295.029.48-.081.19-.19.32-.33.387-.14.066-.32.1-.54.1h-.163c-.108.004-.175.007-.2.01h-.14c-.082 0-.178-.004-.29-.01-.111-.007-.209-.01-.293-.01-.368 0-.727.034-1.078.1-.351.067-.668.161-.95.283l-.085.04c-.23.103-.375.188-.434.258-.06.07-.064.165-.013.286a.38.38 0 00.213.203c.085.032.233.07.443.115.21.044.4.084.568.118a14.95 14.95 0 001.4.212c.506.054.94.082 1.302.082.232 0 .45-.01.657-.03.206-.02.395-.047.565-.078.17-.031.324-.07.46-.12.138-.047.246-.1.325-.157.164-.118.253-.34.264-.667.012-.326-.05-.654-.186-.984a3.14 3.14 0 00-.55-.91c-.233-.28-.486-.474-.758-.585l-.084-.035a4.05 4.05 0 00-.375-.127 5.37 5.37 0 00-.576-.122 7.79 7.79 0 00-.662-.075c-.162-.012-.35-.023-.566-.034l-.372-.02c-.296-.013-.527-.023-.694-.03l-.126-.007a8.07 8.07 0 01-.158-.01 2.216 2.216 0 01-.178-.02l-.113-.015-.158-.03a1.27 1.27 0 01-.19-.047.686.686 0 01-.195-.09.497.497 0 01-.181-.172.49.49 0 01-.086-.274c0-.18.093-.34.279-.483.186-.144.44-.264.762-.36.322-.096.663-.16 1.023-.192.36-.032.721-.032 1.082 0 .36.032.696.095.998.192.301.096.562.216.78.36s.37.303.459.477c.089.174.105.355.046.543-.06.188-.188.354-.388.497a2.3 2.3 0 01-.695.333 3.76 3.76 0 01-.975.148c-.156.008-.326.011-.508.011-.232 0-.447-.004-.645-.011l-.183-.006-.19-.01-.118-.006-.142-.01a3.25 3.25 0 01-.133-.012c-.048-.005-.09-.01-.128-.014l-.108-.014c-.097-.012-.19-.028-.276-.048-.087-.02-.164-.04-.234-.058l-.07-.02c-.1-.03-.186-.062-.26-.093a.938.938 0 01-.206-.13.46.46 0 01-.131-.172.442.442 0 01-.054-.225c0-.1.033-.199.098-.295a.81.81 0 01.272-.263c.116-.078.249-.142.4-.19.15-.05.303-.087.458-.11.156-.024.315-.036.478-.036.118 0 .235.006.35.019.116.013.225.03.327.052.102.022.19.048.267.078.076.03.142.06.196.093l.081.05c.075.046.142.1.201.161.06.062.11.126.151.193a.636.636 0 01.093.212c.019.074.028.151.028.23 0 .15-.04.294-.12.43-.08.136-.213.244-.402.326a1.8 1.8 0 01-.56.137 6.47 6.47 0 01-.592.01c-.23-.01-.435-.027-.613-.053a4.6 4.6 0 01-.55-.105 2.37 2.37 0 01-.482-.172 1.38 1.38 0 01-.387-.273 1.04 1.04 0 01-.25-.383c-.058-.15-.071-.328-.04-.536.031-.207.128-.394.29-.56.16-.166.41-.308.746-.428.337-.12.754-.195 1.252-.227.498-.03 1.077-.012 1.736.058.66.07 1.23.183 1.71.34.48.156.855.348 1.126.575.27.226.435.486.492.78.057.295-.003.617-.18.968-.176.35-.435.6-.775.752-.34.15-.736.227-1.19.227-.303 0-.61-.024-.92-.073a6.83 6.83 0 01-.915-.21 4.25 4.25 0 01-.82-.35 2.16 2.16 0 01-.62-.5 1.5 1.5 0 01-.327-.66c-.058-.252-.03-.534.083-.848.113-.313.343-.579.69-.798.347-.22.814-.38 1.402-.484.588-.103 1.28-.116 2.077-.04.797.077 1.48.226 2.05.446.569.22 1.013.492 1.33.815.318.324.52.688.606 1.092.087.404.038.833-.145 1.287-.184.454-.51.846-.98 1.176-.47.33-1.074.574-1.814.733-.74.158-1.6.21-2.582.154-.983-.057-1.852-.2-2.608-.43-.757-.23-1.382-.528-1.876-.893-.494-.364-.85-.791-1.067-1.28-.217-.49-.283-1.023-.198-1.6.085-.576.303-1.09.653-1.54.35-.45.808-.823 1.374-1.12.566-.296 1.218-.507 1.957-.633.738-.126 1.538-.17 2.397-.13.86.04 1.646.154 2.361.34.714.186 1.325.434 1.831.742.506.308.897.668 1.172 1.08.275.412.41.87.405 1.373-.006.503-.16.993-.464 1.47a3.6 3.6 0 01-1.148 1.148 6.47 6.47 0 01-1.642.74 10.56 10.56 0 01-2.012.376c-.713.058-1.46.058-2.24 0a12.08 12.08 0 01-2.29-.374 9.04 9.04 0 01-2.019-.746 5.7 5.7 0 01-1.55-1.108 4.05 4.05 0 01-.945-1.477 3.4 3.4 0 01-.19-1.736c.078-.588.29-1.133.637-1.634.347-.501.805-.94 1.374-1.32.568-.378 1.233-.685 1.994-.92.76-.236 1.6-.387 2.517-.457.918-.07 1.787-.047 2.608.07.82.116 1.546.31 2.175.582.63.272 1.144.612 1.543 1.02.398.408.668.869.808 1.383.14.514.136 1.054-.013 1.618-.148.564-.46 1.093-.935 1.59-.475.495-1.111.9-1.907 1.212-.797.312-1.746.518-2.847.618-1.1.1-2.122.06-3.063-.118-.94-.18-1.76-.475-2.46-.887a4.83 4.83 0 01-1.64-1.447c-.395-.556-.63-1.148-.704-1.776-.073-.628.02-1.254.278-1.878.258-.623.666-1.198 1.226-1.723.559-.525 1.26-.96 2.101-1.304a11.72 11.72 0 012.781-.72c1.002-.147 2.028-.175 3.08-.086 1.052.09 2.03.297 2.936.622.905.325 1.7.753 2.387 1.284.686.53 1.236 1.153 1.65 1.867.412.714.67 1.508.771 2.38.1.873.029 1.764-.217 2.674-.246.91-.69 1.777-1.333 2.598-.642.822-1.478 1.548-2.508 2.178-1.03.63-2.235 1.113-3.616 1.448-1.38.335-2.888.475-4.524.42zm15.28-11.71c-.016.13-.046.248-.09.352a.85.85 0 01-.18.277.76.76 0 01-.288.185c-.117.044-.254.066-.41.066-.143 0-.27-.018-.379-.054a.696.696 0 01-.28-.166.709.709 0 01-.173-.286 1.17 1.17 0 01-.058-.397V4.44c0-.13.02-.247.058-.35a.713.713 0 01.173-.282.74.74 0 01.28-.185.976.976 0 01.379-.068c.156 0 .293.023.41.068a.76.76 0 01.288.185.77.77 0 01.18.282c.043.103.07.22.078.35v1.87c0 .14-.023.271-.068.394z"/>
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
