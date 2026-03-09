export default async function handler(req, res) {
  // Разрешаем сайту получать данные
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ваши данные Firebase
  const apiKey = 'AIzaSyDxQwSurwxFxiG7Wd0IcJerVrYbsXhm6GE';
  const projectId = 'one-ru';
  // ВНИМАНИЕ: Если ваша таблица в базе называется не users, замените слово ниже!
  const collectionName = 'users'; 
  
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?key=${apiKey}`;

  try {
    // Vercel сам скачивает данные у Google (это происходит мгновенно по TCP)
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    // Распаковываем сложный гугловский формат в простой и понятный массив
    const cleanUsers = (data.documents || []).map(doc => {
      const id = doc.name.split('/').pop();
      const fields = {};
      
      // Перебираем поля документа
      if (doc.fields) {
        for (const [key, val] of Object.entries(doc.fields)) {
          // Достаем значение независимо от его типа в Firestore
          fields[key] = val.stringValue ?? val.integerValue ?? val.booleanValue ?? "";
        }
      }
      return { id, ...fields };
    });

    // Отдаем телефону кристально чистый JSON
    res.status(200).json(cleanUsers);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
