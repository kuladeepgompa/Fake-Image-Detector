/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow API routes to have longer execution time for model inference
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Optimize output file tracing to reduce function size
    outputFileTracingExcludes: {
      // Exclude large unnecessary files from ALL routes
      '*': [
        // Exclude test files
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.test.js',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/*.spec.js',
        // Exclude documentation
        '**/*.md',
        '**/README*',
        '**/CHANGELOG*',
        '**/LICENSE*',
        // Exclude source maps
        '**/*.map',
        // Exclude development files
        '**/.next/cache/**',
        '**/.git/**',
        // Exclude model file from function bundle (it's in public/, served via CDN)
        '**/public/model.onnx',
        '**/model.onnx',
        // Exclude other platform binaries from onnxruntime-node
        // Vercel runs on Linux, so exclude darwin and win32
        'node_modules/onnxruntime-node/bin/napi-v6/darwin/**',
        'node_modules/onnxruntime-node/bin/napi-v6/win32/**',
        // Only keep Linux binaries (Vercel's platform)
        // But also exclude unnecessary architectures if possible
        'node_modules/onnxruntime-node/bin/napi-v6/linux/arm64/**', // Exclude if not needed
        // Exclude sharp platform binaries we don't need
        'node_modules/sharp/build/Release/*.node',
        '!node_modules/sharp/build/Release/sharp-linux-x64.node', // Keep only Linux x64
      ],
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
