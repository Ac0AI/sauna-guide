'use client'

import { useState } from 'react'

interface NewsletterSignupProps {
  variant?: 'hero' | 'inline' | 'minimal'
  className?: string
}

export function NewsletterSignup({ variant = 'hero', className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Welcome! Check your inbox.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className={`${className}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-5 py-3.5 bg-sauna-paper border border-sauna-ash
                       rounded-lg text-sauna-ink placeholder:text-sauna-stone
                       focus:outline-none focus:ring-2 focus:ring-sauna-oak/30 focus:border-sauna-oak
                       transition-all duration-300"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3.5 bg-sauna-ink text-sauna-paper font-medium rounded-lg
                       hover:bg-sauna-charcoal transition-colors duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Joining...
              </span>
            ) : 'Join Free'}
          </button>
        </div>
        {message && (
          <p className={`mt-3 text-sm ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </form>
    )
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`${className}`}>
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="flex-1 px-5 py-3.5 bg-sauna-paper border border-sauna-ash
                       rounded-lg text-sauna-ink placeholder:text-sauna-stone
                       focus:outline-none focus:ring-2 focus:ring-sauna-oak/30 focus:border-sauna-oak
                       transition-all duration-300"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-8 py-3.5 bg-sauna-ink text-sauna-paper font-medium rounded-lg
                       hover:bg-sauna-charcoal transition-colors duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
        {message && (
          <p className={`mt-4 text-center text-sm ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </form>
    )
  }

  // Hero variant (default)
  return (
    <form onSubmit={handleSubmit} className={`max-w-xl mx-auto ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-6 py-4 bg-sauna-paper/95 backdrop-blur-sm border border-sauna-paper/50
                       rounded-xl text-sauna-ink placeholder:text-sauna-stone text-base
                       focus:outline-none focus:ring-2 focus:ring-sauna-sand/50 focus:border-sauna-sand
                       transition-all duration-300 shadow-lg"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-8 py-4 bg-sauna-paper text-sauna-ink font-medium text-base rounded-xl
                     hover:bg-sauna-linen transition-colors duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg hover:shadow-xl"
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Joining...
            </span>
          ) : 'Join Free'}
        </button>
      </div>

      {message && (
        <p className={`mt-4 text-center text-sm ${status === 'success' ? 'text-green-300' : 'text-red-300'}`}>
          {message}
        </p>
      )}

      <p className="mt-5 text-sm text-sauna-birch/70 flex items-center justify-center gap-4">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-sauna-sand" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Free weekly
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-sauna-sand" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Unsubscribe anytime
        </span>
      </p>
    </form>
  )
}
