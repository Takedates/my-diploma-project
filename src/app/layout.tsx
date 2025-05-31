// src/app/layout.tsx
'use client'; 

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Montserrat, Roboto } from "next/font/google";
import "./globals.css";

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

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

// Варианты анимации для смены страниц (оставляем те же, что и в предыдущем шаге)
const pageVariants = {
  initial: { 
    opacity: 0,
    // y: 15, // Пока оставляем без сдвига, чтобы упростить
  },
  animate: { 
    opacity: 1,
    // y: 0, // Пока оставляем без сдвига
  },
  exit: { 
    opacity: 0,
    // y: -15, // Пока оставляем без сдвига
  }
};

// Настройки перехода
const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="ru" className={`${montserrat.variable} ${roboto.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="font-sans flex flex-col min-h-screen bg-gray-100 text-gray-800">

        <Header />

        <AnimatePresence
            // mode="wait" // <-- УДАЛИЛИ ЭТУ СТРОКУ! Теперь новый компонент будет появляться сразу.
            // initial={false} // <-- УБРАЛИ это ещё на прошлом шаге. Так и должно быть.
            onExitComplete={() => window.scrollTo(0, 0)}
        >
          <motion.main
            key={pathname}
            className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
          >
            {children}
          </motion.main>
        </AnimatePresence>

        <Footer />
      </body>
    </html>
  );
}