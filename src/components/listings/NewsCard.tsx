'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { NewsMeta } from '@/lib/news'

function formatDisplayDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

export function NewsCard({ post }: { post: NewsMeta }) {
  const [isLoading, setIsLoading] = useState(true)
  const sourceCount = post.sources?.length || 0

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-sauna-ash/50 bg-white/80 shadow-[0_18px_60px_rgba(28,25,23,0.06)] transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/news/${post.slug}`} className="block">
        {post.image && (
          <div className="relative aspect-16/9 overflow-hidden bg-sauna-linen">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover transition-all duration-700 group-hover:scale-105 ${
                isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
              }`}
              onLoad={() => setIsLoading(false)}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sauna-charcoal/65 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-sauna-paper/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sauna-bark">
                Sauna News
              </span>
              {post.storyCount ? (
                <span className="rounded-full bg-sauna-charcoal/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sauna-paper">
                  {post.storyCount} stories
                </span>
              ) : null}
            </div>
          </div>
        )}

        <div className="p-6 md:p-7">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-sauna-walnut">
            {formatDisplayDate(post.date)}
            {sourceCount > 0 ? ` • ${sourceCount} sources` : ''}
          </p>
          <h2 className="mb-3 font-display text-3xl font-medium leading-tight text-sauna-ink transition-colors group-hover:text-sauna-heat">
            {post.title}
          </h2>
          <p className="mb-5 text-base leading-relaxed text-sauna-slate">
            {post.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {(post.tags || []).slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-sauna-linen px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sauna-stone"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  )
}
