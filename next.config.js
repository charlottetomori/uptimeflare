/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'p.weizwz.com',
      },
      {
        protocol: 'https',
        hostname: 'image.thum.io',
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
    },
  })
}
