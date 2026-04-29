/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'clinique-rebecca-api.onrender.com' },
      { protocol: 'https', hostname: '**.onrender.com' },
      { protocol: 'http',  hostname: 'localhost' },
    ],
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
          // camera/microphone autorisés pour les consultations vidéo (Jitsi)
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
          // CSP de base — adapter si besoin de CDN supplémentaires
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://meet.jit.si",
              "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
              "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://clinique-rebecca-api.onrender.com https://meet.jit.si wss://meet.jit.si",
              "frame-src 'self' https://meet.jit.si",
              "media-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ]
  },

  // API proxy rewrites — évite les erreurs CORS en production (Vercel → Render)
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://clinique-rebecca-api.onrender.com'
    // Strip trailing /api if present to avoid double /api/api
    const base = backendUrl.replace(/\/api\/?$/, '')
    return [
      {
        source: '/api/:path*',
        destination: `${base}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
