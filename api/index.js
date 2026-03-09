export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const url = new URL(request.url);
  url.hostname = 'firestore.googleapis.com';
  url.port = '443';
  url.protocol = 'https:';

  const newRequest = new Request(url.toString(), request);
  newRequest.headers.set('Host', 'firestore.googleapis.com');
  newRequest.headers.delete('Origin');
  newRequest.headers.delete('Referer');
  newRequest.headers.delete('Accept-Encoding');

  const response = await fetch(newRequest);
  const newResponse = new Response(response.body, response);

  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  newResponse.headers.set('Access-Control-Expose-Headers', '*');

  return newResponse;
}
