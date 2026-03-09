import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    // Enable image optimization with modern formats
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Image sizes for responsive images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL for optimized images (in seconds)
    minimumCacheTTL: 60,
    // Disable static image imports in development for faster builds
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Experimental features for better performance
  experimental: {
    // Enable optimized package imports for faster builds
    optimizePackageImports: ['echarts', 'echarts-for-react', 'framer-motion', 'lucide-react'],
  },

  // Compress responses
  compress: true,

  // Enable strict mode for better React performance
  reactStrictMode: true,

  // Power by header (security - hide framework info)
  poweredByHeader: false,

  // Production source maps (disable for faster builds, enable for debugging)
  productionBrowserSourceMaps: false,

  // Generate ETags for caching
  generateEtags: true,

  // Output configuration
  output: 'standalone',
};

export default nextConfig;
