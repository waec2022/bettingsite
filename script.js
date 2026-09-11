/* =========================================================
   NaijaBetTools.ng — script.js
   Google Sheets Integration + Rendering
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     0. GOOGLE SHEETS CONFIGURATION
     ======================================================= */
  
  var GOOGLE_SHEET_ID = "1dv1LoV1vxCetGbik5_0BmVQjvcybVD4znE4GeDvQA8M";
  
  function getSheetUrl(sheetName) {
    return "https://docs.google.com/spreadsheets/d/" + GOOGLE_SHEET_ID + 
           "/gviz/tq?tqx=out:json&sheet=" + encodeURIComponent(sheetName) +
           "&_cb=" + Date.now();
  }

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
     2. FALLBACK DATA — used if Google Sheets unavailable
     ======================================================= */

  var FALLBACK_SITE_DATA = {
    date: "Sep 9, 2026",
    resultsDate: "Sep 8, 2026",

    overview: {
      totalSelections: 25,
      winnersYesterday: 12,
      losersYesterday: 13,
      hitRateYesterday: 48
    },

    yesterdayResults: {
      won: 14,
      lost: 9,
      hitRate: 60.9,
      avgOdds: 2.45
    },

    categories: [
      { key: "All", label: "All", count: 25 },
      { key: "Over/Under", label: "Over/Under", count: 8 },
      { key: "BTTS", label: "BTTS", count: 5 },
      { key: "Match Winner", label: "Match Winner", count: 4 },
      { key: "Double Chance", label: "Double Chance", count: 4 },
      { key: "Other", label: "Other", count: 4 }
    ],

    predictions: [
      { id: 1, match: "man uttd vs Man City", pick: "Over 4.5 Goals", odds: 5.45, bookmakers: ["bet9ja", "sportybet"], code: "BJ-4821-AC", category: "Over/Under" },
      { id: 2, match: "Chelsea vs Newcastle", pick: "Chelsea Win", odds: 1.72, bookmakers: ["betpawa", "betway"], code: "SP-9213-CN", category: "Match Winner" },
      { id: 3, match: "Barcelona vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68, bookmakers: ["sportybet", "bet9ja"], code: "BP-3345-BS", category: "Over/Under" },
      { id: 4, match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80, bookmakers: ["betpawa", "sportybet"], code: "BW-7712-IA", category: "BTTS" },
      { id: 5, match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 1.55, bookmakers: ["bet9ja", "betway"], code: "BJ-5561-LB", category: "Match Winner" },
      { id: 6, match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40, bookmakers: ["sportybet", "betpawa"], code: "SP-2290-PM", category: "Over/Under" },
      { id: 7, match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65, bookmakers: ["betway", "bet9ja"], code: "BW-8834-MB", category: "Double Chance" },
      { id: 8, match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 1.75, bookmakers: ["betpawa", "sportybet"], code: "BP-6620-JL", category: "BTTS" },
      { id: 9, match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60, bookmakers: ["bet9ja", "betway"], code: "BJ-1187-RE", category: "Over/Under" },
      { id: 10, match: "Bayern Munich vs Leverkusen", pick: "Bayern Win", odds: 1.48, bookmakers: ["sportybet", "betpawa"], code: "SP-4456-BL", category: "Double Chance" }
    ],

    accumulators: [
      { key: "3", odds: "3 Odds", matchIds: [1, 2, 6], themeClass: "accumulator-card--3" },
      { key: "5", odds: "5 Odds", matchIds: [3, 4, 5, 7, 8], themeClass: "accumulator-card--5" },
      { key: "10", odds: "10 Odds", matchIds: [9, 10, 1, 2, 3, 6, 7], themeClass: "accumulator-card--10" },
      { key: "20", odds: "20+ Odds", matchIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], themeClass: "accumulator-card--20" }
    ],

    bookmakers: ["bet9ja", "sportybet", "betpawa", "betway"],

    news: [
      { icon: "🎁", headline: "Bet9ja 170% Multiple Bonus — How to qualify", date: "Sep 9, 2026" },
      { icon: "🎟️", headline: "SportyBet Promo: Free Bet Friday", date: "Sep 8, 2026" },
      { icon: "📅", headline: "Top 5 Football Matches to Watch This Week", date: "Sep 7, 2026" },
      { icon: "⚙️", headline: "How to Use Bet Codes on Bet9ja (Step by Step)", date: "Sep 6, 2026" }
    ]
  };

  var SITE_DATA = JSON.parse(JSON.stringify(FALLBACK_SITE_DATA));

  /* =======================================================
     3. GOOGLE SHEETS DATA LOADING
     ======================================================= */

  function parseGoogleSheetResponse(response) {
    try {
      var text = response;
      var prefix = ")]}'\n";
      if (text.substring(0, prefix.length) === prefix) {
        text = text.substring(prefix.length);
      }
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse Google Sheet response:", e);
      return null;
    }
  }

  function extractSheetData(parsedResponse) {
    if (!parsedResponse || !parsedResponse.table || !parsedResponse.table.rows) {
      return [];
    }
    var rows = [];
    parsedResponse.table.rows.forEach(function (row) {
      var cells = [];
      if (row.c) {
        row.c.forEach(function (cell) {
          cells.push(cell ? cell.v : "");
        });
      }
      rows.push(cells);
    });
    return rows;
  }

  function fetchSheetData(sheetName) {
    return fetch(getSheetUrl(sheetName), { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status + " for " + sheetName);
        }
        return response.text();
      })
      .then(function (text) {
        var parsed = parseGoogleSheetResponse(text);
        if (!parsed) {
          throw new Error("Invalid response for " + sheetName);
        }
        return extractSheetData(parsed);
      })
      .catch(function (error) {
        console.error("Error loading sheet '" + sheetName + "':", error);
        return null;
      });
  }

  function parsePredictions(rows) {
    if (!rows || rows.length === 0) {
      console.error("No predictions data found");
      return null;
    }

    var predictions = [];
    var seenIds = {};

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (!row || row.length < 7) continue;

      var id = parseInt(row[0], 10);
      var match = String(row[1] || "").trim();
      var pick = String(row[2] || "").trim();
      var odds = parseFloat(row[3]);
      var bookmakerStr = String(row[4] || "").trim();
      var code = String(row[5] || "").trim();
      var category = String(row[6] || "").trim();

      if (!id || isNaN(odds) || !match || !pick || !code || !category) {
        continue;
      }

      if (seenIds[id]) {
        console.warn("Duplicate prediction ID:", id);
        continue;
      }
      seenIds[id] = true;

      var bookmakers = bookmakerStr.split(",").map(function (b) {
        return b.trim().toLowerCase();
      }).filter(function (b) {
        return b && BOOKMAKER_META[b];
      });

      predictions.push({
        id: id,
        match: match,
        pick: pick,
        odds: odds,
        bookmakers: bookmakers,
        code: code,
        category: category
      });
    }

    return predictions.length > 0 ? predictions : null;
  }

  function parseAccumulators(rows, predictions) {
    if (!rows || rows.length === 0 || !predictions) {
      console.error("No accumulators data found");
      return null;
    }

    var predictionIds = {};
    predictions.forEach(function (p) {
      predictionIds[p.id] = true;
    });

    var accumulators = [];

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (!row || row.length < 4) continue;

      var key = String(row[0] || "").trim();
      var odds = String(row[1] || "").trim();
      var matchIdStr = String(row[2] || "").trim();
      var themeClass = String(row[3] || "").trim();

      if (!key || !odds || !matchIdStr || !themeClass) {
        continue;
      }

      var matchIds = matchIdStr.split(",").map(function (id) {
        return parseInt(id.trim(), 10);
      }).filter(function (id) {
        return !isNaN(id) && predictionIds[id];
      });

      if (matchIds.length === 0) {
        console.warn("Accumulator '" + key + "' has no valid prediction IDs");
        continue;
      }

      accumulators.push({
        key: key,
        odds: odds,
        matchIds: matchIds,
        themeClass: themeClass
      });
    }

    return accumulators;
  }

  function parseResults(rows) {
    if (!rows || rows.length === 0) {
      console.error("No results data found");
      return null;
    }

    var row = rows[0];
    if (!row || row.length < 5) {
      return null;
    }

    var won = parseInt(row[0], 10);
    var lost = parseInt(row[1], 10);
    var hitRate = parseFloat(row[2]);
    var avgOdds = parseFloat(row[3]);
    var resultsDate = String(row[4] || "").trim();

    if (isNaN(won) || isNaN(lost) || isNaN(hitRate) || isNaN(avgOdds) || !resultsDate) {
      console.error("Invalid results data");
      return null;
    }

    return {
      yesterdayResults: {
        won: won,
        lost: lost,
        hitRate: hitRate,
        avgOdds: avgOdds
      },
      resultsDate: resultsDate
    };
  }

  function parseNews(rows) {
    if (!rows || rows.length === 0) {
      console.error("No news data found");
      return null;
    }

    var news = [];

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (!row || row.length < 3) continue;

      var icon = String(row[0] || "").trim();
      var headline = String(row[1] || "").trim();
      var date = String(row[2] || "").trim();

      if (!icon || !headline || !date) {
        continue;
      }

      news.push({
        icon: icon,
        headline: headline,
        date: date
      });
    }

    return news.length > 0 ? news : null;
  }

  function parseSettings(rows) {
    if (!rows || rows.length === 0) {
      console.error("No settings data found");
      return null;
    }

    var settings = {};

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (!row || row.length < 2) continue;

      var key = String(row[0] || "").trim();
      var value = row[1];

      if (!key) continue;

      if (typeof value === "number") {
        settings[key] = value;
      } else if (typeof value === "string") {
        var trimmed = value.trim();
        var asNum = parseFloat(trimmed);
        settings[key] = isNaN(asNum) ? trimmed : asNum;
      }
    }

    return Object.keys(settings).length > 0 ? settings : null;
  }

  function buildCategories(predictions) {
    var counts = {};
    var total = predictions.length;

    predictions.forEach(function (p) {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });

    var categories = [
      { key: "All", label: "All", count: total }
    ];

    Object.keys(counts).forEach(function (cat) {
      categories.push({
        key: cat,
        label: cat,
        count: counts[cat]
      });
    });

    return categories;
  }

  function validateData(data) {
    if (!data.predictions || data.predictions.length === 0) {
      console.error("Validation: No predictions");
      return false;
    }

    if (!data.accumulators) {
      data.accumulators = [];
    }

    var predictionIds = {};
    data.predictions.forEach(function (p) {
      if (predictionIds[p.id]) {
        console.error("Validation: Duplicate prediction ID:", p.id);
        return false;
      }
      predictionIds[p.id] = true;
    });

    for (var i = 0; i < data.accumulators.length; i++) {
      var acc = data.accumulators[i];
      for (var j = 0; j < acc.matchIds.length; j++) {
        if (!predictionIds[acc.matchIds[j]]) {
          console.error("Validation: Accumulator '" + acc.key + "' references missing prediction ID:", acc.matchIds[j]);
          return false;
        }
      }
    }

    return true;
  }

  function loadDataFromGoogleSheets() {
    return Promise.all([
      fetchSheetData("Predictions"),
      fetchSheetData("Accumulators"),
      fetchSheetData("Results"),
      fetchSheetData("News"),
      fetchSheetData("Settings")
    ]).then(function (results) {
      var predictionsRows = results[0];
      var accumulatorsRows = results[1];
      var resultsRows = results[2];
      var newsRows = results[3];
      var settingsRows = results[4];

      if (!predictionsRows) {
        console.error("Google Sheets: Critical data missing");
        return null;
      }

      var predictions = parsePredictions(predictionsRows);
      if (!predictions) {
        console.error("Google Sheets: Failed to parse predictions");
        return null;
      }

      var accumulators = accumulatorsRows ? parseAccumulators(accumulatorsRows, predictions) : [];
      if (!accumulators) {
        console.warn("Google Sheets: No valid accumulators, continuing without them");
        accumulators = [];
      }

      var data = {
        predictions: predictions,
        accumulators: accumulators,
        categories: buildCategories(predictions),
        bookmakers: ["bet9ja", "sportybet", "betpawa", "betway"],
        date: "Sep 9, 2026",
        resultsDate: "Sep 8, 2026",
        overview: {
          totalSelections: predictions.length,
          winnersYesterday: 0,
          losersYesterday: 0,
          hitRateYesterday: 0
        },
        yesterdayResults: {
          won: 0,
          lost: 0,
          hitRate: 0,
          avgOdds: 0
        },
        news: []
      };

      if (resultsRows) {
        var resultsData = parseResults(resultsRows);
        if (resultsData) {
          data.yesterdayResults = resultsData.yesterdayResults;
          data.resultsDate = resultsData.resultsDate;
        }
      }

      if (newsRows) {
        var news = parseNews(newsRows);
        if (news) {
          data.news = news;
        }
      }

      if (settingsRows) {
        var settings = parseSettings(settingsRows);
        if (settings) {
          if (settings.date) data.date = settings.date;
          if (settings.resultsDate) data.resultsDate = settings.resultsDate;
          if (settings.totalSelections) data.overview.totalSelections = settings.totalSelections;
          if (settings.winnersYesterday) data.overview.winnersYesterday = settings.winnersYesterday;
          if (settings.losersYesterday) data.overview.losersYesterday = settings.losersYesterday;
          if (settings.hitRateYesterday) data.overview.hitRateYesterday = settings.hitRateYesterday;
        }
      }

      if (!validateData(data)) {
        console.error("Google Sheets: Data validation failed");
        return null;
      }

      console.log("Google Sheets data loaded successfully");
      return data;
    }).catch(function (error) {
      console.error("Google Sheets: Load error:", error);
      return null;
    });
  }

  /* =======================================================
     4. RENDER HELPERS
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

  function findPredictionById(id) {
    for (var i = 0; i < SITE_DATA.predictions.length; i++) {
      if (SITE_DATA.predictions[i].id === id) return SITE_DATA.predictions[i];
    }
    return null;
  }

  function renderAccumulators(list) {
    var grid = document.getElementById("accumulatorGrid");
    if (!grid) return;

    grid.innerHTML = list
      .map(function (a) {
        var matches = a.matchIds.map(findPredictionById).filter(Boolean);
        var combinedOdds = matches.reduce(function (total, m) { return total * m.odds; }, 1);

        var matchesHTML = matches
          .map(function (m) {
            return (
              '<div class="accumulator-card__match">' +
                '<span class="accumulator-card__match-teams">' + m.match + "</span>" +
                '<span class="accumulator-card__match-pick">' + m.pick + " @ " + m.odds.toFixed(2) + "</span>" +
              "</div>"
            );
          })
          .join("");

        return (
          '<div class="accumulator-card ' + a.themeClass + '">' +
            '<div class="accumulator-card__odds">🎯 ' + a.odds.toUpperCase() + "</div>" +
            '<div class="accumulator-card__desc">' + matches.length + " Selections • Combined " + combinedOdds.toFixed(2) + "</div>" +
            '<div class="accumulator-card__matches">' + matchesHTML + "</div>" +
            '<a href="#" class="accumulator-card__cta">View Slip →</a>' +
          "</div>"
        );
      })
      .join("");
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
     5. NAV INTERACTIONS (live search + bottom nav)
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
     6. INITIALIZATION
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

  function startApp() {
    loadDataFromGoogleSheets().then(function (sheetData) {
      if (sheetData) {
        SITE_DATA = sheetData;
      } else {
        console.log("Using fallback data");
        SITE_DATA = JSON.parse(JSON.stringify(FALLBACK_SITE_DATA));
      }
      init();
    }).catch(function (error) {
      console.error("Failed to load data:", error);
      SITE_DATA = JSON.parse(JSON.stringify(FALLBACK_SITE_DATA));
      init();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp);
  } else {
    startApp();
  }
})();
