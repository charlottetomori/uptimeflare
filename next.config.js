/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.thum.io',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig

if (process.env.NODE_ENV === 'development') {
  const { setupDevBindings } = require('@cloudflare/next-on-pages/next-dev')
  setupDevBindings({
    bindings: {
      UPTIMEFLARE_D1: {
        type: 'd1',
        id: 'UPTIMEFLARE_D1',
      },
      UPTIMEFLARE_CONFIG: {
        type: 'kv',
        id: 'UPTIMEFLARE_CONFIG',
      },
    },
  })
}
