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
    if (!store.lessons[id].practice) store.lessons[id].practice = {};
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

  function bindTheme(btn) {
    if (!btn) return;
    btn.textContent = label();
    btn.addEventListener("click", function () {
      applyTheme(!store.theme ? "dark" : store.theme === "dark" ? "light" : "auto");
    });
  }

  /* ---------- lab page (no grading, just chrome) ---------- */
  function initLab() {
    readbar();
    bindTheme(document.querySelector("[data-theme-toggle]"));

    var id = document.body.getAttribute("data-lesson");
    if (!id) return;
    var st = lessonState(id);

    var quiz = [].slice.call(document.querySelectorAll("ol.quiz > li"));
    if (!quiz.length) return;

    var chip = document.createElement("div");
    chip.className = "scorechip";
    chip.innerHTML = '<span>lab</span><strong data-score>0%</strong><span class="grade" data-grade>–</span><span data-count>0/0</span>';
    document.body.appendChild(chip);

    var total = quiz.length * 2;
    var earned = 0;

    function refresh() {
      var g = gradeOf(earned, total);
      chip.querySelector("[data-score]").textContent = g.pct + "%";
      chip.querySelector("[data-grade]").textContent = "";
      chip.querySelector("[data-grade]").style.display = "none";
      chip.querySelector("[data-count]").textContent = earned + "/" + total;
      st.ts = Date.now();
      persist();
    }

    quiz.forEach(function (li, i) {
      var row = document.createElement("div");
      row.className = "grade-row";
      var lab = document.createElement("span");
      lab.className = "q";
      lab.textContent = "your call";
      row.appendChild(lab);
      li.appendChild(row);

      var cur = st.quiz[i];
      if (cur != null) earned += cur;

      buttons(row, cur, function (v) {
        var prev = st.quiz[i];
        if (prev === v) {
          delete st.quiz[i];
          earned -= prev;
          btnReset(row);
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
      var g = gradeOf(earned, totalItems * 2);
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
      if (text.indexOf("retrieval") !== -1 || text.indexOf("next") !== -1 || text.indexOf("colab") !== -1 || text.indexOf("practice") !== -1 || text.indexOf("step by step") !== -1) return;

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


    /* step-by-step walkthrough: one sentence per click */
    var stepBoxes = [].slice.call(document.querySelectorAll(".steps"));
    stepBoxes.forEach(function (box) {
      var raw = box.querySelector(".steps-data");
      if (!raw) return;
      var items;
      try { items = JSON.parse(raw.textContent); } catch (e) { return; }
      raw.style.display = "none";

      var list = document.createElement("ol");
      list.className = "steplist";
      var nodes = items.map(function (text, i) {
        var li = document.createElement("li");
        li.className = "step" + (i === 0 ? "" : " hidden");
        var n = document.createElement("span");
        n.className = "n";
        n.textContent = ("0" + (i + 1)).slice(-2);
        var t = document.createElement("span");
        t.className = "t";
        t.textContent = text;
        li.appendChild(n);
        li.appendChild(t);
        list.appendChild(li);
        return li;
      });
      box.appendChild(list);

      var bar = document.createElement("div");
      bar.className = "stepbar";
      var count = document.createElement("span");
      count.className = "stepcount";
      count.textContent = "Step 1 of " + items.length;
      var next = document.createElement("button");
      next.type = "button";
      next.className = "stepnext";
      next.textContent = "Next step →";
      var all = document.createElement("button");
      all.type = "button";
      all.className = "stepall";
      all.textContent = "Show all";
      bar.appendChild(count);
      bar.appendChild(next);
      bar.appendChild(all);
      box.appendChild(bar);

      var shown = 1;
      function paint() {
        nodes.forEach(function (li, i) { li.classList.toggle("hidden", i >= shown); });
        count.textContent = shown >= items.length
          ? "All " + items.length + " steps shown"
          : "Step " + shown + " of " + items.length;
        next.hidden = shown >= items.length;
        all.hidden = shown >= items.length;
      }
      next.addEventListener("click", function () {
        shown = Math.min(items.length, shown + 1);
        paint();
        nodes[shown - 1].scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
      all.addEventListener("click", function () {
        shown = items.length;
        paint();
      });
      paint();
    });

    /* extra practice: three attempts, then reveal */
    var boxes = [].slice.call(document.querySelectorAll(".practice"));
    boxes.forEach(function (box, bi) {
      var raw = box.querySelector(".practice-data");
      if (!raw) return;
      var items;
      try { items = JSON.parse(raw.textContent); } catch (e) { return; }
      raw.style.display = "none";

      items.forEach(function (item, qi) {
        totalItems++;
        var key = bi + "-" + qi;
        var rec = st.practice[key];
        if (!rec) {
          rec = { tries: 0, pts: null, solved: false, revealed: false };
          st.practice[key] = rec;
        }
        if (rec.pts) earned += rec.pts;

        var card = document.createElement("div");
        card.className = "pcard";
        var q = document.createElement("p");
        q.className = "pq";
        q.textContent = (qi + 1) + ". " + item.q;
        card.appendChild(q);

        var opts = document.createElement("div");
        opts.className = "poptions";
        card.appendChild(opts);

        var status = document.createElement("p");
        status.className = "pstatus";
        card.appendChild(status);

        var revealBox = document.createElement("div");
        revealBox.className = "panswer";
        revealBox.hidden = true;
        var lead = document.createElement("strong");
        lead.textContent = "Answer: ";
        revealBox.appendChild(lead);
        revealBox.appendChild(document.createTextNode(item.o[item.a]));
        revealBox.appendChild(document.createElement("br"));
        var why = document.createElement("span");
        why.className = "why";
        why.textContent = item.why;
        revealBox.appendChild(why);
        card.appendChild(revealBox);

        var revealBtn = document.createElement("button");
        revealBtn.type = "button";
        revealBtn.className = "reveal";
        revealBtn.textContent = "Show the answer";
        revealBtn.hidden = true;
        card.appendChild(revealBtn);

        function paint() {
          [].forEach.call(opts.children, function (b) {
            b.disabled = rec.solved || rec.revealed;
            b.classList.toggle("right", (rec.solved || rec.revealed) && Number(b.dataset.i) === item.a);
          });
          if (rec.solved) {
            status.textContent = rec.pts === 2 ? "Correct, first try." : "Correct.";
            status.className = "pstatus good";
            revealBox.hidden = false;
          } else if (rec.revealed) {
            status.textContent = "Answer revealed.";
            status.className = "pstatus bad";
            revealBox.hidden = false;
            revealBtn.hidden = true;
          } else if (rec.tries >= 3) {
            status.textContent = "Three attempts used.";
            status.className = "pstatus bad";
            revealBtn.hidden = false;
          } else {
            status.textContent = "Attempt " + (rec.tries + 1) + " of 3";
            status.className = "pstatus";
          }
        }

        item.o.forEach(function (text, i) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "opt";
          b.dataset.i = String(i);
          b.textContent = String.fromCharCode(65 + i) + ". " + text;
          b.addEventListener("click", function () {
            if (rec.solved || rec.revealed) return;
            if (i === item.a) {
              rec.solved = true;
              rec.pts = rec.tries === 0 ? 2 : 1;
              earned += rec.pts;
              paint();
              refresh();
            } else {
              b.classList.add("wrong");
              rec.tries += 1;
              if (rec.tries >= 3) rec.pts = 0;
              paint();
              persist();
            }
          });
          opts.appendChild(b);
        });

        revealBtn.addEventListener("click", function () {
          rec.revealed = true;
          rec.pts = 0;
          paint();
          persist();
        });

        box.appendChild(card);
        paint();
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
      var st = store.lessons[id] || { sections: {}, quiz: {}, practice: {} };
      var secVals = Object.keys(st.sections || {}).map(function (k) { return st.sections[k]; });
      var quizVals = Object.keys(st.quiz || {}).map(function (k) { return st.quiz[k]; });
      var pracVals = Object.keys(st.practice || {})
        .map(function (k) { return st.practice[k].pts; })
        .filter(function (v) { return v != null; });

      var items = secVals.length + quizVals.length + pracVals.length;
      var pts = secVals.concat(quizVals, pracVals).reduce(function (a, b) { return a + b; }, 0);
      var expected = 20; /* 5 section checks + 3 questions + 2 practice, each 0–2 */
      total++;
      if (items >= 10) {
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

    var labRows = [].slice.call(document.querySelectorAll("li.topic[data-lab]"));
    var labsDone = 0, labPts = 0, labMax = labRows.length * 4;
    labRows.forEach(function (row) {
      var id = row.getAttribute("data-lab");
      var st = store.lessons[id];
      var vals = st ? Object.keys(st.quiz || {}).map(function (k) { return st.quiz[k]; }) : [];
      var pts = vals.reduce(function (a, b) { return a + b; }, 0);
      var meta = row.querySelector(".topic-meta");
      if (vals.length) {
        meta.innerHTML = '<span class="badge ready">' + pts + " / 4 pts</span>";
        row.querySelector(".dot").className = "dot " + (vals.length >= 2 ? "done" : "part");
        if (vals.length >= 2) labsDone++;
      }
      labPts += pts;
    });
    var labCnt = document.querySelector("[data-labs-count]");
    if (labCnt) labCnt.textContent = labsDone + " / " + labRows.length;
    var labBar = document.querySelector("[data-labs-bar]");
    if (labBar && labMax) labBar.style.width = Math.round((labPts / labMax) * 100) + "%";

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
        lines.push("| " + id + " | " + title + " | 0/20 | 0% | – | not started |");
        return;
      }
      var secVals = Object.keys(st.sections || {}).map(function (k) { return st.sections[k]; });
      var quizVals = Object.keys(st.quiz || {}).map(function (k) { return st.quiz[k]; });
      var pracVals = Object.keys(st.practice || {})
        .map(function (k) { return st.practice[k].pts; })
        .filter(function (v) { return v != null; });
      var all = secVals.concat(quizVals, pracVals);
      var pts = all.reduce(function (a, b) { return a + b; }, 0);
      var g = gradeOf(pts, 20);
      var status = all.length >= 10 ? "complete" : all.length > 0 ? "in progress" : "not started";
      lines.push("| " + id + " | " + title + " | " + pts + "/20 | " + g.pct + "% | " + g.letter + " | " + status + " |");
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


  function esc(t) {
    return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function highlightCode() {
    var KW = /^(import|from|for|in|while|if|elif|else|def|return|class|with|as|and|or|not|None|True|False|lambda|print|range|len|yield|pass|break|continue|try|except|raise)$/;
    [].forEach.call(document.querySelectorAll("pre code"), function (block) {
      if (block.getAttribute("data-hl")) return;
      var src = block.textContent, out = "", last = 0;
      var re = /(#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?(?:[eE][-+]?\d+)?\b)|([A-Za-z_]\w*)|(\S)/g;
      var m;
      while ((m = re.exec(src))) {
        if (m.index > last) out += esc(src.slice(last, m.index));
        if (m[1]) out += '<span class="tok-c">' + esc(m[1]) + "</span>";
        else if (m[2]) out += '<span class="tok-s">' + esc(m[2]) + "</span>";
        else if (m[3]) out += '<span class="tok-n">' + esc(m[3]) + "</span>";
        else if (m[4]) {
          var w = m[4], after = src.slice(re.lastIndex, re.lastIndex + 1);
          if (KW.test(w)) out += '<span class="tok-k">' + esc(w) + "</span>";
          else if (after === "(") out += '<span class="tok-f">' + esc(w) + "</span>";
          else out += esc(w);
        } else {
          out += /[=+\-*/%<>!]/.test(m[5]) ? '<span class="tok-o">' + esc(m[5]) + "</span>" : esc(m[5]);
        }
        last = re.lastIndex;
      }
      out += esc(src.slice(last));
      block.innerHTML = out;
      block.setAttribute("data-hl", "1");
    });
  }


  function initFigureZoom() {
    [].forEach.call(document.querySelectorAll(".fig svg"), function (svg) {
      svg.addEventListener("click", function () {
        var fig = svg.closest(".fig");
        var on = fig.classList.toggle("zoomed");
        document.body.classList.toggle("zoom-lock", on);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var z = document.querySelector(".fig.zoomed");
      if (z) { z.classList.remove("zoomed"); document.body.classList.remove("zoom-lock"); }
    });
  }

  /* ---------- boot ---------- */
  highlightCode();
  initFigureZoom();
  var page = document.body.getAttribute("data-page");
  if (page === "index") initIndex();
  else if (page === "lab") initLab();
  else initLesson();
})();
