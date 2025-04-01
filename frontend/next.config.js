const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-leaflet', 'leaflet'],
  i18n,
  images: {
    domains: ['localhost', 'api.bezbarierny.gov.ua'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:80'}/api/:path*`,
      },
    ];
  },
  experimental: {
    esmExternals: 'loose',
  },
  // Додайте цей параметр для створення standalone-версії
  output: 'standalone',
};

module.exports = nextConfig;