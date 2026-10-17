const http = require('http');
const { URL } = require('url');

const BASE_URL = 'https://v3.football.api-sports.io';

function getApiKey() {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    throw new Error('API_FOOTBALL_KEY is missing');
  }
  return key;
}

async function proxyRequest(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    const url = new URL(req.url, 'http://localhost');
    const endpoint = url.searchParams.get('endpoint');

    if (!endpoint) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing endpoint query parameter' }));
      return;
    }

    const params = new URLSearchParams();
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== 'endpoint') params.append(key, value);
    }

    const target = `${BASE_URL}/${endpoint.replace(/^\/+/, '')}${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(target, {
      method: 'GET',
      headers: {
        'x-apisports-key': getApiKey(),
        'Accept': 'application/json'
      }
    });

    const body = await response.text();

    res.writeHead(response.status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(body);
  } catch (error) {
    console.error('football proxy error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy failed', detail: error.message }));
  }
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  http.createServer(proxyRequest).listen(port, () => {
    console.log(`API football proxy listening on http://localhost:${port}`);
  });
}

module.exports = proxyRequest;
