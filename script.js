/* =========================================================
   MatchForecast.online — script.js
   Fully local data. No Google Sheets. No network dependency.
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     ================= DAILY CONTENT ==========================
     EDIT EVERYTHING BELOW THIS LINE FOR TODAY'S UPDATES.
     Nothing here affects rendering code further down the file.
     Booking codes marked "ENTER_REAL_CODE_HERE" are placeholders —
     replace with the real code your bookmaker generates. Never
     ship a fake code as if it were real.
     ========================================================= */

  var TODAY_DATE = "Sep 12, 2026";
  var RESULTS_DATE = "Sep 11, 2026";

  var OVERVIEW = {
    totalSelections: 10,
    winnersYesterday: 12,
    losersYesterday: 13,
    hitRateYesterday: 48
  };

  var YESTERDAY_RESULTS = {
    won: 14,
    lost: 9,
    hitRate: 60.9,
    avgOdds: 2.45
  };

  // ----- PREDICTIONS -----
  // Each bookmaker on a prediction has its OWN odds + OWN code.
  // Only bookmakers listed here will show on that prediction.
  // NOTE: Sept 12, 2026 is an international-break weekend for most
  // top European leagues — replace these example matches with
  // whatever fixtures are actually on today before publishing.
  var PREDICTIONS = [
    {
      id: 1,
      match: "Man Utd vs Man City",
      pick: "Over 2.5 Goals",
      category: "Over/Under",
      bookmakers: {
        bet9ja: { odds: 1.70, code: "ENTER_REAL_CODE_HERE" },
        sportybet: { odds: 1.68, code: "ENTER_REAL_CODE_HERE" }
      }
    },
    {
      id: 2,
      match: "Chelsea vs Newcastle",
      pick: "Chelsea Win",
      category: "Match Winner",
      bookmakers: {
        betpawa: { odds: 1.72, code: "ENTER_REAL_CODE_HERE" },
        betway: { odds: 1.75, code: "ENTER_REAL_CODE_HERE" }
      }
    },
    {
      id: 3,
      match: "Barcelona vs Sevilla",
      pick: "Over 2.5 Goals",
      category: "Over/Under",
      bookmakers: {
        sportybet: { odds: 1.68, code: "ENTER_REAL_CODE_HERE" },
        bet9ja: { odds: 1.65, code: "ENTER_REAL_CODE_HERE" }
      }
    },
    {
      id: 4,
      match: "Inter Milan vs Atalanta",
      pick: "BTTS - Yes",
      category: "BTTS",
      bookmakers: {
        betpawa: { odds: 1.80, code: "ENTER_REAL_CODE_HERE" },
        "1xbet": { odds: 1.82, code: "ENTER_REAL_CODE_HERE" }
      }
    },
    {
      id: 5,
      match: "Liverpool vs Bournemouth",
      pick: "Liverpool Win",
      category: "Match Winner",
      bookmakers: {
        bet9ja: { odds: 1.55, code: "ENTER_REAL_CODE_HERE" }
      }
    },
    {
      id: 6,
      match: "PSG vs Marseille",
      pick: "Over 1.5 Goals",
      category: "Over/Under",
      bookmakers: {
        sportybet: { odds: 1.40, code: "ENTER_REAL_CODE_HERE" },
        betpawa: { odds: 1.38, code: "ENTER_REAL_CODE_HERE" }
      }
    },
    {
      id: 7,
      match: "Man United vs Burnley",
      pick: "Man United Win",
      category: "Double Chance",
      bookmakers: {
        betway: { odds: 1.65, code: "ENTER_REAL_CODE_HERE" },
        bet9ja: { odds: 1.62, code: "ENTER_REAL_CODE_HERE" }
      }
    },
    {
      id: 8,
      match: "Juventus vs Lazio",
      pick: "BTTS - Yes",
      category: "BTTS",
      bookmakers: {
        betpawa: { odds: 1.75, code: "ENTER_REAL_CODE_HERE" },
        sportybet: { odds: 1.73, code: "ENTER_REAL_CODE_HERE" }
      }
    },
    {
      id: 9,
      match: "Real Madrid vs Espanyol",
      pick: "Over 2.5 Goals",
      category: "Over/Under",
      bookmakers: {
        bet9ja: { odds: 1.60, code: "ENTER_REAL_CODE_HERE" },
        betway: { odds: 1.58, code: "ENTER_REAL_CODE_HERE" }
      }
    },
    {
      id: 10,
      match: "Bayern Munich vs Leverkusen",
      pick: "Bayern Win",
      category: "Double Chance",
      bookmakers: {
        sportybet: { odds: 1.48, code: "ENTER_REAL_CODE_HERE" },
        "1xbet": { odds: 1.50, code: "ENTER_REAL_CODE_HERE" }
      }
    }
  ];

  // ----- ACCUMULATORS -----
  // Completely independent of PREDICTIONS. Every match/selection
  // here is typed manually — add/remove tiers freely. bookingCodes
  // only shows the bookmakers you actually provide a code for.
  var ACCUMULATORS = [
    { key: "2odds", label: "2 Odds", combinedOdds: 2.10, matches: [
        { match: "Man Utd vs Man City", pick: "Over 2.5 Goals", odds: 1.70 },
        { match: "Chelsea vs Newcastle", pick: "Chelsea Win", odds: 1.24 }
      ], bookingCodes: { sportybet: "ENTER_REAL_CODE_HERE", betpawa: "ENTER_REAL_CODE_HERE" } },

    { key: "4odds", label: "4 Odds", combinedOdds: 4.05, matches: [
        { match: "Barcelona vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68 },
        { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80 },
        { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.34 }
      ], bookingCodes: { bet9ja: "ENTER_REAL_CODE_HERE" } },

    { key: "5odds", label: "5 Odds", combinedOdds: 5.20, matches: [
        { match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 1.55 },
        { match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65 },
        { match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 2.03 }
      ], bookingCodes: { sportybet: "ENTER_REAL_CODE_HERE", betway: "ENTER_REAL_CODE_HERE" } },

    { key: "10odds", label: "10 Odds", combinedOdds: 10.40, matches: [
        { match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60 },
        { match: "Bayern Munich vs Leverkusen", pick: "Bayern Win", odds: 1.48 },
        { match: "Man Utd vs Man City", pick: "Over 2.5 Goals", odds: 1.70 },
        { match: "Chelsea vs Newcastle", pick: "Chelsea Win", odds: 2.60 }
      ], bookingCodes: { bet9ja: "ENTER_REAL_CODE_HERE", betpawa: "ENTER_REAL_CODE_HERE" } },

    { key: "20odds", label: "20 Odds", combinedOdds: 21.30, matches: [
        { match: "Barcelona vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68 },
        { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80 },
        { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40 },
        { match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 1.55 },
        { match: "Man United vs Burnley", pick: "Man United Win", odds: 3.80 }
      ], bookingCodes: { sportybet: "ENTER_REAL_CODE_HERE" } },

    { key: "30odds", label: "30 Odds", combinedOdds: 31.50, matches: [
        { match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 1.75 },
        { match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60 },
        { match: "Bayern Munich vs Leverkusen", pick: "Bayern Win", odds: 1.48 },
        { match: "Man Utd vs Man City", pick: "Over 2.5 Goals", odds: 1.70 },
        { match: "Chelsea vs Newcastle", pick: "Chelsea Win", odds: 4.75 }
      ], bookingCodes: { bet9ja: "ENTER_REAL_CODE_HERE", betway: "ENTER_REAL_CODE_HERE" } },

    { key: "50odds", label: "50 Odds", combinedOdds: 52.00, matches: [
        { match: "Barcelona vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68 },
        { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80 },
        { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40 },
        { match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 1.55 },
        { match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65 },
        { match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 5.60 }
      ], bookingCodes: { sportybet: "ENTER_REAL_CODE_HERE", betpawa: "ENTER_REAL_CODE_HERE" } },

    { key: "75odds", label: "75 Odds", combinedOdds: 76.80, matches: [
        { match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60 },
        { match: "Bayern Munich vs Leverkusen", pick: "Bayern Win", odds: 1.48 },
        { match: "Man Utd vs Man City", pick: "Over 2.5 Goals", odds: 1.70 },
        { match: "Chelsea vs Newcastle", pick: "Chelsea Win", odds: 1.72 },
        { match: "Barcelona vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68 },
        { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 6.85 }
      ], bookingCodes: { bet9ja: "ENTER_REAL_CODE_HERE" } },

    { key: "100odds", label: "100 Odds", combinedOdds: 104.00, matches: [
        { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40 },
        { match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 1.55 },
        { match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65 },
        { match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 1.75 },
        { match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60 },
        { match: "Bayern Munich vs Leverkusen", pick: "Bayern Win", odds: 8.90 }
      ], bookingCodes: { sportybet: "ENTER_REAL_CODE_HERE", betway: "ENTER_REAL_CODE_HERE" } },

    { key: "150odds", label: "150 Odds", combinedOdds: 152.00, matches: [
        { match: "Man Utd vs Man City", pick: "Over 2.5 Goals", odds: 1.70 },
        { match: "Chelsea vs Newcastle", pick: "Chelsea Win", odds: 1.72 },
        { match: "Barcelona vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68 },
        { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80 },
        { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40 },
        { match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 12.60 }
      ], bookingCodes: { bet9ja: "ENTER_REAL_CODE_HERE", betpawa: "ENTER_REAL_CODE_HERE" } },

    { key: "200odds", label: "200 Odds", combinedOdds: 203.00, matches: [
        { match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65 },
        { match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 1.75 },
        { match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60 },
        { match: "Bayern Munich vs Leverkusen", pick: "Bayern Win", odds: 1.48 },
        { match: "Man Utd vs Man City", pick: "Over 2.5 Goals", odds: 1.70 },
        { match: "Chelsea vs Newcastle", pick: "Chelsea Win", odds: 15.40 }
      ], bookingCodes: { sportybet: "ENTER_REAL_CODE_HERE" } },

    { key: "300odds", label: "300 Odds", combinedOdds: 305.00, matches: [
        { match: "Barcelona vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68 },
        { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80 },
        { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40 },
        { match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 1.55 },
        { match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65 },
        { match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 22.40 }
      ], bookingCodes: { bet9ja: "ENTER_REAL_CODE_HERE", betway: "ENTER_REAL_CODE_HERE" } },

    { key: "500odds", label: "500 Odds", combinedOdds: 508.00, matches: [
        { match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60 },
        { match: "Bayern Munich vs Leverkusen", pick: "Bayern Win", odds: 1.48 },
        { match: "Man Utd vs Man City", pick: "Over 2.5 Goals", odds: 1.70 },
        { match: "Chelsea vs Newcastle", pick: "Chelsea Win", odds: 1.72 },
        { match: "Barcelona vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68 },
        { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80 },
        { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 8.10 }
      ], bookingCodes: { sportybet: "ENTER_REAL_CODE_HERE" } },

    { key: "700odds", label: "700 Odds", combinedOdds: 712.00, matches: [
        { match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 1.55 },
        { match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65 },
        { match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 1.75 },
        { match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60 },
        { match: "Bayern Munich vs Leverkusen", pick: "Bayern Win", odds: 1.48 },
        { match: "Man Utd vs Man City", pick: "Over 2.5 Goals", odds: 1.70 },
        { match: "Chelsea vs Newcastle", pick: "Chelsea Win", odds: 10.50 }
      ], bookingCodes: { bet9ja: "ENTER_REAL_CODE_HERE", betpawa: "ENTER_REAL_CODE_HERE" } },

    { key: "1000odds", label: "1000 Odds", combinedOdds: 1015.00, matches: [
        { match: "Barcelona vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68 },
        { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80 },
        { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40 },
        { match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 1.55 },
        { match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65 },
        { match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 1.75 },
        { match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 14.20 }
      ], bookingCodes: { sportybet: "ENTER_REAL_CODE_HERE", betway: "ENTER_REAL_CODE_HERE" } },

    { key: "1500odds", label: "1500 Odds", combinedOdds: 1520.00, matches: [
        { match: "Bayern Munich vs Leverkusen", pick: "Bayern Win", odds: 1.48 },
        { match: "Man Utd vs Man City", pick: "Over 2.5 Goals", odds: 1.70 },
        { match: "Chelsea vs Newcastle", pick: "Chelsea Win", odds: 1.72 },
        { match: "Barcelona vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68 },
        { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80 },
        { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40 },
        { match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 18.60 }
      ], bookingCodes: { bet9ja: "ENTER_REAL_CODE_HERE" } },

    { key: "2000odds", label: "2000 Odds", combinedOdds: 2030.00, matches: [
        { match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65 },
        { match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 1.75 },
        { match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60 },
        { match: "Bayern Munich vs Leverkusen", pick: "Bayern Win", odds: 1.48 },
        { match: "Man Utd vs Man City", pick: "Over 2.5 Goals", odds: 1.70 },
        { match: "Chelsea vs Newcastle", pick: "Chelsea Win", odds: 1.72 },
        { match: "Barcelona vs Sevilla", pick: "Over 2.5 Goals", odds: 24.80 }
      ], bookingCodes: { sportybet: "ENTER_REAL_CODE_HERE", betpawa: "ENTER_REAL_CODE_HERE" } },

    { key: "3000odds", label: "3000 Odds", combinedOdds: 3050.00, matches: [
        { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80 },
        { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40 },
        { match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 1.55 },
        { match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65 },
        { match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 1.75 },
        { match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60 },
        { match: "Bayern Munich vs Leverkusen", pick: "Bayern Win", odds: 32.40 }
      ], bookingCodes: { bet9ja: "ENTER_REAL_CODE_HERE", betway: "ENTER_REAL_CODE_HERE" } },

    { key: "5000odds", label: "5000 Odds", combinedOdds: 5080.00, matches: [
        { match: "Man Utd vs Man City", pick: "Over 2.5 Goals", odds: 1.70 },
        { match: "Chelsea vs Newcastle", pick: "Chelsea Win", odds: 1.72 },
        { match: "Barcelona vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68 },
        { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80 },
        { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40 },
        { match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 1.55 },
        { match: "Man United vs Burnley", pick: "Man United Win", odds: 42.60 }
      ], bookingCodes: { sportybet: "ENTER_REAL_CODE_HERE" } },

    { key: "10000odds", label: "10000+ Odds", combinedOdds: 10240.00, matches: [
        { match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 1.75 },
        { match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60 },
        { match: "Bayern Munich vs Leverkusen", pick: "Bayern Win", odds: 1.48 },
        { match: "Man Utd vs Man City", pick: "Over 2.5 Goals", odds: 1.70 },
        { match: "Chelsea vs Newcastle", pick: "Chelsea Win", odds: 1.72 },
        { match: "Barcelona vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68 },
        { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80 },
        { match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 68.20 }
      ], bookingCodes: { bet9ja: "ENTER_REAL_CODE_HERE", betpawa: "ENTER_REAL_CODE_HERE" } }
  ];

  // ----- CORRECT SCORE ----- (independent of everything else)
  var CORRECT_SCORE = [
    { id: 1, match: "Man Utd vs Man City", score: "2-1", bookmakers: {
        sportybet: { odds: 8.50, code: "ENTER_REAL_CODE_HERE" },
        bet9ja: { odds: 8.70, code: "ENTER_REAL_CODE_HERE" }
      } },
    { id: 2, match: "Chelsea vs Newcastle", score: "1-0", bookmakers: {
        betpawa: { odds: 6.20, code: "ENTER_REAL_CODE_HERE" }
      } },
    { id: 3, match: "Barcelona vs Sevilla", score: "3-1", bookmakers: {
        sportybet: { odds: 11.00, code: "ENTER_REAL_CODE_HERE" },
        betway: { odds: 10.80, code: "ENTER_REAL_CODE_HERE" }
      } },
    { id: 4, match: "Inter Milan vs Atalanta", score: "2-2", bookmakers: {
        bet9ja: { odds: 9.40, code: "ENTER_REAL_CODE_HERE" }
      } },
    { id: 5, match: "Liverpool vs Bournemouth", score: "3-0", bookmakers: {
        betpawa: { odds: 12.50, code: "ENTER_REAL_CODE_HERE" },
        "1xbet": { odds: 12.20, code: "ENTER_REAL_CODE_HERE" }
      } }
  ];

  // ----- CODES ONLY ----- (independent of everything else)
  var CODES_ONLY = [
    { bookmaker: "bet9ja", title: "Daily Multi Code", code: "ENTER_REAL_CODE_HERE" },
    { bookmaker: "sportybet", title: "Daily Multi Code", code: "ENTER_REAL_CODE_HERE" },
    { bookmaker: "betpawa", title: "Daily Multi Code", code: "ENTER_REAL_CODE_HERE" },
    { bookmaker: "betway", title: "Daily Multi Code", code: "ENTER_REAL_CODE_HERE" },
    { bookmaker: "1xbet", title: "Daily Multi Code", code: "ENTER_REAL_CODE_HERE" },
    { bookmaker: "football.com", title: "Daily Multi Code", code: "ENTER_REAL_CODE_HERE" }
  ];

  // ----- BOOKMAKERS -----
  var BOOKMAKER_META = {
    bet9ja: { label: "bet9ja", className: "bet9ja" },
    sportybet: { label: "SportyBet", className: "sportybet" },
    betpawa: { label: "betPawa", className: "betpawa" },
    betway: { label: "betway", className: "betway" },
    "1xbet": { label: "1xBet", className: "onexbet" },
    "football.com": { label: "football.com", className: "footballcom" }
  };

  var AFFILIATE_LINKS = {
    bet9ja: "BET9JA_AFFILIATE_URL",
    sportybet: "SPORTYBET_AFFILIATE_URL",
    betpawa: "BETPAWA_AFFILIATE_URL",
    betway: "BETWAY_AFFILIATE_URL"
  };

  var NEWS = [
    { icon: "🎁", headline: "Bet9ja 170% Multiple Bonus — How to qualify", date: TODAY_DATE },
    { icon: "🎟️", headline: "SportyBet Promo: Free Bet Friday", date: RESULTS_DATE },
    { icon: "📅", headline: "Top 5 Football Matches to Watch This Week", date: RESULTS_DATE },
    { icon: "⚙️", headline: "How to Use Bet Codes on Bet9ja (Step by Step)", date: RESULTS_DATE }
  ];

  /* =========================================================
     ============= END OF DAILY CONTENT =======================
     Nothing below this line needs daily editing.
     ========================================================= */

  function buildCategories(predictions) {
    var counts = {};
    predictions.forEach(function (p) {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });
    var categories = [{ key: "All", label: "All", count: predictions.length }];
    Object.keys(counts).forEach(function (cat) {
      categories.push({ key: cat, label: cat, count: counts[cat] });
    });
    return categories;
  }

  var SITE_DATA = {
    date: TODAY_DATE,
    resultsDate: RESULTS_DATE,
    overview: OVERVIEW,
    yesterdayResults: YESTERDAY_RESULTS,
    predictions: PREDICTIONS,
    categories: buildCategories(PREDICTIONS),
    accumulators: ACCUMULATORS,
    correctScore: CORRECT_SCORE,
    codesOnly: CODES_ONLY,
    bookmakers: Object.keys(BOOKMAKER_META),
    news: NEWS
  };

  /* =======================================================
     RENDER HELPERS
     ======================================================= */

  function bookLabel(key) {
    var meta = BOOKMAKER_META[key];
    return meta ? meta.label : key;
  }

  function bookClass(key) {
    var meta = BOOKMAKER_META[key];
    return meta ? meta.className : "default";
  }

  function requestAdGate(onSuccess) {
    if (window.NBT_AD_PROVIDER && typeof window.NBT_AD_PROVIDER.show === "function") {
      window.NBT_AD_PROVIDER.show(function onAdComplete(success) {
        if (success) onSuccess();
      });
      return;
    }
    onSuccess();
  }

  function copyToClipboard(text, btn) {
    var done = function () {
      var original = btn.textContent;
      btn.textContent = "Copied!";
      window.setTimeout(function () { btn.textContent = original; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done);
    } else {
      done();
    }
  }

  /* ---------- Predictions table / cards ---------- */

  function bookmakerRevealButtons(bookmakersObj, wrapClass) {
    return Object.keys(bookmakersObj).map(function (key) {
      var entry = bookmakersObj[key];
      return (
        '<button type="button" class="reveal-btn ' + (wrapClass || "") + '" data-book="' + key + '" data-code="' + entry.code + '">' +
          '<span class="reveal-btn__book book-pill--' + bookClass(key) + '">' + bookLabel(key) + "</span>" +
          '<span class="reveal-btn__label">Reveal</span>' +
        "</button>"
      );
    }).join("");
  }

  function attachRevealHandlers(container) {
    container.querySelectorAll(".reveal-btn").forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", function () {
        var code = btn.getAttribute("data-code");
        requestAdGate(function () {
          btn.classList.add("reveal-btn--revealed");
          btn.innerHTML =
            '<span class="reveal-btn__code">' + code + "</span>" +
            '<button type="button" class="copy-code-btn">Copy</button>';
          var copyBtn = btn.querySelector(".copy-code-btn");
          copyBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            copyToClipboard(code, copyBtn);
          });
        });
      });
    });
  }

  function renderPicksTable(predictions) {
    var tbody = document.getElementById("picksTableBody");
    if (!tbody) return;
    tbody.innerHTML = predictions.map(function (p, index) {
      return (
        '<tr data-id="' + p.id + '">' +
          '<td class="col-num">' + (index + 1) + "</td>" +
          '<td class="col-match"><span class="match-cell"><span class="match-cell__icon">⚽</span>' + p.match + "</span></td>" +
          '<td class="col-pick"><span class="pick-cell">' + p.pick + "</span></td>" +
          '<td class="col-code"><span class="books-cell books-cell--reveal">' + bookmakerRevealButtons(p.bookmakers) + "</span></td>" +
        "</tr>"
      );
    }).join("");
    attachRevealHandlers(tbody);
  }

  function renderPicksCards(predictions) {
    var wrap = document.getElementById("picksCardsList");
    if (!wrap) return;
    wrap.innerHTML = predictions.map(function (p, index) {
      return (
        '<div class="pick-card" data-id="' + p.id + '">' +
          '<div class="pick-card__top"><span class="pick-card__match"><span class="pick-card__num">#' + (index + 1) + "</span> ⚽ " + p.match + "</span></div>" +
          '<div class="pick-card__mid"><span class="pick-card__pick">' + p.pick + "</span></div>" +
          '<div class="pick-card__bottom"><span class="pick-card__books pick-card__books--reveal">' + bookmakerRevealButtons(p.bookmakers) + "</span></div>" +
        "</div>"
      );
    }).join("");
    attachRevealHandlers(wrap);
  }

  function renderFilters(predictions) {
    var chips = document.querySelectorAll(".filter-chip");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("filter-chip--active"); c.setAttribute("aria-selected", "false"); });
        chip.classList.add("filter-chip--active");
        chip.setAttribute("aria-selected", "true");
        var filter = chip.getAttribute("data-filter");
        var filtered = filter === "All" ? predictions : predictions.filter(function (p) { return p.category === filter; });
        renderPicksTable(filtered);
        renderPicksCards(filtered);
      });
    });
  }

  /* ---------- Accumulators + View Slip modal ---------- */

  function ensureModal() {
    var modal = document.getElementById("viewSlipModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "viewSlipModal";
    modal.className = "slip-modal";
    modal.innerHTML =
      '<div class="slip-modal__backdrop"></div>' +
      '<div class="slip-modal__panel">' +
        '<button type="button" class="slip-modal__close" aria-label="Close">✕</button>' +
        '<div class="slip-modal__body" id="slipModalBody"></div>' +
      "</div>";
    document.body.appendChild(modal);
    modal.querySelector(".slip-modal__backdrop").addEventListener("click", closeSlipModal);
    modal.querySelector(".slip-modal__close").addEventListener("click", closeSlipModal);
    return modal;
  }

  function closeSlipModal() {
    var modal = document.getElementById("viewSlipModal");
    if (modal) modal.classList.remove("slip-modal--open");
  }

  function openSlipModal(acc) {
    var modal = ensureModal();
    var matchesHTML = acc.matches.map(function (m) {
      return (
        '<div class="slip-modal__match">' +
          '<span class="slip-modal__match-teams">' + m.match + "</span>" +
          '<span class="slip-modal__match-pick">' + m.pick + " @ " + m.odds.toFixed(2) + "</span>" +
        "</div>"
      );
    }).join("");

    var codesHTML = Object.keys(acc.bookingCodes).map(function (key) {
      return (
        '<div class="slip-modal__code-row">' +
          '<span class="book-pill book-pill--' + bookClass(key) + '">' + bookLabel(key) + "</span>" +
          '<span class="slip-modal__code-value">' + acc.bookingCodes[key] + "</span>" +
          '<button type="button" class="copy-code-btn" data-copy="' + acc.bookingCodes[key] + '">Copy</button>' +
        "</div>"
      );
    }).join("");

    var body = document.getElementById("slipModalBody");
    body.innerHTML =
      '<h3 class="slip-modal__title">' + acc.label + " — Combined " + acc.combinedOdds.toFixed(2) + "</h3>" +
      '<div class="slip-modal__matches">' + matchesHTML + "</div>" +
      '<h4 class="slip-modal__subtitle">Booking Codes</h4>' +
      '<div class="slip-modal__codes">' + codesHTML + "</div>";

    body.querySelectorAll(".copy-code-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        copyToClipboard(btn.getAttribute("data-copy"), btn);
      });
    });

    modal.classList.add("slip-modal--open");
  }

  function renderAccumulators(list) {
    var grid = document.getElementById("accumulatorGrid");
    if (!grid) return;
    grid.innerHTML = list.map(function (a, i) {
      var themeClass = "accumulator-card--theme" + (i % 4);
      return (
        '<div class="accumulator-card ' + themeClass + '">' +
          '<div class="accumulator-card__odds">🎯 ' + a.label.toUpperCase() + "</div>" +
          '<div class="accumulator-card__desc">' + a.matches.length + " Selections • Combined " + a.combinedOdds.toFixed(2) + "</div>" +
          '<a href="#" class="accumulator-card__cta" data-acckey="' + a.key + '">View Slip →</a>' +
        "</div>"
      );
    }).join("");

    grid.querySelectorAll(".accumulator-card__cta").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var key = btn.getAttribute("data-acckey");
        var acc = ACCUMULATORS.filter(function (a) { return a.key === key; })[0];
        if (acc) openSlipModal(acc);
      });
    });
  }

  /* ---------- Correct Score ---------- */

  function renderCorrectScore(list) {
    var grid = document.getElementById("correctScoreGrid");
    if (!grid) return;
    grid.innerHTML = list.map(function (cs) {
      return (
        '<div class="cs-card">' +
          '<div class="cs-card__match">' + cs.match + "</div>" +
          '<div class="cs-card__score">' + cs.score + "</div>" +
          '<div class="cs-card__books">' + bookmakerRevealButtons(cs.bookmakers) + "</div>" +
        "</div>"
      );
    }).join("");
    attachRevealHandlers(grid);
  }

  /* ---------- Codes Only ---------- */

  function renderCodesOnly(list) {
    var grid = document.getElementById("codesOnlyGrid");
    if (!grid) return;
    grid.innerHTML = list.map(function (c) {
      return (
        '<div class="codes-only-card" data-code="' + c.code + '">' +
          '<span class="book-pill book-pill--' + bookClass(c.bookmaker) + '">' + bookLabel(c.bookmaker) + "</span>" +
          '<span class="codes-only-card__title">' + c.title + "</span>" +
          '<button type="button" class="reveal-btn codes-only-card__reveal" data-code="' + c.code + '">' +
            '<span class="reveal-btn__label">Reveal Code</span>' +
          "</button>" +
        "</div>"
      );
    }).join("");
    attachRevealHandlers(grid);
  }

  /* ---------- Results / bookmaker sidebar / news / nav (unchanged patterns) ---------- */

  function renderResults(results) {
    var grid = document.getElementById("resultsGrid");
    if (!grid) return;
    grid.innerHTML =
      '<div class="result-card result-card--won"><div class="result-card__icon result-card__icon--won">✓</div><span class="result-card__value result-card__value--won">' + results.won + '</span><span class="result-card__label">Won</span></div>' +
      '<div class="result-card result-card--lost"><div class="result-card__icon result-card__icon--lost">✕</div><span class="result-card__value result-card__value--lost">' + results.lost + '</span><span class="result-card__label">Lost</span></div>' +
      '<div class="result-card"><div class="result-card__icon result-card__icon--neutral">◎</div><span class="result-card__value">' + results.hitRate + '%</span><span class="result-card__label">Hit Rate</span></div>' +
      '<div class="result-card"><div class="result-card__icon result-card__icon--neutral">📈</div><span class="result-card__value">' + results.avgOdds.toFixed(2) + '</span><span class="result-card__label">Avg. Odds</span></div>';
  }

  function renderBookmakerSidebar(keys) {
    var list = document.getElementById("bookmakerList");
    if (!list) return;
    list.innerHTML = keys.map(function (key) {
      var url = AFFILIATE_LINKS[key] || "#";
      return (
        '<li class="bookmaker-item"><span class="bookmaker-item__logo bookmaker-item__logo--' + bookClass(key) + '">' + bookLabel(key) + '</span><a href="' + url + '" class="bookmaker-item__cta" data-affiliate="' + key + '">Get Code &amp; Bet →</a></li>'
      );
    }).join("");
  }

  function renderNews(items) {
    var list = document.getElementById("newsList");
    if (!list) return;
    list.innerHTML = items.map(function (n) {
      return (
        '<li class="news-item"><span class="news-item__icon">' + n.icon + '</span><span class="news-item__body"><span class="news-item__headline">' + n.headline + '</span><span class="news-item__date">' + n.date + '</span></span><span class="news-item__arrow">›</span></li>'
      );
    }).join("");
  }

  function applyBookmakerAffiliateLinks() {
    document.querySelectorAll("[data-affiliate]").forEach(function (el) {
      var key = el.getAttribute("data-affiliate");
      if (AFFILIATE_LINKS[key]) el.setAttribute("href", AFFILIATE_LINKS[key]);
    });
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function scrollAndHighlight(el) {
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    el.classList.add("search-highlight");
    window.setTimeout(function () { el.classList.remove("search-highlight"); }, 1600);
  }

  function runSearch(query) {
    var resultsBox = document.getElementById("searchResults");
    if (!resultsBox) return;
    query = query.trim().toLowerCase();
    if (!query) { resultsBox.innerHTML = ""; resultsBox.classList.remove("search-results--visible"); return; }

    var matchResults = SITE_DATA.predictions.filter(function (p) {
      return p.match.toLowerCase().indexOf(query) !== -1 || p.pick.toLowerCase().indexOf(query) !== -1;
    });

    var html = "";
    if (matchResults.length) {
      html += '<li class="search-results__group">Matches</li>';
      html += matchResults.map(function (p) {
        return '<li><button type="button" class="search-result-item" data-id="' + p.id + '">⚽ <span>' + escapeHTML(p.match) + '</span><span class="search-result-item__sub">' + escapeHTML(p.pick) + '</span></button></li>';
      }).join("");
    }
    if (!html) html = '<li class="search-results__empty">No results for "' + escapeHTML(query) + '"</li>';

    resultsBox.innerHTML = html;
    resultsBox.classList.add("search-results--visible");
    resultsBox.querySelectorAll(".search-result-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll('[data-id="' + btn.getAttribute("data-id") + '"]').forEach(function (el) {
          if (el.offsetParent !== null) scrollAndHighlight(el);
        });
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
    if (resultsBox) { resultsBox.innerHTML = ""; resultsBox.classList.remove("search-results--visible"); }
  }

  function initNav() {
    var searchToggle = document.getElementById("searchToggle");
    var navbarSearch = document.getElementById("navbarSearch");
    var searchInput = document.getElementById("searchInput");
    if (searchToggle && navbarSearch) {
      searchToggle.addEventListener("click", function () {
        var isOpen = navbarSearch.classList.toggle("navbar__search--open");
        searchToggle.setAttribute("aria-expanded", String(isOpen));
        if (isOpen && searchInput) searchInput.focus(); else closeSearch();
      });
    }
    if (searchInput) {
      searchInput.addEventListener("input", function () { runSearch(searchInput.value); });
      searchInput.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSearch(); });
    }
    document.addEventListener("click", function (e) {
      if (!navbarSearch) return;
      var inside = navbarSearch.contains(e.target) || (searchToggle && searchToggle.contains(e.target));
      if (!inside && navbarSearch.classList.contains("navbar__search--open")) closeSearch();
    });
  }

  function initBottomNav() {
    document.querySelectorAll(".bottom-nav__item").forEach(function (item) {
      item.addEventListener("click", function () {
        document.querySelectorAll(".bottom-nav__item").forEach(function (i) { i.classList.remove("bottom-nav__item--active"); });
        item.classList.add("bottom-nav__item--active");
      });
    });
  }

  /* =======================================================
     INITIALIZATION — synchronous, zero network wait
     ======================================================= */

  function init() {
    var overviewDate = document.getElementById("overviewDate");
    if (overviewDate) overviewDate.lastChild.textContent = " " + SITE_DATA.date;

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
    renderCorrectScore(SITE_DATA.correctScore);
    renderCodesOnly(SITE_DATA.codesOnly);
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
