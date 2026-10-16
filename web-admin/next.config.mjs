/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Cho phép ảnh từ thư mục public/ (mặc định Next.js)
    // và ảnh remote nếu cần
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async rewrites() {
    return [
      // Proxy API calls đến Shop Server (port 3000)
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3000/api/:path*',
      },
      // Proxy /images/ đến server (nếu cần fallback)
      {
        source: '/images/:path*',
        destination: 'http://127.0.0.1:3000/images/:path*',
      },
      // KHÔNG proxy /products/ nữa — Next.js tự phục vụ từ public/products/
      // Ảnh sản phẩm đã được đồng bộ sẵn vào web-admin/public/products/
    ];
  },
};

export default nextConfig;
