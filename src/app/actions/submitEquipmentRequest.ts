// src/app/actions/submitEquipmentRequest.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Если ваша DB функция insert_equipment_request_untrusted возвращает ID:
// interface EquipmentRequestRpcResponse {
//   id: number; // Предполагая, что функция возвращает ID
// }

interface ActionResult {
  success?: boolean;
  error?: string;
  // data?: EquipmentRequestRpcResponse; // Раскомментируйте и используйте, если функция возвращает данные
}

// Тип EquipmentRequestInsertDB больше не используется для прямого insert,
// но может быть полезен для понимания структуры данных.

export async function submitEquipmentRequest(formData: FormData): Promise<ActionResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Логи для проверки ключей (оставьте на время отладки)
  console.log('--- [Server Action] Verifying Supabase Keys ---');
  console.log(`[Server Action] SUPABASE_URL: ${supabaseUrl ? 'Loaded' : 'MISSING!'}`);
  console.log(`[Server Action] SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Loaded' : 'MISSING!'}`);
  // console.log(`[Server Action] ANON KEY VALUE (for verification): ${supabaseAnonKey}`); // Раскомментируйте, если нужно сверить значение
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
  if (!rawFormData.customerName) {
    return { error: 'Имя обязательно для заполнения.' };
  }
  if (rawFormData.customerName.length < 2) {
      return { error: 'Имя должно содержать не менее 2 символов.' };
  }

  const hasPhone = !!rawFormData.phone;
  const hasEmail = !!rawFormData.email;

  if (!hasPhone && !hasEmail) {
    return { error: 'Необходимо указать телефон или Email.' };
  }

  if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawFormData.email)) {
    return { error: 'Некорректный формат Email.' };
  }
  const phoneDigits = rawFormData.phone.replace(/\D/g, '');
  if (hasPhone && !/^(7|8)?\d{10}$/.test(phoneDigits)) {
      return { error: 'Некорректный формат телефона. Ожидается 10 цифр (например, 9001234567) после кода страны.' };
  }

  if (!rawFormData.isPrivacyPolicyAccepted) {
    return { error: 'Необходимо согласие на обработку персональных данных.' };
  }
  if (!rawFormData.equipmentId) { // equipmentId - это slug или ID техники
    return { error: 'Отсутствует идентификатор запрошенной техники.' };
  }
  // --- Конец валидации ---

  // Формирование contact_info
  let contactInfoString = '';
  if (hasPhone && hasEmail) {
    contactInfoString = `Телефон: ${rawFormData.phone}, Email: ${rawFormData.email}`;
  } else if (hasPhone) {
    contactInfoString = `Телефон: ${rawFormData.phone}`;
  } else if (hasEmail) {
    contactInfoString = `Email: ${rawFormData.email}`;
  }

  // Аргументы для вызова PostgreSQL функции
  // Имена ключей должны совпадать с именами параметров в вашей функции (p_name, p_contact_info и т.д.)
  const functionArgs = {
    p_name: rawFormData.customerName,
    p_contact_info: contactInfoString,
    p_equipment_name: rawFormData.equipmentName, // Может быть null
    p_equipment_link: rawFormData.equipmentId,   // Не должен быть null из-за валидации выше
    p_request_type: 'Запрос цены/консультации',
    p_message: rawFormData.comment,              // Может быть null, если столбец message Nullable
  };

  // Лог перед вызовом функции
  console.log('[Server Action] Attempting to call DB function "insert_equipment_request_untrusted" with args:', JSON.stringify(functionArgs, null, 2));

  try {
    // Вызываем хранимую процедуру (функцию)
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'insert_equipment_request_untrusted', // Точное имя вашей функции в PostgreSQL
      functionArgs // Объект с аргументами
    );

    if (rpcError) {
      console.error('[Server Action] Supabase RPC error:', rpcError);
      return { error: `Не удалось сохранить ваш запрос (код: DB_RPC_ERR). Пожалуйста, попробуйте позже или свяжитесь с нами. Детали: ${rpcError.message}` };
    }

    // Если функция RETURNS VOID, rpcData будет null или не определено.
    // Если функция возвращает значение (например, ID), rpcData будет содержать это значение.
    console.log('[Server Action] DB function call "insert_equipment_request_untrusted" successful. Response data (if any):', rpcData);
    console.log('[Server Action] Заявка на технику успешно сохранена через RPC.');

    revalidatePath('/admin/dashboard');
    if (rawFormData.equipmentId) {
        revalidatePath(`/catalog/${rawFormData.equipmentId}`);
    }

    // Пример, если бы функция возвращала объект с id:
    // if (rpcData && typeof rpcData.id === 'number') {
    //   return { success: true, data: { id: rpcData.id } };
    // }
    return { success: true }; // Для функции с RETURNS VOID

  } catch (err: unknown) {
    console.error('[Server Action] Неожиданная ошибка в submitEquipmentRequest (RPC call):', err);
    if (err instanceof Error) {
      return { error: `Критическая ошибка на сервере: ${err.message}` };
    }
    return { error: 'Произошла неизвестная критическая ошибка на сервере. (Код: SAS-RPC-GEN-01)' };
  }
}