// src/components/Header.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react'; 
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev); // Используем функциональное обновление
  };

  const closeMobileMenu = useCallback(() => {
    if (isMobileMenuOpen) { // Закрываем только если открыто
      setIsMobileMenuOpen(false);
    }
  }, [isMobileMenuOpen]); 
  // УДАЛЕНО: closeMobileMenu() из useEffect [pathname, closeMobileMenu]
  // Эта строка не нужна здесь. closeMobileMenu уже имеет isMobileMenuOpen в зависимостях,
  // и закрытие при смене пути уже происходит через onClick на Link.
  // Если у тебя была проблема, что меню само не закрывалось при навигации через ссылку,
  // это обычно исправляется через onClick на Link, как у тебя уже есть.
  // Если же проблема в том, что меню открыто и пользователь нажимает НАЗАД в браузере,
  // а меню остается открытым, тогда можно добавить:
  // useEffect(() => {
  //   setIsMobileMenuOpen(false);
  // }, [pathname]);


  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'; // Запрещаем скролл тела
    } else {
      document.body.style.overflow = 'unset'; // Разрешаем скролл тела
    }
    // Функция очистки для восстановления (сработает при размонтировании компонента или изменении isMobileMenuOpen)
    return () => {
      document.body.style.overflow = 'unset'; 
    };
  }, [isMobileMenuOpen]); 

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      x: "100%", // Сдвиг за экран вправо (если меню появляется справа)
      transition: { duration: 0.2, ease: "easeOut" }
    },
    visible: {
      opacity: 1,
      x: "0%", // Появление на экране
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  const navLinks = [
    { href: "/", label: "Главная" },
    { href: "/catalog", label: "Каталог" },
    { href: "/news", label: "Новости" },
    { href: "/about", label: "О компании" },
    { href: "/contacts", label: "Контакты" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.nav}>
        <Link href="/" className={styles.logoLink} onClick={closeMobileMenu}>
          {'ООО "Бизнес-Партнер"'}
        </Link>

        <nav className={styles.desktopNavLinks}>
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ''}`}
              onClick={closeMobileMenu} 
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-controls="mobile-menu-list"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className={styles.icon} />
          ) : (
            <Bars3Icon className={styles.icon} />
          )}
        </button>
      </div>

      {/* Добавляем key={pathname} к AnimatePresence, чтобы он реагировал на смену URL */}
      {/* А также, `initial` состояние для motion.nav берется из variants */}
      <AnimatePresence mode="wait" initial={false} key={pathname}> 
        {isMobileMenuOpen && (
          <motion.nav
            id="mobile-menu-list"
            className={styles.mobileNav}
            initial="hidden" // Явно указываем начальное состояние из variants
            animate="visible"
            exit="hidden"
            variants={mobileMenuVariants}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobileNavLink} ${pathname === link.href ? styles.navLinkActiveMobile : ''}`}
                onClick={closeMobileMenu} 
              >
                {link.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;