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

  window.FIG = { mk: mk, clearLayer: clearLayer, axes: axes, arrow: arrow, label: label, fmt: fmt, P: P, reduced: reduced, renderers: R };

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-graph]").forEach(function (fig) {
      var fn = R[fig.getAttribute("data-graph")];
      if (fn) fn(fig);
    });
  });
})();
