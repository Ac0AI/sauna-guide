'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { GuideMeta } from '@/lib/guides'

export function GuideCard({ guide }: { guide: GuideMeta }) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <article className="group relative grid md:grid-cols-12 gap-6 items-start border-b border-sauna-ash/50 pb-10 last:border-0">
      {guide.image && (
        <Link href={`/guides/${guide.slug}`} className="md:col-span-3">
          <div className="aspect-16/10 rounded-lg overflow-hidden bg-sauna-linen relative">
            <Image
              src={guide.image}
              alt={guide.title}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className={`object-cover transition-all duration-700 group-hover:scale-105 ${
                isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
              }`}
              onLoad={() => setIsLoading(false)}
              loading="lazy"
            />
          </div>
        </Link>
      )}
      <div className={guide.image ? "md:col-span-9" : "md:col-span-12"}>
        <div className="text-sm text-sauna-walnut font-medium mb-2 uppercase tracking-wider">
          {guide.date}
        </div>
        <Link href={`/guides/${guide.slug}`}>
          <h2 className="text-2xl font-display font-medium text-sauna-ink mb-3 group-hover:text-sauna-heat transition-colors">
            {guide.title}
          </h2>
        </Link>
        <p className="text-sauna-slate leading-relaxed mb-4">
          {guide.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {guide.tags?.map(tag => (
            <span key={tag} className="text-xs uppercase tracking-wider font-bold text-sauna-stone bg-sauna-linen px-2 py-1 rounded-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
