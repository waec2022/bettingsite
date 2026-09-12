
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
    betway: "BETWAY_AFFILIATE_URL",
    "1xbet": "1XBET_AFFILIATE_URL"
  };

  var BOOKMAKER_META = {
    bet9ja: { label: "bet9ja", className: "bet9ja" },
    sportybet: { label: "SportyBet", className: "sportybet" },
    betpawa: { label: "betPawa", className: "betpawa" },
    betway: { label: "betway", className: "betway" },
    "1xbet": { label: "1xBet", className: "1xbet" }
  };
  // To add another bookmaker later: add one line here, one line above,
  // and (optionally) a .book-pill--yourkey / --bm-yourkey color in
  // styles.css. If you skip the CSS, it still renders with a plain
  // default pill style — nothing breaks.

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
    // Each prediction is fully independent, with its own bookmakers.
    // "bookmakers" is an object keyed by bookmaker id — each bookmaker
    // has ITS OWN odds and ITS OWN booking code. Add/remove a bookmaker
    // by adding/removing its key here; nothing else needs to change.
    // Nothing in this list is shared with accumulators or correct
    // scores below.
    // ===============================
    predictions: [
      { id: 1, match: "fulham vs Man City", pick: "Over 4.5 Goals", odds: 5.45, category: "Over/Under",
        bookmakers: {
          bet9ja: { odds: 5.45, code: "BJ-4821-AC" },
          sportybet: { odds: 5.40, code: "SP-4821-AC" }
        }
      },
      { id: 2, match: "lipzig vs Newcastle", pick: "Chelsea Win", odds: 1.72, category: "Match Winner",
        bookmakers: {
          betpawa: { odds: 1.72, code: "PW-9213-CN" },
          betway: { odds: 1.70, code: "BW-9213-CN" }
        }
      },
      { id: 3, match: "coma vs Sevilla", pick: "Over 2.5 Goals", odds: 1.68, category: "Over/Under",
        bookmakers: {
          sportybet: { odds: 1.68, code: "SP-3345-BS" },
          bet9ja: { odds: 1.65, code: "BJ-3345-BS" }
        }
      },
      { id: 4, match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 1.80, category: "BTTS",
        bookmakers: {
          betpawa: { odds: 1.80, code: "PW-7712-IA" },
          sportybet: { odds: 1.78, code: "SP-7712-IA" }
        }
      },
      { id: 5, match: "Liverpool vs Bournemouth", pick: "Liverpool Win", odds: 1.55, category: "Match Winner",
        bookmakers: {
          bet9ja: { odds: 1.55, code: "BJ-5561-LB" },
          betway: { odds: 1.53, code: "BW-5561-LB" }
        }
      },
      { id: 6, match: "PSG vs Marseille", pick: "Over 1.5 Goals", odds: 1.40, category: "Over/Under",
        bookmakers: {
          sportybet: { odds: 1.40, code: "SP-2290-PM" },
          betpawa: { odds: 1.38, code: "PW-2290-PM" }
        }
      },
      { id: 7, match: "Man United vs Burnley", pick: "Man United Win", odds: 1.65, category: "Double Chance",
        bookmakers: {
          betway: { odds: 1.65, code: "BW-8834-MB" },
          bet9ja: { odds: 1.62, code: "BJ-8834-MB" }
        }
      },
      { id: 8, match: "Juventus vs Lazio", pick: "BTTS - Yes", odds: 1.75, category: "BTTS",
        bookmakers: {
          betpawa: { odds: 1.75, code: "PW-6620-JL" },
          sportybet: { odds: 1.73, code: "SP-6620-JL" }
        }
      },
      { id: 9, match: "Real Madrid vs Espanyol", pick: "Over 2.5 Goals", odds: 1.60, category: "Over/Under",
        bookmakers: {
          bet9ja: { odds: 1.60, code: "BJ-1187-RE" },
          betway: { odds: 1.58, code: "BW-1187-RE" }
        }
      },
      { id: 10, match: "luton town vs Leverkusen", pick: "Bayern Win", odds: 1.48, category: "Double Chance",
        bookmakers: {
          sportybet: { odds: 1.48, code: "SP-4456-BL" },
          betpawa: { odds: 1.46, code: "PW-4456-BL" },
          "1xbet": { odds: 1.50, code: "XB-4456-BL" }
        }
      }
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
        key: "t01",
        title: "2 Odds",
        themeClass: "accumulator-card--3",
        selections: [
          { match: "fulham vs Man City", pick: "Over 1.5 Goals", odds: 1.31 },
          { match: "lipzig vs Newcastle", pick: "Over 3.5 Goals", odds: 1.53 }
        ],
        bookingCodes: [
          { bookmaker: "sportybet", code: "SP-ACC01-2" },
          { bookmaker: "betpawa", code: "PW-ACC01-2" }
        ]
      },
      {
        key: "t02",
        title: "4 Odds",
        themeClass: "accumulator-card--5",
        selections: [
          { match: "coma vs Sevilla", pick: "Over 3.5 Goals", odds: 1.46 },
          { match: "Inter Milan vs Atalanta", pick: "Home Win", odds: 1.72 },
          { match: "Liverpool vs Bournemouth", pick: "Draw No Bet - Home", odds: 1.59 }
        ],
        bookingCodes: [
          { bookmaker: "bet9ja", code: "BJ-ACC02-4" },
          { bookmaker: "betway", code: "BW-ACC02-4" }
        ]
      },
      {
        key: "t03",
        title: "5 Odds",
        themeClass: "accumulator-card--10",
        selections: [
          { match: "PSG vs Marseille", pick: "Away Win", odds: 1.59 },
          { match: "Man United vs Burnley", pick: "Double Chance 1X", odds: 1.81 },
          { match: "Juventus vs Lazio", pick: "Under 3.5 Goals", odds: 1.74 }
        ],
        bookingCodes: [
          { bookmaker: "sportybet", code: "SP-ACC03-5" },
          { bookmaker: "bet9ja", code: "BJ-ACC03-5" }
        ]
      },
      {
        key: "t04",
        title: "10 Odds",
        themeClass: "accumulator-card--20",
        selections: [
          { match: "Real Madrid vs Espanyol", pick: "Double Chance X2", odds: 1.54 },
          { match: "luton town vs Leverkusen", pick: "Over 1.5 Goals", odds: 2.7 },
          { match: "Napoli vs AC Milan", pick: "Over 3.5 Goals", odds: 1.59 },
          { match: "Everton vs Wolves", pick: "Home Win", odds: 1.51 }
        ],
        bookingCodes: [
          { bookmaker: "betpawa", code: "PW-ACC04-10" },
          { bookmaker: "betway", code: "BW-ACC04-10" }
        ]
      },
      {
        key: "t05",
        title: "20 Odds",
        themeClass: "accumulator-card--3",
        selections: [
          { match: "Villarreal vs Betis", pick: "Over 3.5 Goals", odds: 1.98 },
          { match: "Ajax vs Feyenoord", pick: "Home Win", odds: 1.85 },
          { match: "Porto vs Benfica", pick: "Draw No Bet - Home", odds: 1.72 },
          { match: "Celtic vs Rangers", pick: "Double Chance X2", odds: 1.86 },
          { match: "Monaco vs Lyon", pick: "Over 1.5 Goals", odds: 1.71 }
        ],
        bookingCodes: [
          { bookmaker: "sportybet", code: "SP-ACC05-20" },
          { bookmaker: "betpawa", code: "PW-ACC05-20" }
        ]
      },
      {
        key: "t06",
        title: "30 Odds",
        themeClass: "accumulator-card--5",
        selections: [
          { match: "Sevilla vs Villarreal", pick: "Double Chance 1X", odds: 2.17 },
          { match: "Bayern vs Leipzig", pick: "Under 3.5 Goals", odds: 1.69 },
          { match: "Arsenal vs Spurs", pick: "Over 2.5 Goals", odds: 2.52 },
          { match: "Aston Villa vs Brighton", pick: "BTTS - Yes", odds: 1.8 },
          { match: "West Ham vs Crystal Palace", pick: "Away Win", odds: 1.8 }
        ],
        bookingCodes: [
          { bookmaker: "bet9ja", code: "BJ-ACC06-30" },
          { bookmaker: "betway", code: "BW-ACC06-30" }
        ]
      },
      {
        key: "t07",
        title: "50 Odds",
        themeClass: "accumulator-card--10",
        selections: [
          { match: "Roma vs Fiorentina", pick: "Over 3.5 Goals", odds: 1.87 },
          { match: "Valencia vs Real Sociedad", pick: "Home Win", odds: 1.9 },
          { match: "Wolfsburg vs Freiburg", pick: "Draw No Bet - Home", odds: 1.78 },
          { match: "Brentford vs Fulham", pick: "Double Chance X2", odds: 2.0 },
          { match: "Getafe vs Osasuna", pick: "Over 1.5 Goals", odds: 2.02 },
          { match: "Torino vs Bologna", pick: "Over 3.5 Goals", odds: 1.96 }
        ],
        bookingCodes: [
          { bookmaker: "sportybet", code: "SP-ACC07-50" },
          { bookmaker: "bet9ja", code: "BJ-ACC07-50" }
        ]
      },
      {
        key: "t08",
        title: "75 Odds",
        themeClass: "accumulator-card--20",
        selections: [
          { match: "Nice vs Rennes", pick: "Double Chance X2", odds: 1.84 },
          { match: "Genk vs Anderlecht", pick: "Over 1.5 Goals", odds: 1.73 },
          { match: "fulham vs Man City", pick: "Over 3.5 Goals", odds: 1.87 },
          { match: "lipzig vs Newcastle", pick: "Home Win", odds: 2.9 },
          { match: "coma vs Sevilla", pick: "Draw No Bet - Home", odds: 2.12 },
          { match: "Inter Milan vs Atalanta", pick: "Double Chance X2", odds: 2.05 }
        ],
        bookingCodes: [
          { bookmaker: "betpawa", code: "PW-ACC08-75" },
          { bookmaker: "betway", code: "BW-ACC08-75" }
        ]
      },
      {
        key: "t09",
        title: "100 Odds",
        themeClass: "accumulator-card--3",
        selections: [
          { match: "Liverpool vs Bournemouth", pick: "Home Win", odds: 1.78 },
          { match: "PSG vs Marseille", pick: "Draw No Bet - Home", odds: 1.94 },
          { match: "Man United vs Burnley", pick: "Double Chance X2", odds: 1.68 },
          { match: "Juventus vs Lazio", pick: "Over 1.5 Goals", odds: 2.02 },
          { match: "Real Madrid vs Espanyol", pick: "Over 3.5 Goals", odds: 1.83 },
          { match: "luton town vs Leverkusen", pick: "Home Win", odds: 2.39 },
          { match: "Napoli vs AC Milan", pick: "Draw No Bet - Home", odds: 1.95 }
        ],
        bookingCodes: [
          { bookmaker: "sportybet", code: "SP-ACC09-100" },
          { bookmaker: "betpawa", code: "PW-ACC09-100" }
        ]
      },
      {
        key: "t10",
        title: "150 Odds",
        themeClass: "accumulator-card--5",
        selections: [
          { match: "Everton vs Wolves", pick: "Over 2.5 Goals", odds: 2.08 },
          { match: "Villarreal vs Betis", pick: "BTTS - Yes", odds: 2.29 },
          { match: "Ajax vs Feyenoord", pick: "Away Win", odds: 2.03 },
          { match: "Porto vs Benfica", pick: "Double Chance 1X", odds: 2.11 },
          { match: "Celtic vs Rangers", pick: "Under 3.5 Goals", odds: 1.93 },
          { match: "Monaco vs Lyon", pick: "Over 2.5 Goals", odds: 1.8 },
          { match: "Sevilla vs Villarreal", pick: "BTTS - Yes", odds: 2.12 }
        ],
        bookingCodes: [
          { bookmaker: "bet9ja", code: "BJ-ACC10-150" },
          { bookmaker: "betway", code: "BW-ACC10-150" }
        ]
      },
      {
        key: "t11",
        title: "200 Odds",
        themeClass: "accumulator-card--10",
        selections: [
          { match: "Bayern vs Leipzig", pick: "Double Chance X2", odds: 1.73 },
          { match: "Arsenal vs Spurs", pick: "Over 1.5 Goals", odds: 2.04 },
          { match: "Aston Villa vs Brighton", pick: "Over 3.5 Goals", odds: 1.93 },
          { match: "West Ham vs Crystal Palace", pick: "Home Win", odds: 1.76 },
          { match: "Roma vs Fiorentina", pick: "Draw No Bet - Home", odds: 1.8 },
          { match: "Valencia vs Real Sociedad", pick: "Double Chance X2", odds: 2.07 },
          { match: "Wolfsburg vs Freiburg", pick: "Over 1.5 Goals", odds: 1.71 },
          { match: "Brentford vs Fulham", pick: "Over 3.5 Goals", odds: 2.62 }
        ],
        bookingCodes: [
          { bookmaker: "sportybet", code: "SP-ACC11-200" },
          { bookmaker: "bet9ja", code: "BJ-ACC11-200" }
        ]
      },
      {
        key: "t12",
        title: "300 Odds",
        themeClass: "accumulator-card--20",
        selections: [
          { match: "Getafe vs Osasuna", pick: "Draw No Bet - Home", odds: 1.78 },
          { match: "Torino vs Bologna", pick: "Double Chance X2", odds: 1.92 },
          { match: "Nice vs Rennes", pick: "Over 1.5 Goals", odds: 2.05 },
          { match: "Genk vs Anderlecht", pick: "Over 3.5 Goals", odds: 2.3 },
          { match: "fulham vs Man City", pick: "Home Win", odds: 1.96 },
          { match: "lipzig vs Newcastle", pick: "Draw No Bet - Home", odds: 2.21 },
          { match: "coma vs Sevilla", pick: "Double Chance X2", odds: 2.0 },
          { match: "Inter Milan vs Atalanta", pick: "Over 1.5 Goals", odds: 2.15 }
        ],
        bookingCodes: [
          { bookmaker: "betpawa", code: "PW-ACC12-300" },
          { bookmaker: "betway", code: "BW-ACC12-300" }
        ]
      },
      {
        key: "t13",
        title: "500 Odds",
        themeClass: "accumulator-card--3",
        selections: [
          { match: "Liverpool vs Bournemouth", pick: "Home Win", odds: 1.98 },
          { match: "PSG vs Marseille", pick: "Draw No Bet - Home", odds: 2.11 },
          { match: "Man United vs Burnley", pick: "Double Chance X2", odds: 1.71 },
          { match: "Juventus vs Lazio", pick: "Over 1.5 Goals", odds: 2.06 },
          { match: "Real Madrid vs Espanyol", pick: "Over 3.5 Goals", odds: 2.06 },
          { match: "luton town vs Leverkusen", pick: "Home Win", odds: 2.03 },
          { match: "Napoli vs AC Milan", pick: "Draw No Bet - Home", odds: 2.27 },
          { match: "Everton vs Wolves", pick: "Double Chance X2", odds: 1.85 },
          { match: "Villarreal vs Betis", pick: "Over 1.5 Goals", odds: 1.93 }
        ],
        bookingCodes: [
          { bookmaker: "sportybet", code: "SP-ACC13-500" },
          { bookmaker: "betpawa", code: "PW-ACC13-500" }
        ]
      },
      {
        key: "t14",
        title: "700 Odds",
        themeClass: "accumulator-card--5",
        selections: [
          { match: "Ajax vs Feyenoord", pick: "BTTS - Yes", odds: 1.86 },
          { match: "Porto vs Benfica", pick: "Away Win", odds: 1.97 },
          { match: "Celtic vs Rangers", pick: "Double Chance 1X", odds: 2.26 },
          { match: "Monaco vs Lyon", pick: "Under 3.5 Goals", odds: 1.89 },
          { match: "Sevilla vs Villarreal", pick: "Over 2.5 Goals", odds: 2.1 },
          { match: "Bayern vs Leipzig", pick: "BTTS - Yes", odds: 2.23 },
          { match: "Arsenal vs Spurs", pick: "Away Win", odds: 1.8 },
          { match: "Aston Villa vs Brighton", pick: "Double Chance 1X", odds: 2.23 },
          { match: "West Ham vs Crystal Palace", pick: "Under 3.5 Goals", odds: 2.38 }
        ],
        bookingCodes: [
          { bookmaker: "bet9ja", code: "BJ-ACC14-700" },
          { bookmaker: "betway", code: "BW-ACC14-700" }
        ]
      },
      {
        key: "t15",
        title: "1000 Odds",
        themeClass: "accumulator-card--10",
        selections: [
          { match: "Roma vs Fiorentina", pick: "Over 3.5 Goals", odds: 1.99 },
          { match: "Valencia vs Real Sociedad", pick: "Home Win", odds: 2.45 },
          { match: "Wolfsburg vs Freiburg", pick: "Draw No Bet - Home", odds: 2.18 },
          { match: "Brentford vs Fulham", pick: "Double Chance X2", odds: 1.84 },
          { match: "Getafe vs Osasuna", pick: "Over 1.5 Goals", odds: 2.29 },
          { match: "Torino vs Bologna", pick: "Over 3.5 Goals", odds: 1.84 },
          { match: "Nice vs Rennes", pick: "Home Win", odds: 1.75 },
          { match: "Genk vs Anderlecht", pick: "Draw No Bet - Home", odds: 1.92 },
          { match: "fulham vs Man City", pick: "Double Chance X2", odds: 1.77 },
          { match: "lipzig vs Newcastle", pick: "Over 1.5 Goals", odds: 2.04 }
        ],
        bookingCodes: [
          { bookmaker: "sportybet", code: "SP-ACC15-1000" },
          { bookmaker: "bet9ja", code: "BJ-ACC15-1000" }
        ]
      },
      {
        key: "t16",
        title: "1500 Odds",
        themeClass: "accumulator-card--20",
        selections: [
          { match: "coma vs Sevilla", pick: "Over 3.5 Goals", odds: 2.2 },
          { match: "Inter Milan vs Atalanta", pick: "Home Win", odds: 1.14 },
          { match: "Liverpool vs Bournemouth", pick: "Draw No Bet - Home", odds: 2.23 },
          { match: "PSG vs Marseille", pick: "Double Chance X2", odds: 2.04 },
          { match: "Man United vs Burnley", pick: "Over 1.5 Goals", odds: 2.25 },
          { match: "Juventus vs Lazio", pick: "Over 3.5 Goals", odds: 2.38 },
          { match: "Real Madrid vs Espanyol", pick: "Home Win", odds: 2.34 },
          { match: "luton town vs Leverkusen", pick: "Draw No Bet - Home", odds: 2.21 },
          { match: "Napoli vs AC Milan", pick: "Double Chance X2", odds: 2.36 },
          { match: "Everton vs Wolves", pick: "Over 1.5 Goals", odds: 2.02 }
        ],
        bookingCodes: [
          { bookmaker: "betpawa", code: "PW-ACC16-1500" },
          { bookmaker: "betway", code: "BW-ACC16-1500" }
        ]
      },
      {
        key: "t17",
        title: "2000 Odds",
        themeClass: "accumulator-card--3",
        selections: [
          { match: "Villarreal vs Betis", pick: "Over 3.5 Goals", odds: 1.84 },
          { match: "Ajax vs Feyenoord", pick: "Home Win", odds: 2.09 },
          { match: "Porto vs Benfica", pick: "Draw No Bet - Home", odds: 2.15 },
          { match: "Celtic vs Rangers", pick: "Double Chance X2", odds: 1.8 },
          { match: "Monaco vs Lyon", pick: "Over 1.5 Goals", odds: 1.82 },
          { match: "Sevilla vs Villarreal", pick: "Over 3.5 Goals", odds: 2.17 },
          { match: "Bayern vs Leipzig", pick: "Home Win", odds: 2.0 },
          { match: "Arsenal vs Spurs", pick: "Draw No Bet - Home", odds: 1.84 },
          { match: "Aston Villa vs Brighton", pick: "Double Chance X2", odds: 2.11 },
          { match: "West Ham vs Crystal Palace", pick: "Over 1.5 Goals", odds: 2.22 },
          { match: "Roma vs Fiorentina", pick: "Over 3.5 Goals", odds: 1.97 }
        ],
        bookingCodes: [
          { bookmaker: "sportybet", code: "SP-ACC17-2000" },
          { bookmaker: "betpawa", code: "PW-ACC17-2000" }
        ]
      },
      {
        key: "t18",
        title: "3000 Odds",
        themeClass: "accumulator-card--5",
        selections: [
          { match: "Valencia vs Real Sociedad", pick: "BTTS - Yes", odds: 2.15 },
          { match: "Wolfsburg vs Freiburg", pick: "Away Win", odds: 2.29 },
          { match: "Brentford vs Fulham", pick: "Double Chance 1X", odds: 2.3 },
          { match: "Getafe vs Osasuna", pick: "Under 3.5 Goals", odds: 2.29 },
          { match: "Torino vs Bologna", pick: "Over 2.5 Goals", odds: 1.1 },
          { match: "Nice vs Rennes", pick: "BTTS - Yes", odds: 1.94 },
          { match: "Genk vs Anderlecht", pick: "Away Win", odds: 1.93 },
          { match: "fulham vs Man City", pick: "Double Chance 1X", odds: 2.34 },
          { match: "lipzig vs Newcastle", pick: "Under 3.5 Goals", odds: 2.38 },
          { match: "coma vs Sevilla", pick: "Over 2.5 Goals", odds: 2.42 },
          { match: "Inter Milan vs Atalanta", pick: "BTTS - Yes", odds: 2.11 }
        ],
        bookingCodes: [
          { bookmaker: "bet9ja", code: "BJ-ACC18-3000" },
          { bookmaker: "betway", code: "BW-ACC18-3000" }
        ]
      },
      {
        key: "t19",
        title: "5000 Odds",
        themeClass: "accumulator-card--10",
        selections: [
          { match: "Liverpool vs Bournemouth", pick: "Home Win", odds: 2.35 },
          { match: "PSG vs Marseille", pick: "Draw No Bet - Home", odds: 2.41 },
          { match: "Man United vs Burnley", pick: "Double Chance X2", odds: 1.96 },
          { match: "Juventus vs Lazio", pick: "Over 1.5 Goals", odds: 1.96 },
          { match: "Real Madrid vs Espanyol", pick: "Over 3.5 Goals", odds: 2.18 },
          { match: "luton town vs Leverkusen", pick: "Home Win", odds: 1.1 },
          { match: "Napoli vs AC Milan", pick: "Draw No Bet - Home", odds: 2.42 },
          { match: "Everton vs Wolves", pick: "Double Chance X2", odds: 1.91 },
          { match: "Villarreal vs Betis", pick: "Over 1.5 Goals", odds: 2.22 },
          { match: "Ajax vs Feyenoord", pick: "Over 3.5 Goals", odds: 2.29 },
          { match: "Porto vs Benfica", pick: "Home Win", odds: 1.95 },
          { match: "Celtic vs Rangers", pick: "Draw No Bet - Home", odds: 2.38 }
        ],
        bookingCodes: [
          { bookmaker: "sportybet", code: "SP-ACC19-5000" },
          { bookmaker: "bet9ja", code: "BJ-ACC19-5000" }
        ]
      },
      {
        key: "t20",
        title: "10000+ Odds",
        themeClass: "accumulator-card--20",
        selections: [
          { match: "Monaco vs Lyon", pick: "Draw No Bet - Home", odds: 2.11 },
          { match: "Sevilla vs Villarreal", pick: "Double Chance X2", odds: 2.45 },
          { match: "Bayern vs Leipzig", pick: "Over 1.5 Goals", odds: 2.6 },
          { match: "Arsenal vs Spurs", pick: "Over 3.5 Goals", odds: 2.09 },
          { match: "Aston Villa vs Brighton", pick: "Home Win", odds: 2.22 },
          { match: "West Ham vs Crystal Palace", pick: "Draw No Bet - Home", odds: 2.2 },
          { match: "Roma vs Fiorentina", pick: "Double Chance X2", odds: 2.29 },
          { match: "Valencia vs Real Sociedad", pick: "Over 1.5 Goals", odds: 1.1 },
          { match: "Wolfsburg vs Freiburg", pick: "Over 3.5 Goals", odds: 2.57 },
          { match: "Brentford vs Fulham", pick: "Home Win", odds: 2.59 },
          { match: "Getafe vs Osasuna", pick: "Draw No Bet - Home", odds: 2.4 },
          { match: "Torino vs Bologna", pick: "Double Chance X2", odds: 2.58 },
          { match: "Nice vs Rennes", pick: "Over 1.5 Goals", odds: 2.01 }
        ],
        bookingCodes: [
          { bookmaker: "betpawa", code: "PW-ACC20-10000" },
          { bookmaker: "betway", code: "BW-ACC20-10000" }
        ]
      }
    ],

    // ===============================
    // CORRECT SCORE — EDIT HERE
    // Independent section, same shape as predictions above (a
    // bookmakers object with its own odds + code per bookmaker),
    // but with a "score" instead of a "pick".
    // ===============================
    correctScores: [
      { id: 1, match: "Arsenal vs Chelsea", score: "2-1", odds: 8.50,
        bookmakers: {
          sportybet: { odds: 8.50, code: "CS-2201-AC" },
          bet9ja: { odds: 8.40, code: "CS-2201-BJ" },
          betpawa: { odds: 8.30, code: "CS-2201-PW" }
        }
      },
      { id: 2, match: "Bayern vs Dortmund", score: "3-1", odds: 11.00,
        bookmakers: {
          bet9ja: { odds: 11.00, code: "CS-3101-BD" },
          sportybet: { odds: 10.80, code: "CS-3101-SP" }
        }
      },
      { id: 3, match: "Man City vs Fulham", score: "4-0", odds: 15.00,
        bookmakers: {
          betpawa: { odds: 15.00, code: "CS-4001-MF" },
          betway: { odds: 14.50, code: "CS-4001-BW" }
        }
      },
      { id: 4, match: "PSG vs Marseille", score: "2-0", odds: 7.25,
        bookmakers: {
          sportybet: { odds: 7.25, code: "CS-2001-PM" },
          betway: { odds: 7.10, code: "CS-2001-BW" }
        }
      },
      { id: 5, match: "Real Madrid vs Espanyol", score: "3-0", odds: 9.50,
        bookmakers: {
          bet9ja: { odds: 9.50, code: "CS-3002-RE" },
          "1xbet": { odds: 9.70, code: "CS-3002-XB" }
        }
      }
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

    bookmakers: ["bet9ja", "sportybet", "betpawa", "betway", "1xbet"],

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
    var label = meta ? meta.label : key;
    var className = meta ? meta.className : "default";
    return '<span class="book-pill book-pill--' + className + '">' + label + "</span>";
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
            '<td class="col-books"><span class="books-cell">' + Object.keys(p.bookmakers).map(bookPill).join("") + "</span></td>" +
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
              '<span class="pick-card__books">' + Object.keys(p.bookmakers).map(bookPill).join("") + "</span>" +
              revealButtonHTML(p) +
            "</div>" +
          "</div>"
        );
      })
      .join("");

    attachRevealHandlers(wrap);
  }

  function revealButtonHTML(entry) {
    var codes = Object.keys(entry.bookmakers).map(function (key) {
      return { bookmaker: key, code: entry.bookmakers[key].code };
    });
    var codesAttr = escapeHTML(JSON.stringify(codes));
    return (
      '<button type="button" class="reveal-btn" data-codes="' + codesAttr + '">' +
        '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>' +
        '<span class="reveal-btn__label">Reveal Code</span>' +
      "</button>"
    );
  }

  function attachRevealHandlers(container) {
    var buttons = container.querySelectorAll(".reveal-btn");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        requestCodeReveal(btn, btn.getAttribute("data-codes"));
      });
    });
  }

  function requestCodeReveal(button, codesJSON) {
    if (window.NBT_AD_PROVIDER && typeof window.NBT_AD_PROVIDER.show === "function") {
      window.NBT_AD_PROVIDER.show(function onAdComplete(success) {
        if (success) revealCode(button, codesJSON);
      });
      return;
    }
    revealCode(button, codesJSON);
  }

  function revealCode(button, codesJSON) {
    var codes;
    try {
      codes = JSON.parse(codesJSON);
    } catch (e) {
      codes = [];
    }

    var linesHTML = codes
      .map(function (c) {
        var meta = BOOKMAKER_META[c.bookmaker];
        var label = meta ? meta.label : c.bookmaker;
        return (
          '<span class="reveal-btn__code-line">' +
            '<strong>' + escapeHTML(label) + ":</strong> " + escapeHTML(c.code) +
          "</span>"
        );
      })
      .join("");

    button.classList.add("reveal-btn--revealed");
    if (codes.length > 1) button.classList.add("reveal-btn--multi");
    button.innerHTML =
      '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>' +
      '<span class="reveal-btn__code">' + linesHTML + "</span>";
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
            '<td class="col-books"><span class="books-cell">' + Object.keys(cs.bookmakers).map(bookPill).join("") + "</span></td>" +
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
              '<span class="pick-card__books">' + Object.keys(cs.bookmakers).map(bookPill).join("") + "</span>" +
              revealButtonHTML(cs) +
            "</div>" +
          "</div>"
        );
      })
      .join("");

    attachRevealHandlers(wrap);
  }

  /* =======================================================
     3d. LIGHTWEIGHT AUTO-UPDATE CHECK
     GitHub Pages is a static host, so there is no way to push
     changes to an already-open tab instantly without a backend.
     This is the lightest practical alternative: every 45s, fetch
     script.js fresh (cache bypassed) and compare it to the copy
     that is currently running. If they differ — meaning you just
     committed a change on GitHub — reload the page once so the
     visitor gets the new predictions without a manual hard refresh.
     No large downloads, no library, no effect on ads/interactions.
     ======================================================= */

  function initAutoUpdateCheck() {
    var POLL_INTERVAL_MS = 45000; // 45s — light and infrequent
    var baselineText = null;
    var checking = false;

    function poll() {
      if (checking) return;
      checking = true;
      fetch("script.js?check=" + Date.now(), { cache: "no-store" })
        .then(function (res) {
          return res.ok ? res.text() : null;
        })
        .then(function (text) {
          checking = false;
          if (text === null) return;
          if (baselineText === null) {
            baselineText = text; // first check just records the current version
            return;
          }
          if (text !== baselineText) {
            window.location.reload();
          }
        })
        .catch(function () {
          checking = false; // network hiccup — just try again next interval
        });
    }

    window.setInterval(poll, POLL_INTERVAL_MS);
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
    initAutoUpdateCheck();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
