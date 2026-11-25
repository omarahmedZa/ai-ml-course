/* Problem pages: verify a CLI token, store the score, filter the hub. */
(function () {
  "use strict";
  var SALT = "ai35-problems-v1";

  function b64urlDecode(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }
  function parse(token) {
    var parts = String(token || "").trim().split("~");
    if (parts.length !== 2) return null;
    var raw;
    try { raw = b64urlDecode(parts[0]); } catch (e) { return null; }
    var payload;
    try { payload = JSON.parse(new TextDecoder().decode(raw)); } catch (e) { return null; }
    if (!payload || payload.v !== 1 || !payload.id) return null;
    return { raw: raw, sig: parts[1], payload: payload };
  }
  function verify(token) {
    var t = parse(token);
    if (!t) return Promise.resolve(null);
    var data = new Uint8Array(t.raw.length + SALT.length);
    data.set(t.raw, 0);
    for (var i = 0; i < SALT.length; i++) data[t.raw.length + i] = SALT.charCodeAt(i);
    return crypto.subtle.digest("SHA-256", data).then(function (buf) {
      return hex(buf).slice(0, 8) === t.sig ? t.payload : null;
    }).catch(function () { return null; });
  }

  function store() { return (window.Course && window.Course.store) || null; }

  function apply(payload) {
    var s = store();
    if (!s) return false;
    var old = s.problems[payload.id] || {};
    var keep = (old.score || 0) > (payload.score || 0);
    s.problems[payload.id] = {
      score: keep ? old.score : payload.score,
      attempts: Math.max(old.attempts || 0, payload.attempt || 1),
      best_attempt: keep ? old.best_attempt : payload.attempt,
      visible: payload.vis ? payload.vis.join("/") : old.visible,
      hidden: payload.hid ? payload.hid.join("/") : old.hidden,
      ts: payload.ts ? new Date(payload.ts * 1000).toISOString() : old.ts,
      source: "cli"
    };
    window.Course.persist();
    return true;
  }

  function render(payload) {
    var s = store(), rec = payload ? s.problems[payload.id] : (s && s.problems[document.body.dataset.problem]);
    var scoreEl = document.querySelector("[data-score]");
    var metaEl = document.querySelector("[data-score-meta]");
    var barEl = document.querySelector("[data-score-bar]");
    var resEl = document.querySelector("[data-result]");
    if (!scoreEl) return;
    if (!rec) {
      scoreEl.textContent = "—";
      metaEl.textContent = "not submitted yet";
      if (barEl) barEl.style.width = "0%";
      return;
    }
    scoreEl.textContent = rec.score + " / 5";
    metaEl.textContent = "attempt " + rec.attempts + " · visible " + rec.visible + " · hidden " + rec.hidden;
    if (barEl) barEl.style.width = Math.round((rec.score / 5) * 100) + "%";
    if (resEl) resEl.textContent = "Verified locally · " + (rec.ts || "").slice(0, 10) + " · stored on this device only.";
  }

  function problemPage() {
    var id = document.body.dataset.problem;
    var input = document.querySelector("[data-token-input]");
    var resEl = document.querySelector("[data-result]");
    render(null);

    function consume(token, fromHash) {
      verify(token).then(function (payload) {
        if (!payload) {
          if (resEl) resEl.textContent = "That token failed its checksum — copy it again from dml.py submit.";
          return;
        }
        if (payload.id !== id) {
          if (resEl) resEl.textContent = "That token belongs to problem " + payload.id + ", not " + id + ".";
          return;
        }
        apply(payload);
        render(payload);
        if (fromHash) history.replaceState(null, "", location.pathname);
      });
    }

    var m = (location.hash || "").match(/[#&]r=([^&]+)/);
    if (m) consume(decodeURIComponent(m[1]), true);
    if (input) {
      input.addEventListener("change", function () {
        if (input.value.trim()) consume(input.value.trim(), false);
      });
    }
  }

  function hub() {
    var s = store();
    var cards = [].slice.call(document.querySelectorAll(".problem-card"));
    cards.forEach(function (c) {
      var rec = s && s.problems[c.dataset.id];
      var el = c.querySelector("[data-card-score]");
      if (rec && el) {
        el.textContent = rec.score + "/5";
        el.classList.add("done");
      }
    });
    var count = document.querySelector('[data-count="problems"]');
    if (count && s) {
      count.textContent = Object.keys(s.problems).length + " / " + cards.length;
    }
    var state = {};
    function applyFilters() {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = true;
        if (state.difficulty && c.dataset.difficulty !== state.difficulty) ok = false;
        if (state.shape && c.dataset.shape !== state.shape) ok = false;
        c.hidden = !ok;
        if (ok) shown++;
      });
      var empty = document.querySelector("[data-empty]");
      if (empty) empty.hidden = shown > 0;
    }
    document.querySelectorAll("[data-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.dataset.filter, val = btn.dataset.value;
        var active = btn.getAttribute("aria-pressed") === "true";
        document.querySelectorAll('[data-filter="' + key + '"]').forEach(function (b) {
          b.setAttribute("aria-pressed", "false");
        });
        if (active) { delete state[key]; }
        else { state[key] = val; btn.setAttribute("aria-pressed", "true"); }
        applyFilters();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.dataset.page === "problem") problemPage();
    if (document.body.dataset.page === "problems") hub();
  });
})();
