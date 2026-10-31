// GET /api/proxy?provider=odds-api&path=/v4/sports/soccer_epl/odds&q_regions=eu&ttl=600
// Adds the provider secret server-side, allow-lists providers and paths, caches responses, maps errors.
import { json, sameSite } from '../_lib/auth.js';

const PROVIDERS = {
  'football-data': { base: 'https://api.football-data.org', paths: ['/v4/'], secret: 'FOOTBALL_DATA_KEY', header: 'X-Auth-Token' },
  'api-football': { base: 'https://v3.football.api-sports.io', paths: ['/fixtures', '/leagues', '/teams', '/odds'], secret: 'API_FOOTBALL_KEY', header: 'x-apisports-key' },
  'odds-api': { base: 'https://api.the-odds-api.com', paths: ['/v4/sports'], secret: 'ODDS_API_KEY', query: 'apiKey' }
};

export async function onRequestGet({ request, env, waitUntil }) {
  const url = new URL(request.url);
  if (!sameSite(request)) return json({ error: 'forbidden_origin' }, 403);
  const p = PROVIDERS[url.searchParams.get('provider')];
  if (!p) return json({ error: 'unknown_provider' }, 400);
  const path = url.searchParams.get('path') || '';
  if (!path.startsWith('/') || path.includes('..') || path.includes('//') || path.includes('?') || !p.paths.some((x) => path.startsWith(x))) return json({ error: 'forbidden_path' }, 403);
  const key = env[p.secret];
  if (!key) return json({ error: 'missing_credentials', secret: p.secret }, 503);

  const up = new URL(p.base + path);
  for (const [k, v] of url.searchParams) if (k.startsWith('q_')) up.searchParams.set(k.slice(2), v);
  const ttl = Math.min(3600, Math.max(30, parseInt(url.searchParams.get('ttl'), 10) || 300));

  const cacheKey = new Request(url.toString(), { method: 'GET' });
  const cache = caches.default;
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const headers = { Accept: 'application/json' };
  if (p.header) headers[p.header] = key; else up.searchParams.set(p.query, key);
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch(up.toString(), { headers, signal: ctl.signal });
    const text = await r.text();
    if (r.status === 401 || r.status === 403) return json({ error: 'invalid_credentials' }, 401);
    if (r.status === 429) return json({ error: 'rate_limited', retryAfter: r.headers.get('retry-after') }, 429);
    if (!r.ok) return json({ error: 'provider_error', message: text.slice(0, 160) }, 502);
    const res = new Response(text, { status: 200, headers: { 'content-type': 'application/json', 'cache-control': `public, max-age=${ttl}, s-maxage=${ttl}` } });
    (waitUntil || (() => {}))(cache.put(cacheKey, res.clone()));
    return res;
  } catch (e) {
    return json({ error: e.name === 'AbortError' ? 'timeout' : 'unreachable' }, 504);
  } finally { clearTimeout(timer); }
}
