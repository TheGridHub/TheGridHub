const path = require('path');

/** @type {import('next').NextConfig} */
const baseConfig = {
  // Standalone output for server deployment
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  
  // React strict mode for better development
  reactStrictMode: true,
  
  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Enable image optimization
    unoptimized: false,
    domains: ['images.clerk.dev', 'localhost', 'thegridhub.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
    ],
    // Supported formats for better performance
    formats: ['image/webp', 'image/avif'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for responsive images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize layout shift
    minimumCacheTTL: 86400, // 1 day
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'thegridhub.co', '*.thegridhub.co'],
      bodySizeLimit: '2mb',
    },
    // Optimize CSS loading
    optimizeCss: true,
  },
  
  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Fix Edge Runtime issues with Supabase
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\/]node_modules[\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              name: 'common',
              chunks: 'all',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
            ui: {
              test: /[\/]node_modules[\/](@radix-ui|lucide-react|framer-motion)[\/]/,
              name: 'ui-lib',
              chunks: 'all',
              priority: 15,
            },
          },
        },
      }
    }

    // Resolve alias for smaller bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
      'lodash': 'lodash-es',
    }

    return config
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
  
  // External packages for server components
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/ssr', '@prisma/client'],
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

