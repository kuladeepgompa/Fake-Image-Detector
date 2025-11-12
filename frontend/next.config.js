/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow API routes to have longer execution time for model inference
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Ensure Python scripts are accessible
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
    }
    return config
  },
}

module.exports = nextConfig
