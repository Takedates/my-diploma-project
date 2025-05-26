// src/app/contacts/success/page.tsx (Исправленный импорт стилей)
'use client'; // Добавляем на всякий случай

import React from 'react';
import Link from 'next/link';
import styles from './success.module.css'; // <-- ИМПОРТИРУЕМ ПРАВИЛЬНЫЙ МОДУЛЬ

export default function ContactSuccessPage() {
  return (
    <div className={styles.container}> {/* Используем класс из модуля */}
      <h1 className={styles.title}>Сообщение отправлено!</h1>
      <p className={styles.message}>Спасибо за ваше обращение. Мы свяжемся с вами в ближайшее время.</p>
      <Link href="/" className={styles.button}> {/* Используем класс из модуля */}
        Вернуться на главную
      </Link>
    </div>
  );
}