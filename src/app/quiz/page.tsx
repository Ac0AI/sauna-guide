import type { Metadata } from 'next'
import { Suspense } from 'react'
import QuizClient from './QuizClient'

export const metadata: Metadata = {
  title: 'Which Home Sauna Is Right for You?',
  description:
    'Answer 7 questions. Get a personalized home sauna recommendation - type, brand, budget, and installation checklist.',
  alternates: {
    canonical: 'https://sauna.guide/quiz',
  },
  openGraph: {
    title: 'Which Home Sauna Is Right for You? | Sauna Guide',
    description:
      'Answer 7 questions. Get a personalized home sauna recommendation - type, brand, budget, and installation checklist.',
    url: 'https://sauna.guide/quiz',
    type: 'website',
  },
}

export default function QuizPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Home Sauna Configurator',
    url: 'https://sauna.guide/quiz',
    description:
      'Answer 7 questions to get a personalized home sauna recommendation including type, brand, budget, and installation checklist.',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sauna Guide',
      url: 'https://sauna.guide',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-sauna-paper">
        <Suspense>
          <QuizClient />
        </Suspense>
      </main>
    </>
  )
}
