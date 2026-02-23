'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Manufacturer } from '@/lib/manufacturers'

interface BrandCardProps {
  manufacturer: Manufacturer
}

const typeGradients: Record<string, string> = {
  'traditional': 'from-amber-700 to-amber-900',
  'infrared': 'from-red-600 to-red-800',
  'barrel': 'from-orange-600 to-orange-800',
  'barrel-cabin': 'from-orange-600 to-amber-800',
  'outdoor': 'from-green-700 to-green-900',
  'luxury': 'from-purple-600 to-purple-900',
  'red-light': 'from-pink-600 to-rose-800',
  'portable': 'from-blue-600 to-blue-800',
}

const typeLabels: Record<string, string> = {
  'traditional': 'Traditional',
  'infrared': 'Infrared',
  'barrel': 'Barrel',
  'barrel-cabin': 'Barrel & Cabin',
  'outdoor': 'Outdoor',
  'luxury': 'Luxury',
  'red-light': 'Red Light',
  'portable': 'Portable',
}

export function BrandCard({ manufacturer }: BrandCardProps) {
  const gradient = typeGradients[manufacturer.type] || 'from-gray-600 to-gray-800'
  const label = typeLabels[manufacturer.type] || manufacturer.type

  return (
    <Link
      href={`/sauna-brands/${manufacturer.slug}`}
      className="group bg-sauna-paper rounded-2xl border border-sauna-ash/50 overflow-hidden
                    hover:border-sauna-oak/30 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Decorative Header with Logo */}
      <div className={`h-28 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
            <path d="M0,60 Q100,20 200,60 T400,60 L400,120 L0,120 Z" fill="white" />
          </svg>
        </div>
        {manufacturer.logo && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <Image
              src={manufacturer.logo}
              alt={`${manufacturer.name} logo`}
              width={120}
              height={48}
              className="object-contain max-h-10 brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity"
              unoptimized={manufacturer.logo.endsWith('.svg')}
            />
          </div>
        )}
        <div className="absolute bottom-3 left-5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/70 bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-sm">
            {label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-sauna-oak uppercase tracking-wider mb-2">
            <span>{manufacturer.country}</span>
            {manufacturer.founded && (
              <>
                <span>•</span>
                <span>Est. {manufacturer.founded}</span>
              </>
            )}
          </div>
          <h3 className="text-xl font-medium text-sauna-ink group-hover:text-sauna-walnut transition-colors duration-300">
            {manufacturer.name}
          </h3>
        </div>

        <p className="text-sauna-slate text-sm leading-relaxed mb-6 line-clamp-2">
          {manufacturer.unique_angle}
        </p>

        {/* Product Tags */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          {manufacturer.products.slice(0, 3).map((product) => (
            <span
              key={product}
              className="text-[10px] uppercase font-bold tracking-widest bg-sauna-linen
                         text-sauna-walnut/70 px-2 py-0.5 rounded border border-sauna-ash/30"
            >
              {product.replace(/-/g, ' ')}
            </span>
          ))}
          {manufacturer.products.length > 3 && (
            <span className="text-[10px] font-bold text-sauna-slate px-1 py-0.5">
              +{manufacturer.products.length - 3} more
            </span>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-sauna-ash/30 flex items-center justify-end">
          <span className="flex items-center gap-1.5 text-sm font-medium text-sauna-walnut group-hover:gap-2 transition-all">
            Explore
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
