/** @type {import('next').NextConfig} */
const basePath = process.env.APP_BASE_PATH?.trim() ?? "/test";
const nextConfig = {
  reactStrictMode: true,
  basePath,
  env: {
    APP_BASE_PATH: basePath,
    NEXT_PUBLIC_APP_BASE_PATH: basePath,
    APP_PORT: 8000,
  },
};

module.exports = nextConfig