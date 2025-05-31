// src/app/layout.tsx
'use client'; // Необходимо для usePathname и анимаций на клиенте

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Montserrat, Roboto } from "next/font/google";
import "./globals.css"; // Глобальные стили (включая Tailwind, если используется)

// --- Раскомментируем импорты Framer Motion и usePathname ---
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Настройка шрифтов
const montserrat = Montserrat({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '800']
});
const roboto = Roboto({
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
  variable: '--font-roboto',
});

// --- Новые, более простые варианты анимации для смены страниц ---
const pageVariants = {
  initial: { // Начальное состояние (при входе на страницу)
    opacity: 0,
    // y: 15, // Можно убрать сдвиг, чтобы сделать просто fade
  },
  animate: { // Конечное состояние (после появления)
    opacity: 1,
    // y: 0, // Убрать сдвиг
  },
  exit: { // Состояние при уходе со страницы
    opacity: 0,
    // y: -15, // Убрать сдвиг
  }
};

// Настройки перехода
const pageTransition = {
  type: "tween", // Можно попробовать "spring" для другого эффекта
  ease: "easeInOut", // Плавное начало и конец
  duration: 0.3 // Более быстрая анимация
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Снова используем pathname для key

  return (
    <html lang="ru" className={`${montserrat.variable} ${roboto.variable}`}>
      <head>
        {/* 
          Добавляем метатег viewport для контроля масштабирования.
          width=device-width: устанавливает ширину области просмотра равной ширине экрана устройства.
          initial-scale=1: устанавливает начальный масштаб.
          maximum-scale=1: запрещает пользователю увеличивать масштаб сверх начального.
          user-scalable=no: дополнительно запрещает масштабирование пользователем (более строгий вариант).
        */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        {/* Вы можете добавить сюда и другие метатеги, например, для SEO, если они не генерируются Next.js metadata API */}
        {/* <title>ООО "Бизнес-Партнер"</title> */}
        {/* <meta name="description" content="Продажа качественной спецтехники от ООО Бизнес-Партнер" /> */}
      </head>
      <body className="font-sans flex flex-col min-h-screen bg-gray-100 text-gray-800">

        <Header /> {/* Хедер вне зоны анимации */}

        <AnimatePresence
            mode="wait" // Ждем завершения анимации ухода
            // initial={false} // <-- Убираем это! motion.main будет сам управлять начальной анимацией
            onExitComplete={() => window.scrollTo(0, 0)} // Скролл вверх после смены страницы
        >
          {/* Анимируем основной контент */}
          <motion.main
            key={pathname} // Ключ для отслеживания смены компонента (ОБЯЗАТЕЛЬНО!)
            className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8" // Контейнер и отступы
            initial="initial" // Начальное состояние при появлении компонента
            animate="animate" // Состояние, в которое анимируем при появлении
            exit="exit"       // Состояние, в которое анимируем при уходе
            variants={pageVariants} // Применяем варианты анимации
            transition={pageTransition} // Применяем настройки перехода
          >
            {children} {/* Содержимое текущей страницы */}
          </motion.main>
        </AnimatePresence>

        <Footer /> {/* Футер вне зоны анимации */}
      </body>
    </html>
  );
}