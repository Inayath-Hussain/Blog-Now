/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['blogimt.s3.amazonaws.com']
  }
}

module.exports = nextConfig
