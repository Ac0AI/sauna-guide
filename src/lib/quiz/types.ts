export type QuizStep = 'intro' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'results'

export interface QuizAnswers {
  motivation?: 'health' | 'relaxation' | 'social' | 'cold-contrast'
  placement?: 'indoor' | 'outdoor'
  capacity?: '1-2' | '3-4' | '5+'
  heatType?: 'traditional' | 'infrared' | 'open-to-both'
  budget?: '3k-5k' | '5k-10k' | '10k-15k' | '15k+'
  timeline?: 'researching' | 'within-3-months' | 'ready-now'
  priority?: 'design' | 'performance' | 'value' | 'trust'
}

export interface RecommendedBrand {
  name: string
  slug: string
  logo?: string
  bestFor?: string
  keyModels?: string[]
  buyerVerdict?: string
  priceTier?: string
}

export interface QuizResult {
  type: string
  headline: string
  reasoning: string
  brands: RecommendedBrand[]
  costRange: { low: number; high: number }
  nextSteps: string[]
  installNotes: string[]
}

export interface QuizOption {
  value: string
  label: string
  description?: string
  icon: string
  pros?: string[]
  cons?: string[]
}

export interface QuizQuestion {
  id: QuizStep
  answerKey: keyof QuizAnswers
  title: string
  subtitle?: string
  options: QuizOption[]
}
