import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/gear',
        destination: '/accessories',
        permanent: true,
      },
      {
        source: '/gear/:slug',
        destination: '/accessories/:slug',
        permanent: true,
      },
      {
        source: '/guides/which-home-sauna',
        destination: '/quiz',
        permanent: true,
      },
    ]
  },
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
