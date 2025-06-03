// middleware.ts 
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ 
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ 
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Если пользователь не авторизован и пытается зайти в /admin
  if (!session && request.nextUrl.pathname.startsWith('/admin')) {
    // Перенаправляем на страницу входа
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';

    return NextResponse.redirect(redirectUrl);
  }

  // Если пользователь авторизован и пытается зайти на /login
  if (session && request.nextUrl.pathname === '/login') {
     // Перенаправляем на дашборд
     const redirectUrl = request.nextUrl.clone();
     redirectUrl.pathname = '/admin/dashboard';
     return NextResponse.redirect(redirectUrl);
  }


  // Если все проверки пройдены, продолжаем запрос
  return response;
}

// Конфигурация Middleware: указываем, к каким путям его применять
export const config = {
  matcher: [
    /*
     * все пути запросов, кроме тех, что начинаются с:
     * - api (маршруты API)
     * - _next/static (статические файлы)
     * - _next/image (файлы оптимизации изображений)
     * - favicon.ico (файл иконки)
     * Исключаем также путь к самой странице входа, чтобы избежать бесконечного редиректа
     * на саму себя, если пользователь не авторизован. Но мы добавили проверку выше.
     */
    // '/login', 
    '/admin/:path*', // Защищаем все страницы внутри /admin
    '/login'
  ],
};