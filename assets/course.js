/* AI/ML in 35 topics — progress, grading, theme, dashboard.
   No dependencies. State lives in localStorage; nothing leaves the device. */
(function () {
  "use strict";

  var KEY = "ai35.progress.v1";
  var store = { lessons: {}, theme: null };

  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") store = parsed;
    }
  } catch (e) { /* private mode / file:// */ }
  if (!store.lessons) store.lessons = {};

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  }

  function lessonState(id) {
    if (!store.lessons[id]) store.lessons[id] = { sections: {}, quiz: {}, ts: 0 };
    if (!store.lessons[id].sections) store.lessons[id].sections = {};
    if (!store.lessons[id].quiz) store.lessons[id].quiz = {};
    return store.lessons[id];
  }

  /* ---------- theme ---------- */
  var root = document.documentElement;
  if (store.theme) root.setAttribute("data-theme", store.theme);

  function applyTheme(mode) {
    if (mode === "auto") {
      root.removeAttribute("data-theme");
      store.theme = null;
    } else {
      root.setAttribute("data-theme", mode);
      store.theme = mode;
    }
    persist();
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) btn.textContent = label();
  }
  function label() {
    if (!store.theme) return "◐ auto";
    return store.theme === "dark" ? "● dark" : "○ light";
  }

  /* ---------- reading progress ---------- */
  function readbar() {
    var bar = document.createElement("div");
    bar.className = "readbar";
    document.body.appendChild(bar);
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      bar.style.width = Math.max(0, Math.min(1, p)) * 100 + "%";
    }
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  }

  /* ---------- grading ---------- */
  function gradeOf(points, total) {
    if (!total) return { pct: 0, letter: "–" };
    var pct = Math.round((points / total) * 100);
    var letter = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    return { pct: pct, letter: letter };
  }

  function buttons(group, current, onPick) {
    [["2", "✓ got it"], ["1", "~ partly"], ["0", "✗ missed"]].forEach(function (pair) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "gbtn";
      b.dataset.v = pair[0];
      b.textContent = pair[1];
      b.setAttribute("aria-pressed", String(String(current) === pair[0]));
      b.addEventListener("click", function () {
        [].forEach.call(group.querySelectorAll(".gbtn"), function (x) {
          x.setAttribute("aria-pressed", "false");
        });
        b.setAttribute("aria-pressed", "true");
        onPick(Number(pair[0]));
      });
      group.appendChild(b);
    });
  }

  /* ---------- lesson page ---------- */
  function initLesson() {
    var body = document.body;
    var id = body.getAttribute("data-lesson");
    if (!id) return;
    var st = lessonState(id);

    /* top bar */
    var top = document.querySelector(".topline");
    if (top) {
      var themeBtn = document.createElement("button");
      themeBtn.type = "button";
      themeBtn.setAttribute("data-theme-toggle", "");
      themeBtn.textContent = label();
      themeBtn.addEventListener("click", function () {
        applyTheme(!store.theme ? "dark" : store.theme === "dark" ? "light" : "auto");
      });
      top.appendChild(themeBtn);
      var pill = document.createElement("span");
      pill.className = "pill hide-sm";
      pill.setAttribute("data-score-pill", "");
      pill.textContent = "not graded";
      top.appendChild(pill);
    }

    readbar();
    var chip = document.createElement("div");
    chip.className = "scorechip";
    chip.innerHTML = '<span>lesson</span><strong data-score>0%</strong><span class="grade" data-grade>–</span><span data-count>0/0</span>';
    document.body.appendChild(chip);

    var totalItems = 0;
    var earned = 0;

    function refresh() {
      var g = gradeOf(earned, totalItems);
      chip.querySelector("[data-score]").textContent = g.pct + "%";
      chip.querySelector("[data-grade]").textContent = g.letter;
      chip.querySelector("[data-grade]").setAttribute("data-g", g.letter);
      chip.querySelector("[data-count]").textContent = earned + "/" + (totalItems * 2);
      var p = document.querySelector("[data-score-pill]");
      if (p) p.textContent = earned ? g.pct + "% · " + g.letter : "not graded";
      st.ts = Date.now();
      persist();
    }

    /* section confidence */
    var h2s = [].slice.call(document.querySelectorAll("main h2"));
    h2s.forEach(function (h2, i) {
      var text = h2.textContent.toLowerCase();
      if (text.indexOf("retrieval") !== -1 || text.indexOf("next") !== -1 || text.indexOf("colab") !== -1) return;

      /* find the last element belonging to this section */
      var node = h2.nextElementSibling;
      var last = h2;
      while (node && !(node.tagName === "H2") && !(node.classList && node.classList.contains("next"))) {
        last = node;
        node = node.nextElementSibling;
      }

      var row = document.createElement("div");
      row.className = "blockcheck";
      var lab = document.createElement("span");
      lab.className = "grow";
      lab.textContent = "can you explain this without looking?";
      row.appendChild(lab);
      var group = document.createElement("span");
      row.appendChild(group);

      totalItems++;
      var cur = st.sections[i];
      if (cur != null) earned += cur;

      buttons(group, cur, function (v) {
        var prev = st.sections[i];
        if (prev === v) {
          delete st.sections[i];
          earned -= prev;
          btnReset(group);
        } else {
          if (prev != null) earned -= prev;
          st.sections[i] = v;
          earned += v;
        }
        refresh();
      });

      if (last && last.parentNode) last.parentNode.insertBefore(row, last.nextSibling);
      else h2.parentNode.insertBefore(row, h2.nextSibling);
    });

    /* quiz self-grade */
    var quiz = [].slice.call(document.querySelectorAll("ol.quiz > li"));
    quiz.forEach(function (li, i) {
      var row = document.createElement("div");
      row.className = "grade-row";
      var lab = document.createElement("span");
      lab.className = "q";
      lab.textContent = "your call";
      row.appendChild(lab);
      li.appendChild(row);

      totalItems++;
      var cur = st.quiz[i];
      if (cur != null) earned += cur;

      buttons(row, cur, function (v) {
        var prev = st.quiz[i];
        if (prev === v) {
          delete st.quiz[i];
          earned -= prev;
        } else {
          if (prev != null) earned -= prev;
          st.quiz[i] = v;
          earned += v;
          var d = li.querySelector("details");
          if (d && !d.open) d.open = true;
        }
        refresh();
      });
    });

    refresh();

    /* remember last visited for the dashboard */
    store.last = id;
    persist();
  }

  function btnReset(group) {
    [].forEach.call(group.querySelectorAll(".gbtn"), function (x) {
      x.setAttribute("aria-pressed", "false");
    });
  }

  /* ---------- dashboard ---------- */
  function initIndex() {
    var rows = [].slice.call(document.querySelectorAll("li.topic[data-lesson]"));
    if (!rows.length) return;
    readbar();

    var top = document.querySelector(".topline");
    if (top) {
      var themeBtn = document.createElement("button");
      themeBtn.type = "button";
      themeBtn.setAttribute("data-theme-toggle", "");
      themeBtn.textContent = label();
      themeBtn.addEventListener("click", function () {
        applyTheme(!store.theme ? "dark" : store.theme === "dark" ? "light" : "auto");
      });
      top.appendChild(themeBtn);
    }

    var total = 0, done = 0, points = 0, possible = 0;
    var unitAgg = {};

    rows.forEach(function (row) {
      var id = row.getAttribute("data-lesson");
      var unit = row.getAttribute("data-unit");
      var st = store.lessons[id] || { sections: {}, quiz: {} };
      var secVals = Object.keys(st.sections || {}).map(function (k) { return st.sections[k]; });
      var quizVals = Object.keys(st.quiz || {}).map(function (k) { return st.quiz[k]; });

      var items = secVals.length + quizVals.length;
      var pts = secVals.concat(quizVals).reduce(function (a, b) { return a + b; }, 0);
      var expected = 16; /* 5 section checks + 3 questions, each 0–2 */
      total++;
      if (items >= 8) {
        done++;
        row.querySelector(".dot").className = "dot done";
      } else if (items > 0) {
        row.querySelector(".dot").className = "dot part";
      }
      points += pts;
      possible += expected;
      if (!unitAgg[unit]) unitAgg[unit] = { p: 0, e: 0, n: 0 };
      unitAgg[unit].p += pts;
      unitAgg[unit].e += expected;
      unitAgg[unit].n++;

      var meta = row.querySelector(".topic-meta");
      if (meta && items > 0) {
        var g = gradeOf(pts, expected);
        var mins = meta.getAttribute("data-mins") || meta.textContent;
        meta.innerHTML = '<span class="badge ready">' + g.letter + " · " + g.pct + "%</span><br>" + mins;
      }
    });

    var pct = possible ? Math.round((points / possible) * 100) : 0;
    var ring = document.querySelector(".ring");
    if (ring) {
      ring.style.setProperty("--p", pct);
      ring.querySelector(".pct").textContent = pct + "%";
      ring.querySelector(".cap").textContent = done + " of " + total + " done";
    }

    Object.keys(unitAgg).forEach(function (u) {
      var bar = document.querySelector('.unit[data-unit="' + u + '"] .bar i');
      if (bar) {
        var a = unitAgg[u];
        bar.style.width = Math.round((a.p / a.e) * 100) + "%";
      }
    });

    var cont = document.querySelector("[data-continue]");
    if (cont) {
      var next = rows.filter(function (r) { return r.querySelector(".dot").className.indexOf("done") === -1; })[0];
      var target = next || rows[rows.length - 1];
      var link = target.querySelector("a.topic-link");
      if (link) {
        cont.href = link.getAttribute("href");
        cont.textContent = next ? "Continue → " + target.querySelector(".topic-link").textContent : "Review → " + target.querySelector(".topic-link").textContent;
      }
    }

    var exp = document.querySelector("[data-export]");
    if (exp) exp.addEventListener("click", function () { exportRecord(rows); });
    var reset = document.querySelector("[data-reset]");
    if (reset) reset.addEventListener("click", function () {
      if (confirm("Erase all scores on this device? This cannot be undone.")) {
        store = { lessons: {}, theme: store.theme };
        persist();
        location.reload();
      }
    });
  }

  /* ---------- export a learning record ---------- */
  function exportRecord(rows) {
    var lines = [];
    lines.push("# Learning record — progress export");
    lines.push("");
    lines.push("Generated " + new Date().toISOString().slice(0, 10) + " from self-assessed retrieval checks.");
    lines.push("");
    lines.push("| # | Topic | Points | Score | Grade | Status |");
    lines.push("|---|-------|--------|-------|-------|--------|");

    rows.forEach(function (row) {
      var id = row.getAttribute("data-lesson");
      var st = store.lessons[id];
      var title = row.querySelector(".topic-link, .topic-title").textContent.trim();
      if (!st) {
        lines.push("| " + id + " | " + title + " | 0/16 | 0% | – | not started |");
        return;
      }
      var secVals = Object.keys(st.sections || {}).map(function (k) { return st.sections[k]; });
      var quizVals = Object.keys(st.quiz || {}).map(function (k) { return st.quiz[k]; });
      var pts = secVals.concat(quizVals).reduce(function (a, b) { return a + b; }, 0);
      var g = gradeOf(pts, 16);
      var status = secVals.length + quizVals.length >= 8 ? "complete" : secVals.length + quizVals.length > 0 ? "in progress" : "not started";
      lines.push("| " + id + " | " + title + " | " + pts + "/16 | " + g.pct + "% | " + g.letter + " | " + status + " |");
    });

    var weak = rows.filter(function (row) {
      var st = store.lessons[row.getAttribute("data-lesson")];
      if (!st) return false;
      var v = Object.keys(st.sections || {}).map(function (k) { return st.sections[k]; })
        .concat(Object.keys(st.quiz || {}).map(function (k) { return st.quiz[k]; }));
      return v.length && v.reduce(function (a, b) { return a + b; }, 0) / (v.length * 2) < 0.7;
    }).map(function (r) { return r.querySelector(".topic-link, .topic-title").textContent.trim(); });

    lines.push("");
    lines.push("## Revisit");
    lines.push(weak.length ? weak.map(function (w) { return "- " + w; }).join("\n") : "- nothing below 70% yet");
    lines.push("");
    lines.push("## Note");
    lines.push("Scores are self-assessed. They record confidence, not verified ability. A topic is only known when it survives a cold retrieval without the lesson open.");

    var blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "learning-record-" + new Date().toISOString().slice(0, 10) + ".md";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* ---------- boot ---------- */
  if (document.body.getAttribute("data-page") === "index") initIndex();
  else initLesson();
})();
