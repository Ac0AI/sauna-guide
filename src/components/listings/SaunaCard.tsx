'use client'

import type { Sauna } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface SaunaCardProps {
  sauna: Sauna
}

export function SaunaCard({ sauna }: SaunaCardProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Handle: external URLs, full paths (starting with /), or just filenames
  const imageSrc = sauna.images[0]?.startsWith('http') || sauna.images[0]?.startsWith('/')
    ? sauna.images[0]
    : sauna.images[0]
      ? `/images/saunas-photos/${sauna.images[0]}`
      : null

  return (
    <div className="group bg-sauna-paper rounded-2xl border border-sauna-ash/50 overflow-hidden
                    hover:border-sauna-oak/30 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="aspect-[16/10] bg-sauna-linen relative overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={sauna.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 group-hover:scale-105 ${
              isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
            onLoad={() => setIsLoading(false)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sauna-ash">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-sauna-oak uppercase tracking-wider mb-2">
            <span>{sauna.type}</span>
            <span>•</span>
            <span>{sauna.location.city}, {sauna.location.country}</span>
          </div>
          <h3 className="text-xl font-medium text-sauna-ink group-hover:text-sauna-walnut transition-colors duration-300">
            {sauna.name}
          </h3>
        </div>

        <p className="text-sauna-slate text-sm leading-relaxed mb-6 line-clamp-3">
          {sauna.description}
        </p>

        {/* Features Tags */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          {sauna.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="text-[10px] uppercase font-bold tracking-widest bg-sauna-linen 
                         text-sauna-walnut/70 px-2 py-0.5 rounded border border-sauna-ash/30"
            >
              {feature}
            </span>
          ))}
          {sauna.features.length > 3 && (
            <span className="text-[10px] font-bold text-sauna-slate px-1 py-0.5">
              +{sauna.features.length - 3} more
            </span>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-sauna-ash/30 flex items-center justify-end">
          <Link
            href={`/saunas/${sauna.id}`}
            className="flex items-center gap-1.5 text-sm font-medium text-sauna-walnut group-hover:gap-2 transition-all"
          >
            Explore
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
