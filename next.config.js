/** @type {import('next').NextConfig} */
const BACKEND = 'https://clinique-rebecca-api.onrender.com'

const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },

  // Rewrite: /api/* → backend/* (plus fiable que catch-all sur Vercel)
  // Exclut /api/ai qui est géré par la route Next.js locale
  async rewrites() {
    return {
      beforeFiles: [
        // La route /api/ai est gérée localement — ne pas la rediriger
        // Toutes les autres routes /api/* vont vers le backend
        {
          source: '/api/:path((?!ai$|ai/).*)',
          destination: `${BACKEND}/api/:path`,
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
