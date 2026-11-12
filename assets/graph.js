/* Interactive SVG figures. No dependencies. Each figure declares data-graph="name". */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var P = { l: 64, r: 700, t: 24, b: 300 };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function mk(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function clearLayer(svg) {
    var g = svg.querySelector("[data-layer]");
    if (!g) { g = mk("g", { "data-layer": "" }, svg); }
    while (g.firstChild) g.removeChild(g.firstChild);
    return g;
  }

  function fmt(v, d) {
    if (Math.abs(v) < 1e-9) v = 0;
    return v.toFixed(d == null ? 2 : d);
  }

  function axes(g, o) {
    var sx = function (x) { return P.l + ((x - o.x0) / (o.x1 - o.x0)) * (P.r - P.l); };
    var sy = function (y) { return P.b - ((y - o.y0) / (o.y1 - o.y0)) * (P.b - P.t); };

    (o.yticks || []).forEach(function (t) {
      mk("line", { x1: P.l, x2: P.r, y1: sy(t), y2: sy(t), stroke: "var(--rule)", "stroke-dasharray": "3 4", opacity: .5 }, g);
      mk("text", { x: P.l - 8, y: sy(t) + 4, "text-anchor": "end", "font-size": 11, fill: "var(--ink-faint)", "font-family": "ui-monospace, monospace" }, g).textContent = t;
    });
    (o.xticks || []).forEach(function (t) {
      mk("line", { x1: sx(t), x2: sx(t), y1: P.t, y2: P.b, stroke: "var(--rule)", "stroke-dasharray": "3 4", opacity: .5 }, g);
      mk("text", { x: sx(t), y: P.b + 16, "text-anchor": "middle", "font-size": 11, fill: "var(--ink-faint)", "font-family": "ui-monospace, monospace" }, g).textContent = o.xtickFormat ? o.xtickFormat(t) : t;
    });

    mk("line", { x1: P.l, x2: P.r, y1: P.b, y2: P.b, stroke: "var(--ink-faint)", "stroke-width": 1 }, g);
    mk("line", { x1: P.l, x2: P.l, y1: P.t, y2: P.b, stroke: "var(--ink-faint)", "stroke-width": 1 }, g);

    mk("text", { x: P.r, y: P.b + 34, "text-anchor": "end", "font-size": 12, fill: "var(--ink-soft)", "font-family": "ui-monospace, monospace" }, g).textContent = o.xlabel || "";
    mk("text", { x: P.l - 10, y: P.t - 6, "text-anchor": "start", "font-size": 12, fill: "var(--ink-soft)", "font-family": "ui-monospace, monospace" }, g).textContent = o.ylabel || "";
    return { sx: sx, sy: sy };
  }

  function clipId(svg) {
    var id = svg.id || (svg.id = "fig" + Math.random().toString(36).slice(2, 8));
    if (!svg.querySelector("defs")) {
      var defs = mk("defs", {}, svg);
      var cp = mk("clipPath", { id: id + "-clip" }, defs);
      mk("rect", { x: P.l, y: P.t, width: P.r - P.l, height: P.b - P.t }, cp);
    }
    return id + "-clip";
  }

  function arrow(g, x1, y1, x2, y2, color, width) {
    var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    var ux = dx / len, uy = dy / len, head = 9;
    mk("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color, "stroke-width": width || 2.5, "stroke-linecap": "round" }, g);
    mk("polygon", {
      points: [
        x2 + "," + y2,
        (x2 - ux * head - uy * head * .55) + "," + (y2 - uy * head + ux * head * .55),
        (x2 - ux * head + uy * head * .55) + "," + (y2 - uy * head - ux * head * .55)
      ].join(" "),
      fill: color
    }, g);
  }

  function label(g, x, y, text, color, size) {
    var t = mk("text", { x: x, y: y, "font-size": size || 12, fill: color, "font-family": "ui-monospace, monospace" }, g);
    t.textContent = text;
    return t;
  }

  var R = {};

  /* dot product: rotate w, watch the projection */
  R.dot = function (fig) {
    var svg = fig.querySelector("svg");
    var angle = fig.querySelector('[data-k="angle"]');
    var lenIn = fig.querySelector('[data-k="len"]');
    var out = fig.querySelector('[data-out="dot"]');
    var cosOut = fig.querySelector('[data-out="cos"]');

    function draw() {
      var g = clearLayer(svg);
      var A = Number(angle.value), L = Number(lenIn.value);
      var ra = (A * Math.PI) / 180;
      var rx = 0;
      var xLen = 1.8;

      var ox = 382, oy = 170, scale = 100;
      var pt = function (ang, r) { return [ox + Math.cos(ang) * r * scale, oy - Math.sin(ang) * r * scale]; };

      var xv = pt(rx, xLen), wv = pt(ra, L);
      var cosd = Math.cos((A * Math.PI) / 180);
      var dot = xLen * L * cosd;

      mk("line", { x1: 90, x2: 674, y1: oy, y2: oy, stroke: "var(--rule)", "stroke-width": 1 }, g);
      mk("line", { x1: ox, x2: ox, y1: 34, y2: 306, stroke: "var(--rule)", "stroke-width": 1 }, g);

      // projection of x onto w
      var wx = Math.cos(ra), wy = Math.sin(ra);
      var proj = dot / (L || 1);
      var pv = pt(ra, Math.max(0, proj));
      mk("line", { x1: xv[0], y1: xv[1], x2: pv[0], y2: pv[1], stroke: "var(--sym-data)", "stroke-dasharray": "4 4", "stroke-width": 1.5, opacity: .8 }, g);
      mk("circle", { cx: pv[0], cy: pv[1], r: 4, fill: "var(--sym-data)" }, g);

      arrow(g, ox, oy, xv[0], xv[1], "var(--sym-data)", 2.5);
      arrow(g, ox, oy, wv[0], wv[1], "var(--sym-param)", 3);
      label(g, xv[0] + 8, xv[1] - 8, "x (data)", "var(--sym-data)");
      var lx = ox + (wv[0] - ox) * 0.55 + 8;
      var ly = oy + (wv[1] - oy) * 0.55 - 10;
      mk("rect", { x: lx - 4, y: ly - 13, width: 78, height: 18, rx: 3, fill: "var(--card)", opacity: .9 }, g);
      label(g, lx, ly, "w (" + fmt(A, 0) + "°)", "var(--sym-param)");
      label(g, ox + 8, oy + 18, "θ", "var(--ink-faint)");

      if (out) out.textContent = "x·w = " + fmt(dot);
      if (cosOut) cosOut.textContent = "cos = " + fmt(cosd, 2);
    }

    [angle, lenIn].forEach(function (i) { i.addEventListener("input", draw); });
    fig.querySelector("button[type=reset]").addEventListener("click", function () {
      angle.value = 40; lenIn.value = 1.2; draw();
    });
    draw();
  };

  /* squared error: drag the prediction */
  R.loss = function (fig) {
    var svg = fig.querySelector("svg");
    var input = fig.querySelector('[data-k="pred"]');
    var out = fig.querySelector('[data-out="loss"]');
    var res = fig.querySelector('[data-out="res"]');
    var Y = 10, X0 = 0, X1 = 20;

    function draw() {
      var g = clearLayer(svg);
      var yhat = Number(input.value);
      var m = axes(g, {
        x0: X0, x1: X1, y0: 0, y1: 1,
        xticks: [0, 5, 10, 15, 20], yticks: [],
        xlabel: "prediction ŷ  (truth y = 10)", ylabel: ""
      });
      var base = 250, unit = 13;
      mk("line", { x1: m.sx(X0), x2: m.sx(X1), y1: base, y2: base, stroke: "var(--ink-faint)", "stroke-width": 1 }, g);

      // truth marker
      mk("line", { x1: m.sx(Y), x2: m.sx(Y), y1: base - 90, y2: base, stroke: "var(--sym-data)", "stroke-width": 2 }, g);
      label(g, m.sx(Y) + 6, base - 96, "y = 10", "var(--sym-data)");

      // prediction marker
      mk("line", { x1: m.sx(yhat), x2: m.sx(yhat), y1: base - 90, y2: base, stroke: "var(--sym-pred)", "stroke-width": 2 }, g);
      label(g, m.sx(yhat) + 6, base - 96, "ŷ = " + fmt(yhat, 1), "var(--sym-pred)");

      // residual bracket
      var r = Y - yhat;
      if (Math.abs(r) > 0.05) {
        var left = Math.min(m.sx(Y), m.sx(yhat));
        mk("line", { x1: left, x2: left + Math.abs(m.sx(Y) - m.sx(yhat)), y1: base - 46, y2: base - 46, stroke: "var(--sym-loss)", "stroke-width": 2 }, g);
        mk("line", { x1: left, x2: left, y1: base - 52, y2: base - 40, stroke: "var(--sym-loss)", "stroke-width": 2 }, g);
        mk("line", { x1: left + Math.abs(m.sx(Y) - m.sx(yhat)), x2: left + Math.abs(m.sx(Y) - m.sx(yhat)), y1: base - 52, y2: base - 40, stroke: "var(--sym-loss)", "stroke-width": 2 }, g);
        label(g, left + 4, base - 54, "residual " + fmt(r, 1), "var(--sym-loss)", 11);
      }

      // square whose side is the residual
      var side = Math.min(Math.abs(r) * unit, 150);
      if (side > 2) {
        var sq = mk("rect", {
          x: Math.min(m.sx(Y), m.sx(yhat)), y: base - side, width: side, height: side,
          fill: "var(--sym-loss)", opacity: .18, stroke: "var(--sym-loss)", "stroke-width": 1.5
        }, g);
      }

      if (out) out.textContent = "L = (y − ŷ)² = " + fmt(r * r, 1);
      if (res) res.textContent = "residual = " + fmt(r, 1);
    }

    input.addEventListener("input", draw);
    fig.querySelector("button[type=reset]").addEventListener("click", function () { input.value = 7; draw(); });
    draw();
  };

  /* argmin: move theta, read (theta, J) */
  R.argmin = function (fig) {
    var svg = fig.querySelector("svg");
    var input = fig.querySelector('[data-k="theta"]');
    var out = fig.querySelector('[data-out="pair"]');
    var J = function (t) { return (t - 2) * (t - 2) + 1; };

    function draw() {
      var g = clearLayer(svg);
      var m = axes(g, {
        x0: -2, x1: 6, y0: 0, y1: 20,
        xticks: [-2, 0, 2, 4, 6], yticks: [0, 5, 10, 15, 20],
        xlabel: "θ  (parameter)", ylabel: "J(θ)  (loss)"
      });
      var pts = [];
      for (var t = -2; t <= 6.001; t += 0.05) pts.push(m.sx(t) + "," + m.sy(J(t)));
      mk("polyline", { points: pts.join(" "), fill: "none", stroke: "var(--sym-param)", "stroke-width": 2.5 }, g);

      var t0 = Number(input.value);
      mk("line", { x1: m.sx(2), x2: m.sx(2), y1: m.sy(1), y2: m.sy(0), stroke: "var(--sym-opt)", "stroke-dasharray": "4 4", "stroke-width": 1.5 }, g);
      mk("circle", { cx: m.sx(2), cy: m.sy(1), r: 5, fill: "var(--sym-opt)" }, g);
      mk("rect", { x: m.sx(2) + 8, y: m.sy(1) - 28, width: 132, height: 20, rx: 4, fill: "var(--card)", opacity: .92 }, g);
      label(g, m.sx(2) + 12, m.sy(1) - 12, "θ* = 2, J* = 1", "var(--sym-opt)", 12);

      mk("line", { x1: m.sx(t0), x2: m.sx(t0), y1: m.sy(J(t0)), y2: m.sy(0), stroke: "var(--sym-pred)", "stroke-dasharray": "3 4", "stroke-width": 1.5 }, g);
      mk("line", { x1: m.sx(-2), x2: m.sx(t0), y1: m.sy(J(t0)), y2: m.sy(J(t0)), stroke: "var(--sym-pred)", "stroke-dasharray": "3 4", "stroke-width": 1.5 }, g);
      mk("circle", { cx: m.sx(t0), cy: m.sy(J(t0)), r: 6, fill: "var(--sym-pred)" }, g);

      if (out) out.textContent = "θ = " + fmt(t0, 1) + "  →  J = " + fmt(J(t0), 2);
    }

    input.addEventListener("input", draw);
    fig.querySelector("button[type=reset]").addEventListener("click", function () { input.value = 4; draw(); });
    draw();
    fig._drawArgmin = draw;
  };


  /* static: squared vs absolute loss */
  R["loss-curve"] = function (fig) {
    var svg = fig.querySelector("svg");
    var g = clearLayer(svg);
    var m = axes(g, {
      x0: -5, x1: 5, y0: 0, y1: 25,
      xticks: [-5, -3, -1, 1, 3, 5], yticks: [0, 5, 10, 15, 20, 25],
      xlabel: "residual  (ŷ − y)", ylabel: "loss"
    });
    var q = [], a = [];
    for (var r = -5; r <= 5.001; r += 0.1) {
      q.push(m.sx(r) + "," + m.sy(r * r));
      a.push(m.sx(r) + "," + m.sy(Math.abs(r)));
    }
    mk("polyline", { points: a.join(" "), fill: "none", stroke: "var(--sym-data)", "stroke-width": 1.8, "stroke-dasharray": "5 4" }, g);
    mk("polyline", { points: q.join(" "), fill: "none", stroke: "var(--sym-loss)", "stroke-width": 2.8 }, g);
    label(g, m.sx(3.1), m.sy(9.8), "squared", "var(--sym-loss)", 12);
    label(g, m.sx(2.4), m.sy(2.2), "absolute", "var(--sym-data)", 12);
  };


  /* line fit: data fixed, parameters move the line */
  R.linefit = function (fig) {
    var svg = fig.querySelector("svg");
    var wIn = fig.querySelector('[data-k="w"]');
    var bIn = fig.querySelector('[data-k="b"]');
    var out = fig.querySelector('[data-out="fit"]');
    var XS = [0, 2, 4], YS = [1, 5, 9];

    function draw() {
      var g = clearLayer(svg);
      var w = Number(wIn.value), b = Number(bIn.value);
      var m = axes(g, { x0: -0.5, x1: 4.5, y0: -2, y1: 11, xticks: [0, 1, 2, 3, 4], yticks: [0, 5, 10], xlabel: "x  (feature)", ylabel: "y  (target)" });

      var pts = [];
      for (var x = -0.5; x <= 4.501; x += 0.1) pts.push(m.sx(x) + "," + m.sy(w * x + b));
      mk("polyline", { points: pts.join(" "), fill: "none", stroke: "var(--sym-pred)", "stroke-width": 2.5 }, g);

      var hi = fig.getAttribute("data-point");
      XS.forEach(function (x, i) {
        var on = hi !== null && Number(hi) === i;
        mk("circle", { cx: m.sx(x), cy: m.sy(YS[i]), r: on ? 9 : 6, fill: on ? "var(--sym-pred)" : "var(--sym-data)" }, g);
        if (on) label(g, m.sx(x) + 12, m.sy(YS[i]) + 22, "x" + String.fromCharCode(7522), "var(--sym-pred)", 11);
      });
      label(g, m.sx(0) + 8, m.sy(YS[0]) + 18, "data (fixed)", "var(--sym-data)", 11);
      label(g, m.sx(3.2), m.sy(w * 3.2 + b) - 12, "ŷ = wx + b", "var(--sym-pred)", 12);
      if (out) out.textContent = "ŷ = " + fmt(w, 1) + "x + " + fmt(b, 1);
    }

    [wIn, bIn].forEach(function (i) { i.addEventListener("input", draw); });
    fig.querySelector("button[type=reset]").addEventListener("click", function () {
      wIn.value = 2; bIn.value = 1; draw();
    });
    draw();
  };

  /* sum: toggle examples, watch the total */
  R.sum = function (fig) {
    var svg = fig.querySelector("svg");
    var out = fig.querySelector('[data-out="total"]');
    var boxes = [].slice.call(fig.querySelectorAll('[data-k="row"]'));
    var LOSSES = [9, 4, 1, 16];

    function draw() {
      var g = clearLayer(svg);
      var base = 280, unit = 12, x = 120;
      var total = 0;
      mk("line", { x1: 80, x2: 660, y1: base, y2: base, stroke: "var(--ink-faint)", "stroke-width": 1 }, g);
      LOSSES.forEach(function (v, i) {
        var on = boxes[i].checked;
        if (on) total += v;
        var h = v * unit;
        mk("rect", { x: x, y: base - (on ? h : 0), width: 70, height: on ? h : 0, fill: "var(--sym-loss)", opacity: on ? .75 : .12, rx: 3 }, g);
        mk("text", { x: x + 35, y: base + 18, "text-anchor": "middle", "font-size": 11, fill: "var(--ink-faint)", "font-family": "ui-monospace, monospace" }, g).textContent = "x" + (i + 1);
        if (on) {
          mk("text", { x: x + 35, y: base - h - 8, "text-anchor": "middle", "font-size": 12, fill: "var(--sym-loss)", "font-family": "ui-monospace, monospace" }, g).textContent = v;
        }
        x += 130;
      });
      if (out) out.textContent = "Σ = " + total;
    }

    boxes.forEach(function (b) { b.addEventListener("change", draw); });
    fig.querySelector("button[type=reset]").addEventListener("click", function () {
      boxes.forEach(function (b) { b.checked = true; }); draw();
    });
    draw();
  };

  /* average: sum grows with n, the mean does not */
  R.average = function (fig) {
    var svg = fig.querySelector("svg");
    var nIn = fig.querySelector('[data-k="n"]');
    var outSum = fig.querySelector('[data-out="sum"]');
    var outAvg = fig.querySelector('[data-out="avg"]');

    function draw() {
      var g = clearLayer(svg);
      var n = Number(nIn.value), mean = 1.5;
      var base = 290, avgH = 46, sumH = 14 + (n / 100) * 210;
      mk("line", { x1: 90, x2: 650, y1: base, y2: base, stroke: "var(--ink-faint)" }, g);

      mk("rect", { x: 170, y: base - sumH, width: 90, height: sumH, fill: "var(--sym-loss)", opacity: .65, rx: 3 }, g);
      label(g, 215, base + 20, "sum", "var(--ink-soft)", 12);
      label(g, 215, base - sumH - 10, (mean * n).toFixed(1), "var(--sym-loss)", 12);

      mk("rect", { x: 420, y: base - avgH, width: 90, height: avgH, fill: "var(--sym-opt)", opacity: .65, rx: 3 }, g);
      label(g, 465, base + 20, "mean", "var(--ink-soft)", 12);
      label(g, 465, base - avgH - 10, mean.toFixed(2), "var(--sym-opt)", 12);

      mk("line", { x1: 380, x2: 380, y1: 40, y2: base, stroke: "var(--rule)", "stroke-dasharray": "3 4" }, g);
      label(g, 392, 58, "same data, n rows", "var(--ink-faint)", 11);

      if (outSum) outSum.textContent = "Σ = " + (mean * n).toFixed(1);
      if (outAvg) outAvg.textContent = "mean = " + mean.toFixed(2);
    }

    nIn.addEventListener("input", draw);
    fig.querySelector("button[type=reset]").addEventListener("click", function () { nIn.value = 10; draw(); });
    draw();
  };

  /* optimal: the bottom moves with the data */
  R.optimal = function (fig) {
    var svg = fig.querySelector("svg");
    var btns = [].slice.call(fig.querySelectorAll('[data-k="dataset"]'));
    var out = fig.querySelector('[data-out="opt"]');
    var SETS = [
      { mu: 2, floor: 1, name: "dataset A" },
      { mu: 4, floor: 2.5, name: "dataset B" }
    ];
    var cur = 0;

    function J(t, set) { return (t - set.mu) * (t - set.mu) + set.floor; }

    function draw() {
      var g = clearLayer(svg);
      var m = axes(g, { x0: -1, x1: 7, y0: 0, y1: 14, xticks: [0, 2, 4, 6], yticks: [0, 5, 10], xlabel: "θ  (parameter)", ylabel: "J(θ)" });
      var cg = mk("g", { "clip-path": "url(#" + clipId(svg) + ")" }, g);
      SETS.forEach(function (set, i) {
        var pts = [];
        for (var t = -1; t <= 7.001; t += 0.05) pts.push(m.sx(t) + "," + m.sy(J(t, set)));
        mk("polyline", {
          points: pts.join(" "), fill: "none",
          stroke: i === cur ? "var(--sym-param)" : "var(--ink-faint)",
          "stroke-width": i === cur ? 2.6 : 1.8,
          "stroke-dasharray": i === cur ? "none" : "5 4",
          opacity: i === cur ? 1 : 0.55
        }, cg);
      });
      var set = SETS[cur];
      mk("circle", { cx: m.sx(set.mu), cy: m.sy(set.floor), r: 6, fill: "var(--sym-opt)" }, g);

      var legend = set.name + ":  θ* = " + set.mu + "   J* = " + set.floor;
      mk("rect", { x: P.l + 10, y: P.t + 8, width: 210, height: 26, rx: 4, fill: "var(--card)", opacity: .94, stroke: "var(--rule)" }, g);
      mk("circle", { cx: P.l + 24, cy: P.t + 21, r: 4.5, fill: "var(--sym-opt)" }, g);
      label(g, P.l + 36, P.t + 25, legend, "var(--sym-opt)", 11);
      if (out) out.textContent = set.name + " · θ = " + set.mu + " → J = " + set.floor;
    }

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        cur = Number(b.getAttribute("data-v"));
        btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        draw();
      });
      b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-v")) === cur));
    });
    draw();
  };

  /* contour: the landscape of the whole objective */
  R.contour = function (fig) {
    var svg = fig.querySelector("svg");
    var g = clearLayer(svg);
    var m = axes(g, { x0: 0, x1: 4, y0: -1, y1: 3, xticks: [0, 1, 2, 3, 4], yticks: [-1, 0, 1, 2, 3], xlabel: "w  (weight)", ylabel: "b  (bias)" });
    var cx = m.sx(2), cy = m.sy(1), rx = 60, ry = 45;
    [0.6, 1, 1.6, 2.4].forEach(function (k, i) {
      var rxx = rx * k, ryy = ry * k;
      var path = "M" + (cx - rxx) + "," + cy + " a" + rxx + "," + ryy + " 0 1,0 " + (2 * rxx) + ",0 a" + rxx + "," + ryy + " 0 1,0 " + (-2 * rxx) + ",0";
      mk("path", { d: path, fill: "none", stroke: "var(--sym-loss)", "stroke-width": 1, opacity: .5 - i * 0.09 }, g);
    });
    var path = [];
    var w = 0.6, b = 2.7;
    for (var i = 0; i < 30; i++) {
      path.push(m.sx(w) + "," + m.sy(b));
      w += 0.22 * (2 - w);
      b += 0.22 * (1 - b);
    }
    mk("polyline", { points: path.join(" "), fill: "none", stroke: "var(--sym-pred)", "stroke-width": 2, "stroke-dasharray": "4 4" }, g);
    mk("circle", { cx: m.sx(2), cy: m.sy(1), r: 6, fill: "var(--sym-opt)" }, g);
    label(g, m.sx(2) + 10, m.sy(1) - 12, "θ* = (2, 1)", "var(--sym-opt)", 12);
    label(g, m.sx(0.55), m.sy(2.75) - 10, "start", "var(--sym-pred)", 11);
  };


  /* pipeline: one example through prediction and loss */
  R.pipeline = function (fig) {
    var svg = fig.querySelector("svg");
    var g = clearLayer(svg);
    var boxes = [
      { t: "xᵢ", c: "var(--sym-data)", s: "one row" },
      { t: "f_θ", c: "var(--sym-pred)", s: "model" },
      { t: "ŷᵢ", c: "var(--sym-pred)", s: "prediction" },
      { t: "L", c: "var(--sym-loss)", s: "price" },
      { t: "ℓᵢ", c: "var(--sym-loss)", s: "one loss" }
    ];
    var w = 104, gap = 34, x = (720 - (boxes.length * w + (boxes.length - 1) * gap)) / 2;
    boxes.forEach(function (b, i) {
      mk("rect", { x: x, y: 132, width: w, height: 78, rx: 8, fill: "var(--card)", stroke: b.c, "stroke-width": 1.6 }, g);
      var t = mk("text", { x: x + w / 2, y: 168, "text-anchor": "middle", "font-size": 20, fill: b.c, "font-family": "ui-monospace, monospace" }, g);
      t.textContent = b.t;
      var s2 = mk("text", { x: x + w / 2, y: 192, "text-anchor": "middle", "font-size": 11, fill: "var(--ink-faint)", "font-family": "ui-monospace, monospace" }, g);
      s2.textContent = b.s;
      if (i < boxes.length - 1) {
        arrow(g, x + w + 5, 171, x + w + gap - 6, 171, "var(--ink-faint)", 1.6);
      }
      x += w + gap;
    });
    label(g, 360, 78, "one example in, one number out", "var(--ink-faint)", 12);
  };


  /* generic curve: declarative JSON, optional sliders */
  R.curve = function (fig) {
    var svg = fig.querySelector("svg");
    var raw = fig.querySelector(".curve-data");
    var spec;
    try { spec = JSON.parse(raw.textContent); } catch (e) { return; }
    raw.style.display = "none";

    var controls = spec.controls || [];
    var params = {};
    controls.forEach(function (c) { params[c.k] = c.value == null ? c.min : c.value; });

    var ctr = fig.querySelector(".fig-controls");
    if (ctr) {
      ctr.textContent = "";
      controls.forEach(function (c) {
        var lab = document.createElement("label");
        lab.textContent = c.label + " ";
        var inp = document.createElement("input");
        inp.type = "range"; inp.min = c.min; inp.max = c.max;
        inp.step = c.step || 0.1; inp.value = params[c.k];
        inp.setAttribute("data-k", c.k);
        inp.addEventListener("input", function () { params[c.k] = Number(inp.value); draw(); });
        lab.appendChild(inp);
        ctr.appendChild(lab);
      });
      var out = document.createElement("output");
      out.setAttribute("aria-live", "polite");
      out.setAttribute("data-out", "val");
      ctr.appendChild(out);
      var reset = document.createElement("button");
      reset.type = "reset"; reset.textContent = "Reset";
      reset.addEventListener("click", function () {
        controls.forEach(function (c) {
          params[c.k] = c.value == null ? c.min : c.value;
          var i = ctr.querySelector('[data-k="' + c.k + '"]');
          if (i) i.value = params[c.k];
        });
        draw();
      });
      ctr.appendChild(reset);
    }

    function fn(x) {
      var p = params;
      switch (spec.kind) {
        case "quadratic": return Math.pow(x - p.mu, 2) + p.floor;
        case "line": return p.w * x + p.b;
        case "square": return Math.pow(p.k * x, 2);
        case "abs": return p.k * Math.abs(x);
        case "expdecay": return Math.pow(p.base, x);
        case "sigmoid": return 1 / (1 + Math.exp(-p.k * x));
        case "logp": return -Math.log(x);
        case "relu": return Math.max(0, x);
        case "gini": return 2 * x * (1 - x);
        default: return 0;
      }
    }

    function draw() {
      var g = clearLayer(svg);
      var m = axes(g, {
        x0: spec.x[0], x1: spec.x[1], y0: spec.y[0], y1: spec.y[1],
        xticks: spec.xticks || null, yticks: spec.yticks || null,
        xlabel: spec.xlabel || "", ylabel: spec.ylabel || ""
      });
      var pts = [];
      for (var x = spec.x[0]; x <= spec.x[1] + 1e-9; x += (spec.x[1] - spec.x[0]) / 240) {
        var y = fn(x);
        if (y < spec.y[0] - 1e-9 || y > spec.y[1] + 1e-9) { pts.push(""); continue; }
        pts.push(m.sx(x) + "," + m.sy(y));
      }
      // split on gaps
      var seg = [], id = "c" + Math.random().toString(36).slice(2, 7);
      var defs = svg.querySelector("defs") || mk("defs", {}, svg);
      var cp = mk("clipPath", { id: id }, defs);
      mk("rect", { x: P.l, y: P.t, width: P.r - P.l, height: P.b - P.t }, cp);
      var cg = mk("g", { "clip-path": "url(#" + id + ")" }, g);
      mk("polyline", { points: pts.filter(Boolean).join(" "), fill: "none", stroke: "var(--sym-param)", "stroke-width": 2.6 }, cg);

      if (spec.marker) {
        var mx = params[spec.marker];
        var my = fn(mx);
        if (my >= spec.y[0] && my <= spec.y[1]) {
          mk("circle", { cx: m.sx(mx), cy: m.sy(my), r: 6, fill: "var(--sym-pred)" }, g);
          mk("line", { x1: m.sx(mx), x2: m.sx(mx), y1: m.sy(my), y2: m.sy(spec.y[0]), stroke: "var(--sym-pred)", "stroke-dasharray": "3 4" }, g);
        }
      }
      var out = fig.querySelector('[data-out="val"]');
      if (out) {
        var bits = controls.map(function (c) { return c.k + " = " + fmt(params[c.k], 2); });
        if (spec.marker) bits.push("y = " + fmt(fn(params[spec.marker]), 2));
        out.textContent = bits.join("  ·  ");
      }
    }
    draw();
  };

  /* generic bars */
  R.bars = function (fig) {
    var svg = fig.querySelector("svg");
    var raw = fig.querySelector(".bars-data");
    var spec;
    try { spec = JSON.parse(raw.textContent); } catch (e) { return; }
    raw.style.display = "none";
    var g = clearLayer(svg);
    var vals = spec.values, labels = spec.labels || [], max = spec.max || Math.max.apply(null, vals) * 1.2;
    var base = 290, top = 40, n = vals.length;
    var slot = (P.r - P.l) / n;
    var bw = Math.min(80, slot * 0.6);
    mk("line", { x1: P.l, x2: P.r, y1: base, y2: base, stroke: "var(--ink-faint)" }, g);
    vals.forEach(function (v, i) {
      var x = P.l + slot * i + (slot - bw) / 2;
      var h = (v / max) * (base - top);
      var hot = spec.highlight === i;
      mk("rect", {
        x: x, y: base - h, width: bw, height: h, rx: 4,
        fill: hot ? "var(--sym-pred)" : "var(--sym-loss)",
        opacity: hot ? .9 : .7
      }, g);
      label(g, x + bw / 2, base - h - 8, String(v), "var(--ink-soft)", 12);
      if (labels[i]) label(g, x + bw / 2, base + 18, labels[i], "var(--ink-faint)", 11);
    });
    if (spec.ylabel) label(g, P.l - 10, P.t - 6, spec.ylabel, "var(--ink-soft)", 12);
  };


  /* three learning rates stepping on the same bowl */
  R.steps = function (fig) {
    var svg = fig.querySelector("svg");
    var raw = fig.querySelector(".steps-data");
    var spec;
    try { spec = JSON.parse(raw.textContent); } catch (e) { return; }
    raw.style.display = "none";
    var g = clearLayer(svg);
    var rates = spec.rates || [0.05, 0.3, 1.0];
    var start = spec.start == null ? 3 : spec.start;
    var n = spec.steps || 8;
    var m = axes(g, { x0: 0, x1: n, y0: 0, y1: start * start * 1.1, xticks: [0, 2, 4, 6, 8], yticks: [0, 3, 6, 9], xlabel: "step", ylabel: "loss w²" });
    var colors = ["var(--sym-opt)", "var(--sym-pred)", "var(--sym-param)"];
    rates.forEach(function (lr, i) {
      var w = start, pts = [];
      for (var k = 0; k <= n; k++) {
        pts.push(m.sx(k) + "," + m.sy(w * w));
        w = w - lr * 2 * w;
      }
      mk("polyline", { points: pts.join(" "), fill: "none", stroke: colors[i % 3], "stroke-width": 2.4 }, g);
      label(g, m.sx(n) - 46, m.sy(Math.pow(w, 2)) - 8, "η=" + lr, colors[i % 3], 11);
    });
  };

  window.FIG = { mk: mk, clearLayer: clearLayer, axes: axes, arrow: arrow, label: label, fmt: fmt, P: P, reduced: reduced, renderers: R };

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-graph]").forEach(function (fig) {
      var fn = R[fig.getAttribute("data-graph")];
      if (fn) fn(fig);
    });
  });
})();
