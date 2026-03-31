/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'admin.jabnom.com',
      },
      {
        protocol: 'http',
        hostname: 'admin.jabnom.com',
      }
    ],
  },
};

export default nextConfig;
