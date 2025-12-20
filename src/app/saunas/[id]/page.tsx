import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import saunasData from '@/data/saunas.json'
import { Sauna } from '@/lib/types'

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

  return {
    title: `${sauna.name} Review - Best Saunas in ${sauna.location.city}`,
    description: `Complete guide to ${sauna.name} in ${sauna.location.city}, ${sauna.location.country}. Pricing, features, and what to expect at this ${sauna.type} sauna.`,
  }
}

export default async function SaunaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const saunas = saunasData.saunas as Sauna[]
  const sauna = saunas.find((s) => s.id === id)

  if (!sauna) return notFound()

  return (
    <main className="min-h-screen bg-sauna-paper pb-20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-sauna-paper/90 backdrop-blur-md border-b border-sauna-ash/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-sauna-bark flex items-center justify-center
                            group-hover:bg-sauna-walnut transition-colors duration-300">
              <svg className="w-5 h-5 text-sauna-sand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <span className="font-display text-xl font-medium text-sauna-ink tracking-tight">Sauna Guide</span>
          </Link>
          <div className="flex gap-4">
             <Link href="/saunas" className="px-4 py-2 text-sm font-medium text-sauna-walnut hover:text-sauna-ink transition-colors">
               Back to Directory
             </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="relative h-[60vh] min-h-[500px] w-full bg-sauna-charcoal mt-20">
        {sauna.images[0] ? (
          <Image
            src={sauna.images[0].startsWith('http') ? sauna.images[0] : `/images/saunas/${sauna.images[0]}`}
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
        <div className="absolute inset-0 bg-gradient-to-t from-sauna-charcoal via-transparent to-transparent" />
        
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
                    
                    <div className="flex items-center gap-4">
                        {sauna.rating && (
                            <div className="bg-sauna-paper text-sauna-ink px-4 py-3 rounded-lg flex flex-col items-center shadow-lg">
                                <span className="text-2xl font-bold leading-none">{sauna.rating}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-sauna-walnut">Rating</span>
                            </div>
                        )}
                         <div className="bg-sauna-paper text-sauna-ink px-4 py-3 rounded-lg flex flex-col items-center shadow-lg">
                                <span className="text-2xl font-bold leading-none">{sauna.priceRange}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-sauna-walnut">Price</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-display text-sauna-ink mb-6">About this Sauna</h2>
            <div className="prose prose-lg prose-stone text-sauna-slate leading-relaxed">
                <p>{sauna.description}</p>
                <p>
                    Experience the unique atmosphere of {sauna.name}, a standout destination in {sauna.location.city}'s wellness scene. 
                    Whether you are a seasoned sauna enthusiast or a beginner, this location offers a curated heat experience 
                    reflecting the local traditions of {sauna.location.country}.
                </p>
                <h3>What to expect</h3>
                <ul>
                    {sauna.features.map(feature => (
                        <li key={feature}>{feature}</li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
            {/* Map Placeholder */}
            <div className="bg-sauna-linen p-6 rounded-xl border border-sauna-ash/50">
                <h3 className="text-lg font-medium text-sauna-ink mb-4">Location</h3>
                <div className="aspect-square bg-sauna-ash/20 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-sauna-slate text-sm">Map Integration Coming Soon</span>
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
                    Subscribe Free →
                </Link>
            </div>
        </div>
      </div>
    </main>
  )
}
