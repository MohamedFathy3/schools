import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["ofessionalacademyedu.com"],
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://back.professionalacademyedu.com/api/:path*', // عنوان الـ backend
      },
    ]
  },
};

export default nextConfig;
