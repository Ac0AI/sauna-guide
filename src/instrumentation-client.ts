import posthog from 'posthog-js'

const consent = document.cookie
  .split('; ')
  .find((c) => c.startsWith('ph_consent='))
  ?.split('=')[1]

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: '/ingest',
  ui_host: 'https://eu.posthog.com',
  defaults: '2026-01-30',
  capture_exceptions: true,
  debug: process.env.NODE_ENV === 'development',
  opt_out_capturing_by_default: consent !== '1',
  persistence: consent === '1' ? 'localStorage+cookie' : 'memory',
})
