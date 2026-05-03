/** @type {import('next').NextConfig} */
// Proxy: app/api/[...path]/route.ts → clinique-rebecca-api.onrender.com
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },
  // Proxy géré par app/api/[...path]/route.ts
  // Le rewrite n'est plus nécessaire
}
module.exports = nextConfig
