'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function submitEquipmentRequest(formData: FormData): Promise<ActionResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Логи для проверки ключей (оставьте на время отладки, потом можно удалить или сделать условными)
  console.log('--- [Server Action] Verifying Supabase Keys ---');
  console.log(`[Server Action] SUPABASE_URL: ${supabaseUrl ? 'Loaded' : 'MISSING!'}`);
  console.log(`[Server Action] SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Loaded' : 'MISSING!'}`);
  console.log('--- END KEY VERIFICATION ---');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Server Action] Supabase URL or Anon Key is missing in environment variables.");
    return { error: "Ошибка конфигурации сервера: отсутствуют ключи доступа." };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async get(name: string) {
        try {
            const cookieStore = await nextCookies();
            return cookieStore.get(name)?.value;
        } catch (error) {
             console.warn(`[Server Action] Error getting cookie '${name}':`, error);
             return undefined;
        }
      },
      async set(name: string, value: string, options: CookieOptions) {
        try {
            const cookieStore = await nextCookies();
            cookieStore.set({ name, value, ...options });
        } catch (error) {
             console.warn(`[Server Action] Error setting cookie '${name}':`, error);
        }
      },
      async remove(name: string, options: CookieOptions) {
        try {
            const cookieStore = await nextCookies();
            cookieStore.set({ name, value: '', ...options });
        } catch (error) {
             console.warn(`[Server Action] Error removing cookie '${name}':`, error);
        }
      },
    },
  });

  // Извлечение и базовая очистка данных из FormData
  const rawFormData = {
    equipmentId: (formData.get('equipmentId') as string)?.trim() || null,
    equipmentName: (formData.get('equipmentName') as string)?.trim() || null,
    customerName: (formData.get('customerName') as string)?.trim() || '',
    phone: (formData.get('phone') as string)?.trim() || '',
    email: (formData.get('email') as string)?.trim() || '',
    comment: (formData.get('comment') as string)?.trim() || null,
    isPrivacyPolicyAccepted: formData.get('isPrivacyPolicyAccepted') === 'true',
  };

  // --- Валидация на сервере (ОЧЕНЬ ВАЖНА!) ---
  // Имя обязательно для заполнения и не менее 2 символов
  if (!rawFormData.customerName) {
    return { error: 'Пожалуйста, укажите ваше имя.' };
  }
  if (rawFormData.customerName.length < 2) {
      return { error: 'Имя должно содержать не менее 2 символов.' };
  }

  // Необходимо указать телефон ИЛИ Email (хотя бы одно поле)
  const hasPhone = !!rawFormData.phone;
  const hasEmail = !!rawFormData.email;

  if (!hasPhone && !hasEmail) {
    return { error: 'Необходимо указать номер телефона или Email для связи.' };
  }

  // Проверка формата Email, если он указан
  if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawFormData.email)) {
    return { error: 'Некорректный формат Email. Пожалуйста, проверьте правильность ввода.' };
  }

  // Проверка формата телефона, если он указан
  // Удаляем все нецифровые символы для валидации
  const phoneDigits = rawFormData.phone.replace(/\D/g, '');
  // Регулярное выражение для 10-11 цифр, начинающихся с 7 или 8 (для России)
  // или просто 10 цифр (если 7/8 не обязательны)
  if (hasPhone && !/^(7|8)?\d{10}$/.test(phoneDigits)) {
      return { error: 'Некорректный формат телефона. Пожалуйста, введите 10 цифр после кода страны.' };
  }


  // Согласие на обработку персональных данных обязательно
  if (!rawFormData.isPrivacyPolicyAccepted) {
    return { error: 'Для отправки заявки необходимо согласие на обработку персональных данных.' };
  }

  // Идентификатор техники должен быть передан
  if (!rawFormData.equipmentId) { 
    return { error: 'Отсутствует идентификатор запрошенной техники. Пожалуйста, обновите страницу.' };
  }
  // --- Конец валидации ---

  // Формирование contact_info для базы данных
  let contactInfoString = '';
  if (hasPhone && hasEmail) {
    contactInfoString = `Телефон: ${rawFormData.phone}, Email: ${rawFormData.email}`;
  } else if (hasPhone) {
    contactInfoString = `Телефон: ${rawFormData.phone}`;
  } else if (hasEmail) {
    contactInfoString = `Email: ${rawFormData.email}`;
  }

  // Аргументы для вызова PostgreSQL функции
  const functionArgs = {
    p_name: rawFormData.customerName,
    p_contact_info: contactInfoString,
    p_equipment_name: rawFormData.equipmentName, 
    p_equipment_link: rawFormData.equipmentId,   
    p_request_type: 'Запрос цены/консультации',
    p_message: rawFormData.comment,              
  };

  console.log('[Server Action] Attempting to call DB function "insert_equipment_request_untrusted" with args:', JSON.stringify(functionArgs, null, 2));

  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'insert_equipment_request_untrusted', // Точное имя вашей функции в PostgreSQL
      functionArgs 
    );

    if (rpcError) {
      console.error('[Server Action] Supabase RPC error:', rpcError);
      return { error: `Не удалось сохранить ваш запрос. Пожалуйста, попробуйте позже или свяжитесь с нами напрямую. Детали: ${rpcError.message}` };
    }

    console.log('[Server Action] DB function call "insert_equipment_request_untrusted" successful. Response data (if any):', rpcData);
    console.log('[Server Action] Заявка на технику успешно сохранена через RPC.');

    // --- Ревалидация страниц после сохранения заявки ---
    revalidatePath('/admin/dashboard'); // Обновляем дашборд админки
    if (rawFormData.equipmentId) {
        revalidatePath(`/catalog/${rawFormData.equipmentId}`); // Обновляем страницу конкретной техники
    }

    return { success: true }; 

  } catch (err: unknown) {
    console.error('[Server Action] Неожиданная ошибка в submitEquipmentRequest (RPC call):', err);
    if (err instanceof Error) {
      return { error: `Критическая ошибка на сервере: ${err.message}` };
    }
    return { error: 'Произошла неизвестная критическая ошибка на сервере. Пожалуйста, свяжитесь с поддержкой.' };
  }
}