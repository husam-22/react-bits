import path from 'node:path';
import type { NextConfig } from 'next';

// This app is self-contained. Pin the project root so that a lockfile in a parent folder is never picked up.
const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
  // Remote preview hosts (tunnels / sandboxes) that may load dev-only assets. Has no effect in production.
  allowedDevOrigins: ['*.e2b.app', '*.e2b.dev'],
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 75, 85],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1440, 1920, 2560],
    imageSizes: [96, 160, 256, 384, 512]
  }
};

export default nextConfig;
