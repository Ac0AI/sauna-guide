import Link from 'next/link'

interface QuizCTAProps {
  variant: 'inline' | 'sidebar' | 'end'
}

export default function QuizCTA({ variant }: QuizCTAProps) {
  if (variant === 'sidebar') {
    return (
      <div className="rounded-xl border border-sauna-ash bg-sauna-linen p-5">
        <p className="font-display text-lg text-sauna-ink">Still deciding?</p>
        <p className="mt-1 text-sm text-sauna-slate">
          Answer 7 questions. Get your personalized recommendation.
        </p>
        <Link
          href={`/quiz?utm_source=guide&utm_content=sidebar`}
          className="mt-3 inline-block rounded-lg bg-sauna-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sauna-charcoal"
        >
          Take the quiz
        </Link>
      </div>
    )
  }

  if (variant === 'end') {
    return (
      <div className="my-8 rounded-2xl border border-sauna-ash bg-white p-6 md:p-8 text-center">
        <p className="font-display text-2xl md:text-3xl text-sauna-ink">
          You&apos;ve done the research.
        </p>
        <p className="mt-2 text-lg text-sauna-slate">
          Get your recommendation.
        </p>
        <Link
          href={`/quiz?utm_source=guide&utm_content=end`}
          className="mt-4 inline-block rounded-lg bg-sauna-ink px-6 py-3 font-medium text-white transition-colors hover:bg-sauna-charcoal"
        >
          Answer 7 questions
        </Link>
      </div>
    )
  }

  // inline
  return (
    <div className="my-6 rounded-xl border border-sauna-ash bg-sauna-linen p-5">
      <p className="text-sm font-medium text-sauna-ink">
        Not sure which type fits your space?{' '}
        <Link
          href={`/quiz?utm_source=guide&utm_content=inline`}
          className="underline underline-offset-2 text-sauna-oak hover:text-sauna-walnut"
        >
          Answer 7 questions
        </Link>
        {' '}and get a personalized recommendation.
      </p>
    </div>
  )
}
