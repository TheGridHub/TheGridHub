const path = require('path');

/** @type {import('next').NextConfig} */
const baseConfig = {
  // Standalone output for server deployment
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.clerk.dev'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'thegridhub.co', '*.thegridhub.co'],
    },
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.puter.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https: https://api.openai.com https://graph.microsoft.com https://slack.com https://www.googleapis.com https://*.supabase.co",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ]
  },
  // Remove X-Powered-By header for security
  poweredByHeader: false,
}

// Optional bundle analyzer support
let withBundleAnalyzer = null
try {
  // Only enable when ANALYZE=true and package is installed
  const analyzerFactory = require('@next/bundle-analyzer')
  withBundleAnalyzer = analyzerFactory({ enabled: process.env.ANALYZE === 'true' })
} catch (_) {
  // Analyzer not installed; skip without failing builds
}

const nextConfig = withBundleAnalyzer ? withBundleAnalyzer(baseConfig) : baseConfig

module.exports = nextConfig

