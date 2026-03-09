export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = 'AIzaSyDxQwSurwxFxiG7Wd0IcJerVrYbsXhm6GE';
  const projectId = 'one-ru';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/projects?key=${apiKey}`;

  // Умный распаковщик сложных данных Firebase (массивов, объектов, списков)
  function parseValue(val) {
    if (!val) return null;
    if ('stringValue' in val) return val.stringValue;
    if ('integerValue' in val) return parseInt(val.integerValue, 10);
    if ('doubleValue' in val) return parseFloat(val.doubleValue);
    if ('booleanValue' in val) return val.booleanValue;
    if ('timestampValue' in val) return new Date(val.timestampValue).getTime(); // Для дат
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

    if (data.error) return res.status(400).json({ error: data.error.message });

    const projects = (data.documents || []).map(doc => {
      const id = doc.name.split('/').pop();
      const fields = {};
      for (const [k, v] of Object.entries(doc.fields || {})) {
        fields[k] = parseValue(v);
      }
      return { id, ...fields };
    });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
