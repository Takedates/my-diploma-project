// src/app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) { 
  const secret = request.nextUrl.searchParams.get('secret');

  // Проверка секрета
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    // Обновляем страницу списка новостей
    revalidatePath('/news'); 
    // Обновляем все динамические страницы новостей (перевалидирует паттерн)
    revalidatePath('/news/[slug]'); 

    // Обновляем страницу списка каталога
    revalidatePath('/catalog');
    // Обновляем все динамические страницы каталога (перевалидирует паттерн)
    revalidatePath('/catalog/[slug]'); 

    console.log('Revalidation initiated for /news and /catalog pages.');
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error('Error during revalidation:', err);
    return NextResponse.json({ revalidated: false, error: 'Error revalidating' }, { status: 500 });
  }
}