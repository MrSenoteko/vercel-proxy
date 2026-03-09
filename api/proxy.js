export default async function handler(req, res) {
  // 1. Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  // 🔥 ГЛАВНОЕ: Убиваем мобильные протоколы, которые режут в РФ
  res.setHeader('Alt-Svc', 'clear'); 

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 2. Формируем URL к Google
  const targetUrl = `https://firestore.googleapis.com${req.url}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Authorization': req.headers['authorization'] || '',
        'Content-Type': req.headers['content-type'] || 'application/json',
        'x-goog-api-client': req.headers['x-goog-api-client'] || '',
        'x-firebase-gmpid': req.headers['x-firebase-gmpid'] || '',
        // Маскируемся под ПК, чтобы провайдер не включал фильтры
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      // Firestore Lite использует POST для получения данных — передаем тело
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? JSON.stringify(req.body) : undefined
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
