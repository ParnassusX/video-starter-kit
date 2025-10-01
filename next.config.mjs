/** @type {import('next').NextConfig} */
const nextConfig = {
  // No experimental features needed
  experimental: {},
  // Optimize image handling
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Transpile specific modules
  transpilePackages: [
    '@fal-ai/client',
    'remotion',
    '@remotion/player',
    '@remotion/media-utils',
  ],
}

export default nextConfig;
