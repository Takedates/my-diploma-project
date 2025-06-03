// src/app/layout.tsx
'use client'; 

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Montserrat, Roboto } from "next/font/google";
import "./globals.css";


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

export default function RootLayout({ children }: { children: React.ReactNode }) {

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

            className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8"

          >
            {children} 
          </main>

        <Footer />
      </body>
    </html>
  );
}