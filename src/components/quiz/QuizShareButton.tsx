'use client'

import { useState } from 'react'
import type { QuizAnswers } from '@/lib/quiz/types'

interface QuizShareButtonProps {
  answers: QuizAnswers
}

export default function QuizShareButton({ answers }: QuizShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/quiz?r=${btoa(JSON.stringify(answers))}`
    : ''

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Home Sauna Recommendation',
          text: 'I found the right home sauna. Take a look at the recommendation.',
          url: shareUrl,
        })
        return
      } catch {
        // User cancelled or share failed, fall through to copy
      }
    }

    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-sauna-ash bg-sauna-linen p-5">
      <p className="text-sm font-medium text-sauna-ink">
        Buying this together? Send your partner the recommendation.
      </p>
      <button
        onClick={handleShare}
        className="mt-3 rounded-lg border border-sauna-ash bg-white px-4 py-2 text-sm font-medium text-sauna-ink transition-colors hover:border-sauna-oak"
      >
        {copied ? 'Link copied' : 'Share recommendation'}
      </button>
    </div>
  )
}
