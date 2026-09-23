
/* ============================================================
   MatchForecast — script.js (data-driven rendering)
   Reads everything from data.json (published by the private
   editor). Renders into the EXISTING index.html containers
   where they exist, and creates the 4 newer panels (Bet of the
   Day, Live Predictions, Correct Score, Codes Only) if they are
   not already present in the page, so this still works even if
   index.html hasn't been updated with the new markup yet.

   SCHEDULING: every item may carry a `publishAt` ISO timestamp
   (Africa/Lagos, e.g. 2026-09-20T15:00:00+01:00). Anything whose
   publishAt is in the future is filtered out everywhere — lists,
   counts and search — until the clock passes it. A 30s poll
   re-filters and re-renders without a full page reload.
   ============================================================ */

(function () {
  'use strict';

  // Guards against script.js accidentally being included twice in index.html
  // (easy to happen after manual edits) — without this, two copies would
  // both try to render, causing duplicate sections and race conditions.
  if (window.__mfScriptInitialized) return;
  window.__mfScriptInitialized = true;

  const DATA_URL = 'data.json';
  const POLL_MS = 30000;
  let DATA = null;
  let activeFilter = 'All';

  /* ---------------- helpers ---------------- */
  function now() { return new Date(); }
  function isLive(item) {
    if (!item.publishAt) return true;
    return new Date(item.publishAt).getTime() <= now().getTime();
  }
  function livePublished(list) {
    return (list || []).filter(i => isLive(i) && i.status !== 'cancelled');
  }
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  const BADGE_COLORS = ['#2ecc58', '#2f7bff', '#8b5cf6', '#e34848', '#ffb100', '#0aa2a2', '#c2185b', '#5c6bc0'];
  function teamInitials(name) {
    return String(name || '').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  }
  function hashColor(str) {
    let h = 0;
    for (let i = 0; i < String(str).length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return BADGE_COLORS[h % BADGE_COLORS.length];
  }
  function teamBadge(name, logoUrl) {
    if (logoUrl) return `<img class="team-badge team-badge--logo" src="${esc(logoUrl)}" alt="${esc(name)}">`;
    return `<span class="team-badge" style="background:${hashColor(name)}">${esc(teamInitials(name))}</span>`;
  }
  function matchupHtml(home, away, homeLogo, awayLogo) {
    return `<span class="matchup">
      <span class="matchup__side">${teamBadge(home, homeLogo)}<span class="matchup__name">${esc(home)}</span></span>
      <span class="matchup__vs">vs</span>
      <span class="matchup__side">${teamBadge(away, awayLogo)}<span class="matchup__name">${esc(away)}</span></span>
    </span>`;
  }
  function matchupFromString(matchStr) {
    const parts = String(matchStr || '').split(/\s+vs\s+/i);
    if (parts.length === 2) return matchupHtml(parts[0], parts[1]);
    return esc(matchStr);
  }

  // A bookmaker's affiliateUrl only counts as "real" once someone has actually
  // set it in the editor — the placeholder values (e.g. BET9JA_AFFILIATE_URL)
  // don't count, so badges safely stay non-clickable until a real link exists.
  function isRealUrl(url) {
    return !!url && /^https?:\/\//i.test(url);
  }
  function bookmakerMeta(key) {
    return (DATA.meta.bookmakers || []).find(b => b.key === key);
  }

  // Always walk bookmakers in the site's canonical order (meta.bookmakers),
  // not the random insertion order they happen to have on a given item.
  function orderedBookmakerEntries(bookmakers) {
    if (!bookmakers) return [];
    const order = (DATA.meta.bookmakers || []).map(b => b.key);
    return Object.entries(bookmakers).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  }
  function bookmakerBadges(bookmakers) {
    if (!bookmakers) return '';
    return orderedBookmakerEntries(bookmakers).map(([k, v]) => {
      const meta = bookmakerMeta(k);
      const style = meta && meta.color ? ` style="background:${esc(meta.color)}"` : '';
      const label = `${esc(bookmakerLabel(k))}${v.odds ? ' ' + esc(v.odds) : ''}`;
      if (meta && isRealUrl(meta.affiliateUrl)) {
        return `<a class="bm-badge bm-badge--${esc(k)}" href="${esc(meta.affiliateUrl)}" target="_blank" rel="noopener sponsored"${style}>${label}</a>`;
      }
      return `<span class="bm-badge bm-badge--${esc(k)}"${style}>${label}</span>`;
    }).join('');
  }
  function bookmakerLabel(key) {
    const m = (DATA.meta.bookmakers || []).find(b => b.key === key);
    return m ? m.name : key;
  }
  function codeRevealHtml(bookmakers, idPrefix) {
    if (!bookmakers || !Object.keys(bookmakers).length) return '';
    const rows = orderedBookmakerEntries(bookmakers).filter(([, v]) => v.code).map(([k, v]) =>
      `<div class="code-row"><span class="code-row__bm">${esc(bookmakerLabel(k))}</span>
        <span class="code-row__code" data-code-value="${esc(v.code)}">••••••</span>
        <button type="button" class="code-row__btn code-row__btn--copy" data-copy="${esc(v.code)}" style="display:none">Copy</button>
      </div>`
    ).join('');
    return `<button type="button" class="reveal-toggle" data-reveal-toggle="${idPrefix}">🔒 Reveal Code</button>
      <div class="code-reveal" id="${idPrefix}" style="display:none">${rows}</div>`;
  }

  // Ensure a panel exists in the DOM; create + append if missing.
  function ensurePanel(id, parentSelector, headerHtml, extraClass) {
    let panel = document.getElementById(id);
    if (panel) return panel;
    panel = el('div', 'panel' + (extraClass ? ' ' + extraClass : ''));
    panel.id = id;
    panel.innerHTML = headerHtml;
    const parent = document.querySelector(parentSelector) || document.querySelector('.content-main') || document.querySelector('main');
    if (parent) parent.appendChild(panel);
    return panel;
  }

  // Guarantees a specific inner element exists inside a panel and returns it —
  // NEVER returns null. This is what fixes the real bug: if the page already
  // has a static, pre-existing version of a section (built before this data
  // system existed) that doesn't contain the content container we need,
  // this appends it instead of assuming it's already there and crashing.
  function ensureChild(panel, childId, childHtml) {
    let child = document.getElementById(childId);
    if (child) return child;
    if (panel) panel.insertAdjacentHTML('beforeend', childHtml);
    return document.getElementById(childId);
  }

  /* ---------------- TOP PICKS (predictions) ---------------- */
  const FILTERS = ['All', 'Over/Under', 'BTTS', 'Match Winner', 'Double Chance', 'Other'];

  // Guarantees Top Picks always has somewhere to render, even if the page's
  // own #picksTableBody/#picksCardsList markup is missing or renamed —
  // same self-healing approach used for Bet of the Day, Correct Score, etc.
  function ensureTopPicksContainers() {
    let cardsList = document.getElementById('picksCardsList');
    let filtersEl = document.getElementById('picksFilters');
    let badge = document.getElementById('pickCountBadge');
    if (cardsList && filtersEl) {
      return { cardsList, filtersEl, badge, tbody: document.getElementById('picksTableBody') };
    }
    const panel = ensurePanel('top-picks-fallback', '.content-main',
      `<div class="panel__header"><h2 class="panel__title"><span class="panel__title-icon">🔥</span> TODAY'S TOP PICKS <span id="pickCountBadgeFallback" class="badge-count"></span></h2></div>
       <div id="picksFiltersFallback" class="filter-row"></div>
       <div id="picksCardsListFallback"></div>`, 'panel--picks-fallback');
    return {
      cardsList: panel.querySelector('#picksCardsListFallback'),
      filtersEl: panel.querySelector('#picksFiltersFallback'),
      badge: panel.querySelector('#pickCountBadgeFallback'),
      tbody: null,
    };
  }

  function renderPicksFilters(items, filtersEl) {
    if (!filtersEl) return;
    filtersEl.innerHTML = FILTERS.map(f => {
      const count = f === 'All' ? items.length : items.filter(i => i.category === f).length;
      const activeCls = f === activeFilter ? ' filter-chip--active' : '';
      return `<button class="filter-chip${activeCls}" data-filter="${esc(f)}" role="tab" aria-selected="${f === activeFilter}">${esc(f)} (${count})</button>`;
    }).join('');
    filtersEl.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => { activeFilter = btn.dataset.filter; renderPicks(); });
    });
  }

  function renderPicks() {
    const { cardsList, filtersEl, badge, tbody } = ensureTopPicksContainers();
    const items = livePublished(DATA.predictions).sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (badge) badge.textContent = `${items.length} Selections`;
    const overviewTotal = document.getElementById('statTotal');
    if (overviewTotal) overviewTotal.textContent = items.length;

    renderPicksFilters(items, filtersEl);
    const filtered = activeFilter === 'All' ? items : items.filter(i => i.category === activeFilter);

    if (tbody) {
      tbody.innerHTML = filtered.map((p, idx) => `
        <tr id="prediction-${esc(p.id)}">
          <td class="col-num">${idx + 1}</td>
          <td class="col-match">${matchupHtml(p.home, p.away, p.homeLogo, p.awayLogo)}<div class="mf-sub">${esc(p.league || '')}</div></td>
          <td class="col-pick">${esc(p.selection)}${p.rating ? `<div class="mf-rating">Rating ${esc(p.rating)}/10</div>` : ''}</td>
          <td class="col-odds">${esc(p.odds)}</td>
          <td class="col-books">${bookmakerBadges(p.bookmakers)}</td>
          <td class="col-code">${codeRevealHtml(p.bookmakers, `codes-pred-${p.id}`)}</td>
        </tr>`).join('') || `<tr><td colspan="6" class="mf-empty">No selections yet.</td></tr>`;
    }

    if (cardsList) {
      cardsList.innerHTML = filtered.map((p, idx) => `
        <div class="pick-card" id="prediction-card-${esc(p.id)}">
          <div class="pick-card__top">
            <span class="pick-card__num">#${idx + 1}</span>
            <span class="pick-card__match">${matchupHtml(p.home, p.away, p.homeLogo, p.awayLogo)}</span>
            <span class="pick-card__odds-pill">${esc(p.odds)}</span>
          </div>
          <div class="pick-card__selection">${esc(p.selection)}</div>
          <div class="pick-card__body">
            <div class="pick-card__books">${bookmakerBadges(p.bookmakers)}</div>
            <div class="pick-card__reveal">${codeRevealHtml(p.bookmakers, `codes-predcard-${p.id}`)}</div>
          </div>
        </div>`).join('') || `<div class="mf-empty">No selections yet.</div>`;
    }
  }

  /* ---------------- ACCUMULATORS ---------------- */
  const TIER_COLORS = ['#2ecc58', '#2f7bff', '#8b5cf6', '#f5811f'];

  function renderAccumulators() {
    const grid = document.getElementById('accumulatorGrid');
    if (!grid) return;
    const items = livePublished(DATA.accumulators);
    grid.classList.add('acc-grid');
    grid.style.display = 'grid';
    grid.style.gap = '8px';
    grid.innerHTML = items.map((a, idx) => {
      const color = TIER_COLORS[idx % TIER_COLORS.length];
      const preview = (a.selections || []).slice(0, 4).map(s =>
        `<div class="acc-sel"><b>${esc(s.match)}</b><span>${esc(s.pick)} @ ${esc(s.odds)}</span></div>`
      ).join('');
      return `<div class="acc-card" id="accumulator-${esc(a.id)}" style="background:${color}">
        <div class="acc-card__head">🎯 ${esc(a.tier || a.title)}</div>
        <div class="acc-card__meta">${(a.selections || []).length} Selections · Combined ${esc(a.totalOdds)}</div>
        <div class="acc-card__sels">${preview}</div>
        <button type="button" class="acc-card__btn" data-view-acc="${esc(a.id)}">View Slip →</button>
      </div>`;
    }).join('') || `<div class="mf-empty">No accumulators yet.</div>`;

    grid.querySelectorAll('[data-view-acc]').forEach(btn => {
      btn.addEventListener('click', () => openAccModal(btn.dataset.viewAcc));
    });
  }

  function ensureModal() {
    let modal = document.getElementById('mfModal');
    if (modal) return modal;
    modal = el('div', 'mf-modal', `
      <div class="mf-modal__box">
        <button type="button" class="mf-modal__close" id="mfModalClose">✕</button>
        <div id="mfModalBody"></div>
      </div>`);
    modal.id = 'mfModal';
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.getElementById('mfModalClose').addEventListener('click', closeModal);
    return modal;
  }
  function closeModal() { const m = document.getElementById('mfModal'); if (m) m.classList.remove('mf-modal--open'); }
  function openAccModal(id) {
    const acc = (DATA.accumulators || []).find(a => a.id === id);
    if (!acc) return;
    const modal = ensureModal();
    const rows = (acc.selections || []).map(s =>
      `<div class="mf-modal__row"><span>${esc(s.match)}</span><b>${esc(s.pick)} @ ${esc(s.odds)}</b></div>`).join('');
    document.getElementById('mfModalBody').innerHTML = `
      <h3>${esc(acc.title)} — Combined ${esc(acc.totalOdds)}</h3>
      ${rows}
      ${codeRevealHtml(acc.bookmakers, `codes-acc-${acc.id}`)}`;
    modal.classList.add('mf-modal--open');
    wireCodeReveal(modal);
  }

  /* ---------------- RESULTS ---------------- */
  function renderScoreline(matchStr, scoreStr, outcome) {
    const parts = String(matchStr || '').split(/\s+vs\s+/i);
    const scoreParts = String(scoreStr || '').split('-').map(s => s.trim());
    if (parts.length !== 2) return '';
    const statusIcon = outcome === 'won' ? '✓' : (outcome === 'lost' ? '✕' : '–');
    return `<div class="result-card__scoreline">
      <span class="result-card__status">${statusIcon}</span>
      ${teamBadge(parts[0])}<span class="result-card__team-name">${esc(parts[0])}</span>
      <span class="result-card__score">${esc(scoreParts[0] ?? '')} - ${esc(scoreParts[1] ?? '')}</span>
      <span class="result-card__team-name">${esc(parts[1])}</span>${teamBadge(parts[1])}
    </div>`;
  }

  function renderResults() {
    const grid = document.getElementById('resultsGrid');
    if (!grid) return;
    const items = (DATA.results || []);
    grid.innerHTML = items.map(r => `
      <div class="result-card result-card--${r.outcome}" id="result-${esc(r.id)}">
        <span class="result-card__ft">FT</span>
        ${renderScoreline(r.match, r.actualResult, r.outcome)}
        <div class="result-card__meta">${esc(r.prediction)}${r.odds ? ' @ ' + esc(r.odds) : ''} · ${esc(r.match)}</div>
      </div>`).join('') || `<div class="mf-empty">No results yet.</div>`;
  }

  /* ---------------- BOOKMAKERS (sidebar) ---------------- */
  function renderBookmakers() {
    const listEl = document.getElementById('bookmakerList');
    if (!listEl) return;
    const items = (DATA.meta.bookmakers || []).filter(b => b.status !== 'inactive').sort((a, b) => (a.order || 0) - (b.order || 0));
    listEl.innerHTML = items.map(b => {
      const style = b.color ? ` style="background:${esc(b.color)}"` : '';
      const hasLink = isRealUrl(b.affiliateUrl);
      return `
      <li class="bookmaker-item" id="bookmaker-${esc(b.key)}">
        <span class="bookmaker-item__badge bm-badge bm-badge--${esc(b.key)}"${style}>${esc(b.name)}</span>
        <a href="${hasLink ? esc(b.affiliateUrl) : '#'}" ${hasLink ? 'target="_blank" rel="noopener sponsored"' : ''} class="bookmaker-item__cta">Get Code &amp; Bet →</a>
      </li>`;
    }).join('');
  }

  /* ---------------- NEWS (sidebar) ---------------- */
  const NEWS_ICONS = { Preview: '📰', Analysis: '📊', Guide: '📘', Report: '📈' };

  function renderNews() {
    const listEl = document.getElementById('newsList');
    if (!listEl) return;
    const items = livePublished(DATA.news).slice(0, 6);
    listEl.innerHTML = items.map(n => `
      <li class="news-item" id="news-${esc(n.id)}">
        <a href="#news-${esc(n.id)}" class="news-item__link">
          <span class="news-item__icon">${NEWS_ICONS[n.category] || '📰'}</span>
          <span class="news-item__text">
            <span class="news-item__title">${esc(n.title)}</span>
            <span class="news-item__date">${esc(n.date)}</span>
          </span>
          <span class="news-item__chevron">›</span>
        </a>
      </li>`).join('') || `<li class="mf-empty">No news posted yet.</li>`;
  }

  /* ---------------- BET OF THE DAY (new) ---------------- */
  function renderBetOfDay() {
    const panel = ensurePanel('bet-of-day', '.content-main',
      `<div class="panel__header"><h2 class="panel__title"><span class="panel__title-icon">⭐</span> BET OF THE DAY</h2></div>
       <div id="betOfDayList"></div>`, 'panel--bod');
    const listEl = ensureChild(panel, 'betOfDayList', '<div id="betOfDayList"></div>');
    // Just the single most confident pick — your one "correct and sure" headline bet.
    const items = livePublished(DATA.betOfDay).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 1);
    listEl.innerHTML = items.map(b => `
      <div class="bod-card" id="bet-of-day-${esc(b.id)}"${b.photo ? ` style="background-image:url('${esc(b.photo)}')"` : ''}>
        <div class="bod-card__match">${matchupFromString(b.match)}</div>
        <div class="bod-card__pick-row">
          <span class="bod-card__pick">${esc(b.pick)}</span>
          <span class="bod-card__odds">@ ${esc(b.odds)}</span>
        </div>
        <p class="bod-card__desc">${esc(b.description || '')}</p>
        <div class="bod-card__meta">Rating ${esc(b.rating)}/10 · ${esc(bookmakerLabel(b.bookmaker))}</div>
      </div>`).join('') || `<div class="mf-empty">No Bet of the Day yet.</div>`;
  }

  /* ---------------- LIVE PREDICTIONS (new) ---------------- */
  function renderLivePredictions() {
    const panel = ensurePanel('live-predictions', '.content-main',
      `<div class="panel__header"><h2 class="panel__title"><span class="panel__title-icon">📡</span> LIVE PREDICTIONS</h2></div>
       <div class="live-grid" id="liveGrid"></div>`, 'panel--live');
    const gridEl = ensureChild(panel, 'liveGrid', '<div class="live-grid" id="liveGrid"></div>');
    const items = livePublished(DATA.livePredictions);
    gridEl.innerHTML = items.map(l => `
      <div class="live-card" id="live-${esc(l.id)}">
        <div class="live-card__top"><span class="live-dot"></span> ${esc(l.minute)} · ${esc(l.currentScore)}</div>
        <div class="live-card__match">${matchupFromString(l.match)}</div>
        <div class="live-card__pick">${esc(l.pick)} @ ${esc(l.odds)}</div>
      </div>`).join('') || `<div class="mf-empty">No live predictions right now.</div>`;
  }

  /* ---------------- CORRECT SCORE (new) ---------------- */
  function renderCorrectScore() {
    const panel = ensurePanel('correct-score', '.content-main',
      `<div class="panel__header"><h2 class="panel__title"><span class="panel__title-icon">🎯</span> CORRECT SCORE</h2></div>
       <div class="cs-table-wrap"><table class="cs-table">
         <thead><tr><th>#</th><th>Match</th><th>Score</th><th>Odds</th><th>Bookmakers</th><th>Code</th></tr></thead>
         <tbody id="correctScoreBody"></tbody>
       </table></div>`, 'panel--cs');
    const tbody = ensureChild(panel, 'correctScoreBody', '<tbody id="correctScoreBody"></tbody>');
    const items = livePublished(DATA.correctScores);
    tbody.innerHTML = items.map((c, idx) => `
      <tr id="correct-score-${esc(c.id)}">
        <td>${idx + 1}</td>
        <td>${matchupFromString(c.match)}<div class="mf-sub">${esc(c.league || '')}</div></td>
        <td>${esc(c.score)}</td>
        <td>${esc(c.odds)}</td>
        <td>${bookmakerBadges(c.bookmakers)}</td>
        <td>${codeRevealHtml(c.bookmakers, `codes-cs-${c.id}`)}</td>
      </tr>`).join('') || `<tr><td colspan="6" class="mf-empty">No correct score picks yet.</td></tr>`;
  }

  /* ---------------- BET OF THE DAY — more picks (separate from the single main one) ---------------- */
  function renderBetOfDayMore() {
    const panel = ensurePanel('bet-of-day-more', '.content-main',
      `<div class="panel__header"><h2 class="panel__title"><span class="panel__title-icon">⭐</span> MORE BET OF THE DAY</h2></div>
       <div id="betOfDayMoreList"></div>`, 'panel--bod');
    const listEl = ensureChild(panel, 'betOfDayMoreList', '<div id="betOfDayMoreList"></div>');
    // Everything except the single top pick already shown in the main section above.
    const items = livePublished(DATA.betOfDay).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(1, 4);
    listEl.innerHTML = items.map(b => `
      <div class="bod-card" id="bet-of-day-more-${esc(b.id)}"${b.photo ? ` style="background-image:url('${esc(b.photo)}')"` : ''}>
        <div class="bod-card__match">${matchupFromString(b.match)}</div>
        <div class="bod-card__pick-row">
          <span class="bod-card__pick">${esc(b.pick)}</span>
          <span class="bod-card__odds">@ ${esc(b.odds)}</span>
        </div>
        <p class="bod-card__desc">${esc(b.description || '')}</p>
        <div class="bod-card__meta">Rating ${esc(b.rating)}/10 · ${esc(bookmakerLabel(b.bookmaker))}</div>
      </div>`).join('') || `<div class="mf-empty">No more Bet of the Day picks yet.</div>`;
  }

  /* ---------------- CODES ONLY (new, sidebar) ---------------- */
  function renderCodesOnly() {
    const panel = ensurePanel('codes-only', '.content-sidebar',
      `<h3 class="sidebar-panel__title">🔑 CODES ONLY</h3><div id="codesOnlyList"></div>`, 'sidebar-panel panel--codes');
    const listEl = ensureChild(panel, 'codesOnlyList', '<div id="codesOnlyList"></div>');
    const items = livePublished(DATA.codesOnly);
    listEl.innerHTML = items.map(c => `
      <div class="codes-item" id="codes-only-${esc(c.id)}">
        <div class="codes-item__top"><b>${esc(c.label)}</b>${c.odds ? `<span>@ ${esc(c.odds)}</span>` : ''}</div>
        ${bookmakerBadges(c.bookmakers)}
        ${codeRevealHtml(c.bookmakers, `codes-only-reveal-${esc(c.id)}`)}
      </div>`).join('') || `<div class="mf-empty">No codes yet.</div>`;
  }

  /* ---------------- reveal / copy (event delegation, wired once) ---------------- */
  function wireCodeReveal(root) {
    root.querySelectorAll('[data-reveal-toggle]').forEach(btn => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = '1';
      btn.addEventListener('click', () => {
        const panel = document.getElementById(btn.dataset.revealToggle);
        if (!panel) return;
        panel.style.display = 'flex';
        panel.querySelectorAll('[data-code-value]').forEach(span => { span.textContent = span.dataset.codeValue; });
        panel.querySelectorAll('.code-row__btn--copy').forEach(b => { b.style.display = 'inline-block'; });
        btn.textContent = '🔓 Code Revealed';
        btn.disabled = true;
      });
    });
    root.querySelectorAll('[data-copy]').forEach(btn => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = '1';
      btn.addEventListener('click', () => {
        navigator.clipboard?.writeText(btn.dataset.copy).then(() => {
          const old = btn.textContent; btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = old; }, 1500);
        });
      });
    });
  }

  /* ---------------- SEARCH ---------------- */
  let SEARCH_INDEX = [];
  function buildSearchIndex() {
    const idx = [];
    livePublished(DATA.predictions).forEach(p => idx.push({ type: 'Prediction', label: `${p.home} vs ${p.away} — ${p.selection} @ ${p.odds} (${p.league || ''})`, anchor: `prediction-${p.id}` }));
    livePublished(DATA.accumulators).forEach(a => idx.push({ type: 'Accumulator', label: `${a.title} — ${a.tier || ''} combined ${a.totalOdds || ''}`, anchor: `accumulator-${a.id}` }));
    livePublished(DATA.correctScores).forEach(c => idx.push({ type: 'Correct Score', label: `${c.match} — ${c.score} @ ${c.odds}`, anchor: `correct-score-${c.id}` }));
    livePublished(DATA.codesOnly).forEach(c => idx.push({ type: 'Codes Only', label: `${c.label} @ ${c.odds || ''}`, anchor: `codes-only-${c.id}` }));
    livePublished(DATA.livePredictions).forEach(l => idx.push({ type: 'Live Predictions', label: `${l.match} — ${l.pick} @ ${l.odds}`, anchor: `live-${l.id}` }));
    livePublished(DATA.betOfDay).forEach(b => idx.push({ type: 'Bet of the Day', label: `${b.match} — ${b.pick} @ ${b.odds}`, anchor: `bet-of-day-${b.id}` }));
    (DATA.results || []).forEach(r => idx.push({ type: 'Result', label: `${r.match} — ${r.prediction} @ ${r.odds} FT ${r.actualResult}`, anchor: `result-${r.id}` }));
    livePublished(DATA.news).forEach(n => idx.push({ type: 'News', label: n.title, anchor: `news-${n.id}` }));
    (DATA.meta.bookmakers || []).forEach(b => idx.push({ type: 'Bookmaker', label: b.name, anchor: `bookmaker-${b.key}` }));
    SEARCH_INDEX = idx; // rebuilt once per data load/poll, not on every keystroke — keeps typing instant
    return idx;
  }

  // Smart matching: every word the person typed must appear SOMEWHERE in the
  // item's label or type (not necessarily together, not necessarily in
  // order). This is what makes "code only", "real madrid", "correct score
  // 8.50" all work naturally instead of needing an exact substring match.
  function searchMatches(query) {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return SEARCH_INDEX.filter(item => {
      const haystack = `${item.label} ${item.type}`.toLowerCase();
      return words.every(w => haystack.includes(w));
    });
  }

  function highlightMatch(label, q) {
    const i = label.toLowerCase().indexOf(q);
    if (i === -1) return esc(label);
    return esc(label.slice(0, i)) + '<mark>' + esc(label.slice(i, i + q.length)) + '</mark>' + esc(label.slice(i + q.length));
  }

  function renderSearchResults(matches, q) {
    const results = document.getElementById('searchResults');
    if (!results) return;
    results.innerHTML = matches.map(m =>
      `<li class="search-result" data-anchor="${esc(m.anchor)}"><span class="search-result__type">${esc(m.type)}</span> ${highlightMatch(m.label, q)}</li>`
    ).join('') || `<li class="search-result search-result--empty">No matches</li>`;
    // Force the dropdown visible — some page CSS hides #searchResults by
    // default until a class we don't know about is toggled, so we override
    // directly here rather than relying on any assumed class name.
    results.style.display = 'block';
    results.style.visibility = 'visible';
    results.style.opacity = '1';
    results.style.maxHeight = 'none';
    results.style.position = results.style.position || 'relative';
    results.style.zIndex = '50';
    results.querySelectorAll('[data-anchor]').forEach(li => {
      li.addEventListener('click', () => goToResult(li.dataset.anchor));
    });
  }

  function setupSearch() {
    const toggle = document.getElementById('searchToggle');
    const box = document.getElementById('navbarSearch');
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    if (!input || !results) return;
    results.classList.add('search-results');

    if (toggle && box) {
      toggle.addEventListener('click', () => {
        const open = box.style.display === 'block';
        box.style.display = open ? 'none' : 'block';
        toggle.setAttribute('aria-expanded', String(!open));
        if (!open) input.focus();
      });
    }

    // 'input' fires on every keystroke (typed, pasted, or voice-typed) — instant, no debounce delay.
    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (!q) { results.innerHTML = ''; return; }
      const matches = searchMatches(q).slice(0, 12);
      renderSearchResults(matches, q.toLowerCase().split(/\s+/)[0]);
    });

    // Enter jumps straight to the top result — no need to reach for it.
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const first = results.querySelector('[data-anchor]');
        if (first) goToResult(first.dataset.anchor);
      }
    });
  }

  function goToResult(anchorId) {
    const target = document.getElementById(anchorId);
    const results = document.getElementById('searchResults');
    const box = document.getElementById('navbarSearch');
    if (results) results.innerHTML = '';
    if (box) box.style.display = 'none';
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('mf-highlight');
    setTimeout(() => target.classList.remove('mf-highlight'), 1800);
  }

  /* ---------------- overview / stats ---------------- */
  function renderOverview() {
    const ov = DATA.meta.overview || {};
    const map = { statTotal: ov.statTotal, statWinners: ov.statWinners, statLosers: ov.statLosers, statHitRate: ov.statHitRate };
    Object.entries(map).forEach(([id, val]) => {
      const node = document.getElementById(id);
      if (node && val !== undefined && id !== 'statTotal') node.textContent = val; // statTotal is derived from live count in renderPicks
    });
    const dateEl = document.getElementById('overviewDate');
    if (dateEl && ov.date) dateEl.lastChild.textContent = ' ' + ov.date;
  }

  /* ---------------- render everything ---------------- */
  function renderAll() {
    // Every section is isolated: if one throws (e.g. an unexpected page
    // structure), it's logged to the console but every OTHER section still
    // renders normally. One broken section can never again take the rest
    // of the page down with it.
    const sections = [
      renderOverview, renderPicks, renderAccumulators, renderResults,
      renderBookmakers, renderNews, renderBetOfDay, renderLivePredictions,
      renderCorrectScore, renderBetOfDayMore, renderCodesOnly,
    ];
    sections.forEach(fn => {
      try { fn(); } catch (e) { console.error(`Render failed: ${fn.name}`, e); }
    });
    try { wireCodeReveal(document); } catch (e) { console.error('wireCodeReveal failed', e); }
    try { buildSearchIndex(); } catch (e) { console.error('buildSearchIndex failed', e); }
  }

  /* ---------------- load + poll ---------------- */
  let firstRenderDone = false;
  function revealPage() {
    // Pairs with the tiny <script>document.documentElement.style.visibility='hidden'</script>
    // at the very top of index.html's <head> — this is what makes everything
    // appear in one frame instead of flashing an empty "0 Selections" state first.
    document.documentElement.style.visibility = 'visible';
  }

  async function loadData() {
    try {
      const res = await fetch(DATA_URL + '?v=' + Date.now(), { cache: 'no-store' });
      DATA = await res.json();
      if (!DATA.meta) DATA.meta = { bookmakers: [], overview: {} };
      renderAll();
    } catch (e) {
      console.error('Failed to load data.json', e);
    } finally {
      if (!firstRenderDone) { firstRenderDone = true; revealPage(); }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupSearch();
    setInterval(loadData, POLL_MS); // re-check for newly-eligible scheduled content
    // Safety net: never leave the page invisible for more than 4s even if the
    // network is very slow or data.json fails to load at all.
    setTimeout(() => { if (!firstRenderDone) { firstRenderDone = true; revealPage(); } }, 4000);
  });

  // No service worker is used anymore — it was causing inconsistent update
  // behavior ("sometimes it updates, sometimes it doesn't"). Every request
  // now goes straight to the network with cache-busting instead. This also
  // actively removes any service worker a visitor's browser installed from
  // an earlier version of this site, so old caching behavior can't linger.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => reg.unregister());
    }).catch(() => {});
  }
})();
