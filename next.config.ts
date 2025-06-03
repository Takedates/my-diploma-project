// next.config.ts

import type { NextConfig } from 'next'; 

const nextConfig: NextConfig = {
  reactStrictMode: true, 
  // Добавляем секцию images:
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
      },
    ],
  },
};

// Используем export default для TS файлов
export default nextConfig;