// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Получаем URL и ключ 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Проверяем, что переменные окружения загрузились
if (!supabaseUrl || !supabaseAnonKey) {
  // В режиме разработки выводим ошибку в консоль
  if (process.env.NODE_ENV === 'development') {
     console.error("Supabase URL or Anon Key is missing. Check .env.local file.");
  } else {
     console.error("Supabase configuration missing.");
  }
}

// Безопасный вариант: создаем клиент только если переменные есть
let supabaseInstance = null;
if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.error("Cannot create Supabase client due to missing environment variables.");
}

export const supabase = supabaseInstance; // Экспортируем инстанс (или null)