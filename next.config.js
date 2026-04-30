/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://clinique-rebecca-api.onrender.com'
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
