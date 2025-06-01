import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  // Проверка секрета
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    revalidatePath('/news'); // Обновляем страницу списка новостей

    console.log('Revalidation initiated for /news');
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error('Error during revalidation:', err);
    return NextResponse.json({ revalidated: false, error: 'Error revalidating' }, { status: 500 });
  }
}