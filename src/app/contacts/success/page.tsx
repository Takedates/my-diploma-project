// src/app/contacts/success/page.tsx 
'use client'; 

import React from 'react';
import Link from 'next/link';
import styles from './success.module.css'; 

export default function ContactSuccessPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Сообщение отправлено!</h1>
      <p className={styles.message}>Спасибо за ваше обращение. Мы свяжемся с вами в ближайшее время.</p>
      <Link href="/" className={styles.button}>
        Вернуться на главную
      </Link>
    </div>
  );
}