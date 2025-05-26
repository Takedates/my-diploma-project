// src/components/Header.tsx (с CSS Modules)
import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css'; // Импортируем CSS модуль

const Header = () => {
  return (
    // Используем импортированные стили как классы
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logoLink}>
          { 'ООО "Бизнес-Партнер"' }
        </Link>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>Главная</Link>
          <Link href="/catalog" className={styles.navLink}>Каталог</Link>
          <Link href="/news" className={styles.navLink}>Новости</Link>
          <Link href="/about" className={styles.navLink}>О компании</Link>
          <Link href="/contacts" className={styles.navLink}>Контакты</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;