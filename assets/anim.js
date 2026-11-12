/* Animation controller. Motion only where motion is the mechanism.
   Every animation: play/pause, scrub, step readout, poster frame, reduced-motion state. */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var F = window.FIG;
  if (!F) return;
  var P = F.P;

  function mk(tag, attrs, parent) { return F.mk(tag, attrs, parent); }

  function sequence() {
    var t = 5.6, lr = 0.18, out = [t];
    for (var i = 0; i < 24; i++) {
      t = t - lr * 2 * (t - 2);
      out.push(t);
    }
    return out;
  }

  var A = {
    descent: {
      seq: sequence(),
      J: function (t) { return (t - 2) * (t - 2) + 1; },
      draw: function (fig, t) {
        var svg = fig.querySelector("svg");
        var g = F.clearLayer(svg);
        var m = F.axes(g, {
          x0: -2, x1: 6, y0: 0, y1: 20,
          xticks: [-2, 0, 2, 4, 6], yticks: [0, 5, 10, 15, 20],
          xlabel: "θ  (parameter)", ylabel: "J(θ)  (loss)"
        });
        var self = this;
        var pts = [];
        for (var x = -2; x <= 6.001; x += 0.05) pts.push(m.sx(x) + "," + m.sy(self.J(x)));
        mk("polyline", { points: pts.join(" "), fill: "none", stroke: "var(--sym-param)", "stroke-width": 2.5, opacity: .45 }, g);

        var k = Math.min(this.seq.length - 1, Math.round(t * (this.seq.length - 1)));
        var trail = [];
        for (var i = 0; i <= k; i++) trail.push(m.sx(this.seq[i]) + "," + m.sy(this.J(this.seq[i])));
        if (trail.length > 1) {
          mk("polyline", { points: trail.join(" "), fill: "none", stroke: "var(--sym-pred)", "stroke-width": 2, "stroke-dasharray": "3 3" }, g);
        }
        this.seq.slice(0, k + 1).forEach(function (th, i) {
          mk("circle", { cx: m.sx(th), cy: m.sy(self.J(th)), r: i === k ? 6 : 2.5, fill: i === k ? "var(--sym-pred)" : "var(--sym-pred)", opacity: i === k ? 1 : .35 }, g);
        });

        mk("line", { x1: m.sx(2), x2: m.sx(2), y1: m.sy(1), y2: m.sy(0), stroke: "var(--sym-opt)", "stroke-dasharray": "4 4", "stroke-width": 1.5 }, g);
        mk("circle", { cx: m.sx(2), cy: m.sy(1), r: 5, fill: "var(--sym-opt)" }, g);
        mk("rect", { x: m.sx(2) + 8, y: m.sy(1) - 28, width: 70, height: 20, rx: 4, fill: "var(--card)", opacity: .92 }, g);
        F.label(g, m.sx(2) + 12, m.sy(1) - 12, "θ* = 2", "var(--sym-opt)", 12);

        var read = fig.querySelector("[data-out='step']");
        if (read) read.textContent = "step " + k + " / " + (this.seq.length - 1) + "  ·  θ = " + this.seq[k].toFixed(2) + "  ·  J = " + this.J(this.seq[k]).toFixed(2);
      }
    }
  };


  A.flow = {
    draw: function (fig, t) {
      var svg = fig.querySelector("svg");
      var raw = fig.querySelector(".flow-data");
      var spec;
      try { spec = JSON.parse(raw.textContent); } catch (e) { return; }
      raw.style.display = "none";
      var g = F.clearLayer(svg);
      var steps = spec.steps || [];
      var n = steps.length;
      var k = Math.min(n - 1, Math.round(t * (n - 1)));
      var w = Math.min(150, (P.r - P.l - (n - 1) * 24) / n);
      var gap = 24;
      var total = n * w + (n - 1) * gap;
      var x = (720 - total) / 2;
      var y = 150;
      steps.forEach(function (label, i) {
        var on = i === k, done = i < k;
        mk("rect", {
          x: x, y: y, width: w, height: 64, rx: 8,
          fill: on ? "var(--sym-pred)" : "var(--card)",
          "fill-opacity": on ? .14 : 1,
          stroke: on ? "var(--sym-pred)" : "var(--rule)",
          "stroke-width": on ? 2.2 : 1.2
        }, g);
        var tx = mk("text", {
          x: x + w / 2, y: y + 38, "text-anchor": "middle", "font-size": 14,
          fill: on ? "var(--sym-pred)" : (done ? "var(--ink)" : "var(--ink-faint)"),
          "font-family": "ui-monospace, monospace"
        }, g);
        tx.textContent = label;
        if (i < n - 1) {
          F.arrow(g, x + w + 4, y + 32, x + w + gap - 4, y + 32,
            i < k ? "var(--sym-pred)" : "var(--ink-faint)", 1.4);
        }
        x += w + gap;
      });
      var out = fig.querySelector("[data-out='step']");
      if (out) out.textContent = "stage " + (k + 1) + " / " + n + "  ·  " + (spec.note || "");
    }
  };

  function init(fig) {
    var name = fig.getAttribute("data-anim");
    var anim = A[name];
    if (!anim) return;
    var play = fig.querySelector("[data-play]");
    var scrub = fig.querySelector("[data-scrub]");
    var raf = null, start = 0, running = false, pos = 0;

    function render(t) {
      pos = t;
      anim.draw(fig, t);
      if (scrub) scrub.value = Math.round(t * 100);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      if (play) { play.textContent = "Play"; play.setAttribute("data-playing", "false"); }
    }

    function tick(ts) {
      if (!running) return;
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / 5000);
      render(t);
      if (t >= 1) { stop(); return; }
      raf = requestAnimationFrame(tick);
    }

    if (play) {
      play.addEventListener("click", function () {
        if (running) { stop(); return; }
        running = true;
        start = 0;
        if (pos >= 1) render(0);
        play.textContent = "Pause";
        play.setAttribute("data-playing", "true");
        raf = requestAnimationFrame(tick);
      });
    }

    if (scrub) {
      scrub.addEventListener("input", function () {
        stop();
        render(Number(scrub.value) / 100);
      });
    }

    var reset = fig.querySelector("[data-reset]");
    if (reset) reset.addEventListener("click", function () { stop(); render(0); });

    if (reduced) {
      if (play) play.hidden = true;
      render(1);
    } else {
      render(0);
    }
    fig._render = render;
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-anim]").forEach(init);
  });
})();
