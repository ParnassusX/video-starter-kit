/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fal.ai",
      },
    ],
  },
  transpilePackages: [
    "@fal-ai/serverless-client",
    "@fal-ai/serverless-proxy",
    "@fal-ai/serverless-react",
  ],
}

export default nextConfig
