import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const baseUrl = 'https://sauna.guide'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Sauna Guide - Discover the Art of Heat & Wellness',
    template: '%s | Sauna Guide',
  },
  description: 'Your complete guide to saunas worldwide. Discover authentic sauna experiences and science-backed protocols for longevity and performance.',
  keywords: ['sauna', 'sauna guide', 'sauna directory', 'Finnish sauna', 'contrast therapy', 'cold plunge', 'wellness', 'heat therapy'],
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Sauna Guide',
    title: 'Sauna Guide - Discover the Art of Heat & Wellness',
    description: 'Your complete guide to saunas worldwide. Discover authentic sauna experiences and science-backed protocols.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sauna Guide - The Art of Heat & Wellness',
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
      description: 'Your complete guide to saunas worldwide. Discover authentic sauna experiences and science-backed protocols.',
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}#website`,
      url: baseUrl,
      name: 'Sauna Guide',
      publisher: { '@id': `${baseUrl}#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/guides?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'en-US',
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
      </body>
    </html>
  )
}
