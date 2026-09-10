(function () {
  "use strict";

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

  var SITE_DATA = {
    date: "Sep 9, 2026",
    resultsDate: "Sep 8, 2026",
    overview: { totalSelections: 20, winnersYesterday: 12, losersYesterday: 8, hitRateYesterday: 60.0 },
    yesterdayResults: { won: 12, lost: 8, hitRate: 60.0, avgOdds: 2.45 },
    categories: [
      { key: "All", label: "All", count: 20 },
      { key: "Over/Under", label: "Over/Under", count: 5 },
      { key: "BTTS", label: "BTTS", count: 4 },
      { key: "Match Winner", label: "Match Winner", count: 7 },
      { key: "Double Chance", label: "Double Chance", count: 2 },
      { key: "Other", label: "Other", count: 2 }
    ],
    predictions: [
      { id: 1, match: "Man Utd vs Man City", pick: "Over 4.5 Goals", category: "Over/Under", bookmakers: [{ name: "bet9ja", odds: 1.85, code: "9J-MU185" },{ name: "sportybet", odds: 1.85, code: "SB-MU185" },{ name: "betpawa", odds: 1.84, code: "BP-MU184" },{ name: "betway", odds: 1.82, code: "BW-MU182" },{ name: "football.com", odds: 1.83, code: "FC-MU183" },{ name: "1xbet", odds: 1.86, code: "1X-MU186" }] },
      { id: 2, match: "Chelsea vs Newcastle", pick: "Chelsea Win", category: "Match Winner", bookmakers: [{ name: "bet9ja", odds: 1.72, code: "9J-CHL172" },{ name: "sportybet", odds: 1.72, code: "SB-CHL172" },{ name: "betpawa", odds: 1.71, code: "BP-CHL171" },{ name: "betway", odds: 1.69, code: "BW-CHL169" },{ name: "football.com", odds: 1.70, code: "FC-CHL170" },{ name: "1xbet", odds: 1.73, code: "1X-CHL173" }] },
      { id: 3, match: "Liverpool vs Bournemouth", pick: "Liverpool Win", category: "Match Winner", bookmakers: [{ name: "bet9ja", odds: 1.55, code: "9J-LIV155" },{ name: "sportybet", odds: 1.55, code: "SB-LIV155" },{ name: "betpawa", odds: 1.54, code: "BP-LIV154" },{ name: "betway", odds: 1.52, code: "BW-LIV152" },{ name: "football.com", odds: 1.53, code: "FC-LIV153" },{ name: "1xbet", odds: 1.56, code: "1X-LIV156" }] },
      { id: 4, match: "Arsenal vs Fulham", pick: "Both Teams To Score", category: "BTTS", bookmakers: [{ name: "bet9ja", odds: 1.80, code: "9J-ARS180" },{ name: "sportybet", odds: 1.80, code: "SB-ARS180" },{ name: "betpawa", odds: 1.79, code: "BP-ARS179" },{ name: "betway", odds: 1.77, code: "BW-ARS177" },{ name: "football.com", odds: 1.78, code: "FC-ARS178" },{ name: "1xbet", odds: 1.81, code: "1X-ARS181" }] },
      { id: 5, match: "Barcelona vs Real Madrid", pick: "Over 2.5 Goals", category: "Over/Under", bookmakers: [{ name: "bet9ja", odds: 1.65, code: "9J-BAR165" },{ name: "sportybet", odds: 1.65, code: "SB-BAR165" },{ name: "betpawa", odds: 1.64, code: "BP-BAR164" },{ name: "betway", odds: 1.62, code: "BW-BAR162" },{ name: "football.com", odds: 1.63, code: "FC-BAR163" },{ name: "1xbet", odds: 1.66, code: "1X-BAR166" }] },
      { id: 6, match: "Bayern vs Dortmund", pick: "Bayern Win", category: "Match Winner", bookmakers: [{ name: "bet9ja", odds: 1.50, code: "9J-BAY150" },{ name: "sportybet", odds: 1.50, code: "SB-BAY150" },{ name: "betpawa", odds: 1.49, code: "BP-BAY149" },{ name: "betway", odds: 1.47, code: "BW-BAY147" },{ name: "football.com", odds: 1.48, code: "FC-BAY148" },{ name: "1xbet", odds: 1.51, code: "1X-BAY151" }] },
      { id: 7, match: "PSG vs Marseille", pick: "Double Chance: PSG or Draw", category: "Double Chance", bookmakers: [{ name: "bet9ja", odds: 1.25, code: "9J-PSG125" },{ name: "sportybet", odds: 1.25, code: "SB-PSG125" },{ name: "betpawa", odds: 1.24, code: "BP-PSG124" },{ name: "betway", odds: 1.22, code: "BW-PSG122" },{ name: "football.com", odds: 1.23, code: "FC-PSG123" },{ name: "1xbet", odds: 1.26, code: "1X-PSG126" }] },
      { id: 8, match: "Inter vs AC Milan", pick: "Under 3.5 Goals", category: "Over/Under", bookmakers: [{ name: "bet9ja", odds: 1.90, code: "9J-INT190" },{ name: "sportybet", odds: 1.90, code: "SB-INT190" },{ name: "betpawa", odds: 1.89, code: "BP-INT189" },{ name: "betway", odds: 1.87, code: "BW-INT187" },{ name: "football.com", odds: 1.88, code: "FC-INT188" },{ name: "1xbet", odds: 1.91, code: "1X-INT191" }] },
      { id: 9, match: "Juventus vs Napoli", pick: "Both Teams To Score", category: "BTTS", bookmakers: [{ name: "bet9ja", odds: 1.75, code: "9J-JUV175" },{ name: "sportybet", odds: 1.75, code: "SB-JUV175" },{ name: "betpawa", odds: 1.74, code: "BP-JUV174" },{ name: "betway", odds: 1.72, code: "BW-JUV172" },{ name: "football.com", odds: 1.73, code: "FC-JUV173" },{ name: "1xbet", odds: 1.76, code: "1X-JUV176" }] },
      { id: 10, match: "Atletico vs Sevilla", pick: "Other: Over 9.5 Corners", category: "Other", bookmakers: [{ name: "bet9ja", odds: 2.10, code: "9J-ATL210" },{ name: "sportybet", odds: 2.10, code: "SB-ATL210" },{ name: "betpawa", odds: 2.09, code: "BP-ATL209" },{ name: "betway", odds: 2.07, code: "BW-ATL207" },{ name: "football.com", odds: 2.08, code: "FC-ATL208" },{ name: "1xbet", odds: 2.11, code: "1X-ATL211" }] },
      { id: 11, match: "Real Sociedad vs Valencia", pick: "Real Sociedad Win", category: "Match Winner", bookmakers: [{ name: "bet9ja", odds: 1.68, code: "9J-RS168" },{ name: "sportybet", odds: 1.68, code: "SB-RS168" },{ name: "betpawa", odds: 1.67, code: "BP-RS167" },{ name: "betway", odds: 1.65, code: "BW-RS165" },{ name: "football.com", odds: 1.66, code: "FC-RS166" },{ name: "1xbet", odds: 1.69, code: "1X-RS169" }] },
      { id: 12, match: "Tottenham vs West Ham", pick: "Over 3.5 Goals", category: "Over/Under", bookmakers: [{ name: "bet9ja", odds: 2.05, code: "9J-TOT205" },{ name: "sportybet", odds: 2.05, code: "SB-TOT205" },{ name: "betpawa", odds: 2.04, code: "BP-TOT204" },{ name: "betway", odds: 2.02, code: "BW-TOT202" },{ name: "football.com", odds: 2.03, code: "FC-TOT203" },{ name: "1xbet", odds: 2.06, code: "1X-TOT206" }] },
      { id: 13, match: "Leicester vs Brighton", pick: "Both Teams To Score", category: "BTTS", bookmakers: [{ name: "bet9ja", odds: 1.70, code: "9J-LEI170" },{ name: "sportybet", odds: 1.70, code: "SB-LEI170" },{ name: "betpawa", odds: 1.69, code: "BP-LEI169" },{ name: "betway", odds: 1.67, code: "BW-LEI167" },{ name: "football.com", odds: 1.68, code: "FC-LEI168" },{ name: "1xbet", odds: 1.71, code: "1X-LEI171" }] },
      { id: 14, match: "Aston Villa vs Brentford", pick: "Aston Villa Win", category: "Match Winner", bookmakers: [{ name: "bet9ja", odds: 1.60, code: "9J-AV160" },{ name: "sportybet", odds: 1.60, code: "SB-AV160" },{ name: "betpawa", odds: 1.59, code: "BP-AV159" },{ name: "betway", odds: 1.57, code: "BW-AV157" },{ name: "football.com", odds: 1.58, code: "FC-AV158" },{ name: "1xbet", odds: 1.61, code: "1X-AV161" }] },
      { id: 15, match: "Everton vs Wolves", pick: "Double Chance: Draw or Wolves", category: "Double Chance", bookmakers: [{ name: "bet9ja", odds: 1.40, code: "9J-EVE140" },{ name: "sportybet", odds: 1.40, code: "SB-EVE140" },{ name: "betpawa", odds: 1.39, code: "BP-EVE139" },{ name: "betway", odds: 1.37, code: "BW-EVE137" },{ name: "football.com", odds: 1.38, code: "FC-EVE138" },{ name: "1xbet", odds: 1.41, code: "1X-EVE141" }] },
      { id: 16, match: "Palace vs Forest", pick: "Other: Over 10.5 Corners", category: "Other", bookmakers: [{ name: "bet9ja", odds: 1.95, code: "9J-CRY195" },{ name: "sportybet", odds: 1.95, code: "SB-CRY195" },{ name: "betpawa", odds: 1.94, code: "BP-CRY194" },{ name: "betway", odds: 1.92, code: "BW-CRY192" },{ name: "football.com", odds: 1.93, code: "FC-CRY193" },{ name: "1xbet", odds: 1.96, code: "1X-CRY196" }] },
      { id: 17, match: "Leeds vs Southampton", pick: "Leeds Win", category: "Match Winner", bookmakers: [{ name: "bet9ja", odds: 1.75, code: "9J-LEE175" },{ name: "sportybet", odds: 1.75, code: "SB-LEE175" },{ name: "betpawa", odds: 1.74, code: "BP-LEE174" },{ name: "betway", odds: 1.72, code: "BW-LEE172" },{ name: "football.com", odds: 1.73, code: "FC-LEE173" },{ name: "1xbet", odds: 1.76, code: "1X-LEE176" }] },
      { id: 18, match: "Burnley vs Luton", pick: "Over 2.5 Goals", category: "Over/Under", bookmakers: [{ name: "bet9ja", odds: 1.88, code: "9J-BUR188" },{ name: "sportybet", odds: 1.88, code: "SB-BUR188" },{ name: "betpawa", odds: 1.87, code: "BP-BUR187" },{ name: "betway", odds: 1.85, code: "BW-BUR185" },{ name: "football.com", odds: 1.86, code: "FC-BUR186" },{ name: "1xbet", odds: 1.89, code: "1X-BUR189" }] },
      { id: 19, match: "Sheffield vs Fulham", pick: "Both Teams To Score", category: "BTTS", bookmakers: [{ name: "bet9ja", odds: 1.65, code: "9J-SHU165" },{ name: "sportybet", odds: 1.65, code: "SB-SHU165" },{ name: "betpawa", odds: 1.64, code: "BP-SHU164" },{ name: "betway", odds: 1.62, code: "BW-SHU162" },{ name: "football.com", odds: 1.63, code: "FC-SHU163" },{ name: "1xbet", odds: 1.66, code: "1X-SHU166" }] },
      { id: 20, match: "Bournemouth vs Luton", pick: "Bournemouth Win", category: "Match Winner", bookmakers: [{ name: "bet9ja", odds: 1.55, code: "9J-BOU155" },{ name: "sportybet", odds: 1.55, code: "SB-BOU155" },{ name: "betpawa", odds: 1.54, code: "BP-BOU154" },{ name: "betway", odds: 1.52, code: "BW-BOU152" },{ name: "football.com", odds: 1.53, code: "FC-BOU153" },{ name: "1xbet", odds: 1.56, code: "1X-BOU156" }] }
    ],
    bookmakers: ["bet9ja", "sportybet", "betpawa", "betway", "football.com", "1xbet"],
    news: [
      { icon: "🔥", headline: "Bet9ja 170% Multiple Bonus - How to qualify", date: "Sep 9, 2026" },
      { icon: "⚽", headline: "SportyBet Promo: Free Bet Friday", date: "Sep 8, 2026" },
      { icon: "🏆", headline: "Top 5 Football Matches to Watch This Week", date: "Sep 7, 2026" },
      { icon: "📱", headline: "How to Use Bet Codes on Bet9ja (Step by Step)", date: "Sep 6, 2026" }
    ],
    accumulators: [
      { key: "3", odds: "3 Odds", matchIds: [1, 2, 3], themeClass: "accumulator-card-3", combinedCode: "ACC3-9J-111" },
      { key: "5", odds: "5 Odds", matchIds: [4, 5, 6, 7, 8], themeClass: "accumulator-card-5", combinedCode: "ACC5-9J-222" },
      { key: "10", odds: "10 Odds", matchIds: [1,2,3,4,5,6,7,8,9,10], themeClass: "accumulator-card-10", combinedCode: "ACC10-9J-333" },
      { key: "20", odds: "20+ Odds", matchIds: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], themeClass: "accumulator-card-20", combinedCode: "ACC20-9J-444" }
    ]
  };

  function bookPill(key) { var meta = BOOKMAKER_META[key]; if (!meta) return ""; return '<span class="book-pill book-pill--' + meta.className + '">' + meta.label + "</span>"; }

  function renderPicksTable(predictions) {
    var tbody = document.getElementById("picksTableBody"); if (!tbody) return;
    tbody.innerHTML = predictions.map(function (p, index) {
      var oddsBadges = p.bookmakers.map(function(b){ var meta = BOOKMAKER_META[b.name]; return '<span class="odds-cell ' + meta.className + '">' + meta.label + ': ' + b.odds.toFixed(2) + '</span>'; }).join(" ");
      return '<tr data-id="' + p.id + '"><td class="col-run"><span class="match-cell"><span>' + (index + 1) + "</span></td><td class="col-match"><span class="match-cell">" + p.match + "</td><td class="col-pick"><span class="pick-cell">" + p.pick + "</td><td class="col-odds">" + oddsBadges + "</td><td class="col-code">" + revealButtonHTML(p) + "</td></tr>";
    }).join(""); attachRevealHandlers(tbody);
  }

  function renderPicksCards(predictions) {
    var wrap = document.getElementById("picksCardsList"); if (!wrap) return;
    wrap.innerHTML = predictions.map(function (p, index) {
      var avgOdds = p.bookmakers.reduce(function(sum,b){return sum+b.odds},0)/p.bookmakers.length;
      return '<div class="pick-card" data-id="' + p.id + '"><div class="pick-card_top"><span class="pick-card_num">#' + (index + 1) + "</span>" + p.match + '</div><div class="pick-card_mid"><span class="pick-card_pick">' + p.pick + '</span><span class="pick-card_odds">Avg: ' + avgOdds.toFixed(2) + '</span></div><div class="pick-card_bottom"><span class="pick-card_bookies">' + p.bookmakers.map(bookPill).join("") + "</span>" + revealButtonHTML(p) + "</div></div>";
    }).join(""); attachRevealHandlers(wrap);
  }

  function revealButtonHTML(p) { return '<button class="reveal-btn" data-code="' + p.code + '" data-id="' + p.id + '"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="11" rx="2"/><path d="M12 2v8"/></svg><span class="reveal-btn_label">Reveal Code</span></button>'; }

  function attachRevealHandlers(container) { var buttons = container.querySelectorAll(".reveal-btn"); buttons.forEach(function (btn) { btn.addEventListener("click", function () { requestCodeReveal(btn, btn.getAttribute("data-id")); }); }); }

  function requestCodeReveal(button, id) { if (window.MDT_AD_PROVIDER && typeof window.MDT_AD_PROVIDER.show === "function") { window.MDT_AD_PROVIDER.show(function (success) { if (success) revealCode(button, id); }); } else { revealCode(button, id); } }

  function revealCode(button, p_id) {
    button.classList.add("reveal-btn--revealed");
    var p = findPredictionById(p_id);
    var codesHTML = p.bookmakers.map(function(b){ var meta = BOOKMAKER_META[b.name]; return '<div style="margin:4px 0;"><b>' + meta.label + ':</b> ' + b.code + ' @ ' + b.odds.toFixed(2) + '</div>'; }).join("");
    button.innerHTML = codesHTML; button.disabled = true; button.style.cursor = "default";
  }

  function findPredictionById(id) { for (var i = 0; i < SITE_DATA.predictions.length; i++) { if (SITE_DATA.predictions[i].id == id) return SITE_DATA.predictions[i]; } return null; }

  function renderAccumulators(list) {
    var grid = document.getElementById("accumulatorGrid"); if (!grid) return;
    grid.innerHTML = list.map(function (a) {
      var matches = a.matchIds.map(findPredictionById).filter(Boolean);
      var combinedOdds = matches.reduce(function (total, m) { var avgOdds = m.bookmakers.reduce(function(sum, b){ return sum + b.odds; }, 0) / m.bookmakers.length; return total * avgOdds; }, 1);
      var matchesHTML = matches.map(function (m) { var avgOdds = m.bookmakers.reduce(function(sum, b){ return sum + b.odds; }, 0) / m.bookmakers.length; return "<div class=\"accumulator-card_match\"><span class=\"accumulator-card_match-teams\">" + m.match + "</span><span class=\"accumulator-card_match-pick\">" + m.pick + " @ " + avgOdds.toFixed(2) + "</span></div>"; }).join("");
      return "<div class=\"accumulator-card " + a.themeClass + "\"><div class=\"accumulator-card_odds\">" + a.odds.toUpperCase() + "</div><div class=\"accumulator-card_desc\">" + matches.length + " Selections - Combined " + combinedOdds.toFixed(2) + "</div><div class=\"accumulator-card_matches\">" + matchesHTML + "</div><div class=\"accumulator-card_code\"><b>Code:</b> " + a.combinedCode + "</div><button class=\"accumulator-card_btn\" onclick=\"navigator.clipboard.writeText('" + a.combinedCode + "'); alert('Copied: " + a.combinedCode + "')\">Copy Code</button></div>";
    }).join("");
  }

  function renderFilters(predictions) { var chips = document.querySelectorAll(".filter-chip"); chips.forEach(function (chip) { chip.addEventListener("click", function () { chips.forEach(function (c) { c.classList.remove("filter-chip--active"); c.setAttribute("aria-selected", "false"); }); chip.classList.add("filter-chip--active"); chip.setAttribute("aria-selected", "true"); var filter = chip.getAttribute("data-filter"); var filtered = filter === "All"? predictions : predictions.filter(function (p) { return p.category === filter; }); renderPicksTable(filtered); renderPicksCards(filtered); }); }); }

  function applyBookmakerAffiliateLinks() { document.querySelectorAll("[data-affiliate]").forEach(function (el) { var key = el.getAttribute("data-affiliate"); if (AFFILIATE_LINKS[key]) { el.setAttribute("href", AFFILIATE_LINKS[key]); } }); }

  function init() {
    document.getElementById("overviewDate") && (document.getElementById("overviewDate").lastChild.textContent = " - " + SITE_DATA.date);
    var statTotal = document.getElementById("statTotal"); var statWinners = document.getElementById("statWinners"); var statLosers = document.getElementById("statLosers"); var statHitRate = document.getElementById("statHitRate");
    if (statTotal) statTotal.textContent = SITE_DATA.overview.totalSelections;
    if (statWinners) statWinners.textContent = SITE_DATA.overview.winnersYesterday;
    if (statLosers) statLosers.textContent = SITE_DATA.overview.losersYesterday;
    if (statHitRate) statHitRate.textContent = SITE_DATA.overview.hitRateYesterday + "%";
    var pickCountBadge = document.getElementById("pickCountBadge"); if (pickCountBadge) pickCountBadge.textContent = SITE_DATA.overview.totalSelections + " Selections";
    renderPicksTable(SITE_DATA.predictions); renderPicksCards(SITE_DATA.predictions); renderFilters(SITE_DATA.predictions); renderAccumulators(SITE_DATA.accumulators); applyBookmakerAffiliateLinks();
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
