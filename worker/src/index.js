// ESM
/* Sure2OddToday automation Worker.
   Cron tick (every 15 min) -> decides what is due from the editor schedule -> fetches API-Football within a strict
   request budget -> builds odds-comparison (arbitrage) events + rollover tickets -> grades results -> commits data.json.
   Secrets (Cloudflare): ADMIN_TOKEN, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, optional APIFOOTBALL_KEY.
   Storage: one KV namespace bound as S2O (settings, usage ledger, cache, state). The API key never goes into data.json. */

const AF_BASE = 'https://v3.football.api-sports.io';

export const DEFAULT_CFG = {
  enabled: false,
  timezone: 'Africa/Lagos',
  plan: { dailyLimit: 100, reserve: 15, perRunCap: 25 },        // free plan = 100 requests/day. reserve is never spent
  leagues: [{ id: 39, name: 'Premier League' }, { id: 140, name: 'La Liga' }, { id: 135, name: 'Serie A' }, { id: 78, name: 'Bundesliga' }, { id: 61, name: 'Ligue 1' }],
  schedule: { fixturesHour: 5, oddsHours: [6, 12, 16], predictionsHour: 6, resultsFromHour: 5, resultsToHour: 23, resultsEveryMinutes: 90 },
  markets: { bets: [1, 5, 8, 12], totalsLines: [1.5, 2.5, 3.5] },
  arbitrage: { enabled: true, maxPerDay: 2, minProfitPct: 0.5, maxProfitPct: 8, minLeadMinutes: 30, oddsMaxAgeHours: 30, keepExpiredHours: 24 },
  rollovers: { enabled: true, minOdds: 1.1, maxOdds: 1.8, tolerancePct: 5, maxSelections: 20, predictionsPerDay: 10, useApiPredictions: true, buildPerTick: 3 },
  publish: { enabled: true }
};

/* ---------------- small utils ---------------- */
const num = (v, d) => (Number.isFinite(+v) ? +v : d);
export function mergeCfg(base, over) {
  const out = JSON.parse(JSON.stringify(base)); if (!over || typeof over !== 'object') return out;
  for (const k of Object.keys(out)) {
    if (over[k] === undefined) continue;
    if (Array.isArray(out[k])) { if (Array.isArray(over[k])) out[k] = over[k]; }
    else if (out[k] && typeof out[k] === 'object') { for (const j of Object.keys(out[k])) if (over[k] && over[k][j] !== undefined) out[k][j] = over[k][j]; }
    else out[k] = over[k];
  }
  return out;
}
export function sanitiseCfg(c) {
  const o = mergeCfg(DEFAULT_CFG, c), P = o.plan, S = o.schedule, A = o.arbitrage, R = o.rollovers;
  o.enabled = !!o.enabled; o.timezone = String(o.timezone || 'UTC');
  try { new Intl.DateTimeFormat('en-GB', { timeZone: o.timezone }); } catch (e) { o.timezone = 'UTC'; }
  P.dailyLimit = Math.max(10, Math.min(1000000, num(P.dailyLimit, 100))); P.reserve = Math.max(0, Math.min(P.dailyLimit - 1, num(P.reserve, 15))); P.perRunCap = Math.max(1, Math.min(200, num(P.perRunCap, 25)));
  o.leagues = (o.leagues || []).map((l) => ({ id: Math.floor(num(l.id, 0)), name: String(l.name || '').slice(0, 40), season: l.season ? Math.floor(num(l.season, 0)) || undefined : undefined })).filter((l) => l.id > 0).slice(0, 20);
  const hr = (v, d) => Math.max(0, Math.min(23, Math.floor(num(v, d))));
  S.fixturesHour = hr(S.fixturesHour, 5); S.predictionsHour = hr(S.predictionsHour, 6); S.resultsFromHour = hr(S.resultsFromHour, 5); S.resultsToHour = hr(S.resultsToHour, 23);
  S.oddsHours = (Array.isArray(S.oddsHours) ? S.oddsHours : []).map((h) => hr(h, 6)).slice(0, 6);
  S.resultsEveryMinutes = Math.max(30, Math.min(1440, Math.floor(num(S.resultsEveryMinutes, 90))));
  o.markets.bets = (o.markets.bets || []).map((b) => Math.floor(num(b, 0))).filter((b) => [1, 5, 8, 12].includes(b));
  o.markets.totalsLines = (o.markets.totalsLines || []).map((x) => num(x, 0)).filter((x) => x > 0);
  A.enabled = !!A.enabled; A.maxPerDay = Math.max(0, Math.min(10, Math.floor(num(A.maxPerDay, 2)))); A.minProfitPct = Math.max(0, num(A.minProfitPct, 0.5)); A.maxProfitPct = Math.max(A.minProfitPct, num(A.maxProfitPct, 8));
  A.minLeadMinutes = Math.max(0, Math.floor(num(A.minLeadMinutes, 30))); A.oddsMaxAgeHours = Math.max(1, num(A.oddsMaxAgeHours, 30)); A.keepExpiredHours = Math.max(0, num(A.keepExpiredHours, 24));
  R.enabled = !!R.enabled; R.minOdds = Math.max(1.01, num(R.minOdds, 1.1)); R.maxOdds = Math.max(R.minOdds, num(R.maxOdds, 1.8)); R.tolerancePct = Math.max(0.5, Math.min(25, num(R.tolerancePct, 5)));
  R.maxSelections = Math.max(1, Math.min(30, Math.floor(num(R.maxSelections, 20)))); R.predictionsPerDay = Math.max(0, Math.min(40, Math.floor(num(R.predictionsPerDay, 10)))); R.useApiPredictions = !!R.useApiPredictions; R.buildPerTick = Math.max(1, Math.min(14, Math.floor(num(R.buildPerTick, 3))));
  o.publish.enabled = !!o.publish.enabled;
  return o;
}
export function localParts(d, tz) {
  const p = {}; for (const x of new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d)) p[x.type] = x.value;
  return { date: `${p.year}-${p.month}-${p.day}`, hour: (+p.hour) % 24, minute: +p.minute };
}
export const addDays = (ds, n) => { const d = new Date(ds + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const utcDate = (ms) => new Date(ms).toISOString().slice(0, 10);
export function seasonFor(date) { const y = +date.slice(0, 4), m = +date.slice(5, 7); return m >= 7 ? y : y - 1; }   // European season starts in August; override per league in settings

/* ---------------- KV helpers ---------------- */
const kget = async (env, k, d) => { const v = await env.S2O.get(k); if (v == null) return d; try { return JSON.parse(v); } catch (e) { return d; } };
const kput = (env, k, v, ttl) => env.S2O.put(k, JSON.stringify(v), ttl ? { expirationTtl: ttl } : undefined);
const b64 = (u8) => { let s = ''; u8.forEach((c) => (s += String.fromCharCode(c))); return btoa(s); };
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function aesKey(env) { const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('s2o-key-v1:' + env.ADMIN_TOKEN)); return crypto.subtle.importKey('raw', h, 'AES-GCM', false, ['encrypt', 'decrypt']); }
async function encText(env, t) { const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(env), new TextEncoder().encode(t)); return b64(iv) + '.' + b64(new Uint8Array(ct)); }
async function decText(env, s) { const [a, b] = s.split('.'); return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(a) }, await aesKey(env), unb64(b))); }
export async function getApiKey(env) {
  if (env.APIFOOTBALL_KEY) return { key: env.APIFOOTBALL_KEY, source: 'secret' };
  const e = await env.S2O.get('key'); if (!e) return { key: '', source: 'none' };
  try { return { key: await decText(env, e), source: 'kv' }; } catch (err) { return { key: '', source: 'none' }; }
}

/* ---------------- quota guard + API client ---------------- */
export class QuotaError extends Error {}
export class ApiError extends Error { constructor(m, kind) { super(m); this.kind = kind || 'api'; } }
export function canSpend(cfg, usage, spentThisRun, n = 1) {
  const P = cfg.plan, limit = Math.min(P.dailyLimit, usage.limit || Infinity);
  if (spentThisRun + n > P.perRunCap) return false;
  if (usage.total + n > limit - P.reserve) return false;
  if (usage.remaining != null && usage.remaining - n < P.reserve) return false;
  return true;
}
async function fetchT(url, opt, ms) { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); try { return await fetch(url, { ...opt, signal: c.signal }); } finally { clearTimeout(t); } }
const emptyErrors = (e) => !e || (Array.isArray(e) ? e.length === 0 : Object.keys(e).length === 0);
/* One counted request. Cached responses cost nothing. No retries: a failure waits for a later tick (with backoff). */
export async function af(ctx, task, path, params, ttl) {
  const qs = new URLSearchParams(Object.entries(params || {}).sort()).toString(), ck = 'c:' + path + '?' + qs;
  if (ttl) { const hit = await kget(ctx.env, ck, null); if (hit && Date.now() - hit.t < ttl * 1000) return hit.d; }
  if (!ctx.key) throw new ApiError('No API key configured.', 'auth');
  if (!canSpend(ctx.cfg, ctx.usage, ctx.spent, 1)) throw new QuotaError('Request budget reached.');
  ctx.usage.total++; ctx.usage.by[task] = (ctx.usage.by[task] || 0) + 1; ctx.spent++;       // count BEFORE the call so a crash can never under-count
  await kput(ctx.env, 'usage:' + ctx.usageDay, ctx.usage, 40 * 86400);
  let res;
  try { res = await fetchT(AF_BASE + path + (qs ? '?' + qs : ''), { headers: { 'x-apisports-key': ctx.key, Accept: 'application/json' } }, 12000); }
  catch (e) { throw new ApiError(e.name === 'AbortError' ? 'API timed out.' : 'API unreachable.', 'net'); }
  const rem = res.headers.get('x-ratelimit-requests-remaining'), lim = res.headers.get('x-ratelimit-requests-limit');
  if (rem != null && rem !== '') ctx.usage.remaining = +rem; if (lim != null && lim !== '') ctx.usage.limit = +lim; ctx.usage.at = Date.now();
  await kput(ctx.env, 'usage:' + ctx.usageDay, ctx.usage, 40 * 86400);
  if (res.status === 429) throw new ApiError('Rate limited by API-Football.', 'rate');
  if (res.status === 401 || res.status === 403) throw new ApiError('API key rejected.', 'auth');
  if (!res.ok) throw new ApiError('API error ' + res.status + '.', 'api');
  let body; try { body = await res.json(); } catch (e) { throw new ApiError('API returned invalid JSON.', 'api'); }
  if (!emptyErrors(body.errors)) {
    const m = JSON.stringify(body.errors).slice(0, 160), k = /token|key|auth/i.test(m) ? 'auth' : /rate|limit|request/i.test(m) ? 'quota' : 'api';
    if (k === 'quota') ctx.usage.remaining = 0;
    throw new ApiError(m, k);
  }
  if (ttl) await kput(ctx.env, ck, { t: Date.now(), d: body }, ttl);
  return body;
}

/* ---------------- odds normalisation + arbitrage ---------------- */
export function normaliseOdds(item, cfg) {
  const out = { u: item.update || null, k: {} }, bets = cfg.markets.bets, lines = cfg.markets.totalsLines.map(String);
  for (const bm of item.bookmakers || []) for (const bet of bm.bets || []) {
    if (!bets.includes(bet.id)) continue;
    for (const v of bet.values || []) {
      const odd = parseFloat(v.odd); if (!(odd > 1)) continue; let key, name = String(v.value).trim();
      if (bet.id === 1) { if (!['Home', 'Draw', 'Away'].includes(name)) continue; key = '1x2'; }
      else if (bet.id === 5) { const m = /^(Over|Under)\s+([\d.]+)$/i.exec(name); if (!m || !lines.includes(String(parseFloat(m[2])))) continue; key = 't:' + parseFloat(m[2]); name = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase() + ' ' + parseFloat(m[2]); }
      else if (bet.id === 8) { if (!['Yes', 'No'].includes(name)) continue; key = 'btts'; }
      else if (bet.id === 12) { if (!['Home/Draw', 'Draw/Away', 'Home/Away'].includes(name)) continue; key = 'dc'; }
      else continue;
      (out.k[key] = out.k[key] || []).push({ n: name, b: bm.name, o: odd });
    }
  }
  return out;
}
const need = (key) => (key === '1x2' ? ['Home', 'Draw', 'Away'] : key === 'btts' ? ['Yes', 'No'] : key.startsWith('t:') ? ['Over ' + key.slice(2), 'Under ' + key.slice(2)] : null);
export const marketLabel = (key) => (key === '1x2' ? '1X2 (Match Result)' : key === 'btts' ? 'Both Teams to Score' : 'Over / Under ' + key.slice(2) + ' Goals');
export function bestPerOutcome(quotes, names) {
  const best = {}; for (const q of quotes) if (!best[q.n] || q.o > best[q.n].o) best[q.n] = q;
  return names.map((n) => best[n] || null);
}
/* Genuine arbitrage only: every outcome covered, sum of 1/odds < 1, at least two different bookmakers. */
export function analyseFixture(fx, od, cfg) {
  const A = cfg.arbitrage, found = [];
  for (const key of Object.keys(od.k)) {
    const names = need(key); if (!names) continue;
    const best = bestPerOutcome(od.k[key], names); if (best.some((b) => !b)) continue;
    if (new Set(best.map((b) => b.b)).size < 2) continue;
    const sum = best.reduce((s, b) => s + 1 / b.o, 0), pct = (1 / sum - 1) * 100;
    if (sum >= 1 - 1e-9 || pct < A.minProfitPct || pct > A.maxProfitPct) continue;
    found.push({ key, sum, pct, best });
  }
  return found;
}
const teamName = (fx, n) => (n === 'Home' ? fx.home : n === 'Away' ? fx.away : n);
export function toEvent(fx, od, q, nowIso) {
  const mk = (key, best) => ({ key: key === '1x2' ? 'h2h' : key.startsWith('t:') ? 'totals' : 'btts', label: marketLabel(key), ...(key.startsWith('t:') ? { point: +key.slice(2) } : {}), outcomes: best.map((b) => ({ name: teamName(fx, b.n), bookmaker: b.b, odds: b.o })) });
  const markets = [mk(q.key, q.best)];
  for (const key of ['1x2', 't:2.5', 'btts']) { if (key === q.key || !od.k[key]) continue; const nm = need(key), b = bestPerOutcome(od.k[key], nm); if (!b.some((x) => !x)) markets.push(mk(key, b)); }
  return { id: `af-${fx.id}-${q.key}`, home: fx.home, away: fx.away, league: fx.league, kickoff: fx.kickoff, updated: od.u || nowIso, published: true, auto: true, source: 'api-football', fixtureId: fx.id, profitPct: +q.pct.toFixed(3), markets, expired: false };
}
/* Keep valid events stable, expire changed/started ones, fill free daily slots with the best new ones. */
export function updateArbEvents(prev, fixtures, odds, cfg, nowMs) {
  const A = cfg.arbitrage, nowIso = new Date(nowMs).toISOString(), tz = cfg.timezone, byFx = {}; fixtures.forEach((f) => (byFx[f.id] = f));
  const keep = [], autoPrev = [];
  for (const e of prev || []) (e.auto ? autoPrev : keep).push(e);
  const qual = [];
  for (const f of fixtures) {
    const od = odds[f.id]; if (!od) continue; if (Date.parse(f.kickoff) - nowMs < A.minLeadMinutes * 60000) continue;
    if (od.u && nowMs - Date.parse(od.u) > A.oddsMaxAgeHours * 3600000) continue;
    for (const q of analyseFixture(f, od, cfg)) qual.push({ f, od, q });
  }
  const qById = {}; qual.forEach((x) => (qById[`af-${x.f.id}-${x.q.key}`] = x));
  const out = [], perDay = {};
  for (const e of autoPrev) {
    const started = Date.parse(e.kickoff) <= nowMs, x = qById[e.id];
    if (e.expired) { if (nowMs - Date.parse(e.kickoff) < A.keepExpiredHours * 3600000) out.push(e); continue; }
    if (started) { out.push({ ...e, expired: true, expiredReason: 'Match started', expiredAt: nowIso }); continue; }
    if (!x) { out.push({ ...e, expired: true, expiredReason: 'Odds changed: no longer an arbitrage', expiredAt: nowIso }); continue; }
    const ne = toEvent(x.f, x.od, x.q, nowIso); out.push(ne); const d = localParts(new Date(ne.kickoff), tz).date; perDay[d] = (perDay[d] || 0) + 1;
    delete qById[e.id];
  }
  const fresh = Object.values(qById).sort((a, b) => b.q.pct - a.q.pct);
  for (const x of fresh) { const d = localParts(new Date(x.f.kickoff), tz).date; if ((perDay[d] || 0) >= A.maxPerDay) continue; out.push(toEvent(x.f, x.od, x.q, nowIso)); perDay[d] = (perDay[d] || 0) + 1; }
  return keep.concat(out);
}

/* ---------------- rollover logic (same rules as the public site) ---------------- */
export function dayStatus(sels) {
  sels = sels || []; if (!sels.length) return 'pending'; let w = 0, l = 0, p = 0;
  for (const s of sels) { if (s.status === 'lost') l++; else if (s.status === 'won') w++; else if (s.status === 'void') { /* ignored */ } else p++; }
  if (l) return 'lost'; if (p) return 'pending'; return w ? 'won' : 'void';
}
export function packageState(pkg) {
  const days = pkg.days || [], statuses = days.map((d) => (d.skipped ? 'void' : dayStatus(d.selections)));
  let failed = false, done = 0, lostIdx = -1; statuses.forEach((s, i) => { if (!failed && s === 'lost') { failed = true; lostIdx = i; } else if (!failed && (s === 'won' || s === 'void')) done++; });
  return { statuses, failed, lostIdx, overall: failed ? 'failed' : done === days.length && days.length ? 'completed' : 'active' };
}
export function gradeSelection(sel, score) {
  if (!score || score.home == null || score.away == null) return null;
  const h = +score.home, a = +score.away, pick = String(sel.pick || ''), t = h + a; let m; const win = (b) => (b ? 'won' : 'lost');
  if ((m = /^(over|under)\s*([\d.]+)/i.exec(pick))) { const line = parseFloat(m[2]); return win(/over/i.test(m[1]) ? t > line : t < line); }
  if (/btts|both teams/i.test(pick)) { const both = h > 0 && a > 0; if (/yes/i.test(pick)) return win(both); if (/no/i.test(pick)) return win(!both); return null; }
  if (/1x|home or draw/i.test(pick)) return win(h >= a);
  if (/x2|draw or away/i.test(pick)) return win(a >= h);
  if (/\b12\b|home or away/i.test(pick)) return win(h !== a);
  if (/draw/i.test(pick)) return win(h === a);
  if (/win/i.test(pick)) { const p = pick.toLowerCase(); if (sel.home && p.indexOf(sel.home.toLowerCase()) === 0) return win(h > a); if (sel.away && p.indexOf(sel.away.toLowerCase()) === 0) return win(a > h); }
  return null;
}

/* ---------------- candidate selections + ticket builder ---------------- */
const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
export function candidatesFor(fx, od, pred, cfg) {
  const R = cfg.rollovers, out = [], add = (market, pick, odds, n, apiHit, apiConf) => {
    if (odds < R.minOdds || odds > R.maxOdds) return;
    out.push({ fid: fx.id, match: `${fx.home} vs ${fx.away}`, home: fx.home, away: fx.away, league: fx.league, kickoff: fx.kickoff, market, pick, odds: Math.round(odds * 100) / 100, books: n,
      source: apiHit ? 'api-prediction' : 'odds-suggestion', conf: apiHit ? Math.max(apiConf || 0, 100 / odds) + 10 : 100 / odds });   // API-backed picks rank above plain odds picks
  };
  const med = (key, name) => { const q = (od.k[key] || []).filter((x) => x.n === name).map((x) => x.o); return q.length >= 2 ? { v: median(q), n: q.length } : null; };
  const P = pred || {}; const hp = P.ph || 0, ap = P.pa || 0;
  for (const [name, pk, hit, conf] of [['Home', fx.home + ' Win', P.w && P.w === P.home, hp], ['Away', fx.away + ' Win', P.w && P.w === P.away, ap]]) { const m = med('1x2', name); if (m) add('Match Result', pk, m.v, m.n, hit, conf); }
  for (const [name, pk, hit] of [['Home/Draw', '1X (Home or Draw)', P.wd && P.w === P.home], ['Draw/Away', 'X2 (Draw or Away)', P.wd && P.w === P.away], ['Home/Away', '12 (Home or Away)', false]]) { const m = med('dc', name); if (m) add('Double Chance', pk, m.v, m.n, hit, hit ? Math.max(hp, ap) + 15 : 0); }
  for (const key of Object.keys(od.k)) if (key.startsWith('t:')) for (const side of ['Over', 'Under']) {
    const name = `${side} ${key.slice(2)}`, m = med(key, name); if (!m) continue;
    const hit = P.uo && ((P.uo[0] === '-' && side === 'Under') || (P.uo[0] === '+' && side === 'Over')) && Math.abs(parseFloat(P.uo)) === +key.slice(2);
    add('Total Goals', name, m.v, m.n, hit, 60);
  }
  const y = med('btts', 'Yes'), n = med('btts', 'No'); if (y) add('Both Teams to Score', 'BTTS - Yes', y.v, y.n, false, 0); if (n) add('Both Teams to Score', 'BTTS - No', n.v, n.n, false, 0);
  return out;
}
/* Beam search over log-odds: best average confidence among tickets whose combined odds land within the tolerance window. */
export function buildTicket(cands, target, tolPct, maxN) {
  const lo = Math.log(target * (1 - tolPct / 100)), hi = Math.log(target * (1 + tolPct / 100)), lt = Math.log(target);
  const list = [...cands].sort((a, b) => b.conf - a.conf).slice(0, 36);
  let states = [{ l: 0, c: 0, pick: [] }], best = null;
  for (const cd of list) {
    const lg = Math.log(cd.odds), next = states.slice();
    for (const s of states) {
      if (s.pick.length >= maxN || s.pick.some((p) => p.fid === cd.fid)) continue;
      const l = s.l + lg; if (l > hi) continue;
      const n = { l, c: s.c + cd.conf, pick: s.pick.concat(cd) }; next.push(n);
      if (l >= lo) { const avg = n.c / n.pick.length; if (!best || avg > best.avg + 1e-9 || (Math.abs(avg - best.avg) < 1e-9 && Math.abs(l - lt) < Math.abs(best.l - lt))) best = { avg, l, pick: n.pick }; }
    }
    const m = new Map(); for (const s of next) { const k = Math.round(s.l / 0.015) + '|' + s.pick.length; const o = m.get(k); if (!o || s.c > o.c) m.set(k, s); }
    states = [...m.values()].sort((a, b) => b.c - a.c).slice(0, 60);
  }
  return best ? best.pick : null;
}
const toSelection = (c) => ({ match: c.match, home: c.home, away: c.away, league: c.league, market: c.market, pick: c.pick, bookmaker: `Avg of ${c.books} books`, odds: c.odds, status: 'pending', kickoff: c.kickoff, fixtureId: c.fid, source: c.source });

/* One package: manage the cycle, then fill today's ticket if empty. Returns true when it changed. */
export function advancePackage(pkg, today, cands, cfg, buildAllowed) {
  let changed = false; const D = (pkg.days || []).length || 7;
  if (!pkg.days || !pkg.days.length) { pkg.days = Array.from({ length: D }, () => ({ selections: [] })); changed = true; }
  if (!pkg.cycleStart) { pkg.cycleStart = today; changed = true; }
  const st0 = packageState(pkg), endDate = addDays(pkg.cycleStart, D - 1);
  const lostDate = st0.failed ? (pkg.days[st0.lostIdx].date || addDays(pkg.cycleStart, st0.lostIdx)) : null;
  if (today > endDate || (st0.failed && today > lostDate)) {
    pkg.history = [{ start: pkg.cycleStart, end: endDate, outcome: st0.failed ? 'failed' : st0.overall, days: pkg.days }].concat((pkg.history || []).map((h) => ({ start: h.start, end: h.end, outcome: h.outcome }))).slice(0, 3);   // full tickets kept only for the latest finished cycle
    pkg.days = Array.from({ length: D }, () => ({ selections: [] })); pkg.cycleStart = today; changed = true;
  }
  if (pkg.tolerancePct !== cfg.rollovers.tolerancePct) { pkg.tolerancePct = cfg.rollovers.tolerancePct; changed = true; }
  pkg.days.forEach((d, i) => { const dt = addDays(pkg.cycleStart, i); if (d.date !== dt) { d.date = dt; changed = true; } });
  const st = packageState(pkg);
  pkg.days.forEach((d) => { if (d.date < today && !(d.selections || []).length && !d.skipped) { d.skipped = true; changed = true; } });
  const idx = pkg.days.findIndex((d) => d.date === today);
  if (idx >= 0 && !st.failed && !pkg.days[idx].skipped && !(pkg.days[idx].selections || []).length && buildAllowed && cands.length) {
    const prior = st.statuses.slice(0, idx).every((s) => s === 'won' || s === 'void');
    if (prior) { const t = buildTicket(cands, +pkg.target, cfg.rollovers.tolerancePct, cfg.rollovers.maxSelections); if (t) { pkg.days[idx].selections = t.map(toSelection); pkg.days[idx].generatedAt = new Date().toISOString(); delete pkg.days[idx].noQualify; changed = true; } else if (pkg.days[idx].noQualify !== true) { pkg.days[idx].noQualify = true; changed = true; } }
  }
  return changed;
}

/* ---------------- scheduling ---------------- */
export function dueTasks(cfg, state, local, nowMs, hasResultsDue) {
  const S = cfg.schedule, today = local.date, due = [], ok = (t) => !(state.fail && state.fail[t] && state.fail[t].next > nowMs);
  if (state.authError) return due;
  if (local.hour >= S.fixturesHour && state.last.fixtures !== today && ok('fixtures')) due.push('fixtures');
  const slots = [...S.oddsHours].sort((a, b) => a - b).filter((h) => local.hour >= h), slot = slots.length ? slots[slots.length - 1] : null;
  if (slot != null && (state.last.oddsDate !== today || state.last.oddsSlot !== slot) && (state.last.fixtures === today || due.includes('fixtures')) && ok('odds')) due.push('odds');
  if (cfg.rollovers.useApiPredictions && cfg.rollovers.predictionsPerDay > 0 && local.hour >= S.predictionsHour && state.last.predictions !== today && (state.last.oddsDate === today || due.includes('odds')) && ok('predictions')) due.push('predictions');
  if (hasResultsDue && local.hour >= S.resultsFromHour && local.hour <= S.resultsToHour && nowMs - (state.last.resultsAt || 0) >= S.resultsEveryMinutes * 60000 && ok('results')) due.push('results');
  return due;
}
const backoff = (state, task, nowMs) => { const f = (state.fail[task] = state.fail[task] || { n: 0 }); f.n++; f.next = nowMs + Math.min(360, 15 * 2 ** f.n) * 60000; };

/* ---------------- tasks (each spends API requests only through af()) ---------------- */
async function taskFixtures(ctx) {
  const { cfg, state, today } = ctx, out = [];
  for (const L of cfg.leagues) {
    const season = L.season || seasonFor(today);
    const body = await af(ctx, 'fixtures', '/fixtures', { league: L.id, season, date: today, timezone: cfg.timezone }, 3600);
    for (const r of body.response || []) out.push({ id: r.fixture.id, home: r.teams.home.name, away: r.teams.away.name, homeId: r.teams.home.id, awayId: r.teams.away.id, league: r.league.name, leagueId: L.id, season, kickoff: r.fixture.date, status: r.fixture.status && r.fixture.status.short });
  }
  state.fixtures = { [today]: out }; state.last.fixtures = today; state.odds = {}; state.pred = state.pred || {};
  ctx.note(`Fixtures: ${out.length} matches in ${cfg.leagues.length} leagues`);
}
async function taskOdds(ctx) {
  const { cfg, state, today, nowMs } = ctx, fxs = (state.fixtures && state.fixtures[today]) || [];
  const live = fxs.filter((f) => Date.parse(f.kickoff) > nowMs), byL = {};
  live.forEach((f) => (byL[f.leagueId] = byL[f.leagueId] || f));
  if (!live.length) { state.last.oddsDate = today; state.last.oddsSlot = ctx.slot; ctx.note('Odds: no upcoming matches, skipped (0 requests)'); return; }
  const idx = {}; fxs.forEach((f) => (idx[f.id] = f)); let n = 0;
  for (const lid of Object.keys(byL)) {
    const f = byL[lid]; let page = 1, total = 1;
    while (page <= total && page <= 4) {
      const body = await af(ctx, 'odds', '/odds', { league: lid, season: f.season, date: today, timezone: cfg.timezone, page }, 1800);
      total = (body.paging && body.paging.total) || 1;
      for (const it of body.response || []) { const id = it.fixture && it.fixture.id; if (idx[id]) { state.odds[id] = normaliseOdds(it, cfg); n++; } }
      page++;
    }
  }
  state.last.oddsDate = today; state.last.oddsSlot = ctx.slot; ctx.note(`Odds: ${n} fixtures updated`);
}
async function taskPredictions(ctx) {
  const { cfg, state, today, nowMs } = ctx, fxs = ((state.fixtures && state.fixtures[today]) || []).filter((f) => Date.parse(f.kickoff) > nowMs && state.odds[f.id] && !state.pred[f.id]);
  fxs.sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff)); let n = 0;
  for (const f of fxs.slice(0, cfg.rollovers.predictionsPerDay)) {
    const body = await af(ctx, 'predictions', '/predictions', { fixture: f.id }, 21600), p = body.response && body.response[0] && body.response[0].predictions;
    if (!p) continue; const pc = (x) => parseFloat(String((p.percent || {})[x] || '0'));
    state.pred[f.id] = { w: p.winner && p.winner.id, home: f.homeId, away: f.awayId, wd: !!p.win_or_draw, uo: p.under_over || null, adv: p.advice || '', ph: pc('home'), pd: pc('draw'), pa: pc('away') }; n++;
  }
  state.last.predictions = today; ctx.note(`Predictions: ${n} fetched`);
}
async function taskResults(ctx) {
  const { cfg, nowMs } = ctx, ids = ctx.resultsIds.slice(0, 40), map = {};
  for (let i = 0; i < ids.length; i += 20) {
    const body = await af(ctx, 'results', '/fixtures', { ids: ids.slice(i, i + 20).join('-'), timezone: cfg.timezone });
    for (const r of body.response || []) map[r.fixture.id] = { status: r.fixture.status && r.fixture.status.short, ft: r.score && r.score.fulltime };
  }
  ctx.results = map; ctx.state.last.resultsAt = nowMs; ctx.note(`Results: ${Object.keys(map).length} matches checked`);
}
export const FINISHED = ['FT', 'AET', 'PEN'], VOIDED = ['PST', 'CANC', 'ABD', 'AWD', 'WO'];
export function applyResults(packages, results) {
  let n = 0;
  for (const p of packages) for (const d of p.days || []) for (const s of d.selections || []) {
    if (s.status !== 'pending' || !s.fixtureId) continue; const r = results[s.fixtureId]; if (!r) continue;
    if (VOIDED.includes(r.status)) { s.status = 'void'; n++; }
    else if (FINISHED.includes(r.status) && r.ft && r.ft.home != null) { const g = gradeSelection(s, r.ft); if (g) { s.status = g; n++; } }
  }
  return n;
}
export function resultsDueIds(packages, nowMs) {
  const ids = new Set(); for (const p of packages) for (const d of p.days || []) for (const s of d.selections || []) if (s.status === 'pending' && s.fixtureId && nowMs - Date.parse(s.kickoff) > 120 * 60000) ids.add(s.fixtureId);
  return [...ids];
}

/* ---------------- GitHub (reads data.json, commits changes) ---------------- */
async function gh(env, path, init = {}) {
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`;
  return fetchT(url + (init.method === 'PUT' ? '' : '?ref=' + (env.GITHUB_BRANCH || 'main')), { ...init, headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'sure2oddtoday-automation', 'X-GitHub-Api-Version': '2022-11-28', ...(init.body ? { 'Content-Type': 'application/json' } : {}) } }, 15000);
}
const dec = (b) => new TextDecoder().decode(unb64(String(b).replace(/\n/g, '')));
async function readData(env) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) throw new ApiError('GitHub is not configured (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO).', 'gh');
  const r = await gh(env, env.DATA_PATH || 'data.json');
  if (r.status === 404) return { data: {}, sha: null };
  if (!r.ok) throw new ApiError('GitHub read failed (' + r.status + ').', 'gh');
  const j = await r.json(); if (!j.content) throw new ApiError('data.json is too large to read through the contents API.', 'gh');
  return { data: JSON.parse(dec(j.content)), sha: j.sha };
}
async function writeData(env, data, sha, msg) {
  const body = { message: msg, content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2) + '\n'))), branch: env.GITHUB_BRANCH || 'main', ...(sha ? { sha } : {}) };
  const r = await gh(env, env.DATA_PATH || 'data.json', { method: 'PUT', body: JSON.stringify(body) });
  if (!r.ok) throw new ApiError('GitHub publish failed (' + r.status + ').', r.status === 409 ? 'conflict' : 'gh');
  const j = await r.json(); return j.commit && j.commit.sha;
}

/* ---------------- the tick ---------------- */
export async function runTick(env, opts = {}) {
  const nowMs = opts.nowMs || Date.now(), cfg = sanitiseCfg(await kget(env, 'cfg', null));
  const state = Object.assign({ last: {}, fixtures: {}, odds: {}, pred: {}, log: [], fail: {}, authError: false }, await kget(env, 'state', {}));
  state.last = state.last || {}; state.fail = state.fail || {}; state.log = state.log || [];
  const log = (m) => { state.log.unshift({ t: nowMs, m }); state.log = state.log.slice(0, 60); };
  if (!cfg.enabled && !opts.force) return { skipped: 'disabled' };
  const local = localParts(new Date(nowMs), cfg.timezone), today = local.date, usageDay = utcDate(nowMs);
  const usage = await kget(env, 'usage:' + usageDay, { total: 0, by: {}, remaining: null, limit: null, at: null });
  const ak = await getApiKey(env);
  const ctx = { env, cfg, state, today, nowMs, usage, usageDay, spent: 0, key: ak.key, note: log, slot: null };
  const summary = { ran: [], changed: false, published: false };
  try {
    const { data, sha } = await readData(env);
    const pk = data['rollover-packages'] = data['rollover-packages'] || { packages: [] }, arb = data.arbitrage = data.arbitrage || { events: [] };
    let changed = false;
    if (pk.demo === true) { pk.packages.forEach((p) => { p.days = p.days.map(() => ({ selections: [] })); delete p.cycleStart; }); pk.demo = false; changed = true; log('First automatic run: sample rollover data cleared'); }
    if (arb.demo === true) { arb.events = []; arb.demo = false; changed = true; log('First automatic run: sample arbitrage data cleared'); }
    ctx.resultsIds = resultsDueIds(pk.packages, nowMs);
    let due = opts.tasks ? opts.tasks.slice() : dueTasks(cfg, state, local, nowMs, ctx.resultsIds.length > 0);
    if (opts.force && !opts.tasks) due = ['fixtures', 'odds', 'predictions'].concat(ctx.resultsIds.length ? ['results'] : []);
    const hrs = [...cfg.schedule.oddsHours].sort((a, b) => a - b).filter((h) => local.hour >= h); ctx.slot = hrs.length ? hrs[hrs.length - 1] : local.hour;
    for (const t of due) {
      try {
        if (t === 'fixtures') await taskFixtures(ctx); else if (t === 'odds') await taskOdds(ctx); else if (t === 'predictions') await taskPredictions(ctx); else if (t === 'results') { await taskResults(ctx); if (applyResults(pk.packages, ctx.results)) changed = true; }
        summary.ran.push(t); delete state.fail[t];
      } catch (e) {
        if (e instanceof QuotaError) { log('Stopped: ' + e.message + ' (' + t + ')'); break; }
        log(`${t} failed: ${e.message}`);
        if (e.kind === 'auth') { state.authError = true; log('API key problem: automation paused until you test the connection in the editor.'); break; }
        if (e.kind === 'quota') break;
        backoff(state, t, nowMs);
      }
    }
    // free (no API) build step: arbitrage + rollover tickets
    const fxs = (state.fixtures && state.fixtures[today]) || [];
    if (cfg.arbitrage.enabled) {
      const before = JSON.stringify(arb.events), live = Object.keys(state.odds).length > 0;
      if (live || (arb.events || []).some((e) => e.auto)) {
        arb.events = updateArbEvents(arb.events || [], fxs, state.odds, cfg, nowMs);
        const active = arb.events.filter((e) => e.auto && !e.expired).length;
        arb.message = active ? '' : (state.last.oddsDate === today ? 'No valid arbitrage opportunity found today.' : 'Waiting for today\'s odds.');
        arb.checkedAt = state.last.oddsDate === today ? new Date(nowMs).toISOString() : arb.checkedAt;
        if (JSON.stringify(arb.events) !== before) changed = true;
      }
    }
    if (cfg.rollovers.enabled) {
      let built = 0;
      const cands = []; for (const f of fxs) { const od = state.odds[f.id]; if (od && Date.parse(f.kickoff) - nowMs > 20 * 60000) cands.push(...candidatesFor(f, od, state.pred[f.id], cfg)); }
      for (const p of pk.packages) {
        if (p.active === false) continue;
        const needsBuild = !((p.days || []).find((d) => d.date === today) || { selections: [1] }).selections.length;
        const allow = built < cfg.rollovers.buildPerTick; if (allow && needsBuild && cands.length) built++;
        if (advancePackage(p, today, cands, cfg, allow)) changed = true;
      }
    }
    summary.changed = changed;
    if (changed && cfg.publish.enabled && !opts.dryRun) {
      data._automation = { source: 'api-football', updatedAt: new Date(nowMs).toISOString(), note: 'Picks marked "API prediction" come from API-Football; "odds-based suggestion" picks are generated from bookmaker odds. Neither is guaranteed.' };
      try { const c = await writeData(env, data, sha, 'Sure2OddToday automation: update predictions and odds'); state.publish = { at: nowMs, ok: true, commit: c }; summary.published = true; log('Published data.json (' + String(c).slice(0, 7) + ')'); }
      catch (e) { state.publish = { at: nowMs, ok: false, msg: e.message }; log('Publish failed: ' + e.message); if (e.kind === 'conflict') log('data.json changed while publishing; will retry next tick'); }
    }
    summary.data = opts.returnData ? data : undefined;
  } catch (e) { log('Tick error: ' + e.message); summary.error = e.message; }
  finally { await kput(env, 'state', state); }
  summary.spent = ctx.spent; summary.usage = ctx.usage; return summary;
}

/* ---------------- admin API (editor) ---------------- */
const cors = (env, req) => { const o = req.headers.get('Origin') || '', ok = String(env.ALLOWED_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean); return ok.includes(o) ? { 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS', Vary: 'Origin' } : {}; };
const jres = (env, req, obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...cors(env, req) } });
function authed(req, env) {
  if (!env.ADMIN_TOKEN || env.ADMIN_TOKEN.length < 16) return false; const h = req.headers.get('Authorization') || '';
  if (!h.startsWith('Bearer ') || h.length - 7 !== env.ADMIN_TOKEN.length) return false; let r = 0; for (let i = 0; i < env.ADMIN_TOKEN.length; i++) r |= h.charCodeAt(i + 7) ^ env.ADMIN_TOKEN.charCodeAt(i); return r === 0;
}
export async function statusCall(env) {
  const k = await getApiKey(env); if (!k.key) return { ok: false, error: 'No API key saved yet.', keySource: 'none' };
  let res; try { res = await fetchT(AF_BASE + '/status', { headers: { 'x-apisports-key': k.key } }, 10000); } catch (e) { return { ok: false, error: 'API-Football could not be reached.', keySource: k.source }; }
  let b = null; try { b = await res.json(); } catch (e) { /* */ }
  if (res.status === 401 || res.status === 403 || (b && !emptyErrors(b.errors))) return { ok: false, error: 'API-Football rejected the key' + (b && b.errors && !emptyErrors(b.errors) ? ': ' + JSON.stringify(b.errors).slice(0, 120) : '.'), keySource: k.source };
  if (!res.ok || !b || !b.response) return { ok: false, error: 'Unexpected response (' + res.status + ').', keySource: k.source };
  const r = b.response, req = r.requests || {}, sub = r.subscription || {};
  const hdr = res.headers.get('x-ratelimit-requests-remaining');
  return { ok: true, keySource: k.source, keyLast4: k.key.slice(-4), plan: sub.plan || 'unknown', active: sub.active !== false, planEnds: sub.end || null, used: req.current ?? null, limitDay: req.limit_day ?? null, remaining: hdr != null && hdr !== '' ? +hdr : (req.limit_day != null && req.current != null ? req.limit_day - req.current : null), resetsAt: 'Daily at 00:00 UTC' };
}
export async function adminState(env, now = Date.now()) {
  const cfg = sanitiseCfg(await kget(env, 'cfg', null)), state = await kget(env, 'state', {}), days = [];
  for (let i = 0; i < 7; i++) { const d = utcDate(now - i * 86400000), u = await kget(env, 'usage:' + d, null); days.push({ date: d, total: u ? u.total : 0, by: u ? u.by : {}, remaining: u ? u.remaining : null }); }
  const avg = days.reduce((s, d) => s + d.total, 0) / 7, k = await getApiKey(env);
  return { cfg, keySource: k.source, keyLast4: k.key ? k.key.slice(-4) : '', today: days[0], days, avgPerDay: Math.round(avg * 10) / 10, estMonthly: Math.round(avg * 30), monthlyBudget: cfg.plan.dailyLimit * 30, authError: !!state.authError, last: state.last || {}, publish: state.publish || null, log: (state.log || []).slice(0, 25), fail: state.fail || {} };
}
async function handle(req, env) {
  const url = new URL(req.url), p = url.pathname;
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(env, req) });
  if (!p.startsWith('/admin/')) return jres(env, req, { ok: true, service: 'sure2oddtoday-automation' });
  if (!authed(req, env)) return jres(env, req, { error: 'Unauthorized.' }, 401);
  if (p === '/admin/state' && req.method === 'GET') return jres(env, req, await adminState(env));
  if (p === '/admin/key' && req.method === 'POST') {
    const b = await req.json().catch(() => ({})), key = String(b.key || '').trim();
    if (!/^[A-Za-z0-9_-]{16,80}$/.test(key)) return jres(env, req, { error: 'That does not look like an API key.' }, 400);
    await env.S2O.put('key', await encText(env, key)); const st = await kget(env, 'state', {}); st.authError = false; await kput(env, 'state', st);
    return jres(env, req, { ok: true, keyLast4: key.slice(-4), note: env.APIFOOTBALL_KEY ? 'A Cloudflare secret named APIFOOTBALL_KEY exists and takes priority over this saved key.' : '' });
  }
  if (p === '/admin/key' && req.method === 'DELETE') { await env.S2O.delete('key'); return jres(env, req, { ok: true }); }
  if (p === '/admin/test' && req.method === 'POST') {
    const r = await statusCall(env); if (r.ok) { const st = await kget(env, 'state', {}); st.authError = false; await kput(env, 'state', st); if (r.remaining != null) { const d = utcDate(Date.now()), u = await kget(env, 'usage:' + d, { total: 0, by: {}, remaining: null, limit: null, at: null }); u.remaining = r.remaining; u.limit = r.limitDay; u.at = Date.now(); await kput(env, 'usage:' + d, u, 40 * 86400); } }
    return jres(env, req, r, r.ok ? 200 : 400);
  }
  if (p === '/admin/config' && req.method === 'POST') { const b = await req.json().catch(() => null); if (!b || typeof b !== 'object') return jres(env, req, { error: 'Invalid settings.' }, 400); const c = sanitiseCfg(b); await kput(env, 'cfg', c); return jres(env, req, { ok: true, cfg: c }); }
  if (p === '/admin/run' && req.method === 'POST') {
    const b = await req.json().catch(() => ({})); const tasks = Array.isArray(b.tasks) ? b.tasks.filter((t) => ['fixtures', 'odds', 'predictions', 'results'].includes(t)) : null;
    const r = await runTick(env, { force: true, tasks: tasks && tasks.length ? tasks : null }); delete r.data; return jres(env, req, r);
  }
  return jres(env, req, { error: 'Not found.' }, 404);
}
export default {
  fetch: (req, env) => handle(req, env).catch((e) => jres(env, req, { error: 'Server error: ' + e.message }, 500)),
  scheduled: (event, env, ctx) => { ctx.waitUntil(runTick(env).catch(() => {})); }
};
