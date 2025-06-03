// src/components/Footer.tsx
import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.copyrightAndTerms}>
          © {currentYear}, ООО «Бизнес-Партнер».{' '}
          <Link href="/terms-of-use" className={styles.footerLink}>
            Все права защищены
          </Link>
          .
        </p>
        <p className={styles.developerCredit}>
          Разработка сайта –{' '}
          <a
            href="https://cuteslippers.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.developerLink}
          >
            Кузьмин В.С.
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;