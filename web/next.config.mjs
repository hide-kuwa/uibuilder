import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
export default {
  experimental: { externalDir: true },
  transpilePackages: ['@repo/types','@repo/comp-maps-jp'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@core': path.resolve(__dirname, 'core'),
      '@core/action-bus': path.resolve(__dirname, 'core/action-bus'),
      '@domain-components': path.resolve(__dirname, 'components/domain'),
      '@data': path.resolve(__dirname, 'data'),
      'next-auth/react': path.resolve(__dirname, 'next-auth/react.ts'),
    };
    return config;
  },
};
