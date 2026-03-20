import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import CookieBanner from '@/components/CookieBanner'
import './globals.css'

const baseUrl = 'https://sauna.guide'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Home Sauna Buying Guide 2026 | Honest Reviews & Comparisons | Sauna Guide',
    template: '%s | Sauna Guide',
  },
  description: 'Find the perfect home sauna with our honest, expert-tested buying guides. Compare infrared, barrel & traditional saunas. Unbiased reviews since 2025.',
  keywords: ['home sauna', 'sauna buying guide', 'sauna reviews', 'home sauna cost', 'best home sauna 2026', 'sauna comparison', 'Finnish sauna', 'sauna guide'],
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Sauna Guide',
    title: 'Home Sauna Buying Guide 2026 | Honest Reviews & Comparisons | Sauna Guide',
    description: 'Find the perfect home sauna with our honest, expert-tested buying guides. Compare infrared, barrel & traditional saunas. Unbiased reviews since 2025.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Home Sauna Buying Guide 2026 - Honest Reviews & Comparisons',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sauna Guide',
    description: 'Discover the art of heat & wellness',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
}

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
      name: 'Sauna Guide',
      url: baseUrl,
      logo: `${baseUrl}/images/logo.svg`,
      email: 'mailto:saunaguide@mail.beehiiv.com',
      description: 'Your complete guide to saunas worldwide. Discover authentic sauna experiences and science-backed protocols.',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'editorial',
          email: 'saunaguide@mail.beehiiv.com',
          url: `${baseUrl}/contact`,
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}#website`,
      url: baseUrl,
      name: 'Sauna Guide',
      publisher: { '@id': `${baseUrl}#organization` },
      inLanguage: 'en-US',
      publishingPrinciples: `${baseUrl}/editorial-policy`,
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2C1810" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className="antialiased bg-sauna-steam text-sauna-dark">
        {children}
        <Analytics />
        <CookieBanner />
      </body>
    </html>
  )
}
