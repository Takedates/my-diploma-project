// src/components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  // Эффект для закрытия меню при изменении pathname (навигация)
  useEffect(() => {
    closeMobileMenu(); // Вызываем функцию закрытия
    // Мы хотим, чтобы этот эффект срабатывал только при изменении pathname.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Эффект для управления прокруткой body, когда мобильное меню открыто/закрыто
  // Это предотвращает скролл страницы под открытым меню
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset'; // или 'auto'
    }
    // Функция очистки для восстановления прокрутки при размонтировании компонента
    return () => {
      document.body.style.overflow = 'unset'; // или 'auto'
    };
  }, [isMobileMenuOpen]); // <--- ДОБАВЛЕНО isMobileMenuOpen в зависимости, как и требовал ESLint

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    visible: {
      opacity: 1,
      y: 0,
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
        {/* При клике на логотип также закрываем меню, если оно открыто */}
        <Link href="/" className={styles.logoLink} onClick={closeMobileMenu}>
          {'ООО "Бизнес-Партнер"'}
        </Link>

        <nav className={styles.desktopNavLinks}>
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ''}`}
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

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            id="mobile-menu-list"
            className={styles.mobileNav}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileMenuVariants}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobileNavLink} ${pathname === link.href ? styles.navLinkActiveMobile : ''}`}
                onClick={closeMobileMenu} // Используем функцию закрытия
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