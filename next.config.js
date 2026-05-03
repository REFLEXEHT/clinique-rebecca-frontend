/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },
  // Proxy géré par app/api/[...path]/route.ts
  // Le rewrite n'est plus nécessaire
}
module.exports = nextConfig
