// src/app/layout.tsx
'use client'; 

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Montserrat, Roboto } from "next/font/google";
import "./globals.css";

// --- Закомментируем импорты Framer Motion и usePathname, они больше не нужны для main ---
// import { motion, AnimatePresence } from 'framer-motion';
// import { usePathname } from 'next/navigation';

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

// --- Переменные для анимации закомментированы/удалены ---
// const pageVariants = { ... };
// const pageTransition = { ... };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // const pathname = usePathname(); // Закомментируем, так как key={pathname} больше не используется

  return (
    <html lang="ru" className={`${montserrat.variable} ${roboto.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="font-sans flex flex-col min-h-screen bg-gray-100 text-gray-800">

        <Header /> 

        {/* --- Заменили AnimatePresence и motion.main на обычный main --- */}
        {/* <AnimatePresence
            mode="wait"
            initial={false}
            onExitComplete={() => window.scrollTo(0, 0)}
        > */}
          <main
            // key={pathname} 
            className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8"
            // initial="initial" 
            // animate="in"      
            // exit="out"        
            // variants={pageVariants} 
            // transition={pageTransition} 
          >
            {children} 
          </main>
        {/* </AnimatePresence> */}

        <Footer />
      </body>
    </html>
  );
}