/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow API routes to have longer execution time for model inference
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Configure webpack to handle ONNX Runtime native bindings
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize onnxruntime-node completely - don't try to bundle it
      // It will be loaded at runtime as a native module
      config.externals = config.externals || []
      config.externals.push('onnxruntime-node')
    }
    
    // Don't try to bundle native modules on client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    
    return config
  },
}

module.exports = nextConfig
