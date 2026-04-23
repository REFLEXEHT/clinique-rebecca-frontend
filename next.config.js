/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://clinique-rebecca-api.onrender.com',
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.onrender.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },

  // Proxy /api/* vers le backend — résout les erreurs CORS en production
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://clinique-rebecca-api.onrender.com'
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },

  // Headers CORS pour dev local
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS,PATCH' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
