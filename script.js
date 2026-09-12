/* =========================================================
   MatchForecast.online — script.js
   Local SITE_DATA rendering (no external data source)
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     1. CONFIG — affiliate links (insert real URLs here)
     ======================================================= */
  var AFFILIATE_LINKS = {
    bet9ja: "BET9JA_AFFILIATE_URL",
    sportybet: "SPORTYBET_AFFILIATE_URL",
    betpawa: "BETPAWA_AFFILIATE_URL",
    betway: "BETWAY_AFFILIATE_URL"
  };

  var BOOKMAKER_META = {
    bet9ja: { label: "bet9ja", className: "bet9ja" },
    sportybet: { label: "SportyBet", className: "sportybet" },
    betpawa: { label: "betPawa", className: "betpawa" },
    betway: { label: "betway", className: "betway" }
  };

  /* =======================================================
     2. SITE_DATA — edit this block daily with today's picks
     ======================================================= */

  var SITE_DATA = {
    date: "Sep 9, 2026",
    resultsDate: "Sep 8, 2026",

    overview: {
      totalSelections: 25,
      winnersYesterday: 12,
      losersYesterday: 13,
      hitRateYesterday: 48
    },

    categories: [
      { key: "All", label: "All", count: 25 },
      { key: "Over/Under", label: "Over/Under", count: 8 },
      { key: "BTTS", label: "BTTS", count: 5 },
      { key: "Match Winner", label: "Match Winner", count: 4 },
      { key: "Double Chance", label: "Double Chance", count: 4 },
      { key: "Other", label: "Other", count: 4 }
    ],

    // ===============================
    // DAILY PREDICTIONS — EDIT HERE
    // Each prediction is fully independent: its own bookmakers[] and
    // its own code. Nothing here is shared with accumulators or
    // correct scores below.
    // ===============================
    predictions: [
      { id: 1, match: "fulham vs Man City", pick: "Over 4.5 Goals", odds: 5.45, bookmakers: ["bet9ja", "sportybet"], code: "BJ-4821-AC", category: "Over/Under" },
      { id: 2, match: "lipzig vs Newcastle", pick: "Chelsea Win", odds: 1.72, bookmakers: ["betpawa", "betway"], code: "SP-9213-CN", category: "Match Winner" },
      { id: 3, match: "coma vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68, bookmakers: ["sportybet", "bet9ja"], code: "BP-3345-BS", category: "Over/Under" },
      { id: 4, match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80, bookmakers: ["betpawa", "sportybet"], code: "BW-7712-IA", category: "BTTS" },
      { id: 5, match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 1.55, bookmakers: ["bet9ja", "betway"], code: "BJ-5561-LB", category: "Match Winner" },
      { id: 6, match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40, bookmakers: ["sportybet", "betpawa"], code: "SP-2290-PM", category: "Over/Under" },
      { id: 7, match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65, bookmakers: ["betway", "bet9ja"], code: "BW-8834-MB", category: "Double Chance" },
      { id: 8, match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 1.75, bookmakers: ["betpawa", "sportybet"], code: "BP-6620-JL", category: "BTTS" },
      { id: 9, match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60, bookmakers: ["bet9ja", "betway"], code: "BJ-1187-RE", category: "Over/Under" },
      { id: 10, match: "luton town vs Leverkusen", pick: "Bayern Win", odds: 1.48, bookmakers: ["sportybet", "betpawa"], code: "SP-4456-BL", category: "Double Chance" }
    ],

    // ===============================
    // ACCUMULATOR SLIPS — EDIT HERE
    // Fully independent from predictions[] above — each slip lists its
    // own selections (match/pick/odds) and its own bookingCodes
    // (one code per bookmaker for the whole slip, shown in View Slip).
    // Editing a prediction above never changes a slip, and editing a
    // slip here never changes a prediction.
    // ===============================
    accumulators: [
      {
        key: "3",
        title: "3 Odds",
        themeClass: "accumulator-card--3",
        selections: [
          { match: "fulham vs Man City", pick: "Over 4.5 Goals", odds: 5.45 },
          { match: "lipzig vs Newcastle", pick: "Chelsea Win", odds: 1.72 },
          { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40 }
        ],
        bookingCodes: [
          { bookmaker: "sportybet", code: "SP-3ACC-001" },
          { bookmaker: "betpawa", code: "BP-3ACC-001" }
        ]
      },
      {
        key: "5",
        title: "5 Odds",
        themeClass: "accumulator-card--5",
        selections: [
          { match: "coma vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68 },
          { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80 },
          { match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 1.55 },
          { match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65 },
          { match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 1.75 }
        ],
        bookingCodes: [
          { bookmaker: "sportybet", code: "SP-5ACC-002" },
          { bookmaker: "betpawa", code: "BP-5ACC-002" }
        ]
      },
      {
        key: "10",
        title: "10 Odds",
        themeClass: "accumulator-card--10",
        selections: [
          { match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60 },
          { match: "luton town vs Leverkusen", pick: "Bayern Win", odds: 1.48 },
          { match: "fulham vs Man City", pick: "Over 4.5 Goals", odds: 5.45 },
          { match: "lipzig vs Newcastle", pick: "Chelsea Win", odds: 1.72 },
          { match: "coma vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68 },
          { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40 },
          { match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65 }
        ],
        bookingCodes: [
          { bookmaker: "sportybet", code: "SP-10ACC-003" },
          { bookmaker: "betpawa", code: "BP-10ACC-003" }
        ]
      },
      {
        key: "20",
        title: "20+ Odds",
        themeClass: "accumulator-card--20",
        selections: [
          { match: "fulham vs Man City", pick: "Over 4.5 Goals", odds: 5.45 },
          { match: "lipzig vs Newcastle", pick: "Chelsea Win", odds: 1.72 },
          { match: "coma vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68 },
          { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80 },
          { match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 1.55 },
          { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40 },
          { match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65 },
          { match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 1.75 },
          { match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60 },
          { match: "luton town vs Leverkusen", pick: "Bayern Win", odds: 1.48 }
        ],
        bookingCodes: [
          { bookmaker: "sportybet", code: "SP-20ACC-004" },
          { bookmaker: "betpawa", code: "BP-20ACC-004" }
        ]
      }
    ],

    // ===============================
    // CORRECT SCORE — EDIT HERE
    // Independent section, same shape as predictions but with a
    // "score" instead of a "pick".
    // ===============================
    correctScores: [
      { id: 1, match: "Arsenal vs Chelsea", score: "2-1", odds: 8.50, bookmakers: ["sportybet"], code: "CS-2201-AC" },
      { id: 2, match: "Bayern vs Dortmund", score: "3-1", odds: 11.00, bookmakers: ["bet9ja"], code: "CS-3101-BD" },
      { id: 3, match: "Man City vs Fulham", score: "4-0", odds: 15.00, bookmakers: ["betpawa"], code: "CS-4001-MF" },
      { id: 4, match: "PSG vs Marseille", score: "2-0", odds: 7.25, bookmakers: ["sportybet", "betway"], code: "CS-2001-PM" },
      { id: 5, match: "Real Madrid vs Espanyol", score: "3-0", odds: 9.50, bookmakers: ["bet9ja"], code: "CS-3002-RE" }
    ],

    // ===============================
    // RESULTS — EDIT HERE
    // ===============================
    yesterdayResults: {
      won: 14,
      lost: 9,
      hitRate: 60.9,
      avgOdds: 2.45
    },

    bookmakers: ["bet9ja", "sportybet", "betpawa", "betway"],

    news: [
      { icon: "🎁", headline: "Bet9ja 170% Multiple Bonus — How to qualify", date: "Sep 9, 2026" },
      { icon: "🎟️", headline: "SportyBet Promo: Free Bet Friday", date: "Sep 8, 2026" },
      { icon: "📅", headline: "Top 5 Football Matches to Watch This Week", date: "Sep 7, 2026" },
      { icon: "⚙️", headline: "How to Use Bet Codes on Bet9ja (Step by Step)", date: "Sep 6, 2026" }
    ]
  };

  /* =======================================================
     3. RENDER HELPERS
     ======================================================= */

  function bookPill(key) {
    var meta = BOOKMAKER_META[key];
    if (!meta) return "";
    return '<span class="book-pill book-pill--' + meta.className + '">' + meta.label + "</span>";
  }

  function renderPicksTable(predictions) {
    var tbody = document.getElementById("picksTableBody");
    if (!tbody) return;

    tbody.innerHTML = predictions
      .map(function (p, index) {
        return (
          '<tr data-id="' + p.id + '">' +
            '<td class="col-num">' + (index + 1) + "</td>" +
            '<td class="col-match"><span class="match-cell"><span class="match-cell__icon">⚽</span>' + p.match + "</span></td>" +
            '<td class="col-pick"><span class="pick-cell">' + p.pick + "</span></td>" +
            '<td class="col-odds"><span class="odds-cell">' + p.odds.toFixed(2) + "</span></td>" +
            '<td class="col-books"><span class="books-cell">' + p.bookmakers.map(bookPill).join("") + "</span></td>" +
            '<td class="col-code">' + revealButtonHTML(p) + "</td>" +
          "</tr>"
        );
      })
      .join("");

    attachRevealHandlers(tbody);
  }

  function renderPicksCards(predictions) {
    var wrap = document.getElementById("picksCardsList");
    if (!wrap) return;

    wrap.innerHTML = predictions
      .map(function (p, index) {
        return (
          '<div class="pick-card" data-id="' + p.id + '">' +
            '<div class="pick-card__top">' +
              '<span class="pick-card__match"><span class="pick-card__num">#' + (index + 1) + "</span> ⚽ " + p.match + "</span>" +
            "</div>" +
            '<div class="pick-card__mid">' +
              '<span class="pick-card__pick">' + p.pick + "</span>" +
              '<span class="pick-card__odds">' + p.odds.toFixed(2) + "</span>" +
            "</div>" +
            '<div class="pick-card__bottom">' +
              '<span class="pick-card__books">' + p.bookmakers.map(bookPill).join("") + "</span>" +
              revealButtonHTML(p) +
            "</div>" +
          "</div>"
        );
      })
      .join("");

    attachRevealHandlers(wrap);
  }

  function revealButtonHTML(p) {
    return (
      '<button type="button" class="reveal-btn" data-code="' + p.code + '" data-id="' + p.id + '">' +
        '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>' +
        '<span class="reveal-btn__label">Reveal Code</span>' +
      "</button>"
    );
  }

  function attachRevealHandlers(container) {
    var buttons = container.querySelectorAll(".reveal-btn");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        requestCodeReveal(btn, btn.getAttribute("data-code"));
      });
    });
  }

  function requestCodeReveal(button, code) {
    if (window.NBT_AD_PROVIDER && typeof window.NBT_AD_PROVIDER.show === "function") {
      window.NBT_AD_PROVIDER.show(function onAdComplete(success) {
        if (success) revealCode(button, code);
      });
      return;
    }
    revealCode(button, code);
  }

  function revealCode(button, code) {
    button.classList.add("reveal-btn--revealed");
    button.innerHTML =
      '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>' +
      '<span class="reveal-btn__code">' + code + "</span>";
    button.disabled = true;
  }

  function renderFilters(predictions) {
    var chips = document.querySelectorAll(".filter-chip");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.classList.remove("filter-chip--active");
          c.setAttribute("aria-selected", "false");
        });
        chip.classList.add("filter-chip--active");
        chip.setAttribute("aria-selected", "true");

        var filter = chip.getAttribute("data-filter");
        var filtered = filter === "All" ? predictions : predictions.filter(function (p) {
          return p.category === filter;
        });
        renderPicksTable(filtered);
        renderPicksCards(filtered);
      });
    });
  }

  function renderAccumulators(list) {
    var grid = document.getElementById("accumulatorGrid");
    if (!grid) return;

    grid.innerHTML = list
      .map(function (a) {
        var combinedOdds = a.selections.reduce(function (total, s) { return total * s.odds; }, 1);

        var matchesHTML = a.selections
          .map(function (s) {
            return (
              '<div class="accumulator-card__match">' +
                '<span class="accumulator-card__match-teams">' + s.match + "</span>" +
                '<span class="accumulator-card__match-pick">' + s.pick + " @ " + s.odds.toFixed(2) + "</span>" +
              "</div>"
            );
          })
          .join("");

        return (
          '<div class="accumulator-card ' + a.themeClass + '">' +
            '<div class="accumulator-card__odds">🎯 ' + a.title.toUpperCase() + "</div>" +
            '<div class="accumulator-card__desc">' + a.selections.length + " Selections • Combined " + combinedOdds.toFixed(2) + "</div>" +
            '<div class="accumulator-card__matches">' + matchesHTML + "</div>" +
            '<button type="button" class="accumulator-card__cta" data-slip-key="' + a.key + '">View Slip →</button>' +
          "</div>"
        );
      })
      .join("");

    attachSlipHandlers(grid);
  }

  /* =======================================================
     3b. VIEW SLIP MODAL — shows the booking codes for a slip
     ======================================================= */

  function findAccumulatorByKey(key) {
    for (var i = 0; i < SITE_DATA.accumulators.length; i++) {
      if (SITE_DATA.accumulators[i].key === key) return SITE_DATA.accumulators[i];
    }
    return null;
  }

  function attachSlipHandlers(container) {
    var buttons = container.querySelectorAll("[data-slip-key]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        openSlipModal(btn.getAttribute("data-slip-key"));
      });
    });
  }

  function openSlipModal(key) {
    var acc = findAccumulatorByKey(key);
    if (!acc) return;

    var modal = document.getElementById("slipModal");
    var title = document.getElementById("slipModalTitle");
    var selectionsBox = document.getElementById("slipModalSelections");
    var codesBox = document.getElementById("slipModalCodes");
    if (!modal || !selectionsBox || !codesBox) return;

    if (title) title.textContent = acc.title + " — View Slip";

    selectionsBox.innerHTML = acc.selections
      .map(function (s) {
        return (
          '<div class="slip-modal__selection">' +
            '<span class="slip-modal__selection-match">⚽ ' + escapeHTML(s.match) + "</span>" +
            '<span class="slip-modal__selection-pick">' + escapeHTML(s.pick) + " @ " + s.odds.toFixed(2) + "</span>" +
          "</div>"
        );
      })
      .join("");

    codesBox.innerHTML = acc.bookingCodes
      .map(function (bc) {
        var meta = BOOKMAKER_META[bc.bookmaker];
        var label = meta ? meta.label : bc.bookmaker;
        return (
          '<div class="slip-modal__code-row">' +
            '<div class="slip-modal__code-info">' +
              '<span class="slip-modal__code-bookmaker">' + escapeHTML(label) + "</span>" +
              '<span class="slip-modal__code-value">Booking Code: ' + escapeHTML(bc.code) + "</span>" +
            "</div>" +
            '<button type="button" class="slip-modal__copy-btn" data-copy-code="' + escapeHTML(bc.code) + '">Copy Code</button>' +
          "</div>"
        );
      })
      .join("");

    codesBox.querySelectorAll("[data-copy-code]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        copyCodeToClipboard(btn.getAttribute("data-copy-code"), btn);
      });
    });

    modal.classList.add("slip-modal--open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeSlipModal() {
    var modal = document.getElementById("slipModal");
    if (!modal) return;
    modal.classList.remove("slip-modal--open");
    modal.setAttribute("aria-hidden", "true");
  }

  function copyCodeToClipboard(code, btn) {
    function onCopied() {
      var original = btn.textContent;
      btn.textContent = "Copied!";
      window.setTimeout(function () {
        btn.textContent = original;
      }, 1200);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(onCopied, onCopied);
    } else {
      onCopied();
    }
  }

  function initSlipModal() {
    var modal = document.getElementById("slipModal");
    if (!modal) return;
    modal.querySelectorAll("[data-slip-close]").forEach(function (el) {
      el.addEventListener("click", closeSlipModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSlipModal();
    });
  }

  /* =======================================================
     3c. CORRECT SCORE — reuses the same reveal-btn/book-pill
     pattern as the predictions table above.
     ======================================================= */

  function renderCorrectScoreTable(list) {
    var tbody = document.getElementById("correctScoreTableBody");
    if (!tbody) return;

    tbody.innerHTML = list
      .map(function (cs, index) {
        return (
          '<tr data-id="cs-' + cs.id + '">' +
            '<td class="col-num">' + (index + 1) + "</td>" +
            '<td class="col-match"><span class="match-cell"><span class="match-cell__icon">⚽</span>' + cs.match + "</span></td>" +
            '<td class="col-pick"><span class="pick-cell">' + cs.score + "</span></td>" +
            '<td class="col-odds"><span class="odds-cell">' + cs.odds.toFixed(2) + "</span></td>" +
            '<td class="col-books"><span class="books-cell">' + cs.bookmakers.map(bookPill).join("") + "</span></td>" +
            '<td class="col-code">' + revealButtonHTML(cs) + "</td>" +
          "</tr>"
        );
      })
      .join("");

    attachRevealHandlers(tbody);
  }

  function renderCorrectScoreCards(list) {
    var wrap = document.getElementById("correctScoreCardsList");
    if (!wrap) return;

    wrap.innerHTML = list
      .map(function (cs, index) {
        return (
          '<div class="pick-card" data-id="cs-' + cs.id + '">' +
            '<div class="pick-card__top">' +
              '<span class="pick-card__match"><span class="pick-card__num">#' + (index + 1) + "</span> ⚽ " + cs.match + "</span>" +
            "</div>" +
            '<div class="pick-card__mid">' +
              '<span class="pick-card__pick">' + cs.score + "</span>" +
              '<span class="pick-card__odds">' + cs.odds.toFixed(2) + "</span>" +
            "</div>" +
            '<div class="pick-card__bottom">' +
              '<span class="pick-card__books">' + cs.bookmakers.map(bookPill).join("") + "</span>" +
              revealButtonHTML(cs) +
            "</div>" +
          "</div>"
        );
      })
      .join("");

    attachRevealHandlers(wrap);
  }

  function renderResults(results) {
    var grid = document.getElementById("resultsGrid");
    if (!grid) return;
    grid.innerHTML =
      '<div class="result-card result-card--won">' +
        '<div class="result-card__icon result-card__icon--won">✓</div>' +
        '<span class="result-card__value result-card__value--won">' + results.won + "</span>" +
        '<span class="result-card__label">Won</span>' +
      "</div>" +
      '<div class="result-card result-card--lost">' +
        '<div class="result-card__icon result-card__icon--lost">✕</div>' +
        '<span class="result-card__value result-card__value--lost">' + results.lost + "</span>" +
        '<span class="result-card__label">Lost</span>' +
      "</div>" +
      '<div class="result-card">' +
        '<div class="result-card__icon result-card__icon--neutral">◎</div>' +
        '<span class="result-card__value">' + results.hitRate + "%</span>" +
        '<span class="result-card__label">Hit Rate</span>' +
      "</div>" +
      '<div class="result-card">' +
        '<div class="result-card__icon result-card__icon--neutral">📈</div>' +
        '<span class="result-card__value">' + results.avgOdds.toFixed(2) + "</span>" +
        '<span class="result-card__label">Avg. Odds</span>' +
      "</div>";
  }

  function renderBookmakerSidebar(keys) {
    var list = document.getElementById("bookmakerList");
    if (!list) return;
    list.innerHTML = keys
      .map(function (key) {
        var meta = BOOKMAKER_META[key];
        var url = AFFILIATE_LINKS[key] || "#";
        return (
          "<li class=\"bookmaker-item\">" +
            '<span class="bookmaker-item__logo bookmaker-item__logo--' + meta.className + '">' + meta.label + "</span>" +
            '<a href="' + url + '" class="bookmaker-item__cta" data-affiliate="' + key + '">Get Code &amp; Bet →</a>' +
          "</li>"
        );
      })
      .join("");
  }

  function renderNews(items) {
    var list = document.getElementById("newsList");
    if (!list) return;
    list.innerHTML = items
      .map(function (n) {
        return (
          "<li class=\"news-item\">" +
            '<span class="news-item__icon">' + n.icon + "</span>" +
            '<span class="news-item__body">' +
              '<span class="news-item__headline">' + n.headline + "</span>" +
              '<span class="news-item__date">' + n.date + "</span>" +
            "</span>" +
            '<span class="news-item__arrow">›</span>' +
          "</li>"
        );
      })
      .join("");
  }

  function applyBookmakerAffiliateLinks() {
    document.querySelectorAll("[data-affiliate]").forEach(function (el) {
      var key = el.getAttribute("data-affiliate");
      if (AFFILIATE_LINKS[key]) {
        el.setAttribute("href", AFFILIATE_LINKS[key]);
      }
    });
  }

  /* =======================================================
     4. NAV INTERACTIONS (live search + bottom nav)
     ======================================================= */

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function scrollAndHighlight(el) {
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    el.classList.add("search-highlight");
    window.setTimeout(function () {
      el.classList.remove("search-highlight");
    }, 1600);
  }

  function scrollToPick(id) {
    var candidates = document.querySelectorAll('[data-id="' + id + '"]');
    candidates.forEach(function (el) {
      if (el.offsetParent !== null) scrollAndHighlight(el);
    });
  }

  function runSearch(query) {
    var resultsBox = document.getElementById("searchResults");
    if (!resultsBox) return;

    query = query.trim().toLowerCase();
    if (!query) {
      resultsBox.innerHTML = "";
      resultsBox.classList.remove("search-results--visible");
      return;
    }

    var matchResults = SITE_DATA.predictions.filter(function (p) {
      return p.match.toLowerCase().indexOf(query) !== -1 || p.pick.toLowerCase().indexOf(query) !== -1;
    });

    var bookmakerResults = SITE_DATA.bookmakers.filter(function (key) {
      return BOOKMAKER_META[key].label.toLowerCase().indexOf(query) !== -1;
    });

    var newsResults = SITE_DATA.news.filter(function (n) {
      return n.headline.toLowerCase().indexOf(query) !== -1;
    });

    var html = "";

    if (matchResults.length) {
      html += '<li class="search-results__group">Matches</li>';
      html += matchResults
        .map(function (p) {
          return (
            '<li><button type="button" class="search-result-item" data-action="pick" data-id="' + p.id + '">' +
              "⚽ <span>" + escapeHTML(p.match) + "</span>" +
              '<span class="search-result-item__sub">' + escapeHTML(p.pick) + " @ " + p.odds.toFixed(2) + "</span>" +
            "</button></li>"
          );
        })
        .join("");
    }

    if (bookmakerResults.length) {
      html += '<li class="search-results__group">Bookmakers</li>';
      html += bookmakerResults
        .map(function (key) {
          return (
            '<li><button type="button" class="search-result-item" data-action="section" data-target="bookmakers">' +
              "🏦 <span>" + escapeHTML(BOOKMAKER_META[key].label) + "</span>" +
            "</button></li>"
          );
        })
        .join("");
    }

    if (newsResults.length) {
      html += '<li class="search-results__group">News</li>';
      html += newsResults
        .map(function (n) {
          return (
            '<li><button type="button" class="search-result-item" data-action="section" data-target="newsList">' +
              "📰 <span>" + escapeHTML(n.headline) + "</span>" +
            "</button></li>"
          );
        })
        .join("");
    }

    if (!html) {
      html = '<li class="search-results__empty">No results for "' + escapeHTML(query) + '"</li>';
    }

    resultsBox.innerHTML = html;
    resultsBox.classList.add("search-results--visible");

    resultsBox.querySelectorAll(".search-result-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.getAttribute("data-action") === "pick") {
          scrollToPick(btn.getAttribute("data-id"));
        } else {
          var target = document.getElementById(btn.getAttribute("data-target"));
          scrollAndHighlight(target);
        }
        closeSearch();
      });
    });
  }

  function closeSearch() {
    var navbarSearch = document.getElementById("navbarSearch");
    var searchToggle = document.getElementById("searchToggle");
    var searchInput = document.getElementById("searchInput");
    var resultsBox = document.getElementById("searchResults");
    if (navbarSearch) navbarSearch.classList.remove("navbar__search--open");
    if (searchToggle) searchToggle.setAttribute("aria-expanded", "false");
    if (searchInput) searchInput.value = "";
    if (resultsBox) {
      resultsBox.innerHTML = "";
      resultsBox.classList.remove("search-results--visible");
    }
  }

  function initNav() {
    var searchToggle = document.getElementById("searchToggle");
    var navbarSearch = document.getElementById("navbarSearch");
    var searchInput = document.getElementById("searchInput");

    if (searchToggle && navbarSearch) {
      searchToggle.addEventListener("click", function () {
        var isOpen = navbarSearch.classList.toggle("navbar__search--open");
        searchToggle.setAttribute("aria-expanded", String(isOpen));
        if (isOpen && searchInput) {
          searchInput.focus();
        } else {
          closeSearch();
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        runSearch(searchInput.value);
      });
      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeSearch();
      });
    }

    document.addEventListener("click", function (e) {
      if (!navbarSearch) return;
      var clickedInsideSearch = navbarSearch.contains(e.target) || (searchToggle && searchToggle.contains(e.target));
      if (!clickedInsideSearch && navbarSearch.classList.contains("navbar__search--open")) {
        closeSearch();
      }
    });
  }

  function initBottomNav() {
    var items = document.querySelectorAll(".bottom-nav__item");
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        items.forEach(function (i) { i.classList.remove("bottom-nav__item--active"); });
        item.classList.add("bottom-nav__item--active");
      });
    });
  }

  /* =======================================================
     5. INITIALIZATION — renders immediately from SITE_DATA,
     no network request, no delay.
     ======================================================= */

  function init() {
    var overviewDate = document.getElementById("overviewDate");
    if (overviewDate && overviewDate.lastChild) {
      overviewDate.lastChild.textContent = " " + SITE_DATA.date;
    }

    var statTotal = document.getElementById("statTotal");
    var statWinners = document.getElementById("statWinners");
    var statLosers = document.getElementById("statLosers");
    var statHitRate = document.getElementById("statHitRate");
    if (statTotal) statTotal.textContent = SITE_DATA.overview.totalSelections;
    if (statWinners) statWinners.textContent = SITE_DATA.overview.winnersYesterday;
    if (statLosers) statLosers.textContent = SITE_DATA.overview.losersYesterday;
    if (statHitRate) statHitRate.textContent = SITE_DATA.overview.hitRateYesterday + "%";

    var pickCountBadge = document.getElementById("pickCountBadge");
    if (pickCountBadge) pickCountBadge.textContent = SITE_DATA.overview.totalSelections + " Selections";

    renderPicksTable(SITE_DATA.predictions);
    renderPicksCards(SITE_DATA.predictions);
    renderFilters(SITE_DATA.predictions);
    renderAccumulators(SITE_DATA.accumulators);
    renderCorrectScoreTable(SITE_DATA.correctScores);
    renderCorrectScoreCards(SITE_DATA.correctScores);
    renderResults(SITE_DATA.yesterdayResults);
    renderBookmakerSidebar(SITE_DATA.bookmakers);
    renderNews(SITE_DATA.news);
    applyBookmakerAffiliateLinks();
    initNav();
    initBottomNav();
    initSlipModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
