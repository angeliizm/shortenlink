/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      // Ensure internal analytics API stays within Next.js
      {
        source: '/api/analytics/:path*',
        destination: '/api/analytics/:path*',
      },
      {
        source: '/api/analytics/export/:path*',
        destination: '/api/analytics/export/:path*',
      },
      // Generic external API proxy (keep last)
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig