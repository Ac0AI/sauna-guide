'use client'

import { useReducer, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import type { QuizAnswers, QuizStep, QuizResult } from '@/lib/quiz/types'
import { quizQuestions } from '@/lib/quiz/questions'
import { getQuizResult } from '@/lib/quiz/engine'
import QuizProgress from '@/components/quiz/QuizProgress'
import QuizQuestion from '@/components/quiz/QuizQuestion'
import QuizResults from '@/components/quiz/QuizResults'

const STEPS: QuizStep[] = ['intro', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'results']
const STORAGE_KEY = 'sauna-quiz-answers'

const VALID_VALUES: Record<keyof QuizAnswers, string[]> = {
  motivation: ['health', 'relaxation', 'social', 'cold-contrast'],
  placement: ['indoor', 'outdoor'],
  capacity: ['1-2', '3-4', '5+'],
  heatType: ['traditional', 'infrared', 'open-to-both'],
  budget: ['3k-5k', '5k-10k', '10k-15k', '15k+'],
  timeline: ['researching', 'within-3-months', 'ready-now'],
  priority: ['design', 'performance', 'value', 'trust'],
}

function sanitizeAnswers(raw: unknown): QuizAnswers | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const answers: QuizAnswers = {}
  const obj = raw as Record<string, unknown>

  for (const [key, validOptions] of Object.entries(VALID_VALUES)) {
    const val = obj[key]
    if (typeof val === 'string' && validOptions.includes(val)) {
      (answers as Record<string, string>)[key] = val
    }
  }

  return Object.keys(answers).length > 0 ? answers : null
}

interface QuizState {
  step: QuizStep
  answers: QuizAnswers
  result: QuizResult | null
  isUnlocked: boolean
  direction: 'forward' | 'backward'
}

type QuizAction =
  | { type: 'ANSWER'; key: keyof QuizAnswers; value: string }
  | { type: 'GO_BACK' }
  | { type: 'START' }
  | { type: 'UNLOCK' }
  | { type: 'RESTORE'; answers: QuizAnswers; step: QuizStep }
  | { type: 'LOAD_RESULTS'; answers: QuizAnswers; unlocked: boolean }

function reducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START':
      return { ...state, step: 'q1', direction: 'forward' }

    case 'ANSWER': {
      const newAnswers = { ...state.answers, [action.key]: action.value } as QuizAnswers
      const currentIndex = STEPS.indexOf(state.step)
      const nextStep = STEPS[currentIndex + 1]

      if (nextStep === 'results') {
        const result = getQuizResult(newAnswers)
        return { ...state, step: 'results', answers: newAnswers, result, direction: 'forward' }
      }

      return { ...state, step: nextStep as QuizStep, answers: newAnswers, direction: 'forward' }
    }

    case 'GO_BACK': {
      const currentIndex = STEPS.indexOf(state.step)
      if (currentIndex <= 1) return state
      const prevStep = STEPS[currentIndex - 1]
      return { ...state, step: prevStep as QuizStep, result: null, direction: 'backward' }
    }

    case 'UNLOCK':
      return { ...state, isUnlocked: true }

    case 'RESTORE':
      return { ...state, step: action.step, answers: action.answers, direction: 'forward' }

    case 'LOAD_RESULTS': {
      const result = getQuizResult(action.answers)
      return {
        ...state,
        step: 'results',
        answers: action.answers,
        result,
        isUnlocked: action.unlocked,
        direction: 'forward',
      }
    }

    default:
      return state
  }
}

export default function QuizClient() {
  const searchParams = useSearchParams()

  const [state, dispatch] = useReducer(reducer, {
    step: 'intro',
    answers: {},
    result: null,
    isUnlocked: false,
    direction: 'forward' as const,
  })

  // Load shared results from URL or saved progress from sessionStorage
  useEffect(() => {
    const encoded = searchParams.get('r')
    if (encoded) {
      try {
        const parsed = JSON.parse(atob(encoded))
        const answers = sanitizeAnswers(parsed)
        if (answers) {
          dispatch({ type: 'LOAD_RESULTS', answers, unlocked: true })
          return
        }
      } catch {
        // Invalid encoded data, ignore
      }
    }

    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const answers = sanitizeAnswers(parsed)
        if (answers) {
          const filledCount = Object.keys(answers).length
          if (filledCount > 0 && filledCount < 7) {
            const resumeStep = `q${filledCount + 1}` as QuizStep
            dispatch({ type: 'RESTORE', answers, step: resumeStep })
          }
        }
      } catch {
        // Invalid saved data, ignore
      }
    }
  }, [searchParams])

  // Persist answers to sessionStorage
  useEffect(() => {
    if (Object.keys(state.answers).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.answers))
    }
  }, [state.answers])

  // Clear storage on unlock
  const handleUnlock = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    dispatch({ type: 'UNLOCK' })
  }, [])

  const currentStepIndex = STEPS.indexOf(state.step)
  const currentQuestion = quizQuestions.find((q) => q.id === state.step)
  const isQuestion = state.step.startsWith('q') && state.step !== 'results'
  const questionNumber = isQuestion ? parseInt(state.step.replace('q', ''), 10) : 0

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-16">
      {/* Progress dots */}
      {isQuestion && <QuizProgress current={questionNumber} />}

      {/* Slide container */}
      <div
        key={state.step}
        className="animate-fade-up"
        style={{ animationDuration: '200ms' }}
      >
        {/* Intro */}
        {state.step === 'intro' && (
          <div className="flex flex-col items-center gap-8 text-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-sauna-oak">
                Home Sauna Configurator
              </p>
              <h1 className="mt-3 font-display text-4xl md:text-5xl text-sauna-ink leading-tight">
                Which home sauna is right for you?
              </h1>
              <p className="mt-4 text-lg text-sauna-slate max-w-lg mx-auto">
                Answer 7 questions. Get a personalized recommendation - type, brand, budget, and installation checklist.
              </p>
            </div>
            <button
              onClick={() => dispatch({ type: 'START' })}
              className="rounded-lg bg-sauna-ink px-8 py-3.5 font-medium text-white transition-colors hover:bg-sauna-charcoal"
            >
              Find my sauna
            </button>
            <p className="text-xs text-sauna-stone">Takes about 2 minutes. No signup required.</p>
          </div>
        )}

        {/* Questions */}
        {currentQuestion && (
          <div>
            <QuizQuestion
              question={currentQuestion}
              selected={state.answers[currentQuestion.answerKey]}
              onSelect={(value) => {
                // Tap-to-advance with small delay
                setTimeout(() => {
                  dispatch({
                    type: 'ANSWER',
                    key: currentQuestion.answerKey,
                    value,
                  })
                }, 200)
              }}
            />
          </div>
        )}

        {/* Results */}
        {state.step === 'results' && state.result && (
          <QuizResults
            result={state.result}
            answers={state.answers}
            isUnlocked={state.isUnlocked}
            onUnlock={handleUnlock}
          />
        )}
      </div>

      {/* Back button */}
      {currentStepIndex > 1 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => dispatch({ type: 'GO_BACK' })}
            className="text-sm text-sauna-stone transition-colors hover:text-sauna-ink"
          >
            &larr; Back
          </button>
        </div>
      )}
    </div>
  )
}
