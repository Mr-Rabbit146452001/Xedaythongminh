/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3000/api/:path*',
      },
      {
        source: '/images/:path*',
        destination: 'http://127.0.0.1:3000/images/:path*',
      },
      {
        source: '/products/:path*',
        destination: 'http://127.0.0.1:3000/products/:path*',
      },
    ];
  },
};

export default nextConfig;
