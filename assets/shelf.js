/* Book reader: covers open into a two-page spread. No dependencies. */
(function () {
  "use strict";

  var dataEl = document.querySelector(".book-data");
  if (!dataEl) return;
  var BOOKS = JSON.parse(dataEl.textContent);
  var reader = document.querySelector("[data-reader]");
  var spread = document.querySelector("[data-spread]");
  var counter = document.querySelector("[data-pagecount]");
  var current = 0, page = 0, spreads = [];

  function store() {
    return (window.Course && window.Course.store) || { lessons: {} };
  }
  function doneCount(book) {
    var s = store().lessons || {}, n = 0;
    allRows(book).forEach(function (c) {
      if (!c.planned && s[c.id] && s[c.id].sections && Object.keys(s[c.id].sections).length >= 8) n++;
    });
    return n;
  }
  function allRows(book) {
    var out = [];
    book.levels.forEach(function (l) { out = out.concat(l.rows); });
    return out;
  }
  function firstUnfinished(book) {
    var st = store().lessons || {};
    var rows = allRows(book);
    for (var i = 0; i < rows.length; i++) {
      var c = rows[i];
      if (c.planned) continue;
      if (!st[c.id] || !st[c.id].sections || Object.keys(st[c.id].sections).length < 8) return c.id;
    }
    return null;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function exLibris(book) {
    var page = el("div", "page plate");
    var frame = el("div", "plate-frame");
    frame.appendChild(el("p", "plate-kicker", "Ex libris"));
    frame.appendChild(el("p", "plate-title", book.title));
    var rule = el("span", "plate-rule");
    frame.appendChild(rule);
    frame.appendChild(el("p", "plate-meta",
      book.total + " lessons · " + book.labs + " labs · " + book.problems + " problems"));
    frame.appendChild(el("p", "plate-imprint", "AI·ML"));
    page.appendChild(frame);
    return page;
  }

  function preface(book) {
    var p = el("div", "page");
    p.appendChild(el("p", "page-kicker", "Preface"));
    p.appendChild(el("h3", null, "What you need first"));
    p.appendChild(el("p", "serif-body", book.preface[0]));
    p.appendChild(el("h3", null, "What you will be able to do"));
    p.appendChild(el("p", "serif-body", book.preface[1]));

    p.appendChild(el("p", "page-kicker gap", "Conventions"));
    var table = el("dl", "conv");
    [["Lessons", "Read once, then score the retrieval check.", book.total],
     ["Equation labs", "One symbol each, draggable figures.", book.labs],
     ["Problems", "One function, checked against hidden tests.", book.problems]]
      .forEach(function (row) {
        var dt = el("dt", null, row[0]);
        var dd = el("dd", null, row[1]);
        var num = el("span", "conv-n", String(row[2]));
        dt.appendChild(num);
        table.appendChild(dt);
        table.appendChild(dd);
      });
    p.appendChild(table);
    p.appendChild(el("p", "page-foot", doneCount(book) + " of " + book.steps + " steps done."));
    return p;
  }

  function contentsPage(book, level) {
    var p = el("div", "page");
    p.appendChild(el("p", "page-kicker", "Part " + level.roman));
    var head = el("div", "part-head");
    head.appendChild(el("h3", "part-name", level.name));
    head.appendChild(el("span", "part-count",
      doneIn(level) + " / " + level.total + " lessons"));
    p.appendChild(head);
    var startRow = level.start;
    if (startRow) {
      var a = el("a", "start-btn", "START | " + startRow.title);
      a.setAttribute("href", "../" + startRow.url);
      p.appendChild(a);
    } else {
      p.appendChild(el("span", "start-btn off", "opens in a later wave"));
    }
    var ol = el("ol", "toc");
    var here = firstUnfinished(book);
    var s = store().lessons || {};
    level.rows.forEach(function (c) {
      var li = el("li", "toc-row" + (c.planned ? " planned" : ""));
      li.appendChild(el("span", "toc-n", String(c.n)));
      var title = el(c.planned ? "span" : "a", "toc-title", c.title);
      if (!c.planned) title.setAttribute("href", "../" + c.url);
      li.appendChild(title);
      var mark = el("span", "toc-mark");
      var st = s[c.id];
      if (st && st.sections && Object.keys(st.sections).length >= 8) mark.classList.add("done");
      else if (st && st.sections && Object.keys(st.sections).length) mark.classList.add("part");
      li.appendChild(mark);
      if (c.id === here) li.appendChild(el("span", "toc-here", "here"));
      if (c.planned) li.appendChild(el("span", "toc-wave", "wave"));
      ol.appendChild(li);
    });
    p.appendChild(ol);
    return p;
  }

  function doneIn(level) {
    var s = store().lessons || {}, n = 0;
    level.rows.forEach(function (c) {
      if (!c.planned && s[c.id] && s[c.id].sections && Object.keys(s[c.id].sections).length >= 8) n++;
    });
    return n;
  }

  function build(book) {
    var pages = [];
    pages.push([exLibris(book), preface(book)]);
    var lv = book.levels;
    pages.push([contentsPage(book, lv[0]), contentsPage(book, lv[1])]);
    var third = contentsPage(book, lv[2]);
    var legend = el("div", "page");
    legend.appendChild(el("p", "page-kicker", "How a lesson works"));
    legend.appendChild(el("p", "serif-body", book.promise));
    var dl = el("dl", "conv");
    [["Why it matters", "the failure this prevents"],
     ["The core idea", "the one sentence to keep"],
     ["How it works", "the mechanism, in parts"],
     ["Worked example", "numbers, end to end"],
     ["The trap", "the wrong model, and its tell"],
     ["Retrieval", "three questions, no notes"],
     ["Build it", "a notebook you can run"],
     ["Practice", "two harder questions"]].forEach(function (row) {
      dl.appendChild(el("dt", null, row[0]));
      dl.appendChild(el("dd", null, row[1]));
    });
    legend.appendChild(dl);
    pages.push([third, legend]);
    var folio = 2;
    pages.forEach(function (pair) {
      pair.forEach(function (pg) {
        pg.appendChild(el("span", "folio", String(folio++)));
      });
    });
    return pages;
  }

  function turnCorner(kind, dir) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "page-turn " + kind;
    b.setAttribute("aria-label", dir > 0 ? "Next page" : "Previous page");
    b.addEventListener("click", function (ev) {
      ev.stopPropagation();
      if (dir > 0 && page < spreads.length - 1) { page++; render(); }
      if (dir < 0 && page > 0) { page--; render(); }
    });
    return b;
  }

  function render() {
    var book = BOOKS[current];
    spreads = build(book);
    if (page >= spreads.length) page = spreads.length - 1;
    spread.innerHTML = "";
    var left = spreads[page][0], right = spreads[page][1];
    left.classList.add("page-left");
    right.classList.add("page-right");
    spread.appendChild(left);
    spread.appendChild(right);
    if (page > 0) left.appendChild(turnCorner("prev", -1));
    if (page < spreads.length - 1) right.appendChild(turnCorner("next", 1));
    counter.textContent = (page + 1) + " / " + spreads.length;
    document.querySelector("[data-prev]").disabled = page === 0;
    document.querySelector("[data-next]").disabled = page === spreads.length - 1;
  }

  function open(i) {
    current = i; page = 0;
    render();
    reader.hidden = false;
    document.body.classList.add("reading");
    var close = reader.querySelector(".reader-nav");
    if (close) close.setAttribute("data-open-book", String(i));
  }
  function close() {
    reader.hidden = true;
    document.body.classList.remove("reading");
  }

  document.querySelectorAll("[data-open]").forEach(function (btn) {
    btn.addEventListener("click", function () { open(Number(btn.getAttribute("data-open"))); });
  });
  reader.addEventListener("click", function (ev) {
    if (ev.target.hasAttribute("data-close")) close();
  });
  document.querySelector("[data-prev]").addEventListener("click", function () {
    if (page > 0) { page--; render(); }
  });
  document.querySelector("[data-next]").addEventListener("click", function () {
    if (page < spreads.length - 1) { page++; render(); }
  });
  document.addEventListener("keydown", function (ev) {
    if (reader.hidden) return;
    if (ev.key === "Escape") close();
    if (ev.key === "ArrowLeft" && page > 0) { page--; render(); }
    if (ev.key === "ArrowRight" && page < spreads.length - 1) { page++; render(); }
  });

  window.Shelf = { open: open, close: close, books: BOOKS };
  var deep = (location.hash || "").match(/^#book-(\d+)(?:-(\d+))?$/);
  if (deep) {
    open(Math.max(0, Math.min(BOOKS.length - 1, Number(deep[1]) - 1)));
    if (deep[2]) { page = Math.max(0, Math.min(spreads.length - 1, Number(deep[2]) - 1)); render(); }
  }
})();
