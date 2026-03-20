'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = document.cookie
      .split('; ')
      .find((c) => c.startsWith('ph_consent='))
      ?.split('=')[1]

    if (!consent) setVisible(true)

    function onSettingsClick(e: Event) {
      const target = e.target as HTMLElement
      if (target.closest('[data-cookie-settings]')) setVisible(true)
    }
    document.addEventListener('click', onSettingsClick)
    return () => document.removeEventListener('click', onSettingsClick)
  }, [])

  function accept() {
    posthog.opt_in_capturing()
    document.cookie = 'ph_consent=1; max-age=31536000; path=/; SameSite=Lax'
    setVisible(false)
  }

  function decline() {
    posthog.opt_out_capturing()
    document.cookie = 'ph_consent=0; max-age=31536000; path=/; SameSite=Lax'
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 sm:bottom-6 sm:left-6">
      <div className="max-w-sm rounded-xl border border-sauna-bark/30 bg-sauna-dark/95 px-5 py-4 shadow-lg backdrop-blur-sm">
        <p className="text-[13px] leading-relaxed text-sauna-fog">
          <span className="mr-1.5 inline-block text-base" aria-hidden="true">🍪</span>
          Cookies help us see what works on this site. OK with that?
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={accept}
            className="text-[13px] font-medium text-sauna-cream underline decoration-sauna-cream/30 underline-offset-2 transition-colors hover:text-sauna-paper hover:decoration-sauna-cream/60"
          >
            That&apos;s fine
          </button>
          <span className="text-sauna-bark">·</span>
          <button
            onClick={decline}
            className="text-[13px] text-sauna-stone transition-colors hover:text-sauna-cream/80"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  )
}
