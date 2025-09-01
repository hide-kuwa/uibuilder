import path from 'node:path';
import { fileURLToPath } from 'node:url';

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure tracing root points to repo root in monorepo
  outputFileTracingRoot: path.join(__dirname, '..'),
  experimental: { externalDir: true },

  webpack: (config) => {
    // Keep aliases aligned to your actual paths
    config.resolve.alias = {
      ...config.resolve.alias,
      '@core': path.resolve(__dirname, 'core'),
      '@core/action-bus': path.resolve(__dirname, 'core/action-bus'),
      '@domain-components': path.resolve(__dirname, 'components/domain'),
      '@data': path.resolve(__dirname, 'data'),
    };
    return config;
  },
  // If needed, transpile local workspace packages explicitly
  // transpilePackages: ['@repo/types','@repo/builder-core','@repo/comp-basics','@repo/comp-maps-jp'],
};

export default nextConfig;
