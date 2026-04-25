/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://clinique-rebecca-api.onrender.com'
    // Remove trailing /api if present to avoid doubling
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
