/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress hydration warnings from browser extensions
  reactStrictMode: false,

  // API proxy rewrites
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://clinique-rebecca-api.onrender.com'
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
