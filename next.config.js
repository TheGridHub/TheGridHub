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
      allowedOrigins: ['localhost:3000', '*.taskwork.io'],
    },
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

