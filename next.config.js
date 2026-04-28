/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://clinique-rebecca-api.onrender.com'
    const base = backendUrl.replace(/\/api\/?$/, '')

    return {
      // FIX: "beforeFiles" → les routes API Next.js internes (/api/translate etc.)
      // sont résolues EN PREMIER et ne passent PAS par le proxy backend.
      // "afterFiles" → seulement si aucune route Next.js ne matche, on proxifie.
      beforeFiles: [],
      afterFiles: [
        {
          source: '/api/:path*',
          destination: `${base}/api/:path*`,
        },
      ],
      fallback: [],
    }
  },
}

module.exports = nextConfig
