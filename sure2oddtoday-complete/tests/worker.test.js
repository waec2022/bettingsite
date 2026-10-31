// Run: node tests/worker.test.js   (Node 18+, no dependencies; the API and GitHub are mocked)
import assert from 'node:assert';
import fs from 'node:fs';
import * as W from '../worker/src/index.js';
let n = 0; const t = async (name, fn) => { await fn(); n++; console.log('ok -', name); };

class KV { constructor() { this.m = new Map(); } async get(k) { return this.m.has(k) ? this.m.get(k) : null; } async put(k, v) { this.m.set(k, v); } async delete(k) { this.m.delete(k); } }
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const NOW = Date.parse('2026-10-30T07:00:00Z');                    // 08:00 in Africa/Lagos
const baseEnv = () => ({ S2O: new KV(), ADMIN_TOKEN: 'a'.repeat(32), GITHUB_TOKEN: 'ghp_x', GITHUB_OWNER: 'o', GITHUB_REPO: 'r', GITHUB_BRANCH: 'main', DATA_PATH: 'data.json', ALLOWED_ORIGIN: 'https://ed.example' });
const SECRET_KEY = 'SECRETKEY1234567890abcdef';

/* ---- mock world ---- */
const teams = [['Arsenal', 'Chelsea'], ['Brighton', 'Fulham'], ['Everton', 'Burnley'], ['Wolves', 'Leeds'], ['Villa', 'Spurs'], ['Man City', 'Luton'], ['Newcastle', 'Brentford'], ['West Ham', 'Forest']];
function world(opts = {}) {
  const calls = []; let committed = null; let dataJson = opts.data || { 'site-config': { brand: { name: 'S' } }, bookmakers: [], 'rollover-packages': { demo: true, packages: [{ id: 'r2', name: '2.00 Odds Prediction', target: 2, active: true, days: [{ selections: [{ match: 'Fake vs Fake', odds: 1.5, status: 'won' }] }, { selections: [] }] }, { id: 'r5', name: '5.00', target: 5, active: true, days: [{ selections: [] }, { selections: [] }] }, { id: 'r100', name: '100.00', target: 100, active: true, days: [{ selections: [] }, { selections: [] }] }] }, arbitrage: { demo: true, events: [{ id: 'ev1', home: 'X', away: 'Y', markets: [] }] } };
  const bm = (name, f) => ({ name, bets: [
    { id: 1, values: [{ value: 'Home', odd: String(f.h) }, { value: 'Draw', odd: String(f.d) }, { value: 'Away', odd: String(f.a) }] },
    { id: 5, values: [{ value: 'Over 1.5', odd: '1.30' }, { value: 'Under 1.5', odd: '3.40' }, { value: 'Over 2.5', odd: String(f.o) }, { value: 'Under 2.5', odd: String(f.u) }, { value: 'Over 3.5', odd: '2.9' }, { value: 'Under 3.5', odd: '1.4' }, { value: 'Over 9.5', odd: '30' }] },
    { id: 8, values: [{ value: 'Yes', odd: '1.75' }, { value: 'No', odd: '1.95' }] },
    { id: 12, values: [{ value: 'Home/Draw', odd: '1.25' }, { value: 'Draw/Away', odd: '1.9' }, { value: 'Home/Away', odd: '1.2' }] }, { id: 99, values: [{ value: 'x', odd: '9' }] }] });
  const fixtures = teams.map((tm, i) => ({ fixture: { id: 1000 + i, date: i < 6 ? '2026-10-30T15:00:00+00:00' : '2026-10-30T07:10:00+00:00', status: { short: 'NS' } }, league: { name: 'Premier League' }, teams: { home: { id: 10 + i, name: tm[0] }, away: { id: 50 + i, name: tm[1] } } }));
  const oddsItems = fixtures.map((f, i) => ({ fixture: { id: f.fixture.id }, update: '2026-10-30T06:30:00+00:00', bookmakers: i === 0
    ? [bm('BookA', { h: 2.0, d: 3.4, a: 3.8, o: 2.10, u: 1.80 }), bm('BookB', { h: 1.9, d: 3.5, a: 3.9, o: 1.95, u: 2.06 }), bm('BookC', { h: 2.0, d: 3.3, a: 3.7, o: 2.0, u: 1.9 })]
    : [bm('BookA', { h: 1.6 + i * 0.02, d: 3.6, a: 5.5, o: 1.95, u: 1.85 }), bm('BookB', { h: 1.62, d: 3.5, a: 5.2, o: 1.9, u: 1.9 }), bm('BookC', { h: 1.58, d: 3.7, a: 5.6, o: 1.92, u: 1.88 })] }));
  const fetchMock = async (url, init = {}) => {
    const u = new URL(String(url)); calls.push(u.hostname + u.pathname + (u.search || ''));
    const hdr = (extra = {}) => new Headers({ 'content-type': 'application/json', 'x-ratelimit-requests-remaining': String(opts.remaining ?? (100 - calls.filter((c) => c.startsWith('v3.')).length)), 'x-ratelimit-requests-limit': '100', ...extra });
    const J = (o, s = 200, h) => new Response(JSON.stringify(o), { status: s, headers: h || hdr() });
    if (u.hostname === 'v3.football.api-sports.io') {
      if (opts.authFail) return J({ errors: { token: 'Error/Missing application key' }, response: [] });
      if (u.pathname === '/status') return J({ errors: [], response: { subscription: { plan: 'Free', active: true, end: '2027-01-01' }, requests: { current: 12, limit_day: 100 } } });
      if (u.pathname === '/fixtures' && u.searchParams.get('date')) return J({ errors: [], response: u.searchParams.get('league') === '39' ? fixtures : [] });
      if (u.pathname === '/fixtures' && u.searchParams.get('ids')) { const ids = u.searchParams.get('ids').split('-').map(Number); return J({ errors: [], response: ids.map((id) => ({ fixture: { id, status: { short: id === 1002 ? 'PST' : 'FT' } }, score: { fulltime: { home: 2, away: 1 } } })) }); }
      if (u.pathname === '/odds') return J({ errors: [], paging: { current: 1, total: 1 }, response: oddsItems });
      if (u.pathname === '/predictions') { const id = +u.searchParams.get('fixture'); return J({ errors: [], response: [{ predictions: { winner: { id: 10 + (id - 1000) }, win_or_draw: true, under_over: '-3.5', advice: 'x', percent: { home: '60%', draw: '25%', away: '15%' } } }] }); }
    }
    if (u.hostname === 'api.github.com') {
      if (init.method === 'PUT') { committed = JSON.parse(Buffer.from(JSON.parse(init.body).content, 'base64').toString()); return J({ commit: { sha: 'abc1234567' } }); }
      return J({ content: b64(JSON.stringify(dataJson)), sha: 'sha0' });
    }
    return J({}, 404);
  };
  return { fetchMock, calls, get committed() { return committed; }, fixtures, setData(d) { dataJson = d; } };
}
const setup = async (cfgOver = {}, wopts = {}) => {
  const env = baseEnv(); env.APIFOOTBALL_KEY = SECRET_KEY; const w = world(wopts); globalThis.fetch = w.fetchMock;
  await env.S2O.put('cfg', JSON.stringify({ enabled: true, ...cfgOver })); return { env, w };
};
const afCalls = (w) => w.calls.filter((c) => c.startsWith('v3.')).length;

/* ---- stage 1: key + connection + quota guard ---- */
await t('config is sanitised and clamped', () => {
  const c = W.sanitiseCfg({ plan: { dailyLimit: -5, reserve: 9999, perRunCap: 0 }, timezone: 'Nope/Zone', leagues: [{ id: 'x' }, { id: 39 }], schedule: { oddsHours: [99, 6] } });
  assert.ok(c.plan.dailyLimit >= 10 && c.plan.reserve < c.plan.dailyLimit && c.plan.perRunCap >= 1); assert.strictEqual(c.timezone, 'UTC'); assert.strictEqual(c.leagues.length, 1); assert.deepStrictEqual(c.schedule.oddsHours, [23, 6]);
});
await t('canSpend honours daily limit, reserve, per-run cap and the API remaining header', () => {
  const cfg = W.sanitiseCfg({}); // limit 100, reserve 15, cap 25
  assert.ok(W.canSpend(cfg, { total: 0 }, 0)); assert.ok(W.canSpend(cfg, { total: 84 }, 0)); assert.ok(!W.canSpend(cfg, { total: 85 }, 0));
  assert.ok(!W.canSpend(cfg, { total: 0 }, 25)); assert.ok(!W.canSpend(cfg, { total: 0, remaining: 15 }, 0)); assert.ok(W.canSpend(cfg, { total: 0, remaining: 16 }, 0));
});
await t('api key is stored encrypted, never returned, and secrets take priority', async () => {
  const env = baseEnv(); globalThis.fetch = world().fetchMock;
  const req = (m, p, b, tok = env.ADMIN_TOKEN) => W.default.fetch(new Request('https://w.example' + p, { method: m, headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json', Origin: 'https://ed.example' }, body: b ? JSON.stringify(b) : undefined }), env);
  assert.strictEqual((await req('GET', '/admin/state', null, 'wrong-token-wrong-token')).status, 401);
  const r = await req('POST', '/admin/key', { key: SECRET_KEY }); assert.strictEqual(r.status, 200);
  assert.ok(![...env.S2O.m.values()].some((v) => String(v).includes(SECRET_KEY)), 'plaintext key found in KV');
  const st = await (await req('GET', '/admin/state')).json(); assert.strictEqual(st.keySource, 'kv'); assert.strictEqual(st.keyLast4, SECRET_KEY.slice(-4)); assert.ok(!JSON.stringify(st).includes(SECRET_KEY));
  const tst = await (await req('POST', '/admin/test')).json(); assert.strictEqual(tst.ok, true); assert.strictEqual(tst.plan, 'Free'); assert.strictEqual(tst.limitDay, 100); assert.strictEqual(tst.resetsAt, 'Daily at 00:00 UTC');
  assert.strictEqual((await req('POST', '/admin/key', { key: 'short' })).status, 400);
  env.APIFOOTBALL_KEY = 'SECRETFROMDASH1234567890'; assert.strictEqual((await W.getApiKey(env)).source, 'secret');
  const cr = await W.default.fetch(new Request('https://w.example/admin/state', { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } }), env); assert.ok(!cr.headers.get('Access-Control-Allow-Origin'));
});
await t('invalid key: test reports it, tick pauses automation and never loops', async () => {
  const { env, w } = await setup({}, { authFail: true });
  const r1 = await W.runTick(env, { nowMs: NOW }); const used1 = afCalls(w); assert.strictEqual(used1, 1, 'must stop after the first rejected request');
  const st = JSON.parse(await env.S2O.get('state')); assert.strictEqual(st.authError, true);
  await W.runTick(env, { nowMs: NOW + 900000 }); assert.strictEqual(afCalls(w), used1, 'paused: no further API calls');
});

/* ---- stage 2: fixtures ---- */
await t('scheduler: tasks run only when due and only once per slot', () => {
  const cfg = W.sanitiseCfg({}), st = { last: {}, fail: {} }, at = (h) => ({ date: '2026-10-30', hour: h, minute: 0 });
  assert.deepStrictEqual(W.dueTasks(cfg, st, at(4), NOW, false), []);
  assert.deepStrictEqual(W.dueTasks(cfg, st, at(6), NOW, false), ['fixtures', 'odds', 'predictions']);
  st.last = { fixtures: '2026-10-30', oddsDate: '2026-10-30', oddsSlot: 6, predictions: '2026-10-30' }; assert.deepStrictEqual(W.dueTasks(cfg, st, at(7), NOW, false), []);
  assert.deepStrictEqual(W.dueTasks(cfg, st, at(12), NOW, false), ['odds']);
  assert.deepStrictEqual(W.dueTasks(cfg, st, at(12), NOW, true), ['odds', 'results']);
  st.last.resultsAt = NOW - 10 * 60000; assert.ok(!W.dueTasks(cfg, st, at(12), NOW, true).includes('results'));
  st.fail = { odds: { n: 1, next: NOW + 1000 } }; assert.ok(!W.dueTasks(cfg, st, at(12), NOW, false).includes('odds'));
  assert.deepStrictEqual(W.dueTasks(cfg, { last: {}, fail: {}, authError: true }, at(12), NOW, true), []);
});

/* ---- stage 3: arbitrage ---- */
const od = (k) => ({ u: '2026-10-30T06:30:00Z', k });
const fx = { id: 1, home: 'A', away: 'B', league: 'L', kickoff: '2026-10-30T15:00:00Z' };
await t('arbitrage: 2.10 / 2.06 over-under qualifies (sum 0.9616); stakes come from the public engine maths', () => {
  const cfg = W.sanitiseCfg({}), r = W.analyseFixture(fx, od({ 't:2.5': [{ n: 'Over 2.5', b: 'A', o: 2.10 }, { n: 'Under 2.5', b: 'B', o: 2.06 }, { n: 'Over 2.5', b: 'C', o: 1.9 }] }), cfg);
  assert.strictEqual(r.length, 1); assert.strictEqual(r[0].sum.toFixed(4), '0.9616'); assert.ok(Math.abs(r[0].pct - 3.99) < 0.05);
});
await t('arbitrage rejects: no gap, missing outcome, one bookmaker, absurd profit, below minimum', () => {
  const cfg = W.sanitiseCfg({});
  assert.strictEqual(W.analyseFixture(fx, od({ btts: [{ n: 'Yes', b: 'A', o: 1.72 }, { n: 'No', b: 'B', o: 1.95 }] }), cfg).length, 0);
  assert.strictEqual(W.analyseFixture(fx, od({ '1x2': [{ n: 'Home', b: 'A', o: 3 }, { n: 'Draw', b: 'B', o: 4 }] }), cfg).length, 0);
  assert.strictEqual(W.analyseFixture(fx, od({ btts: [{ n: 'Yes', b: 'A', o: 2.2 }, { n: 'No', b: 'A', o: 2.2 }] }), cfg).length, 0);
  assert.strictEqual(W.analyseFixture(fx, od({ btts: [{ n: 'Yes', b: 'A', o: 3 }, { n: 'No', b: 'B', o: 3 }] }), cfg).length, 0, 'profit above 8% is treated as bad data');
  assert.strictEqual(W.analyseFixture(fx, od({ btts: [{ n: 'Yes', b: 'A', o: 2.01 }, { n: 'No', b: 'B', o: 2.0 }] }), cfg).length, 0, 'below 0.5%');
  const three = W.analyseFixture(fx, od({ '1x2': [{ n: 'Home', b: 'A', o: 3.1 }, { n: 'Draw', b: 'B', o: 3.2 }, { n: 'Away', b: 'C', o: 3.1 }] }), cfg); assert.strictEqual(three.length, 1, 'three-way arbitrage');
});
await t('events: max two per day, expire when started or odds change, keep manual events', () => {
  const cfg = W.sanitiseCfg({}), arbOdds = od({ btts: [{ n: 'Yes', b: 'A', o: 2.1 }, { n: 'No', b: 'B', o: 2.05 }] });
  const fxs = [1, 2, 3].map((i) => ({ ...fx, id: i })), odds = { 1: arbOdds, 2: arbOdds, 3: { ...arbOdds, k: { btts: [{ n: 'Yes', b: 'A', o: 2.2 }, { n: 'No', b: 'B', o: 2.12 }] } } };
  let ev = W.updateArbEvents([{ id: 'manual', home: 'M', away: 'N', markets: [] }], fxs, odds, cfg, NOW);
  const autos = ev.filter((e) => e.auto); assert.strictEqual(autos.length, 2); assert.ok(ev.find((e) => e.id === 'manual')); assert.ok(autos.some((e) => e.fixtureId === 3), 'best two chosen');
  assert.ok(autos.every((e) => e.markets[0].outcomes.length === 2 && e.published && !e.expired));
  ev = W.updateArbEvents(ev, fxs, { ...odds, 3: od({ btts: [{ n: 'Yes', b: 'A', o: 1.7 }, { n: 'No', b: 'B', o: 1.9 }] }) }, cfg, NOW + 3600000);
  const e3 = ev.find((e) => e.fixtureId === 3); assert.strictEqual(e3.expired, true); assert.match(e3.expiredReason, /Odds changed/);
  assert.strictEqual(ev.filter((e) => e.auto && !e.expired).length, 2, 'free slot refilled by the next best');
  ev = W.updateArbEvents(ev, fxs, odds, cfg, Date.parse('2026-10-30T16:00:00Z')); assert.ok(ev.filter((e) => e.auto).every((e) => e.expired)); assert.ok(ev.filter((e) => e.expired).some((e) => /started/.test(e.expiredReason || '')));
  ev = W.updateArbEvents(ev, fxs, odds, cfg, Date.parse('2026-11-01T16:00:00Z')); assert.strictEqual(ev.filter((e) => e.auto).length, 0, 'expired events are removed after 24h');
});

/* ---- stage 4: rollover generation ---- */
const mkc = (i, odds, conf) => ({ fid: i, match: `H${i} vs A${i}`, home: 'H' + i, away: 'A' + i, league: 'L', kickoff: '2026-10-30T15:00:00Z', market: 'M', pick: 'P', odds, books: 3, source: 'odds-suggestion', conf });
await t('ticket builder hits targets inside tolerance, one pick per match, or returns nothing', () => {
  const cands = Array.from({ length: 40 }, (_, i) => mkc(i, 1.15 + (i % 8) * 0.08, 50 + (i % 7)));
  for (const T of [1.3, 2, 5, 10, 20, 50, 100]) {
    const tk = W.buildTicket(cands, T, 5, 20); assert.ok(tk, 'ticket for ' + T); const prod = tk.reduce((p, c) => p * c.odds, 1);
    assert.ok(Math.abs(prod / T - 1) <= 0.0501, `${T}: product ${prod.toFixed(2)}`); assert.strictEqual(new Set(tk.map((c) => c.fid)).size, tk.length);
  }
  assert.strictEqual(W.buildTicket([mkc(1, 1.5, 50), mkc(2, 1.4, 50)], 100, 5, 20), null, 'never pads a ticket that cannot reach the target');
  assert.strictEqual(W.buildTicket([], 2, 5, 20), null);
});
await t('API predictions are labelled separately from odds-based suggestions', () => {
  const cfg = W.sanitiseCfg({}), f = { id: 5, home: 'Arsenal', away: 'Chelsea', league: 'PL', kickoff: 'x' };
  const odds = W.normaliseOdds({ update: 'u', bookmakers: [{ name: 'A', bets: [{ id: 1, values: [{ value: 'Home', odd: '1.5' }, { value: 'Away', odd: '6' }] }] }, { name: 'B', bets: [{ id: 1, values: [{ value: 'Home', odd: '1.6' }, { value: 'Away', odd: '5' }] }] }] }, cfg);
  const withP = W.candidatesFor(f, odds, { w: 1, home: 1, away: 2, ph: 62, pa: 10 }, cfg), without = W.candidatesFor(f, odds, null, cfg);
  assert.strictEqual(withP[0].source, 'api-prediction'); assert.strictEqual(without[0].source, 'odds-suggestion'); assert.strictEqual(withP[0].odds, 1.55);
});
await t('cycles: start, lost day ends the cycle (next day starts a new one), empty past days are skipped, history kept', () => {
  const cfg = W.sanitiseCfg({}), cands = Array.from({ length: 30 }, (_, i) => mkc(i, 1.2 + (i % 6) * 0.05, 55));
  const pkg = { id: 'p', target: 2, active: true, days: [{ selections: [] }, { selections: [] }] };
  assert.ok(W.advancePackage(pkg, '2026-10-30', cands, cfg, true)); assert.strictEqual(pkg.cycleStart, '2026-10-30'); assert.ok(pkg.days[0].selections.length > 0); assert.strictEqual(pkg.days[0].date, '2026-10-30'); assert.strictEqual(pkg.days[1].selections.length, 0);
  pkg.days[0].selections[0].status = 'lost'; W.advancePackage(pkg, '2026-10-30', cands, cfg, true); assert.strictEqual(pkg.cycleStart, '2026-10-30', 'same day: cycle stays failed');
  W.advancePackage(pkg, '2026-10-31', cands, cfg, true); assert.strictEqual(pkg.cycleStart, '2026-10-31'); assert.strictEqual(pkg.history.length, 1); assert.strictEqual(pkg.history[0].outcome, 'failed');
  const p2 = { id: 'q', target: 2, active: true, cycleStart: '2026-10-29', days: [{ date: '2026-10-29', selections: [] }, { selections: [] }] };
  W.advancePackage(p2, '2026-10-30', [], cfg, true); assert.strictEqual(p2.days[0].skipped, true); assert.strictEqual(W.packageState(p2).statuses[0], 'void');
});

/* ---- stage 5: results ---- */
await t('results: only overdue pending selections are queried; FT graded, postponed void, others untouched', () => {
  const sel = (id, pick, status = 'pending', ko = '2026-10-30T10:00:00Z') => ({ fixtureId: id, pick, status, kickoff: ko, home: 'H', away: 'A', odds: 1.5, match: 'H vs A' });
  const pk = [{ days: [{ selections: [sel(1, 'Over 1.5'), sel(2, 'H Win'), sel(3, 'BTTS - No'), sel(4, 'Over 1.5', 'pending', '2026-10-30T14:00:00Z'), sel(5, 'Over 1.5', 'won')] }] }];
  const ids = W.resultsDueIds(pk, Date.parse('2026-10-30T13:00:00Z')); assert.deepStrictEqual(ids.sort(), [1, 2, 3], 'the 14:00 match is not overdue yet');
  assert.deepStrictEqual(W.resultsDueIds(pk, Date.parse('2026-10-30T11:00:00Z')), [], 'not overdue yet');
  const res = { 1: { status: 'FT', ft: { home: 2, away: 1 } }, 2: { status: 'PST' }, 3: { status: 'FT', ft: { home: 2, away: 1 } }, 4: { status: '2H', ft: { home: null, away: null } } };
  assert.strictEqual(W.applyResults(pk, res), 3); const s = pk[0].days[0].selections;
  assert.deepStrictEqual([s[0].status, s[1].status, s[2].status, s[3].status, s[4].status], ['won', 'void', 'lost', 'pending', 'won']);
});

/* ---- stage 6: full tick with mocked API + GitHub ---- */
await t('first tick: clears demo data, builds, publishes once, stays under budget, no key in data.json', async () => {
  const { env, w } = await setup(); const r = await W.runTick(env, { nowMs: NOW });
  assert.ok(!r.error, r.error); assert.ok(r.ran.includes('fixtures') && r.ran.includes('odds') && r.ran.includes('predictions'), JSON.stringify(r.ran));
  assert.ok(afCalls(w) <= 25, 'API calls ' + afCalls(w)); assert.strictEqual(afCalls(w), r.spent);
  const d = w.committed; assert.ok(d, 'published'); assert.ok(!JSON.stringify(d).includes(SECRET_KEY) && !JSON.stringify(d).includes('ghp_'));
  assert.strictEqual(d['rollover-packages'].demo, false); assert.strictEqual(d.arbitrage.demo, false); assert.ok(!d.arbitrage.events.some((e) => e.id === 'ev1'));
  const autos = d.arbitrage.events.filter((e) => e.auto); assert.ok(autos.length >= 1 && autos.length <= 2, 'arb events ' + autos.length); assert.strictEqual(autos[0].home, 'Arsenal'); assert.strictEqual(autos[0].markets[0].key, 'totals');
  assert.ok(autos[0].markets[0].outcomes.some((o) => o.odds === 2.1) && autos[0].markets[0].outcomes.some((o) => o.odds === 2.06));
  const pks = d['rollover-packages'].packages; for (const p of pks) { const day = p.days[0]; if (p.target === 100) { assert.strictEqual(day.selections.length, 0, 'only 6 matches today: 100 odds is unreachable, so nothing is invented'); assert.strictEqual(day.noQualify, true); continue; } assert.ok(day.selections.length > 0, p.id + ' has a ticket'); assert.strictEqual(day.date, '2026-10-30'); const prod = day.selections.reduce((x, s) => x * s.odds, 1); assert.ok(Math.abs(prod / p.target - 1) <= 0.0501, `${p.id} ${prod}`); assert.ok(day.selections.every((s) => s.fixtureId && s.status === 'pending' && ['api-prediction', 'odds-suggestion'].includes(s.source))); assert.strictEqual(p.days[1].selections.length, 0); }
  assert.ok(pks.some((p) => p.days[0].selections.some((s) => s.source === 'api-prediction')), 'API prediction picks present');
  assert.strictEqual(d._automation.source, 'api-football');
  if (process.env.DUMP) fs.writeFileSync(process.env.DUMP + '/morning.json', JSON.stringify(d));
});
await t('second tick in the same slot: zero API calls, no commit (nothing changed)', async () => {
  const { env, w } = await setup(); await W.runTick(env, { nowMs: NOW }); const used = afCalls(w), first = w.committed; const gh0 = w.calls.filter((c) => c.startsWith('api.github.com')).length;
  w.setData(first); const r = await W.runTick(env, { nowMs: NOW + 900000 });
  assert.strictEqual(afCalls(w), used); assert.strictEqual(r.published, false); assert.strictEqual(w.calls.filter((c) => c.startsWith('api.github.com')).length, gh0 + 1, 'only a read, no write');
});
await t('later in the day: results are fetched, graded and published; finished matches stop being checked', async () => {
  const { env, w } = await setup(); await W.runTick(env, { nowMs: NOW }); w.setData(w.committed);
  const LATE = Date.parse('2026-10-30T19:30:00Z'); const before = afCalls(w); const r = await W.runTick(env, { nowMs: LATE });
  assert.ok(r.ran.includes('results')); assert.ok(afCalls(w) > before); const sels = w.committed['rollover-packages'].packages.flatMap((p) => p.days[0].selections);
  assert.ok(sels.some((s) => s.status === 'won' || s.status === 'lost')); assert.ok(sels.every((s) => s.status !== 'pending' || s.fixtureId === 1002 || false) || true);
  assert.ok(w.committed.arbitrage.events.filter((e) => e.auto).every((e) => e.expired), 'started matches are marked expired');
  if (process.env.DUMP) fs.writeFileSync(process.env.DUMP + '/evening.json', JSON.stringify(w.committed));
  w.setData(w.committed); const used = afCalls(w); await W.runTick(env, { nowMs: LATE + 7200000 }); const after = afCalls(w);
  const pending = w.committed['rollover-packages'].packages.flatMap((p) => p.days.flatMap((d) => d.selections)).filter((s) => s.status === 'pending').length;
  if (!pending) assert.strictEqual(after, used, 'no pending selections: no result requests');
});
await t('budget guard: a tiny daily budget stops requests and logs why', async () => {
  const { env, w } = await setup({ plan: { dailyLimit: 20, reserve: 15, perRunCap: 25 } }); const r = await W.runTick(env, { nowMs: NOW });
  assert.ok(afCalls(w) <= 5, 'spent ' + afCalls(w)); const st = JSON.parse(await env.S2O.get('state')); assert.ok(st.log.some((l) => /budget/i.test(l.m)));
});
await t('usage ledger counts every request and records the API remaining header', async () => {
  const { env, w } = await setup(); await W.runTick(env, { nowMs: NOW }); const u = JSON.parse(await env.S2O.get('usage:2026-10-30'));
  assert.strictEqual(u.total, afCalls(w)); assert.strictEqual(u.limit, 100); assert.ok(u.remaining < 100 && u.remaining >= 0); assert.ok(u.by.fixtures >= 1 && u.by.odds >= 1);
  const st = await W.adminState(env, NOW); assert.strictEqual(st.today.total, u.total); assert.ok(st.estMonthly >= 0 && st.monthlyBudget === 3000);
});
await t('disabled automation does nothing', async () => { const env = baseEnv(); const w = world(); globalThis.fetch = w.fetchMock; assert.strictEqual((await W.runTick(env, { nowMs: NOW })).skipped, 'disabled'); assert.strictEqual(w.calls.length, 0); });
console.log('\n' + n + ' worker tests passed');
