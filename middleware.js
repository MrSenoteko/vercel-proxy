export const config = {
  matcher: '/(.*)', // Перехватываем абсолютно все запросы
};

export default async function middleware(request) {
  // 1. Отвечаем браузеру на проверку безопасности (CORS)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Alt-Svc': 'clear' // Выключаем проблемный мобильный протокол
      }
    });
  }

  // 2. Берем оригинальную ссылку (со всеми скобками) и меняем домен на Google
  const url = new URL(request.url);
  url.hostname = 'firestore.googleapis.com';

  // 3. Копируем заголовки и маскируемся под ПК
  const headers = new Headers(request.headers);
  headers.set('Host', 'firestore.googleapis.com');
  headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36');
  // Удаляем эти заголовки, чтобы Google думал, что мы сервер, а не браузер
  headers.delete('origin'); 
  headers.delete('referer');

  try {
    // 4. Отправляем кристально чистый запрос в Google
    const response = await fetch(url.toString(), {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: 'manual'
    });

    // 5. Разрешаем вашему сайту прочитать полученные данные
    const resHeaders = new Headers(response.headers);
    resHeaders.set('Access-Control-Allow-Origin', '*');
    resHeaders.set('Alt-Svc', 'clear');

    return new Response(response.body, {
      status: response.status,
      headers: resHeaders
    });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
