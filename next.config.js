/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore TypeScript errors for now
  typescript: {
    ignoreBuildErrors: true
  },
  // Ignore ESLint errors for now
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    serverComponentsExternalPackages: ['@coinbase/agentkit', '@langchain/anthropic', '@langchain/core', 'nillion-sv-wrappers'],
    esmExternals: true
  },
  webpack: (config, { isServer }) => {
    // Handle ESM modules
    config.experiments = { ...config.experiments, topLevelAwait: true };
    
    // Add fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false
    };

    // Improve module resolution
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
    
    // Ensure proper module resolution for @ alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': config.resolve.alias['@'] || '.'
    };

    // Add module directories for resolution
    config.resolve.modules = [
      ...config.resolve.modules || [],
      'node_modules',
      '.'
    ];

    return config;
  },
  // Ensure source maps are generated
  productionBrowserSourceMaps: true
};

export default nextConfig;