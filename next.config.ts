import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    unoptimized: true,
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
