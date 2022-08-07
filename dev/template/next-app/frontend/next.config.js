/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  basePath: process.env.APP_BASE_PATH?.trim() ?? "",
  env: {
    NEXT_PUBLIC_API_BASE_URL: `${process.env.API_HOSTNAME?.trim() || "localhost"}:${process.env.API_PORT?.trim() || "8000"}${process.env.API_BASE_PATH?.trim() || ""}`,
  }
};

module.exports = nextConfig