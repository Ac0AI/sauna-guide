'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface NewsletterSignupProps {
  variant?: 'hero' | 'inline' | 'minimal'
  className?: string
  redirectOnSuccess?: boolean
  source?: string
}

export function NewsletterSignup({
  variant = 'hero',
  className = '',
  redirectOnSuccess = true,
  source = 'newsletter'
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setEmail('')

        if (source === 'challenge') {
            setShowInvite(true)
            setMessage('') // Clear any previous messages
            return
        }

        if (redirectOnSuccess) {
          router.push('/welcome')
        } else {
          setMessage('You\'re in. Check your inbox.')
        }
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  // Invite View - Overrides form when active
  if (showInvite) {
    return (
        <div className={`bg-sauna-paper p-8 rounded-xl border border-sauna-ash shadow-lg text-center max-w-md mx-auto ${className}`}>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h3 className="text-2xl font-display font-medium text-sauna-ink mb-3">You're on the list.</h3>
            <p className="text-sauna-slate mb-8 text-lg leading-relaxed">
                Research shows you are <strong>80% more likely</strong> to finish the protocol if you do it with a friend.
            </p>
            
            <button 
              onClick={() => {
                  const url = typeof window !== 'undefined' ? window.location.href : 'https://sauna.guide/challenge';
                  navigator.clipboard.writeText(`Join me for the 30-Day Sauna Reset: ${url}`);
                  setMessage("Link copied to clipboard!");
                  // Optional: Redirect after a delay or just let them stay
                  // setTimeout(() => router.push('/welcome'), 3000); 
              }}
              className="w-full py-4 bg-sauna-ink text-sauna-paper font-medium rounded-xl hover:bg-sauna-charcoal transition-colors mb-4 flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 012 2v-8a2 2 0 01-2-2h-8a2 2 0 012 2v8a2 2 0 012 2z" />
               </svg>
               Copy Invite Link
            </button>
            
            {message && <p className="text-green-600 font-medium mb-4 animate-pulse">{message}</p>}

            <button 
              onClick={() => router.push('/welcome')}
              className="text-sauna-slate/60 hover:text-sauna-ink transition-colors text-sm font-medium"
            >
                I'll do it alone →
            </button>
        </div>
    )
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
                Opening...
              </span>
            ) : 'Step inside →'}
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
            {status === 'loading' ? 'Opening...' : 'Step inside →'}
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
              Opening...
            </span>
          ) : 'Step inside →'}
        </button>
      </div>

      {message && (
        <p className={`mt-4 text-center text-sm ${status === 'success' ? 'text-green-300' : 'text-red-300'}`}>
          {message}
        </p>
      )}

      <p className="mt-5 text-sm text-sauna-birch/60 text-center">
        Every Thursday · 5 min read · Free forever
      </p>
    </form>
  )
}