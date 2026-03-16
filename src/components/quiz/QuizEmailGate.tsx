'use client'

import { useState } from 'react'
import type { QuizAnswers } from '@/lib/quiz/types'

interface QuizEmailGateProps {
  answers: QuizAnswers
  onUnlock: () => void
}

export default function QuizEmailGate({ answers, onUnlock }: QuizEmailGateProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const customFields: Record<string, string> = {}
      if (answers.heatType) customFields.quiz_heat_type = answers.heatType
      if (answers.budget) customFields.quiz_budget = answers.budget
      if (answers.timeline) customFields.quiz_timeline = answers.timeline
      if (answers.placement) customFields.quiz_placement = answers.placement
      if (answers.motivation) customFields.quiz_motivation = answers.motivation

      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'quiz',
          customFields,
          utm_source: 'quiz',
          utm_medium: 'configurator',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || 'Something went wrong.')
        setStatus('error')
        return
      }

      onUnlock()
    } catch {
      setErrorMessage('Something went wrong. Try again.')
      setStatus('error')
    }
  }

  return (
    <div className="relative rounded-2xl border border-sauna-ash bg-white p-6 md:p-8 shadow-sm">
      <h3 className="font-display text-2xl text-sauna-ink text-center">
        See my full recommendation
      </h3>
      <p className="mt-2 text-center text-sauna-slate">
        Your personalized brand comparison, installation checklist, and common mistakes to avoid.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full rounded-lg border border-sauna-ash bg-sauna-paper px-4 py-3 text-sauna-ink placeholder:text-sauna-stone focus:border-sauna-oak focus:outline-none focus:ring-1 focus:ring-sauna-oak"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-lg bg-sauna-ink px-6 py-3 font-medium text-white transition-colors hover:bg-sauna-charcoal disabled:opacity-50"
        >
          {status === 'loading' ? 'Sending...' : 'See my full recommendation'}
        </button>
      </form>

      {status === 'error' && (
        <p className="mt-3 text-center text-sm text-red-600">{errorMessage}</p>
      )}

      <p className="mt-4 text-center text-xs text-sauna-stone">
        We&apos;ll also send you the Thursday letter. One email a week.
      </p>
    </div>
  )
}
