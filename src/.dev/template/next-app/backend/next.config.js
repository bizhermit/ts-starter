/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  basePath: process.env.API_BASE_PATH?.trim() ?? ""
};

module.exports = nextConfig