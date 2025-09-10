/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  // Removed rewrites to fix Vercel deployment issues
  // All API routes are now handled internally by Next.js
}

module.exports = nextConfig