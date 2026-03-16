'use client'

import type { QuizQuestion as QuizQuestionType } from '@/lib/quiz/types'
import QuizCard from './QuizCard'

interface QuizQuestionProps {
  question: QuizQuestionType
  selected: string | undefined
  onSelect: (value: string) => void
}

export default function QuizQuestion({ question, selected, onSelect }: QuizQuestionProps) {
  const columns = question.options.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2'

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-display text-3xl md:text-4xl text-sauna-ink">
          {question.title}
        </h2>
        {question.subtitle && (
          <p className="mt-2 text-lg text-sauna-slate">{question.subtitle}</p>
        )}
      </div>
      <div className={`grid grid-cols-1 ${columns} gap-4`}>
        {question.options.map((option) => (
          <QuizCard
            key={option.value}
            option={option}
            selected={selected === option.value}
            onSelect={() => onSelect(option.value)}
          />
        ))}
      </div>
    </div>
  )
}
