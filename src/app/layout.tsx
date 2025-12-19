import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Sauna Guide - Discover the Art of Heat & Wellness',
    template: '%s | Sauna Guide',
  },
  description: 'Your complete guide to saunas worldwide. Discover authentic sauna experiences, learn time-tested techniques, and join a community of 10,000+ wellness enthusiasts.',
  keywords: ['sauna', 'sauna guide', 'sauna directory', 'Finnish sauna', 'contrast therapy', 'cold plunge', 'wellness', 'heat therapy'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sauna.guide',
    siteName: 'Sauna Guide',
    title: 'Sauna Guide - Discover the Art of Heat & Wellness',
    description: 'Your complete guide to saunas worldwide. Join 10,000+ wellness enthusiasts.',
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
  },
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
      </head>
      <body className="antialiased bg-sauna-steam text-sauna-dark">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
