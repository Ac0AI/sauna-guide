'use client'

import { useState } from 'react'
import { BrandCard } from '@/components/listings/BrandCard'
import type { Manufacturer } from '@/lib/manufacturers'

interface BrandGridProps {
  manufacturers: Manufacturer[]
  types: { type: Manufacturer['type']; count: number; label: string }[]
}

export function BrandGrid({ manufacturers, types }: BrandGridProps) {
  const [activeType, setActiveType] = useState<string | null>(null)

  const filtered = activeType
    ? manufacturers.filter((m) => m.type === activeType)
    : manufacturers

  return (
    <>
      {/* Type filters */}
      <div className="flex flex-wrap gap-3 mb-12">
        <button
          onClick={() => setActiveType(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeType === null
              ? 'bg-sauna-ink text-sauna-paper'
              : 'bg-transparent text-sauna-slate border border-sauna-ash/50 hover:border-sauna-oak/50 hover:text-sauna-ink'
          }`}
        >
          All ({manufacturers.length})
        </button>
        {types.map(({ type, count, label }) => (
          <button
            key={type}
            onClick={() => setActiveType(activeType === type ? null : type)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeType === type
                ? 'bg-sauna-ink text-sauna-paper'
                : 'bg-transparent text-sauna-slate border border-sauna-ash/50 hover:border-sauna-oak/50 hover:text-sauna-ink'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Brand grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((manufacturer) => (
          <BrandCard key={manufacturer.slug} manufacturer={manufacturer} />
        ))}
      </div>
    </>
  )
}
