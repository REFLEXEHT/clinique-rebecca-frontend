/** @type {import('next').NextConfig} */
const nextConfig = {
  // Nécessaire pour Vercel — output standalone pour Docker/Render
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,

  // Variables d'environnement exposées au navigateur
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.onrender.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },

  // Proxy API calls vers le backend en production (évite CORS)
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
