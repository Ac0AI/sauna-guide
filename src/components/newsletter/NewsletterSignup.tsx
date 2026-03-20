'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'

interface NewsletterSignupProps {
  variant?: 'hero' | 'inline' | 'minimal' | 'buying-guide' | 'buying-guide-hero'
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
  const isBuyingGuide = variant === 'buying-guide' || variant === 'buying-guide-hero'
  const effectiveSource = source !== 'newsletter' ? source : (isBuyingGuide ? 'buying-guide' : source)
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
        body: JSON.stringify({ email, source: effectiveSource }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setEmail('')

        posthog.identify(email, { email })
        posthog.capture('newsletter_subscribed', {
          source: effectiveSource,
          variant,
        })

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
        posthog.capture('newsletter_subscription_failed', {
          source: effectiveSource,
          variant,
          error: data.error,
        })
      }
    } catch (err) {
      setStatus('error')
      setMessage('Network error. Please try again.')
      posthog.captureException(err)
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
            <h3 className="text-2xl font-display font-medium text-sauna-ink mb-3">You&apos;re on the list.</h3>
            <p className="text-sauna-slate mb-8 text-lg leading-relaxed">
                Research shows you are <strong>80% more likely</strong> to finish the protocol if you do it with a friend.
            </p>
            
            <button 
              onClick={() => {
                  const url = typeof window !== 'undefined' ? window.location.href : 'https://sauna.guide/challenge';
                  navigator.clipboard.writeText(`Join me for the 30-Day Sauna Reset: ${url}`);
                  setMessage("Link copied to clipboard!");
                  posthog.capture('challenge_invite_link_copied')
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
                I&apos;ll do it alone →
            </button>
        </div>
    )
  }

  if (variant === 'buying-guide-hero') {
    return (
      <form onSubmit={handleSubmit} className={`max-w-xl mx-auto ${className}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-6 py-4 bg-sauna-paper/95 backdrop-blur-xs border border-sauna-paper/50
                       rounded-xl text-sauna-ink placeholder:text-sauna-stone text-base
                       focus:outline-hidden focus:ring-2 focus:ring-sauna-sand/50 focus:border-sauna-sand
                       transition-all duration-300 shadow-lg"
          />
          {/* Outer glow wrapper */}
          <div className="relative group rounded-xl whitespace-nowrap
                          hover:scale-[1.02] active:scale-[0.98] transition-transform duration-500">
            {/* Spinning conic gradient border - the "molten metal" ring */}
            <div className="absolute -inset-[2px] rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-[conic-gradient(#5C4033_0%,#C8843C_20%,#E8B86D_35%,#FFF1D0_45%,#E8B86D_55%,#C8843C_70%,#5C4033_100%)]
                              animate-spin-slow opacity-75 group-hover:opacity-100
                              transition-opacity duration-500" />
            </div>
            {/* Grinding spark - contact point with particle spray */}
            <div className="absolute inset-0 animate-orbit-spark pointer-events-none">
              {/* Hot contact point */}
              <div className="absolute -top-0.5 left-1/2 w-1.5 h-1.5 bg-white rounded-full
                              shadow-[0_0_4px_2px_rgba(255,220,80,0.9),0_0_12px_4px_rgba(232,184,109,0.4)]" />
              {/* Particle spray - tiny fast sparks */}
              <div className="absolute -top-0.5 left-1/2 w-[3px] h-[3px] bg-amber-200 rounded-full [animation:sp1_0.35s_ease-out_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[2px] h-[2px] bg-white rounded-full [animation:sp2_0.3s_ease-out_0.05s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[3px] h-[3px] bg-yellow-300 rounded-full [animation:sp3_0.4s_ease-out_0.1s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[2px] h-[2px] bg-amber-100 rounded-full [animation:sp4_0.32s_ease-out_0.15s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[2px] h-[2px] bg-orange-300 rounded-full [animation:sp5_0.38s_ease-out_0.08s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[3px] h-[3px] bg-white rounded-full [animation:sp6_0.33s_ease-out_0.2s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[2px] h-[2px] bg-yellow-200 rounded-full [animation:sp7_0.36s_ease-out_0.12s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[2px] h-[2px] bg-amber-300 rounded-full [animation:sp8_0.42s_ease-out_0.03s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[3px] h-[3px] bg-white/80 rounded-full [animation:sp9_0.3s_ease-out_0.18s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[2px] h-[2px] bg-amber-100 rounded-full [animation:sp10_0.34s_ease-out_0.07s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[2px] h-[2px] bg-yellow-100 rounded-full [animation:sp11_0.28s_ease-out_0.22s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[3px] h-[3px] bg-orange-200 rounded-full [animation:sp12_0.37s_ease-out_0.13s_infinite]" />
            </div>
            {/* Outer ambient glow */}
            <div className="absolute -inset-1.5 rounded-xl bg-amber-500/15 blur-lg
                            animate-glow group-hover:bg-amber-500/25" />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="relative px-8 py-4 font-medium text-base rounded-xl
                         overflow-hidden transition-all duration-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Darker warm gradient base */}
              <span className="absolute inset-0 bg-gradient-to-r from-sauna-bark via-sauna-walnut to-sauna-bark" />
              {/* Shimmer overlay */}
              <span className="absolute inset-0 bg-[length:200%_100%] animate-shimmer
                               bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              {/* Text */}
              <span className="relative text-white drop-shadow-sm">
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : 'Send me the guide'}
              </span>
            </button>
          </div>
        </div>
        {message && (
          <p className={`mt-4 text-center text-sm ${status === 'success' ? 'text-green-300' : 'text-red-300'}`}>
            {message}
          </p>
        )}
      </form>
    )
  }

  if (variant === 'buying-guide') {
    return (
      <form onSubmit={handleSubmit} className={`w-full ${className}`}>
        <div className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="w-full px-5 py-3.5 bg-sauna-paper border border-sauna-ash
                       rounded-lg text-sauna-ink placeholder:text-sauna-stone
                       focus:outline-hidden focus:ring-2 focus:ring-sauna-oak/30 focus:border-sauna-oak
                       transition-all duration-300"
          />
          {/* Outer glow wrapper */}
          <div className="relative group rounded-lg w-full
                          hover:scale-[1.02] active:scale-[0.98] transition-transform duration-500">
            {/* Spinning metal border */}
            <div className="absolute -inset-[2px] rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-[conic-gradient(#5C4033_0%,#C8843C_20%,#E8B86D_35%,#FFF1D0_45%,#E8B86D_55%,#C8843C_70%,#5C4033_100%)]
                              animate-spin-slow" />
            </div>
            {/* Grinding spark - contact point with particle spray */}
            <div className="absolute inset-0 animate-orbit-spark pointer-events-none">
              {/* Hot contact point */}
              <div className="absolute -top-0.5 left-1/2 w-1.5 h-1.5 bg-white rounded-full
                              shadow-[0_0_4px_2px_rgba(255,220,80,0.9),0_0_12px_4px_rgba(232,184,109,0.4)]" />
              {/* Particle spray - tiny fast sparks */}
              <div className="absolute -top-0.5 left-1/2 w-[3px] h-[3px] bg-amber-200 rounded-full [animation:sp1_0.35s_ease-out_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[2px] h-[2px] bg-white rounded-full [animation:sp2_0.3s_ease-out_0.05s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[3px] h-[3px] bg-yellow-300 rounded-full [animation:sp3_0.4s_ease-out_0.1s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[2px] h-[2px] bg-amber-100 rounded-full [animation:sp4_0.32s_ease-out_0.15s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[2px] h-[2px] bg-orange-300 rounded-full [animation:sp5_0.38s_ease-out_0.08s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[3px] h-[3px] bg-white rounded-full [animation:sp6_0.33s_ease-out_0.2s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[2px] h-[2px] bg-yellow-200 rounded-full [animation:sp7_0.36s_ease-out_0.12s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[2px] h-[2px] bg-amber-300 rounded-full [animation:sp8_0.42s_ease-out_0.03s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[3px] h-[3px] bg-white/80 rounded-full [animation:sp9_0.3s_ease-out_0.18s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[2px] h-[2px] bg-amber-100 rounded-full [animation:sp10_0.34s_ease-out_0.07s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[2px] h-[2px] bg-yellow-100 rounded-full [animation:sp11_0.28s_ease-out_0.22s_infinite]" />
              <div className="absolute -top-0.5 left-1/2 w-[3px] h-[3px] bg-orange-200 rounded-full [animation:sp12_0.37s_ease-out_0.13s_infinite]" />
            </div>
            {/* Ambient glow */}
            <div className="absolute -inset-1.5 rounded-lg bg-amber-500/15 blur-lg animate-glow" />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="relative w-full px-8 py-3.5 font-medium rounded-lg
                         overflow-hidden transition-all duration-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-sauna-bark via-sauna-walnut to-sauna-bark" />
              <span className="absolute inset-0 bg-[length:200%_100%] animate-shimmer
                               bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <span className="relative text-white drop-shadow-sm">
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : 'Send me the guide'}
              </span>
            </button>
          </div>
        </div>
        {message && (
          <p className={`mt-4 text-center text-sm ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </form>
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
                       focus:outline-hidden focus:ring-2 focus:ring-sauna-oak/30 focus:border-sauna-oak
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
                       focus:outline-hidden focus:ring-2 focus:ring-sauna-oak/30 focus:border-sauna-oak
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
            className="w-full px-6 py-4 bg-sauna-paper/95 backdrop-blur-xs border border-sauna-paper/50
                       rounded-xl text-sauna-ink placeholder:text-sauna-stone text-base
                       focus:outline-hidden focus:ring-2 focus:ring-sauna-sand/50 focus:border-sauna-sand
                       transition-all duration-300 shadow-lg"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="group relative px-8 py-4 font-medium text-base rounded-xl
                     overflow-hidden transition-all duration-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg hover:shadow-2xl hover:shadow-sauna-ember/25
                     hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Warm gradient base */}
          <span className="absolute inset-0 bg-gradient-to-r from-sauna-ember via-sauna-glow to-sauna-ember" />
          {/* Shimmer overlay */}
          <span className="absolute inset-0 bg-[length:200%_100%] animate-shimmer
                           bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          {/* Soft glow pulse */}
          <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                           transition-opacity duration-500
                           shadow-[inset_0_0_20px_rgba(212,165,116,0.3)]" />
          {/* Text */}
          <span className="relative text-white drop-shadow-sm">
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Opening...
              </span>
            ) : 'Step inside →'}
          </span>
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