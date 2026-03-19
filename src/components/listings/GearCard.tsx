'use client'

import type { GearProduct } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface GearCardProps {
  product: GearProduct
}

const categoryIcons: Record<string, string> = {
  'essentials': '🪣',
  'comfort': '🧘',
  'aromatherapy': '🌿',
  'cold-therapy': '❄️',
  'tracking': '📊',
  'recovery': '💪',
  'red-light': '🔴',
  'infrared': '🔥',
  'portable-saunas': '🏕️',
  'barrel-saunas': '🛖',
  'outdoor-saunas': '🛖',
  'heaters': '🔥',
  'wood-stoves': '🪵',
  'tech': '🎵',
  'maintenance': '🧹',
}

export function GearCard({ product }: GearCardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const imageSrc = product.image?.startsWith('http') || product.image?.startsWith('/')
    ? product.image
    : product.image
      ? `/images/gear/products/${product.image}`
      : null

  const icon = categoryIcons[product.category] || '🔥'
  const showFallback = !imageSrc || imageError

  return (
    <Link
      href={`/accessories/${product.slug}`}
      className="group bg-white rounded-2xl border border-sauna-ash/30 overflow-hidden
                 hover:border-sauna-oak/30 hover:shadow-lg
                 transition-all duration-300 flex flex-col h-full"
    >
      {/* Image */}
      <div className={`aspect-[4/3] relative overflow-hidden ${showFallback ? 'bg-sauna-charcoal' : 'bg-sauna-linen'}`}>
        {imageSrc && !imageError ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-contain p-6 transition-all duration-500 group-hover:scale-105 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')] opacity-40" />
            <span className="text-4xl mb-2 opacity-60">{icon}</span>
            <span className="text-xs font-medium text-sauna-fog/70 text-center line-clamp-2 px-4 uppercase tracking-wider">
              {product.brand}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full text-sm font-bold text-sauna-ink shadow-sm">
          {product.price}
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <span className="text-amber-500 text-xs">★</span>
            <span className="text-xs font-bold text-sauna-ink">{product.rating}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[11px] font-semibold text-sauna-oak uppercase tracking-widest mb-1">
          {product.brand}
        </span>
        <h2 className="text-[15px] font-semibold text-sauna-ink leading-snug group-hover:text-sauna-walnut transition-colors line-clamp-2 mb-2">
          {product.name}
        </h2>

        <p className="text-sauna-slate text-sm leading-relaxed line-clamp-2 grow">
          {product.description}
        </p>

        {/* Why */}
        {product.why && (
          <div className="mt-4 pt-3 border-t border-sauna-ash/20">
            <p className="text-xs text-sauna-slate leading-relaxed line-clamp-2">
              <span className="font-semibold text-sauna-walnut">Why: </span>{product.why}
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
