// src/app/layout.tsx
'use client'; // Необходимо для usePathname и анимаций на клиенте

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Montserrat, Roboto } from "next/font/google";
import "./globals.css"; // Глобальные стили (включая Tailwind, если используется)
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

// Варианты анимации для смены страниц
const pageVariants = {
  initial: { // Перед появлением
    opacity: 0,
    y: 15, // Сдвиг снизу
  },
  in: { // Активное состояние
    opacity: 1,
    y: 0,
  },
  out: { // Перед уходом
    opacity: 0,
    y: -15, // Сдвиг вверх
  }
};

// Настройки перехода
const pageTransition = {
  type: "tween",
  ease: "anticipate", // Эффект можно поменять на "easeInOut" или другой
  duration: 0.5
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
            initial={false} // Не анимируем первую загрузку
            onExitComplete={() => window.scrollTo(0, 0)} // Скролл вверх после смены страницы
        >
          {/* Анимируем основной контент */}
          <motion.main
            key={pathname} // Ключ для отслеживания смены компонента
            className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8" // Контейнер и отступы
            initial="initial"
            animate="in"
            exit="out"
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