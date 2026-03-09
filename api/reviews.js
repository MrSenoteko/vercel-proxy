export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { projectId } = req.query;
  if (!projectId) {
    return res.status(400).json({ error: 'Укажите projectId' });
  }

  const apiKey = 'AIzaSyDxQwSurwxFxiG7Wd0IcJerVrYbsXhm6GE';
  const url = `https://firestore.googleapis.com/v1/projects/one-ru/databases/(default)/documents/projects/${projectId}/reviews?key=${apiKey}`;

  // Умный распаковщик данных
  function parseValue(val) {
    if (!val) return null;
    if ('stringValue' in val) return val.stringValue;
    if ('integerValue' in val) return parseInt(val.integerValue, 10);
    if ('doubleValue' in val) return parseFloat(val.doubleValue);
    if ('booleanValue' in val) return val.booleanValue;
    if ('timestampValue' in val) return new Date(val.timestampValue).getTime();
    if ('arrayValue' in val) return (val.arrayValue.values || []).map(parseValue);
    if ('mapValue' in val) {
      const obj = {};
      for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
        obj[k] = parseValue(v);
      }
      return obj;
    }
    return null;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Если отзывов еще нет, Google выдаст 404, это нормально
    if (data.error && data.error.code === 404) {
      return res.status(200).json([]); 
    }
    if (data.error) return res.status(400).json({ error: data.error.message });

    const reviews = (data.documents || []).map(doc => {
      const id = doc.name.split('/').pop();
      const fields = {};
      for (const [k, v] of Object.entries(doc.fields || {})) {
        fields[k] = parseValue(v);
      }
      return { id, ...fields };
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
