'use client'

import type { QuizOption } from '@/lib/quiz/types'

interface QuizCardProps {
  option: QuizOption
  selected: boolean
  onSelect: () => void
}

export default function QuizCard({ option, selected, onSelect }: QuizCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex min-h-[80px] w-full flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all duration-200 ${
        selected
          ? 'border-sauna-ink bg-sauna-linen ring-1 ring-sauna-ink'
          : 'border-sauna-ash bg-white hover:border-sauna-oak'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg leading-none" aria-hidden="true">
          {option.icon}
        </span>
        <span className="font-display text-lg font-medium text-sauna-ink">
          {option.label}
        </span>
      </div>
      {option.description && (
        <p className="pl-[calc(1.125rem+0.75rem)] text-sm text-sauna-slate">
          {option.description}
        </p>
      )}
      {option.pros && option.pros.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-[calc(1.125rem+0.75rem)] text-xs text-sauna-stone">
          <span className="text-sauna-oak">
            + {option.pros.join(' · ')}
          </span>
          {option.cons && option.cons.length > 0 && (
            <span className="text-sauna-slate">
              - {option.cons.join(' · ')}
            </span>
          )}
        </div>
      )}
    </button>
  )
}
