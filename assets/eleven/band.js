/* THE CALENDAR RAIL — today in eleven calendars, along the bottom of every page.
 * ----------------------------------------------------------------------------
 * Fills every element carrying [data-eleven-band]. One form only: a single
 * line of type per system, in the site's ivory and gold, with one of the
 * site's eight Saturn expressions between entries, picked at random per
 * page load.
 *
 * WHAT CAME OUT, 2026-11-09, and should not go back without the owner asking.
 * An earlier pass ran two rails — this one plus a four-line copy below the
 * masthead — and gave each system the plugin's own hue with a drawn motif
 * behind it. Eleven saturated hues fought every page they sat on, and the
 * second rail pushed the page itself below the fold. Both cut. The rail keeps
 * two colours and one line.
 *
 * WHY TWO RUNS. The loop animates translateX(0) -> translateX(-50%), which
 * closes seamlessly only when the two runs are identical, in width AND in
 * content. Every cell is followed by a mascot, the LAST ONE INCLUDED — drop
 * that trailing one from a run and the seam shows a gap — and both runs read
 * the same randomly drawn faces, or the seam shows one changing expression.
 *
 * FAILING SAFE. site.css reserves the rail's height on <body> whether or not
 * this script runs, because an unreserved fixed strip covers the last line of
 * every page. So a rail that cannot render must not leave an empty lit strip:
 * on any failure it writes one plain line pointing at the page.
 */
(function () {
  "use strict";

  var KEYS = ["gregorian", "illuminati", "erisian", "pataphysical", "poundian",
              "thelemic", "frenchRev", "islamic", "chinese", "mayan", "hebrew"];

  var NS = "http://www.w3.org/2000/svg";

  /* === THE CHAIN VARIANT ==================================================
     The rail below the masthead, data-variant="chain". It keeps the plugin's
     own COLOR_MAP and the drawn motifs, so a visitor who runs Eleven Days in
     Obsidian meets the same cascade on the web, and it links its entries with
     a chain rather than with the mascot.

     Two rails, deliberately different and deliberately out of step: this one
     carries the colour and runs slow, the one at the foot of the page stays
     ivory and gold and runs quicker. Match their speeds and the page reads as
     one scrolling surface with the content sitting in a hole in the middle.
     ====================================================================== */

  /* the plugin's own COLOR_MAP, src/calendars.ts */
  var ACCENT = {
    illuminati: "#d97706", chinese: "#e11d48", thelemic: "#dc2626",
    erisian: "#db2777", poundian: "#7c3aed", frenchRev: "#2563eb",
    hebrew: "#0284c7", pataphysical: "#059669", islamic: "#16a34a",
    mayan: "#65a30d", gregorian: "#00b4d8"
  };

  /* One motif per system, stroked in currentColor so the entry's own accent
     tints it. Each says what the system counts by rather than merely
     decorating it: the eye in the triangle for the Year of Light, the
     gidouille for Jarry, a cash coin for the Chinese year, a stepped pyramid
     for the Long Count. */
  var MOTIF = {
    gregorian: '<rect x="12" y="24" width="76" height="66"/><path d="M12 44h76M34 44v46M56 44v46M78 44v46M12 66h76"/><path d="M30 14v16M70 14v16"/>',
    illuminati: '<path d="M50 12 92 86H8Z"/><path d="M28 62q22-22 44 0-22 22-44 0Z"/><circle cx="50" cy="62" r="7"/>',
    erisian: '<path d="M50 32c-14-14-34-6-34 16 0 20 16 40 34 40s34-20 34-40c0-22-20-30-34-16Z"/><path d="M50 32V14"/><path d="M50 22q14-12 24-6-4 12-24 6Z"/>',
    pataphysical: '<path d="M50 50a6 6 0 1 1 0-12 12 12 0 1 1 0 24 18 18 0 1 1 0-36 24 24 0 1 1 0 48 30 30 0 1 1 0-60"/>',
    poundian: '<path d="M22 20h56M26 28h48M34 28v44M50 28v44M66 28v44M26 72h48M20 80h60M14 88h72"/>',
    thelemic: '<circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="7"/><path d="M50 8v10M50 82v10M8 50h10M82 50h10M22 22l7 7M71 71l7 7M78 22l-7 7M29 71l-7 7"/>',
    frenchRev: '<circle cx="50" cy="50" r="38"/><circle cx="50" cy="50" r="25"/><circle cx="50" cy="50" r="12"/>',
    islamic: '<path d="M66 14a40 40 0 1 0 0 72 44 44 0 0 1 0-72Z"/><path d="M78 36l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z"/>',
    chinese: '<circle cx="50" cy="50" r="36"/><rect x="36" y="36" width="28" height="28"/><path d="M50 14v22M50 64v22M14 50h22M64 50h22"/>',
    mayan: '<path d="M8 88h84M18 88V72h64v16M28 72V56h44v16M38 56V40h24v16M46 40V26h8v14"/><path d="M44 88V72h12v16"/>',
    hebrew: '<path d="M50 24v52M34 88h32M42 76h16M50 76v12"/><path d="M50 50q-9 0-9-14M50 50q9 0 9-14M50 44q-18 0-18-20M50 44q18 0 18-20"/><path d="M14 20v6M32 20v6M41 16v6M50 14v6M59 16v6M68 20v6M86 20v6"/>'
  };

  function motifSVG(key) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 100 100");
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "4");
    s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = MOTIF[key] || "";
    return s;
  }

  /* ONE LINK OF CHAIN: two half rings and a free ellipse, interlocked, the
     ellipse under a gradient so the colour hands over from the entry on the
     left to the one on the right mid-link.

     The half rings bulge INWARD, toward the ellipse. A ring emerging from the
     entry on the left shows its RIGHT half, so its open side faces the words
     it comes out of. Bulge them outward and each reads as a bracket cupping
     away from the link, which is what the first version drew.

     Each chord sits on the viewBox edge and the rx carries the bulge inward
     to x=11 and x=57, so nothing draws outside the box. The ellipse runs
     rx 24 from cx 34, spanning 10 to 58, so it overlaps both bulges and the
     three pieces interlock rather than merely touch. */
  var jointSeq = 0;
  function chainJoint(fromKey, toKey) {
    var a = ACCENT[fromKey] || "#c9a24b";
    var b = ACCENT[toKey] || "#c9a24b";
    var id = "eb-chain-" + (++jointSeq);
    var d = document.createElement("span");
    d.className = "eleven-joint eleven-joint--chain";
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 68 24");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML =
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="' + a + '"/>' +
        '<stop offset="1" stop-color="' + b + '"/>' +
      '</linearGradient></defs>' +
      '<path d="M 0 5 A 11 7 0 0 1 0 19" fill="none" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M 68 5 A 11 7 0 0 0 68 19" fill="none" stroke="' + b + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<ellipse cx="34" cy="12" rx="24" ry="7" fill="none" stroke="url(#' + id + ')" stroke-width="2.2"/>';
    d.appendChild(s);
    return d;
  }

  /* THE PUNCTUATION BETWEEN ENTRIES: the site's own mascot, one of its eight
     expressions, picked at random per page load rather than written in. The
     chain link that used to sit here drew two half rings and a free ellipse;
     the owner replaced it with the Saturn kit on 2026-11-09.

     THE SEQUENCE IS DRAWN ONCE AND REUSED BY BOTH RUNS. The loop animates
     translateX(0) -> translateX(-50%), which only closes seamlessly when the
     two runs are identical — in width AND in content. Pick a fresh face per
     joint in each run and the two halves disagree, so the seam shows a
     mascot changing expression mid-scroll. Hence faceRun() below, built once
     and read twice.

     The faces, not the parts: sat-base, sat-ring, sat-eyes and the rest are
     pieces the expressions are assembled from, and a lone pair of eyes is
     not a mascot. */
  var FACES = ["sat-cool", "sat-devil", "sat-done-for", "sat-shock",
               "sat-sleepy", "sat-smile", "sat-smug", "sat-wink"];

  function faceRun(n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(FACES[Math.floor(Math.random() * FACES.length)]);
    return out;
  }

  function joint(face) {
    var d = document.createElement("span");
    d.className = "eleven-joint";
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("class", "sat");
    s.setAttribute("aria-hidden", "true");
    var u = document.createElementNS(NS, "use");
    /* setAttributeNS(null, ...) rather than href=: an SVG <use> takes a plain
       href attribute, and setting it through the XLink namespace instead
       silently resolves to nothing in a current browser. */
    u.setAttributeNS(null, "href", "assets/planet-sprite.svg#" + face);
    s.appendChild(u);
    d.appendChild(s);
    return d;
  }

  /* The engine names the era inside .year for most systems; two it does not,
     so they get theirs here rather than showing a bare number. */
  function parts(data, key) {
    var e = data && data[key];
    if (!e) return null;
    var year = String(e.year);
    if (key === "gregorian") year = year + " C.E.";
    if (key === "chinese") year = year + " C.C.";
    return { name: e.name || key, year: year, month: String(e.month), date: String(e.date) };
  }

  function cell(data, key, href, chain) {
    var p = parts(data, key);
    if (!p) return null;
    var c = document.createElement("a");
    c.className = "eleven-cell";
    c.href = href;
    if (chain) {
      c.style.setProperty("--accent", ACCENT[key] || "#c9a24b");
      var art = document.createElement("span");
      art.className = "eleven-art";
      art.appendChild(motifSVG(key));
      c.appendChild(art);
    }
    /* The run reads as one piece of chrome, announced once on the rail. A
       screen reader walking eleven identical links learns nothing from them. */
    c.setAttribute("tabindex", "-1");
    c.setAttribute("aria-hidden", "true");

    var name = document.createElement("span");
    name.className = "eleven-l1";
    name.textContent = p.name;
    c.appendChild(name);

    var line = document.createElement("span");
    line.className = "eleven-oneline";
    line.textContent = p.year + " · " + p.month + " · " + p.date;
    c.appendChild(line);
    return c;
  }

  function fallback(host, href) {
    host.classList.add("eleven-band--plain");
    host.textContent = "";
    var a = document.createElement("a");
    a.className = "eleven-plain";
    a.href = href;
    a.textContent = "Today in eleven calendars";
    host.appendChild(a);
  }

  /* CARRYING ON ACROSS A NAVIGATION.
     Every page load restarts a CSS animation at zero and re-rolls the random
     faces, so walking from one tab to the next made the rail visibly jump
     back to its first entry. Both now persist for the life of the browser
     tab:

       the START TIME, stored once. The loop runs linearly, so a page that
       opens later computes how far in it should already sit and applies that
       as a NEGATIVE animation-delay. The rail therefore keeps running on
       wall-clock time rather than on page time, and a navigation costs it
       nothing.

       the FACES, stored as drawn. Re-rolling them on each load reads as a
       reset even when the scroll position survives.

     sessionStorage, not localStorage: this should follow one tab's journey
     and start fresh in a new one. Every read and write sits in a try/catch —
     a private window or blocked site data throws on access, and the rail has
     to render anyway. */
  var STORE_T = "eleven-rail-start";
  var STORE_F = "eleven-rail-faces";

  function remembered(key) {
    try { return window.sessionStorage.getItem(key); } catch (e) { return null; }
  }

  function remember(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch (e) { /* no store, no memory */ }
  }

  function startedAt() {
    var raw = Number(remembered(STORE_T));
    if (raw && isFinite(raw) && raw <= Date.now()) return raw;
    var now = Date.now();
    remember(STORE_T, String(now));
    return now;
  }

  function facesFor(n) {
    var raw = remembered(STORE_F);
    if (raw) {
      var kept = raw.split(",");
      if (kept.length === n && kept.every(function (f) { return FACES.indexOf(f) > -1; })) return kept;
    }
    var fresh = faceRun(n);
    remember(STORE_F, fresh.join(","));
    return fresh;
  }

  function build(host) {
    var href = host.getAttribute("data-href") || "eleven-days";
    var chain = host.getAttribute("data-variant") === "chain";
    var data;
    try {
      data = window.buildCalendars(null);
    } catch (e) {
      data = null;
    }
    if (!data) { fallback(host, href); return; }

    var track = document.createElement("div");
    track.className = "eleven-track";
    var faces = chain ? null : facesFor(KEYS.length);
    var built = 0;
    for (var pass = 0; pass < 2; pass++) {
      var run = document.createElement("div");
      run.className = "eleven-run";
      for (var i = 0; i < KEYS.length; i++) {
        var c = cell(data, KEYS[i], href, chain);
        if (!c) continue;
        run.appendChild(c);
        /* the trailing joint belongs here too, and in the mascot variant both
           runs read the same face at the same index - see the header note */
        run.appendChild(chain
          ? chainJoint(KEYS[i], KEYS[(i + 1) % KEYS.length])
          : joint(faces[i]));
        built++;
      }
      track.appendChild(run);
    }
    if (!built) { fallback(host, href); return; }

    /* The two variants run at different speeds on purpose — see the header.
       The delay is negative and taken modulo the duration, which is what
       places this page's rail where the last page's had got to. */
    var secs = chain ? 150 : 96;
    var elapsed = (Date.now() - startedAt()) / 1000;
    track.style.animationDuration = secs + "s";
    track.style.animationDelay = "-" + (elapsed % secs).toFixed(3) + "s";

    host.textContent = "";
    host.appendChild(track);

    /* Pause on hover and on focus. Focus matters as much as hover: a reader
       who tabs to a link inside the rail cannot read a line that keeps
       moving underneath them. */
    host.addEventListener("focusin", function () { host.classList.add("is-paused"); });
    host.addEventListener("focusout", function () { host.classList.remove("is-paused"); });
  }

  function start() {
    var hosts = document.querySelectorAll("[data-eleven-band]");
    for (var i = 0; i < hosts.length; i++) build(hosts[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
