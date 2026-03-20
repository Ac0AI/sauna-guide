'use client'

import { useState } from 'react'
import posthog from 'posthog-js'

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('https://saunaguide.com/challenge')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      posthog.capture('challenge_link_copied')
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = 'https://saunaguide.com/challenge'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      posthog.capture('challenge_link_copied')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="px-8 py-4 bg-sauna-ink text-sauna-paper font-medium rounded-xl hover:bg-sauna-charcoal transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
    >
      {copied ? '✓ Link Copied!' : 'Copy Link to Share'}
    </button>
  )
}
