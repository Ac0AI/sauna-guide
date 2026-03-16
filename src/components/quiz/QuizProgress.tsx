'use client'

const TOTAL_STEPS = 7

export default function QuizProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const step = i + 1
        const isDone = step < current
        const isCurrent = step === current
        return (
          <div
            key={step}
            className={`rounded-full transition-all duration-300 ${
              isDone
                ? 'h-2 w-2 bg-sauna-oak'
                : isCurrent
                  ? 'h-2.5 w-2.5 bg-sauna-ink scale-125'
                  : 'h-2 w-2 bg-sauna-ash/50'
            }`}
          />
        )
      })}
    </div>
  )
}
