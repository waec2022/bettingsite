// Shared helpers for Pages Functions. Secrets come from env (Cloudflare dashboard), never from code.
export const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...extra } });

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
export function isAdmin(request, env) {
  if (!env.ADMIN_TOKEN || env.ADMIN_TOKEN.length < 16) return false;   // refuse weak/missing tokens
  const h = request.headers.get('Authorization') || '';
  return h.startsWith('Bearer ') && safeEqual(h.slice(7), env.ADMIN_TOKEN);
}
export function sameSite(request) {
  const o = request.headers.get('Origin') || request.headers.get('Referer');
  if (!o) return true;                       // non-browser clients: still need the admin token for writes
  try { return new URL(o).host === new URL(request.url).host; } catch { return false; }
}
