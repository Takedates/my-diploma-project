// src/app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from './login.module.css';
import { AuthError } from '@supabase/supabase-js'; // <-- Импортируем AuthError

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!supabase) {
       setError("Клиент Supabase не инициализирован.");
       setLoading(false);
       return;
    }

    try {
      // signInError здесь будет типа AuthError | null
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        // signInError это уже объект AuthError, его можно передавать дальше
        throw signInError;
      }

      router.push('/admin/dashboard');

    } catch (e: unknown) { // Ловим ошибку как unknown
      console.error("Ошибка входа:", e);
      // Проверяем тип ошибки
      if (e instanceof AuthError) {
        setError(e.message || 'Неверный email или пароль.');
      } else if (e instanceof Error) { // Общая JavaScript ошибка
        setError(e.message || 'Произошла ошибка при входе.');
      } else {
        setError('Произошла неизвестная ошибка при входе.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Вход для сотрудников</h1>
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Пароль:</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}