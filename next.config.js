/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore specific folders from compilation
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(ext => 
    !ext.includes('agents/') && !ext.includes('data/') && !ext.includes('data/') && !ext.includes('e2e/')
  ),
  // Ignore TypeScript errors for now
  typescript: {
    ignoreBuildErrors: true
  },
  // Ignore ESLint errors for now
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: (config) => {
    // Handle ESM modules
    config.experiments = { ...config.experiments, topLevelAwait: true };
    
    // Add fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false
    };

    return config;
  }
};

export default nextConfig;