'use client'

import type { QuizAnswers, QuizResult } from '@/lib/quiz/types'
import QuizEmailGate from './QuizEmailGate'
import QuizShareButton from './QuizShareButton'
import Link from 'next/link'

interface QuizResultsProps {
  result: QuizResult
  answers: QuizAnswers
  isUnlocked: boolean
  onUnlock: () => void
}

export default function QuizResults({ result, answers, isUnlocked, onUnlock }: QuizResultsProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Teaser - always visible */}
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-sauna-oak">
          Your recommendation
        </p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl text-sauna-ink">
          {result.headline}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-sauna-slate leading-relaxed">
          {result.reasoning}
        </p>
      </div>

      {/* Cost range */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-sauna-slate">All-in cost:</span>
        <span className="font-display text-2xl text-sauna-ink">
          ${result.costRange.low.toLocaleString()} - ${result.costRange.high.toLocaleString()}
        </span>
      </div>

      {/* Top brand preview */}
      {result.brands[0] && (
        <div className="rounded-xl border border-sauna-ash bg-white p-5 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-sauna-stone">
            Top pick
          </p>
          <p className="mt-1 font-display text-xl text-sauna-ink">
            {result.brands[0].name}
          </p>
          {result.brands[0].bestFor && (
            <p className="mt-1 text-sm text-sauna-slate">
              {result.brands[0].bestFor}
            </p>
          )}
        </div>
      )}

      {/* Email gate or full results */}
      {!isUnlocked ? (
        <>
          {/* Blurred preview */}
          <div className="relative">
            <div className="pointer-events-none select-none blur-[8px]">
              <GatedContent result={result} />
            </div>
            <div className="absolute inset-0 flex items-start justify-center pt-8">
              <div className="w-full max-w-md">
                <QuizEmailGate answers={answers} onUnlock={onUnlock} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <GatedContent result={result} />
          <QuizShareButton answers={answers} />
          <SoftNewsletterNote />
        </>
      )}
    </div>
  )
}

function GatedContent({ result }: { result: QuizResult }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Brand comparison */}
      <div>
        <h3 className="font-display text-xl text-sauna-ink mb-4">
          Brand comparison
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {result.brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/sauna-brands/${brand.slug}`}
              className="rounded-xl border border-sauna-ash bg-white p-4 transition-colors hover:border-sauna-oak"
            >
              <div className="flex items-center gap-3">
                {brand.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-8 w-8 object-contain"
                  />
                )}
                <div>
                  <p className="font-medium text-sauna-ink">{brand.name}</p>
                  {brand.priceTier && (
                    <p className="text-xs capitalize text-sauna-stone">{brand.priceTier}</p>
                  )}
                </div>
              </div>
              {brand.buyerVerdict && (
                <p className="mt-3 text-sm text-sauna-slate">{brand.buyerVerdict}</p>
              )}
              {brand.keyModels && brand.keyModels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {brand.keyModels.slice(0, 3).map((model) => (
                    <span
                      key={model}
                      className="rounded-full bg-sauna-linen px-2 py-0.5 text-xs text-sauna-slate"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Installation checklist */}
      <div>
        <h3 className="font-display text-xl text-sauna-ink mb-3">
          Installation checklist
        </h3>
        <ul className="space-y-2">
          {result.installNotes.map((note, i) => (
            <li key={i} className="flex gap-3 text-sm text-sauna-slate">
              <span className="mt-0.5 text-sauna-oak">&#10003;</span>
              {note}
            </li>
          ))}
        </ul>
      </div>

      {/* Next steps */}
      <div>
        <h3 className="font-display text-xl text-sauna-ink mb-3">
          What to do next
        </h3>
        <ol className="space-y-2">
          {result.nextSteps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-sauna-slate">
              <span className="mt-0.5 font-medium text-sauna-ink">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Common mistakes */}
      <div className="rounded-xl border border-sauna-ash bg-sauna-linen p-5">
        <h3 className="font-display text-lg text-sauna-ink mb-2">
          What most people get wrong
        </h3>
        <ul className="space-y-1.5 text-sm text-sauna-slate">
          {getCommonMistakes(result.type).map((mistake, i) => (
            <li key={i}>- {mistake}</li>
          ))}
        </ul>
      </div>

      {/* Related guides */}
      <div>
        <h3 className="font-display text-xl text-sauna-ink mb-3">
          Keep reading
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/guides/ultimate-home-sauna-buying-guide"
            className="rounded-lg border border-sauna-ash bg-white p-4 text-sm text-sauna-ink transition-colors hover:border-sauna-oak"
          >
            The Complete Home Sauna Buying Guide
          </Link>
          <Link
            href="/guides"
            className="rounded-lg border border-sauna-ash bg-white p-4 text-sm text-sauna-ink transition-colors hover:border-sauna-oak"
          >
            All Sauna Guides
          </Link>
        </div>
      </div>
    </div>
  )
}

function getCommonMistakes(type: string): string[] {
  if (type.includes('infrared')) {
    return [
      'Choosing the cheapest panel (low-EMF certification matters)',
      'Putting it in a room with no airflow at all',
      'Expecting traditional sauna temperatures (infrared runs cooler)',
      'Not checking the warranty covers both panels and wood',
    ]
  }
  if (type.includes('barrel') || type.includes('outdoor')) {
    return [
      'Skipping the foundation (settling cracks the barrel)',
      'Not treating the exterior wood before first use',
      'Placing it too close to fences or structures',
      'Forgetting drainage planning for rain and snowmelt',
    ]
  }
  return [
    'Undersizing the heater for the room volume',
    'Skipping the vapor barrier (leads to moisture damage)',
    'Not planning ventilation before building',
    'Buying before getting an electrician quote',
  ]
}

function SoftNewsletterNote() {
  return (
    <p className="text-center text-xs text-sauna-stone">
      Your first Thursday letter is on its way. One email a week - why heat heals, where to find it, and five minutes of stillness.
    </p>
  )
}
