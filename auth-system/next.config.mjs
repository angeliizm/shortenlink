/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    // Type checking is done in separate step during CI/CD
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint is run in separate step during CI/CD
    ignoreDuringBuilds: false,
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  // Environment variables that should be available on the client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Compress responses
  compress: true,
  // Power by header
  poweredByHeader: false,
  // Trailing slash
  trailingSlash: false,
  // React strict mode
  reactStrictMode: true,
  // SWC minifier
  swcMinify: true,
  // Image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  // Rewrites for API calls (if needed)
  async rewrites() {
    return [
      // Example: proxy API calls to backend during development
      // {
      //   source: '/api/:path*',
      //   destination: 'http://localhost:8080/api/:path*',
      // },
    ]
  },
}

export default nextConfig