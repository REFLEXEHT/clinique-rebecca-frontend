/** @type {import('next').NextConfig} */
const BACKEND = 'https://clinique-rebecca-api.onrender.com'

const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },

  async rewrites() {
    return {
      // afterFiles: vérifie d'abord les routes Next.js (app/api/ai/route.ts),
      // puis applique le rewrite si aucune route ne correspond.
      // Ainsi /api/ai → route locale, /api/auth/register → backend
      afterFiles: [
        {
          source: '/api/:path*',
          destination: `${BACKEND}/api/:path*`,
        },
      ],
    }
  },

  // En-têtes de sécurité HTTP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection',        value: '1; mode=block' },
          { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
