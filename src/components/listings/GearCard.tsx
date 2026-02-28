'use client'

import type { GearProduct } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface GearCardProps {
  product: GearProduct
}

// Category-based styling for visual variety
const categoryStyles: Record<string, { gradient: string; icon: string }> = {
  'essentials': {
    gradient: 'from-amber-100 via-orange-50 to-yellow-100',
    icon: '🪣'
  },
  'comfort': {
    gradient: 'from-rose-50 via-pink-50 to-fuchsia-50',
    icon: '🧘'
  },
  'aromatherapy': {
    gradient: 'from-emerald-50 via-green-50 to-teal-50',
    icon: '🌿'
  },
  'cold-therapy': {
    gradient: 'from-cyan-100 via-sky-50 to-blue-100',
    icon: '❄️'
  },
  'tracking': {
    gradient: 'from-violet-50 via-purple-50 to-indigo-50',
    icon: '📊'
  },
  'recovery': {
    gradient: 'from-orange-50 via-amber-50 to-yellow-50',
    icon: '💪'
  },
  'red-light': {
    gradient: 'from-red-100 via-rose-50 to-orange-50',
    icon: '🔴'
  },
  'infrared': {
    gradient: 'from-orange-100 via-red-50 to-amber-50',
    icon: '🔥'
  },
  'portable-saunas': {
    gradient: 'from-stone-100 via-neutral-50 to-zinc-100',
    icon: '🏕️'
  },
  'barrel-saunas': {
    gradient: 'from-amber-100 via-yellow-50 to-orange-50',
    icon: '🛖'
  },
  'outdoor-saunas': {
    gradient: 'from-amber-100 via-yellow-50 to-orange-50',
    icon: '🛖'
  },
  'heaters': {
    gradient: 'from-red-50 via-orange-50 to-amber-100',
    icon: '🔥'
  },
  'wood-stoves': {
    gradient: 'from-orange-100 via-amber-50 to-red-50',
    icon: '🪵'
  },
  'tech': {
    gradient: 'from-slate-100 via-gray-50 to-zinc-100',
    icon: '🎵'
  },
  'maintenance': {
    gradient: 'from-lime-50 via-green-50 to-emerald-50',
    icon: '🧹'
  },
}

export function GearCard({ product }: GearCardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const imageSrc = product.image?.startsWith('http') || product.image?.startsWith('/')
    ? product.image
    : product.image
      ? `/images/gear/products/${product.image}`
      : null

  const style = categoryStyles[product.category] || categoryStyles['essentials']
  const showFallback = !imageSrc || imageError

  return (
    <Link
      href={`/gear/${product.slug}`}
      className="group bg-white rounded-2xl border border-sauna-ash/40 overflow-hidden
                 hover:border-sauna-oak/40 hover:shadow-2xl hover:-translate-y-1
                 transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className={`aspect-4/3 relative overflow-hidden ${showFallback ? `bg-linear-to-br ${style.gradient}` : 'bg-sauna-linen'}`}>
        {imageSrc && !imageError ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-contain p-6 transition-all duration-500 group-hover:scale-110 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <span className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
              {style.icon}
            </span>
            <span className="text-sm font-medium text-sauna-walnut/70 text-center line-clamp-2 px-4">
              {product.name}
            </span>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full text-sm font-bold text-sauna-ink shadow-lg">
          {product.price}
        </div>

        {/* Rating Badge */}
        {product.rating && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <span className="text-yellow-500 text-sm">★</span>
            <span className="text-xs font-bold text-sauna-ink">{product.rating}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <span className="text-xs font-semibold text-sauna-walnut uppercase tracking-wider">
            {product.brand}
          </span>
          <h2 className="text-base font-semibold text-sauna-ink mt-1 group-hover:text-sauna-walnut transition-colors line-clamp-2">
            {product.name}
          </h2>
        </div>

        <p className="text-sauna-slate text-sm leading-relaxed line-clamp-2 grow">
          {product.description}
        </p>

        {/* Why badge */}
        <div className="mt-4 pt-4 border-t border-sauna-ash/30">
          <p className="text-xs text-sauna-bark leading-relaxed line-clamp-2">
            <span className="font-semibold">Why:</span> {product.why}
          </p>
        </div>

        {/* View indicator */}
        <div className="mt-4 flex items-center justify-end text-sauna-walnut text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View details
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
