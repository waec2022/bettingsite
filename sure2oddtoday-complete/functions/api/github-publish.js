// POST /api/github-publish  {action: 'status'|'publish'|'revert', repo:{owner,repo,branch}, files:{...}}
// Requires Authorization: Bearer <ADMIN_TOKEN>. The GitHub token (GITHUB_TOKEN) never leaves this function.
import { json, isAdmin, sameSite } from '../_lib/auth.js';
const validate = (function () { var module = { exports: {} };
/* Shared validation (editor + serverless publish). Returns an array of error strings. */
(function (root) {
  'use strict';
  var V = {};
  var num = function (x) { return typeof x === 'number' && isFinite(x); };
  V.validateFile = function (name, d) {
    var e = [];
    if (name === 'site-config') {
      if (!d || typeof d !== 'object' || Array.isArray(d)) return ['site-config must be an object'];
      if (!d.brand || !d.brand.name) e.push('Website name is required');
      if (d.defaultStake != null && !(d.defaultStake > 0)) e.push('Default stake must be positive');
    } else if (name === 'bookmakers') {
      if (!Array.isArray(d)) return ['bookmakers must be a list'];
      var ids = {};
      d.forEach(function (b, i) {
        if (!b.id || !b.name) e.push('Bookmaker ' + (i + 1) + ': id and name required');
        if (ids[b.id]) e.push('Duplicate bookmaker id: ' + b.id); ids[b.id] = 1;
      });
    } else if (name === 'rollover-packages') {
      if (!d || !Array.isArray(d.packages)) return ['packages must be a list'];
      var pids = {};
      d.packages.forEach(function (p, i) {
        var t = 'Package ' + (p.name || i + 1) + ': ';
        if (!p.id) e.push(t + 'missing id'); else if (pids[p.id]) e.push(t + 'duplicate id'); pids[p.id] = 1;
        if (!(p.target > 1)) e.push(t + 'target odds must be above 1.00');
        if (!Array.isArray(p.days) || p.days.length < 1 || p.days.length > 31) e.push(t + 'needs 1 to 31 days');
        (p.days || []).forEach(function (day, di) {
          (day.selections || []).forEach(function (s, si) {
            var w = t + 'day ' + (di + 1) + ' selection ' + (si + 1) + ': ';
            if (!s.match) e.push(w + 'match name required');
            if (!(Number(s.odds) > 1)) e.push(w + 'odds must be above 1.00');
            if (['pending', 'won', 'lost', 'void'].indexOf(s.status) < 0) e.push(w + 'invalid status');
          });
        });
      });
    } else if (name === 'arbitrage') {
      if (!d || !Array.isArray(d.events)) return ['events must be a list'];
      d.events.forEach(function (ev, i) {
        var t = 'Event ' + (ev.home ? ev.home + ' vs ' + ev.away : i + 1) + ': ';
        if (!ev.id || !ev.home || !ev.away) e.push(t + 'id, home and away required');
        (ev.markets || []).forEach(function (m, mi) {
          (m.outcomes || []).forEach(function (o, oi) {
            if (!o.name || !o.bookmaker) e.push(t + 'market ' + (mi + 1) + ' outcome ' + (oi + 1) + ': name and bookmaker required');
            if (!(Number(o.odds) > 1)) e.push(t + 'market ' + (mi + 1) + ' outcome ' + (oi + 1) + ': odds must be above 1.00');
          });
        });
      });
    } else e.push('Unknown file: ' + name);
    return e;
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = V;
  else { root.SA = root.SA || {}; root.SA.validate = V; }
})(typeof window !== 'undefined' ? window : this);

return module.exports; })();

const PARTS = ['site-config', 'rollover-packages', 'bookmakers', 'arbitrage'];
const MAX = 800 * 1024;

export async function onRequestPost({ request, env }) {
  if (!sameSite(request)) return json({ error: 'Forbidden origin.' }, 403);
  if (!isAdmin(request, env)) return json({ error: 'Unauthorized. Enter the correct admin token (ADMIN_TOKEN secret, at least 16 characters).' }, 401);
  if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) return json({ error: 'Server not configured: set GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO secrets.' }, 503);
  let body; try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body.' }, 400); }
  const branch = env.GITHUB_BRANCH || 'main';
  const want = body.repo || {};
  if ((want.owner && want.owner !== env.GITHUB_OWNER) || (want.repo && want.repo !== env.GITHUB_REPO) || (want.branch && want.branch !== branch))
    return json({ error: 'Repository, owner or branch does not match the server configuration. Writes are restricted to ' + env.GITHUB_OWNER + '/' + env.GITHUB_REPO + ' on ' + branch + '.' }, 400);

  const base = `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`;
  const gh = (path, init = {}) => fetch('https://api.github.com' + path, {
    ...init,
    headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'surearb-editor', 'X-GitHub-Api-Version': '2022-11-28', ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined
  });
  const ok = async (res) => { if (!res.ok) { const t = await res.text(); const e = new Error(`GitHub ${res.status}: ${t.slice(0, 160)}`); e.status = res.status; throw e; } return res.json(); };

  async function commit(files, message) {
    const ref = await ok(await gh(`${base}/git/ref/heads/${branch}`));
    const head = await ok(await gh(`${base}/git/commits/${ref.object.sha}`));
    const tree = [];
    for (const [path, content] of Object.entries(files)) {
      const blob = await ok(await gh(`${base}/git/blobs`, { method: 'POST', body: { content, encoding: 'utf-8' } }));
      tree.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const nt = await ok(await gh(`${base}/git/trees`, { method: 'POST', body: { base_tree: head.tree.sha, tree } }));
    const c = await ok(await gh(`${base}/git/commits`, { method: 'POST', body: { message, tree: nt.sha, parents: [ref.object.sha] } }));
    await ok(await gh(`${base}/git/refs/heads/${branch}`, { method: 'PATCH', body: { sha: c.sha } }));
    return c.sha;
  }

  try {
    if (body.action === 'status') {
      const r = await ok(await gh(base));
      if (!r.permissions || !r.permissions.push) return json({ error: 'The GitHub token can read but not write this repository.' }, 403);
      await ok(await gh(`${base}/branches/${branch}`));
      return json({ connected: true, repo: r.full_name, branch });
    }
    if (body.action === 'publish') {
      const data = (body.files || {})['data.json'];
      if (!data || typeof data !== 'object') return json({ error: 'data.json is missing from the request.' }, 400);
      const errs = [];
      for (const n of PARTS) errs.push(...(data[n] === undefined ? [n + ' is missing'] : validate.validateFile(n, data[n])));
      if (errs.length) return json({ error: errs.slice(0, 3).join('; ') }, 422);
      const text = JSON.stringify(data, null, 2) + '\n';
      if (text.length > MAX) return json({ error: 'data.json is too large.' }, 413);
      const sha = await commit({ 'data.json': text }, 'SureArb editor: publish site data');
      return json({ ok: true, commit: sha });
    }
    if (body.action === 'revert') {
      const list = await ok(await gh(`${base}/commits?sha=${branch}&path=data.json&per_page=2`));
      if (list.length < 2) return json({ error: 'No earlier published version found.' }, 404);
      const prev = list[1].sha;
      const f = await ok(await gh(`${base}/contents/data.json?ref=${prev}`));
      const text = new TextDecoder().decode(Uint8Array.from(atob(f.content.replace(/\n/g, '')), (c) => c.charCodeAt(0)));
      const sha = await commit({ 'data.json': text }, 'SureArb editor: revert data to ' + prev.slice(0, 7));
      return json({ ok: true, commit: sha, restoredFrom: prev });
    }
    return json({ error: 'Unknown action.' }, 400);
  } catch (e) {
    const s = e.status === 401 ? 'GitHub rejected the token (GITHUB_TOKEN).' : e.status === 404 ? 'Repository or branch not found, or the token cannot see it.' : e.message;
    return json({ error: s }, e.status === 401 || e.status === 404 ? 502 : 500);
  }
}
