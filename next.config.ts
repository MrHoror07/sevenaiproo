import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  images: {
    domains: ['localhost', 'vercel.app'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
