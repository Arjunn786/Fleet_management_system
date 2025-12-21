/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    domains: ["localhost", "res.cloudinary.com", "images.unsplash.com"],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://18.209.221.12:5000/api",
  },
};

module.exports = nextConfig;
