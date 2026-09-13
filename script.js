
/* ==========================================================================
   MatchForecast — script.js
   Renders ALL daily content from data.json (the single source of truth).
   No hard-coded matches/odds/codes live in this file anymore.
   The Local Editor (matchforecast-editor) publishes data.json to GitHub;
   this file only fetches it and draws the page.
   ========================================================================== */

(function () {
  "use strict";

  var DATA_URL = "data.json";
  var state = {
    data: null,
    activeFilter: "All"
  };

  /* ---------------- helpers ---------------- */

  function el(tag, className, html) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function esc(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function safeArr(a) {
    return Array.isArray(a) ? a : [];
  }

  function statusClass(status) {
    var s = (status || "pending").toLowerCase();
    if (s === "won" || s === "win") return "status-won";
    if (s === "lost" || s === "loss") return "status-lost";
    if (s === "live") return "status-live";
    return "status-pending";
  }

  /* Renders the bookmaker chips (name + odds + reveal/copy code) used by
     predictions, accumulators, correct scores and live predictions. */
  function bookmakerChips(list) {
    var wrap = el("div", "bm-chips");
    safeArr(list).forEach(function (b) {
      if (!b || !b.name) return;
      var chip = el("div", "bm-chip");
      var head = el("span", "bm-chip__name", esc(b.name));
      chip.appendChild(head);
      if (b.odds) chip.appendChild(el("span", "bm-chip__odds", esc(b.odds)));
      if (b.code) {
        var codeBtn = el("button", "bm-chip__code-btn");
        codeBtn.type = "button";
        codeBtn.dataset.code = b.code;
        codeBtn.textContent = "Reveal Code";
        codeBtn.addEventListener("click", function () {
          revealAndCopy(codeBtn, b.code);
        });
        chip.appendChild(codeBtn);
      }
      if (b.link) {
        var a = document.createElement("a");
        a.href = b.link;
        a.target = "_blank";
        a.rel = "noopener";
        a.className = "bm-chip__link";
        a.textContent = "Bet Now";
        chip.appendChild(a);
      }
      wrap.appendChild(chip);
    });
    return wrap;
  }

  function revealAndCopy(btn, code) {
    if (btn.classList.contains("is-revealed")) {
      navigator.clipboard && navigator.clipboard.writeText(code).catch(function () {});
      btn.textContent = "Copied!";
      setTimeout(function () {
        btn.textContent = code;
      }, 1200);
      return;
    }
    btn.classList.add("is-revealed");
    btn.textContent = code;
  }

  function bookmakerNames(list) {
    return safeArr(list).map(function (b) { return b.name; }).filter(Boolean).join(", ");
  }

  /* ---------------- overview / hero stats ---------------- */

  function renderMeta(data) {
    var m = data.meta || {};
    var stats = m.stats || {};
    setText("statTotal", stats.totalSelections || 0);
    setText("statWinners", stats.winnersYesterday || 0);
    setText("statLosers", stats.losersYesterday || 0);
    setText("statHitRate", (stats.hitRateYesterday || 0) + "%");

    var dateLabel = m.displayDate || "";
    var overviewDate = document.getElementById("overviewDate");
    if (overviewDate) overviewDate.lastChild ? (overviewDate.lastChild.textContent = " " + dateLabel) : null;
    setDateBadge("picksHeaderDate", dateLabel);
    setDateBadge("resultsDateBadge", m.resultsDate || dateLabel);
  }

  function setDateBadge(id, text) {
    var node = document.getElementById(id);
    if (!node) return;
    var svg = node.querySelector("svg");
    node.textContent = "";
    if (svg) node.appendChild(svg);
    node.appendChild(document.createTextNode(" " + (text || "")));
  }

  function setText(id, val) {
    var n = document.getElementById(id);
    if (n) n.textContent = val;
  }

  /* ---------------- Bet of the Day ---------------- */

  function renderBetOfTheDay(list) {
    var grid = document.getElementById("betOfTheDayGrid");
    if (!grid) return;
    grid.innerHTML = "";
    var items = safeArr(list);
    if (!items.length) {
      grid.appendChild(el("p", "empty-state", "No Bet of the Day selection yet — check back soon."));
      return;
    }
    items.forEach(function (b) {
      var card = el("div", "botd-card");
      card.appendChild(el("div", "botd-card__match", esc(b.match)));
      card.appendChild(el("div", "botd-card__pick", (b.market ? esc(b.market) + ": " : "") + esc(b.prediction)));
      if (b.odds) card.appendChild(el("span", "botd-card__odds", "Odds " + esc(b.odds)));
      card.appendChild(bookmakerChips(b.bookmakers));
      grid.appendChild(card);
    });
  }

  /* ---------------- Top Picks (predictions) ---------------- */

  function buildFilters(predictions) {
    var bar = document.getElementById("picksFilters");
    if (!bar) return;
    var markets = {};
    predictions.forEach(function (p) {
      var m = p.market || "Other";
      markets[m] = (markets[m] || 0) + 1;
    });
    bar.innerHTML = "";
    var allBtn = el("button", "filter-chip" + (state.activeFilter === "All" ? " filter-chip--active" : ""), "All (" + predictions.length + ")");
    allBtn.type = "button";
    allBtn.dataset.filter = "All";
    allBtn.setAttribute("role", "tab");
    allBtn.setAttribute("aria-selected", state.activeFilter === "All");
    bar.appendChild(allBtn);
    Object.keys(markets).forEach(function (m) {
      var b = el("button", "filter-chip" + (state.activeFilter === m ? " filter-chip--active" : ""), esc(m) + " (" + markets[m] + ")");
      b.type = "button";
      b.dataset.filter = m;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", state.activeFilter === m);
      bar.appendChild(b);
    });
    bar.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.activeFilter = btn.dataset.filter;
        renderPicks(state.data.predictions);
      });
    });
  }

  function renderPicks(predictions) {
    predictions = safeArr(predictions);
    buildFilters(predictions);

    var filtered = state.activeFilter === "All"
      ? predictions
      : predictions.filter(function (p) { return (p.market || "Other") === state.activeFilter; });

    setText("pickCountBadge", filtered.length + " Selections");

    var tbody = document.getElementById("picksTableBody");
    var cards = document.getElementById("picksCardsList");
    if (tbody) tbody.innerHTML = "";
    if (cards) cards.innerHTML = "";

    if (!filtered.length) {
      if (tbody) {
        var tr = document.createElement("tr");
        tr.innerHTML = '<td colspan="6" class="empty-state">No predictions published yet — check back soon.</td>';
        tbody.appendChild(tr);
      }
      return;
    }

    filtered.forEach(function (p, i) {
      if (tbody) {
        var row = document.createElement("tr");
        row.className = statusClass(p.status);
        row.innerHTML =
          '<td class="col-num">' + (i + 1) + '</td>' +
          '<td class="col-match"><strong>' + esc(p.match) + '</strong><br><small>' + esc(p.league || "") + '</small></td>' +
          '<td class="col-pick">' + esc(p.prediction) + '</td>' +
          '<td class="col-odds">' + esc(p.odds || "") + '</td>' +
          '<td class="col-books">' + esc(bookmakerNames(p.bookmakers)) + '</td>' +
          '<td class="col-code"></td>';
        row.querySelector(".col-code").appendChild(bookmakerChips(p.bookmakers));
        tbody.appendChild(row);
      }
      if (cards) {
        var card = el("div", "pick-card " + statusClass(p.status));
        card.innerHTML =
          '<div class="pick-card__top">' +
            '<span class="pick-card__match">' + esc(p.match) + '</span>' +
            '<span class="pick-card__league">' + esc(p.league || "") + '</span>' +
          '</div>' +
          '<div class="pick-card__mid">' +
            '<span class="pick-card__pick">' + esc(p.prediction) + '</span>' +
            '<span class="pick-card__odds">' + esc(p.odds || "") + '</span>' +
          '</div>';
        card.appendChild(bookmakerChips(p.bookmakers));
        cards.appendChild(card);
      }
    });
  }

  /* ---------------- Live Predictions ---------------- */

  function renderLive(list) {
    list = safeArr(list);
    setText("liveCountBadge", list.length + " Live");
    var tbody = document.getElementById("liveTableBody");
    var cards = document.getElementById("liveCardsList");
    if (tbody) tbody.innerHTML = "";
    if (cards) cards.innerHTML = "";
    if (!list.length) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No live predictions right now.</td></tr>';
      return;
    }
    list.forEach(function (p, i) {
      if (tbody) {
        var row = document.createElement("tr");
        row.className = "status-live";
        row.innerHTML =
          '<td class="col-num">' + (i + 1) + '</td>' +
          '<td class="col-match"><strong>' + esc(p.match) + '</strong><br><small>' + esc(p.league || "") + '</small></td>' +
          '<td class="col-pick">' + esc(p.prediction) + '</td>' +
          '<td class="col-odds">' + esc(p.odds || "") + '</td>' +
          '<td class="col-books">' + esc(p.bookmaker || "") + '</td>' +
          '<td class="col-code">' + esc(p.code || "") + '</td>';
        tbody.appendChild(row);
      }
      if (cards) {
        var card = el("div", "pick-card status-live");
        card.innerHTML =
          '<div class="pick-card__top"><span class="pick-card__match">' + esc(p.match) + '</span></div>' +
          '<div class="pick-card__mid"><span class="pick-card__pick">' + esc(p.prediction) + '</span><span class="pick-card__odds">' + esc(p.odds || "") + '</span></div>';
        cards.appendChild(card);
      }
    });
  }

  /* ---------------- Accumulators ---------------- */

  function renderAccumulators(list) {
    list = safeArr(list);
    setText("accaCountBadge", list.length + " Odds Slips");
    var grid = document.getElementById("accumulatorGrid");
    if (!grid) return;
    grid.innerHTML = "";
    if (!list.length) {
      grid.appendChild(el("p", "empty-state", "No accumulators published yet."));
      return;
    }
    list.forEach(function (acc) {
      var card = el("div", "accumulator-card");
      var head = el("div", "accumulator-card__head");
      head.innerHTML = '<span class="accumulator-card__title">' + esc(acc.title) + '</span>' +
        '<span class="accumulator-card__odds">Odds ' + esc(acc.totalOdds || "") + '</span>';
      card.appendChild(head);

      var selList = el("ul", "accumulator-card__selections");
      safeArr(acc.selections).forEach(function (s) {
        selList.appendChild(el("li", "", esc(s.match) + " — <strong>" + esc(s.pick) + "</strong>"));
      });
      card.appendChild(selList);
      card.appendChild(bookmakerChips(acc.bookmakers));
      grid.appendChild(card);
    });
  }

  /* ---------------- Correct Score ---------------- */

  function renderCorrectScores(list) {
    list = safeArr(list);
    setText("csCountBadge", list.length + " Selections");
    var tbody = document.getElementById("csTableBody");
    var cards = document.getElementById("csCardsList");
    if (tbody) tbody.innerHTML = "";
    if (cards) cards.innerHTML = "";
    if (!list.length) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No correct-score picks published yet.</td></tr>';
      return;
    }
    list.forEach(function (c, i) {
      if (tbody) {
        var row = document.createElement("tr");
        row.className = statusClass(c.status);
        row.innerHTML =
          '<td class="col-num">' + (i + 1) + '</td>' +
          '<td class="col-match"><strong>' + esc(c.match) + '</strong><br><small>' + esc(c.league || "") + '</small></td>' +
          '<td class="col-pick">' + esc(c.correctScore) + '</td>' +
          '<td class="col-odds">' + esc(c.odds || "") + '</td>' +
          '<td class="col-books">' + esc(bookmakerNames(c.bookmakers)) + '</td>' +
          '<td class="col-code"></td>';
        row.querySelector(".col-code").appendChild(bookmakerChips(c.bookmakers));
        tbody.appendChild(row);
      }
      if (cards) {
        var card = el("div", "pick-card " + statusClass(c.status));
        card.innerHTML =
          '<div class="pick-card__top"><span class="pick-card__match">' + esc(c.match) + '</span></div>' +
          '<div class="pick-card__mid"><span class="pick-card__pick">' + esc(c.correctScore) + '</span><span class="pick-card__odds">' + esc(c.odds || "") + '</span></div>';
        card.appendChild(bookmakerChips(c.bookmakers));
        cards.appendChild(card);
      }
    });
  }

  /* ---------------- Codes Only ---------------- */

  function renderCodesOnly(list) {
    var ul = document.getElementById("codesOnlyList");
    if (!ul) return;
    ul.innerHTML = "";
    list = safeArr(list);
    if (!list.length) {
      ul.appendChild(el("li", "empty-state", "No codes published yet."));
      return;
    }
    list.forEach(function (c) {
      var li = el("li", "codes-only-item");
      li.innerHTML = '<span class="codes-only-item__label">' + esc(c.bookmaker) + (c.label ? " — " + esc(c.label) : "") + '</span>';
      if (c.code) {
        var btn = el("button", "bm-chip__code-btn");
        btn.type = "button";
        btn.textContent = "Reveal Code";
        btn.addEventListener("click", function () { revealAndCopy(btn, c.code); });
        li.appendChild(btn);
      }
      ul.appendChild(li);
    });
  }

  /* ---------------- Results ---------------- */

  function renderResults(list) {
    var grid = document.getElementById("resultsGrid");
    if (!grid) return;
    grid.innerHTML = "";
    list = safeArr(list);
    if (!list.length) {
      grid.appendChild(el("p", "empty-state", "No results posted yet."));
      return;
    }
    list.forEach(function (r) {
      var card = el("div", "result-card " + (r.winLoss === "win" ? "result-card--win" : r.winLoss === "loss" ? "result-card--loss" : ""));
      card.innerHTML =
        '<div class="result-card__match">' + esc(r.match) + '</div>' +
        '<div class="result-card__score">' + esc(r.result || "") + '</div>' +
        '<div class="result-card__status">' + esc((r.status || r.winLoss || "").toString().toUpperCase()) + '</div>';
      grid.appendChild(card);
    });
  }

  /* ---------------- News ---------------- */

  function renderNews(list) {
    var ul = document.getElementById("newsList");
    if (!ul) return;
    ul.innerHTML = "";
    list = safeArr(list);
    if (!list.length) {
      ul.appendChild(el("li", "empty-state", "No news posted yet."));
      return;
    }
    list.forEach(function (n) {
      var li = el("li", "news-item");
      li.innerHTML =
        (n.image ? '<img class="news-item__img" src="' + esc(n.image) + '" alt="" loading="lazy">' : "") +
        '<div class="news-item__body">' +
          '<span class="news-item__title">' + esc(n.title) + '</span>' +
          '<span class="news-item__date">' + esc(n.date || "") + (n.category ? " · " + esc(n.category) : "") + '</span>' +
        '</div>';
      if (n.link) {
        var a = document.createElement("a");
        a.href = n.link;
        a.className = "news-item__link";
        a.appendChild(li);
        ul.appendChild(a);
      } else {
        ul.appendChild(li);
      }
    });
  }

  /* ---------------- Bookmakers sidebar ---------------- */

  function renderBookmakers(list) {
    var ul = document.getElementById("bookmakerList");
    if (!ul) return;
    ul.innerHTML = "";
    safeArr(list).forEach(function (b) {
      var li = el("li", "bookmaker-list__item");
      li.innerHTML = '<span>' + esc(b.name) + '</span>';
      if (b.link) {
        var a = document.createElement("a");
        a.href = b.link;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "Visit";
        li.appendChild(a);
      }
      ul.appendChild(li);
    });
  }

  /* ---------------- search ---------------- */

  function setupSearch(data) {
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    if (!input || !results) return;
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      results.innerHTML = "";
      if (!q) return;
      var pool = []
        .concat(safeArr(data.predictions).map(function (p) { return { label: p.match + " — " + p.prediction, type: "Prediction" }; }))
        .concat(safeArr(data.correctScores).map(function (c) { return { label: c.match + " — " + c.correctScore, type: "Correct Score" }; }))
        .concat(safeArr(data.livePredictions).map(function (p) { return { label: p.match + " — " + p.prediction, type: "Live" }; }));
      var matches = pool.filter(function (item) { return item.label.toLowerCase().indexOf(q) !== -1; }).slice(0, 8);
      matches.forEach(function (m) {
        results.appendChild(el("li", "", esc(m.label) + ' <small>(' + m.type + ')</small>'));
      });
    });
  }

  var searchToggle = document.getElementById("searchToggle");
  if (searchToggle) {
    searchToggle.addEventListener("click", function () {
      var box = document.getElementById("navbarSearch");
      var expanded = searchToggle.getAttribute("aria-expanded") === "true";
      searchToggle.setAttribute("aria-expanded", String(!expanded));
      if (box) box.classList.toggle("is-open", !expanded);
    });
  }

  /* ---------------- master render ---------------- */

  function render(data) {
    state.data = data;
    renderMeta(data);
    renderBetOfTheDay(data.betOfTheDay);
    renderPicks(data.predictions);
    renderLive(data.livePredictions);
    renderAccumulators(data.accumulators);
    renderCorrectScores(data.correctScores);
    renderCodesOnly(data.codesOnly);
    renderResults(data.results);
    renderNews(data.news);
    renderBookmakers(data.bookmakers);
    setupSearch(data);
  }

  /* ---------------- data loading (always fresh, cache-busted) ---------------- */

  function loadData() {
    var url = DATA_URL + "?v=" + Date.now();
    fetch(url, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("data.json request failed: " + res.status);
        return res.json();
      })
      .then(function (data) {
        render(data);
      })
      .catch(function (err) {
        console.error("MatchForecast: failed to load data.json", err);
      });
  }

  document.addEventListener("DOMContentLoaded", loadData);

  /* Register the service worker (kept lightweight: it only caches the
     static app shell, never data.json — see sw.js). */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
