/* =========================================================
   NaijaBetTools.ng — script.js
   Central data + rendering. Edit the DATA section daily.
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
  betway: "BETWAY_AFFILIATE_URL",
  "football.com": "FOOTBALL_AFFILIATE_URL",
  "1xbet": "1XBET_AFFILIATE_URL"
};

var BOOKMAKER_META = {
  bet9ja: { label: "Bet9ja", className: "bet9ja" },
  sportybet: { label: "SportyBet", className: "sportybet" },
  betpawa: { label: "BetPawa", className: "betpawa" },
  betway: { label: "Betway", className: "betway" },
  "football.com": { label: "Football.com", className: "football" },
  "1xbet": { label: "1xBet", className: "1xbet" }
};

  /* =======================================================
     2. DATA — update this every day
     ======================================================= */

  var SITE_DATA = {
    date: "Sep 9, 2026",
    resultsDate: "Sep 8, 2026",


     overview: {
  totalSelections: 20,
  winnersYesterday: 12,
  losersYesterday: 6,
  hitRateYesterday: 66.7
},

    yesterdayResults: {
      won: 14,
      lost: 9,
      hitRate: 60.9,
      avgOdds: 2.45
    },

    /* category counts shown on the filter chips */
    categories: [
  { key: "All", label: "All", count: 20 },
  { key: "Over/Under", label: "Over/Under", count: 5 },
  { key: "BTTS", label: "BTTS", count: 4 },
  { key: "Match Winner", label: "Match Winner", count: 7 },
  { key: "Double Chance", label: "Double Chance", count: 2 },
  { key: "Other", label: "Other", count: 2 }
],



     


predictions: [
  { id: 1, match: "Man Utd vs Man City", pick: "Over 4.5 Goals", category: "Over/Under", bookmakers: [{ name: "bet9ja", odds: 1.85, code: "9J-MU185" },{ name: "football.com", odds: 1.83, code: "FC-MU183" },{ name: "1xbet", odds: 1.86, code: "1X-MU186" },{ name: "betpawa", odds: 1.84, code: "BP-MU184" },{ name: "sportybet", odds: 1.85, code: "SB-MU185" },{ name: "betway", odds: 1.82, code: "BW-MU182" }] },
  { id: 2, match: "Chelsea vs Newcastle", pick: "Chelsea Win", category: "Match Winner", bookmakers: [{ name: "bet9ja", odds: 1.72, code: "9J-CHL172" },{ name: "football.com", odds: 1.70, code: "FC-CHL170" },{ name: "1xbet", odds: 1.73, code: "1X-CHL173" },{ name: "betpawa", odds: 1.71, code: "BP-CHL171" },{ name: "sportybet", odds: 1.72, code: "SB-CHL172" },{ name: "betway", odds: 1.69, code: "BW-CHL169" }] },
  { id: 3, match: "Liverpool vs Bournemouth", pick: "Liverpool Win", category: "Match Winner", bookmakers: [{ name: "bet9ja", odds: 1.55, code: "9J-LIV155" },{ name: "football.com", odds: 1.53, code: "FC-LIV153" },{ name: "1xbet", odds: 1.56, code: "1X-LIV156" },{ name: "betpawa", odds: 1.54, code: "BP-LIV154" },{ name: "sportybet", odds: 1.55, code: "SB-LIV155" },{ name: "betway", odds: 1.52, code: "BW-LIV152" }] },
  { id: 4, match: "Arsenal vs Fulham", pick: "Both Teams To Score", category: "BTTS", bookmakers: [{ name: "bet9ja", odds: 1.80, code: "9J-ARS180" },{ name: "football.com", odds: 1.78, code: "FC-ARS178" },{ name: "1xbet", odds: 1.81, code: "1X-ARS181" },{ name: "betpawa", odds: 1.79, code: "BP-ARS179" },{ name: "sportybet", odds: 1.80, code: "SB-ARS180" },{ name: "betway", odds: 1.77, code: "BW-ARS177" }] },
  { id: 5, match: "Barcelona vs Real Madrid", pick: "Over 2.5 Goals", category: "Over/Under", bookmakers: [{ name: "bet9ja", odds: 1.65, code: "9J-BAR165" },{ name: "football.com", odds: 1.63, code: "FC-BAR163" },{ name: "1xbet", odds: 1.66, code: "1X-BAR166" },{ name: "betpawa", odds: 1.64, code: "BP-BAR164" },{ name: "sportybet", odds: 1.65, code: "SB-BAR165" },{ name: "betway", odds: 1.62, code: "BW-BAR162" }] },
  { id: 6, match: "Bayern vs Dortmund", pick: "Bayern Win", category: "Match Winner", bookmakers: [{ name: "bet9ja", odds: 1.50, code: "9J-BAY150" },{ name: "football.com", odds: 1.48, code: "FC-BAY148" },{ name: "1xbet", odds: 1.51, code: "1X-BAY151" },{ name: "betpawa", odds: 1.49, code: "BP-BAY149" },{ name: "sportybet", odds: 1.50, code: "SB-BAY150" },{ name: "betway", odds: 1.47, code: "BW-BAY147" }] },
  { id: 7, match: "PSG vs Marseille", pick: "Double Chance: PSG or Draw", category: "Double Chance", bookmakers: [{ name: "bet9ja", odds: 1.25, code: "9J-PSG125" },{ name: "football.com", odds: 1.23, code: "FC-PSG123" },{ name: "1xbet", odds: 1.26, code: "1X-PSG126" },{ name: "betpawa", odds: 1.24, code: "BP-PSG124" },{ name: "sportybet", odds: 1.25, code: "SB-PSG125" },{ name: "betway", odds: 1.22, code: "BW-PSG122" }] },
  { id: 8, match: "Inter vs AC Milan", pick: "Under 3.5 Goals", category: "Over/Under", bookmakers: [{ name: "bet9ja", odds: 1.90, code: "9J-INT190" },{ name: "football.com", odds: 1.88, code: "FC-INT188" },{ name: "1xbet", odds: 1.91, code: "1X-INT191" },{ name: "betpawa", odds: 1.89, code: "BP-INT189" },{ name: "sportybet", odds: 1.90, code: "SB-INT190" },{ name: "betway", odds: 1.87, code: "BW-INT187" }] },
  { id: 9, match: "Juventus vs Napoli", pick: "Both Teams To Score", category: "BTTS", bookmakers: [{ name: "bet9ja", odds: 1.75, code: "9J-JUV175" },{ name: "football.com", odds: 1.73, code: "FC-JUV173" },{ name: "1xbet", odds: 1.76, code: "1X-JUV176" },{ name: "betpawa", odds: 1.74, code: "BP-JUV174" },{ name: "sportybet", odds: 1.75, code: "SB-JUV175" },{ name: "betway", odds: 1.72, code: "BW-JUV172" }] },
  { id: 10, match: "Atletico vs Sevilla", pick: "Other: Over 9.5 Corners", category: "Other", bookmakers: [{ name: "bet9ja", odds: 2.10, code: "9J-ATL210" },{ name: "football.com", odds: 2.08, code: "FC-ATL208" },{ name: "1xbet", odds: 2.11, code: "1X-ATL211" },{ name: "betpawa", odds: 2.09, code: "BP-ATL209" },{ name: "sportybet", odds: 2.10, code: "SB-ATL210" },{ name: "betway", odds: 2.07, code: "BW-ATL207" }] },
  { id: 11, match: "Real Sociedad vs Valencia", pick: "Real Sociedad Win", category: "Match Winner", bookmakers: [{ name: "bet9ja", odds: 1.68, code: "9J-RS168" },{ name: "football.com", odds: 1.66, code: "FC-RS166" },{ name: "1xbet", odds: 1.69, code: "1X-RS169" },{ name: "betpawa", odds: 1.67, code: "BP-RS167" },{ name: "sportybet", odds: 1.68, code: "SB-RS168" },{ name: "betway", odds: 1.65, code: "BW

       
    bookmakers: ["bet9ja", "sportybet", "betpawa", "betway"],

    news: [
      { icon: "🎁", headline: "Bet9ja 170% Multiple Bonus — How to qualify", date: "Sep 9, 2026" },
      { icon: "🎟️", headline: "SportyBet Promo: Free Bet Friday", date: "Sep 8, 2026" },
      { icon: "📅", headline: "Top 5 Football Matches to Watch This Week", date: "Sep 7, 2026" },
      { icon: "⚙️", headline: "How to Use Bet Codes on Bet9ja (Step by Step)", date: "Sep 6, 2026" }
    ]
  };

                                                                                                                  
 accumulators: [
  { key: "3", odds: "3 Odds", matchIds: [1, 2, 3], themeClass: "accumulator-card-3", combinedCode: "ACC3-9J-111" },
  { key: "5", odds: "5 Odds", matchIds: [4, 5, 6, 7, 8], themeClass: "accumulator-card-5", combinedCode: "ACC5-9J-222" },
  { key: "10", odds: "10 Odds", matchIds: [1,2,3,4,5,6,7,8,9,10], themeClass: "accumulator-card-10", combinedCode: "ACC10-9J-333" },
  { key: "20", odds: "20+ Odds", matchIds: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], themeClass: "accumulator-card-20", combinedCode: "ACC20-9J-444" }
],
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
  
  tbody.innerHTML = predictions.map(function (p, index) {
    var oddsBadges = p.bookmakers.map(function(b){
      var meta = BOOKMAKER_META[b.name];
      return '<span class="odds-cell ' + meta.className + '">' + meta.label + ': ' + b.odds.toFixed(2) + '</span>';
    }).join(" ");
    
    return (
      '<tr data-id="' + p.id + '">' +
      '<td class="col-num"><span class="hatch-cell">' + (index + 1) + "</span></td>" +
      '<td class="col-match"><span class="hatch-cell"></span>' + p.match + "</td>" +
      '<td class="col-pick"><span class="pick-cell"></span>' + p.pick + "</td>" +
      '<td class="col-odds">' + oddsBadges + '</td>' +
      '<td class="col-code">' + revealButtonHTML(p) + "</td>" +
      "</tr>"
    );
  }).join("");
  
  attachRevealHandlers(tbody);
       }
    
    return (
      '<tr data-id="' + p.id + '">' +
      '<td class="col-num"><span class="hatch-cell">' + (index + 1) + "</span></td>" +
      '<td class="col-match"><span class="hatch-cell"></span>' + p.match + "</td>" +
      '<td class="col-pick"><span class="pick-cell"></span>' + p.pick + "</td>" +
      '<td class="col-odds">' + bookmakerBadges + '</td>' +
      '<td class="col-code">' + revealButtonHTML(p) + "</td>" +
      "</tr>"
    );
  }).join("");
  
  attachRevealHandlers(tbody);
       }
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

  /*
   * Booking code reveal flow.
   *
   * requestCodeReveal() is the single place a rewarded-ad / interstitial-ad
   * provider should hook in later. If window.NBT_AD_PROVIDER is connected,
   * the code only unlocks after its callback confirms the ad was actually
   * watched/completed. Until a provider is connected, clicking "Reveal Code"
   * unlocks the code right away so the feature works out of the box.
   */
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
      // Real ad provider connected: only reveal after it confirms completion.
      window.NBT_AD_PROVIDER.show(function onAdComplete(success) {
        if (success) revealCode(button, code);
      });
      return;
    }
    // No ad provider connected yet — reveal immediately.
    revealCode(button, code);
  }

  function revealCode(button, p_id) {
  button.classList.add("reveal-btn--revealed");
  var p = findPredictionById(parseInt(p_id));
  
  var codesHTML = p.bookmakers.map(function(b){
    var meta = BOOKMAKER_META[b.name];
    return '<div style="margin:4px 0;"><b>' + meta.label + '</b>: ' + b.code + ' @ ' + b.odds + '</div>';
  }).join("");
  
  button.innerHTML = codesHTML;
  button.disabled = true;
  button.style.cursor = "default";
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

  function findPredictionById(id) {
    for (var i = 0; i < SITE_DATA.predictions.length; i++) {
      if (SITE_DATA.predictions[i].id === id) return SITE_DATA.predictions[i];
    }
    return null;
  }


function renderAccumulators(list) {
  var grid = document.getElementById("accumulatorGrid");
  if (!grid) return;
  grid.innerHTML = list.map(function (a) {
    var matches = a.matchIds.map(findPredictionById).filter(Boolean);
    var combinedOdds = matches.reduce(function (total, m) { 
      var avgOdds = m.bookmakers.reduce(function(sum, b){ return sum + b.odds; }, 0) / m.bookmakers.length;
      return total * avgOdds; 
    }, 1);
    var matchesHTML = matches.map(function (m) {
      var avgOdds = m.bookmakers.reduce(function(sum, b){ return sum + b.odds; }, 0) / m.bookmakers.length;
      return "<div class=\"accumulator-card_match\"><span class=\"accumulator-card_match-teams\">" + m.match + "</span><span class=\"accumulator-card_match-pick\">" + m.pick + " @ " + avgOdds.toFixed(2) + "</span></div>";
    }).join("");
    return "<div class=\"accumulator-card " + a.themeClass + "\"><div class=\"accumulator-card_odds\">" + a.odds.toUpperCase() + "</div><div class=\"accumulator-card_desc\">" + matches.length + " Selections - Combined " + combinedOdds.toFixed(2) + "</div><div class=\"accumulator-card_matches\">" + matchesHTML + "</div><div class=\"accumulator-card_code\"><b>Code:</b> " + a.combinedCode + "</div><button class=\"accumulator-card_btn\" onclick=\"navigator.clipboard.writeText('" + a.combinedCode + "')\">Copy Code</button></div>";
  }).join("");
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
      // Elements that reference the AFFILIATE_LINKS map directly by key
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
    // Only the table row OR the mobile card is visible at any given
    // breakpoint (the other is display:none) — jump to whichever one is.
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
      // Live filtering — results update on every keystroke, no submit needed.
      searchInput.addEventListener("input", function () {
        runSearch(searchInput.value);
      });
      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeSearch();
      });
    }

    // Close the search dropdown when clicking outside of it.
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
     5. INIT
     ======================================================= */

  function init() {
    document.getElementById("overviewDate") &&
      (document.getElementById("overviewDate").lastChild.textContent = " " + SITE_DATA.date);

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
    renderResults(SITE_DATA.yesterdayResults);
    renderBookmakerSidebar(SITE_DATA.bookmakers);
    renderNews(SITE_DATA.news);
    applyBookmakerAffiliateLinks();
    initNav();
    initBottomNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
