// src/components/Footer.tsx (Обновленный)
import React from 'react';
import Link from 'next/link'; // Импортируем Link для внутренней ссылки
import styles from './Footer.module.css'; // Импортируем стили

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Используем ваш .container класс или стандартный .footerContent */}
      <div className={styles.footerContent}> {/* Используем класс из вашего CSS */}
        <p className={styles.copyrightAndTerms}> {/* Новый класс для стилизации, если нужно */}
          © {currentYear}, ООО «Бизнес-Партнер».{' '} {/* Используем кавычки-ёлочки */}
          <Link href="/terms-of-use" className={styles.footerLink}>
            Все права защищены
          </Link>
          .
        </p>
        <p className={styles.developerCredit}>
          Разработка сайта –{' '}
          <a
            href="https://cuteslippers.netlify.app/" // Твоя ссылка
            target="_blank" // Открывать в новой вкладке
            rel="noopener noreferrer" // Лучшие практики безопасности
            className={styles.developerLink} // Отдельный стиль для ссылки разработчика
          >
            Кузьмин В.С. {/* Замени на свой ник/имя, если нужно */}
          </a>
          {' '}{currentYear}
        </p>
      </div>
    </footer>
  );
};

export default Footer;