/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    return config;
  },
 };
 
 
 module.exports = nextConfig;