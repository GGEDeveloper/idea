/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Vercel optimizations
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=120',
          },
        ],
      },
    ];
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration - disable during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Output for Vercel
  output: 'standalone',
};

module.exports = nextConfig; 