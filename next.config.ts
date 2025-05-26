// next.config.ts

import type { NextConfig } from 'next'; // Импортируем тип

const nextConfig: NextConfig = {
  reactStrictMode: true, // Пример другой настройки (можно оставить или убрать)
  // Добавляем секцию images:
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        // pathname: '/images/**', // Оставляем закомментированным пока
      },
    ],
    // Если вдруг remotePatterns не сработает (маловероятно с TS):
    // domains: ['cdn.sanity.io'],
  },
  // Здесь могут быть другие твои настройки
};

// Используем export default для TS файлов
export default nextConfig;