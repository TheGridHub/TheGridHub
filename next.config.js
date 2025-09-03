/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for server deployment
  output: 'standalone',
  
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

module.exports = nextConfig

