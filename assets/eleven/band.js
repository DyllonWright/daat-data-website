/* THE CALENDAR BAND — site-wide chrome, two forms.
 * ----------------------------------------------------------------------------
 * Fills every element carrying [data-eleven-band]. Two forms, chosen by the
 * element's data-lines:
 *
 *   data-lines="1"   one line, Cormorant Garamond at 26px. Every page.
 *   data-lines="4"   four nested lines, about 122px tall. The /eleven-days
 *                    page only, where the band stops being decoration and
 *                    becomes the page's own subject.
 *
 * The four lines nest the way the engine does: calendar name, then era and
 * year, then month, then day, with a hairline rule under the name so a block
 * reads like a calendar page at a glance.
 *
 * WHY TWO RUNS. The loop animates translateX(0) -> translateX(-50%), which
 * closes seamlessly only when the two runs measure identically. Every cell is
 * followed by a joint, the LAST ONE INCLUDED. Drop that trailing joint from
 * one run and the seam shows a half-empty chain link.
 *
 * WHY THE JOINT IS ONE SVG. It began as .cell::before / .cell::after parked
 * outside their own block at left:100%. The cell needs overflow:hidden for
 * its watermark, which clipped both away — and two pseudo-elements that know
 * nothing of each other cannot share a gradient across the gap either. One
 * SVG per gap fixes both: the two half rings and the free ellipse sit in a
 * single drawing, stroked with one gradient running from the left block's
 * accent to the right block's, so the colour hands over mid-link.
 *
 * The hues and the motifs come from the plugin's own COLOR_MAP, so a visitor
 * who runs Eleven Days in Obsidian meets the same cascade on the web.
 *
 * FAILING SAFE. site.css reserves the fixed band's height on <body> whether
 * or not this script runs, because an unreserved fixed strip covers the last
 * line of every page. So a band that cannot render must not leave an empty
 * lit strip: on any failure it writes one plain line pointing at the page.
 */
(function () {
  "use strict";

  var KEYS = ["gregorian", "illuminati", "erisian", "pataphysical", "poundian",
              "thelemic", "frenchRev", "islamic", "chinese", "mayan", "hebrew"];

  /* The plugin's own COLOR_MAP, src/calendars.ts. */
  var ACCENT = {
    illuminati: "#d97706", chinese: "#e11d48", thelemic: "#dc2626",
    erisian: "#db2777", poundian: "#7c3aed", frenchRev: "#2563eb",
    hebrew: "#0284c7", pataphysical: "#059669", islamic: "#16a34a",
    mayan: "#65a30d", gregorian: "#00b4d8"
  };

  /* One motif per system, stroked in currentColor so a theme can tint it.
     Each says what the system counts by, not merely what it looks like. */
  var MOTIF = {
    /* a month grid with its binding rings */
    gregorian: '<rect x="12" y="24" width="76" height="66"/><path d="M12 44h76M34 44v46M56 44v46M78 44v46M12 66h76"/><path d="M30 14v16M70 14v16"/>',
    /* the eye in the triangle — Anno Lucis, the Year of Light */
    illuminati: '<path d="M50 12 92 86H8Z"/><path d="M28 62q22-22 44 0-22 22-44 0Z"/><circle cx="50" cy="62" r="7"/>',
    /* the golden apple of discord */
    erisian: '<path d="M50 32c-14-14-34-6-34 16 0 20 16 40 34 40s34-20 34-40c0-22-20-30-34-16Z"/><path d="M50 32V14"/><path d="M50 22q14-12 24-6-4 12-24 6Z"/>',
    /* the gidouille, Ubu's spiral */
    pataphysical: '<path d="M50 50a6 6 0 1 1 0-12 12 12 0 1 1 0 24 18 18 0 1 1 0-36 24 24 0 1 1 0 48 30 30 0 1 1 0-60"/>',
    /* a column, for the post-Ulysses era */
    poundian: '<path d="M22 20h56M26 28h48M34 28v44M50 28v44M66 28v44M26 72h48M20 80h60M14 88h72"/>',
    /* the sun disc, since the Thelemic month names the Sun's sign */
    thelemic: '<circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="7"/><path d="M50 8v10M50 82v10M8 50h10M82 50h10M22 22l7 7M71 71l7 7M78 22l-7 7M29 71l-7 7"/>',
    /* the revolutionary cockade */
    frenchRev: '<circle cx="50" cy="50" r="38"/><circle cx="50" cy="50" r="25"/><circle cx="50" cy="50" r="12"/>',
    /* the crescent, which opens every month */
    islamic: '<path d="M66 14a40 40 0 1 0 0 72 44 44 0 0 1 0-72Z"/><path d="M78 36l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z"/>',
    /* a cash coin: round outside, square hole */
    chinese: '<circle cx="50" cy="50" r="36"/><rect x="36" y="36" width="28" height="28"/><path d="M50 14v22M50 64v22M14 50h22M64 50h22"/>',
    /* a stepped pyramid, for the Long Count */
    mayan: '<path d="M8 88h84M18 88V72h64v16M28 72V56h44v16M38 56V40h24v16M46 40V26h8v14"/><path d="M44 88V72h12v16"/>',
    /* the menorah */
    hebrew: '<path d="M50 24v52M34 88h32M42 76h16M50 76v12"/><path d="M50 50q-9 0-9-14M50 50q9 0 9-14M50 44q-18 0-18-20M50 44q18 0 18-20"/><path d="M14 20v6M32 20v6M41 16v6M50 14v6M59 16v6M68 20v6M86 20v6"/>'
  };

  var NS = "http://www.w3.org/2000/svg";

  function motif(key) {
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

  /* One link of chain. The viewBox runs 0..68 wide and each half ring bulges
     rx BEYOND its own chord, so the chords sit 11 in from the edges and the
     bulges land exactly on 0 and 68. Put the chords on the edges instead and
     both halves draw outside the viewBox and vanish. The ellipse runs rx 24,
     so it overlaps both chords and the three pieces genuinely interlock. */
  var jointSeq = 0;
  function joint(fromKey, toKey) {
    var a = ACCENT[fromKey] || "#c9a24b";
    var b = ACCENT[toKey] || "#c9a24b";
    var id = "eb-joint-" + (++jointSeq);
    var d = document.createElement("div");
    d.className = "eleven-joint";
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 68 24");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML =
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="' + a + '"/>' +
        '<stop offset="1" stop-color="' + b + '"/>' +
      "</linearGradient></defs>" +
      '<path d="M 11 4 A 11 8 0 0 0 11 20" fill="none" stroke="' + a + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M 57 4 A 11 8 0 0 1 57 20" fill="none" stroke="' + b + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<ellipse cx="34" cy="12" rx="24" ry="8" fill="none" stroke="url(#' + id + ')" stroke-width="2.4"/>';
    d.appendChild(s);
    return d;
  }

  /* The engine names the era inside .year for most systems; two it does not,
     so they get theirs here rather than reading an era off a bare number. */
  function parts(data, key) {
    var e = data && data[key];
    if (!e) return null;
    var year = String(e.year);
    if (key === "gregorian") year = year + " C.E.";
    if (key === "chinese") year = year + " C.C.";
    return { name: e.name || key, year: year, month: String(e.month), date: String(e.date) };
  }

  function cell(data, key, lines, href) {
    var p = parts(data, key);
    if (!p) return null;
    var c = document.createElement(href ? "a" : "div");
    c.className = "eleven-cell";
    c.style.setProperty("--accent", ACCENT[key] || "#c9a24b");
    if (href) {
      c.href = href;
      /* The whole run reads as one decoration, announced once on the band. A
         screen reader walking eleven identical links learns nothing. */
      c.setAttribute("tabindex", "-1");
      c.setAttribute("aria-hidden", "true");
    }

    var art = document.createElement("span");
    art.className = "eleven-art";
    art.appendChild(motif(key));
    c.appendChild(art);

    function line(cls, text, gloss) {
      var l = document.createElement("span");
      l.className = "eleven-" + cls;
      if (gloss) {
        var hit = document.createElement("span");
        hit.className = "eleven-hit";
        hit.textContent = text;
        hit.setAttribute("data-gloss", gloss);
        hit.setAttribute("data-key", key);
        hit.tabIndex = 0;
        l.appendChild(hit);
      } else {
        l.textContent = text;
      }
      c.appendChild(l);
      return l;
    }

    if (lines === 4) {
      line("l1", p.name, "k");
      var bar = document.createElement("span");
      bar.className = "eleven-bar";
      c.appendChild(bar);
      line("l2", p.year, "y");
      line("l3", p.month, "m");
      line("l4", p.date, "d");
    } else {
      line("l1", p.name);
      var row = document.createElement("span");
      row.className = "eleven-oneline";
      row.textContent = p.year + " · " + p.month + " · " + p.date;
      c.appendChild(row);
    }
    return c;
  }

  function fallback(host) {
    host.classList.add("eleven-band--plain");
    host.textContent = "";
    var a = document.createElement("a");
    a.className = "eleven-plain";
    a.href = host.getAttribute("data-href") || "eleven-days";
    a.textContent = "Today in eleven calendars";
    host.appendChild(a);
  }

  function build(host) {
    var lines = host.getAttribute("data-lines") === "4" ? 4 : 1;
    var href = lines === 4 ? null : (host.getAttribute("data-href") || "eleven-days");
    var data;
    try {
      data = window.buildCalendars(null);
    } catch (e) {
      data = null;
    }
    if (!data) { fallback(host); return null; }

    var track = document.createElement("div");
    track.className = "eleven-track";
    var built = 0;
    for (var pass = 0; pass < 2; pass++) {
      var run = document.createElement("div");
      run.className = "eleven-run";
      for (var i = 0; i < KEYS.length; i++) {
        var c = cell(data, KEYS[i], lines, href);
        if (!c) continue;
        run.appendChild(c);
        /* the trailing joint belongs here too — see the header note */
        run.appendChild(joint(KEYS[i], KEYS[(i + 1) % KEYS.length]));
        built++;
      }
      track.appendChild(run);
    }
    if (!built) { fallback(host); return null; }

    host.textContent = "";
    host.classList.add("eleven-band--live");
    host.setAttribute("data-count", String(built / 2));
    host.appendChild(track);

    /* Pause on hover and on focus. Focus matters as much as hover: a keyboard
       reader who tabs into the gloss cannot read a line that keeps moving. */
    host.addEventListener("focusin", function () { host.classList.add("is-paused"); });
    host.addEventListener("focusout", function () { host.classList.remove("is-paused"); });
    return host;
  }

  /* THE GLOSS DRAWER. Every one of the four lines responds: hover reads it
     into the drawer below the band, click pins it, click again releases. The
     drawer's copy lives in assets/eleven/gloss.js, which the page loads only
     where a four-line band stands. Without it the lines simply do not gloss. */
  function wireGloss(host) {
    var drawer = document.querySelector("[data-eleven-gloss]");
    var G = window.ELEVEN_GLOSS;
    if (!drawer || !G) return;

    var data;
    try { data = window.buildCalendars(null); } catch (e) { return; }
    if (!data) return;

    var pinned = null;

    function idle() {
      drawer.innerHTML = "";
      var k = document.createElement("span");
      k.className = "eleven-gk";
      k.textContent = "The drawer";
      var p = document.createElement("p");
      p.className = "eleven-gidle";
      p.textContent = "Hover a line to read it here. Click to pin it, click again to let go.";
      drawer.appendChild(k);
      drawer.appendChild(p);
    }

    function show(key, which, el, pin) {
      if (pinned && !pin && pinned !== el) return;
      if (pin) {
        if (pinned === el) {
          pinned = null;
          el.classList.remove("is-pinned");
          idle();
          return;
        }
        if (pinned) pinned.classList.remove("is-pinned");
        pinned = el;
        el.classList.add("is-pinned");
      }
      var g = G.notes[key];
      var p = parts(data, key);
      if (!g || !p) return;
      var head, big, lead, body;
      if (which === "k") {
        head = "What this system counts";
        big = p.name;
        lead = "Counts from " + G.epoch[key];
        body = g.y[1];
      } else if (which === "y") {
        head = "The year, and the morning it counts from";
        big = p.year; lead = g.y[0]; body = g.y[1];
      } else if (which === "m") {
        head = "The month, and what the name means";
        big = p.month; lead = g.m[0]; body = g.m[1];
      } else {
        head = "The day, and what it marks";
        big = p.date; lead = g.d[0]; body = g.d[1];
      }
      drawer.innerHTML = "";
      function put(cls, tag, text) {
        var n = document.createElement(tag);
        n.className = cls;
        n.textContent = text;
        drawer.appendChild(n);
      }
      put("eleven-gk", "span", p.name + " · " + head);
      put("eleven-gt", "span", big);
      put("eleven-gb", "p", lead + ".");
      put("eleven-ge", "div", body);
    }

    host.addEventListener("mouseover", function (ev) {
      var hit = ev.target.closest && ev.target.closest(".eleven-hit");
      if (hit) show(hit.getAttribute("data-key"), hit.getAttribute("data-gloss"), hit);
    });
    host.addEventListener("focusin", function (ev) {
      var hit = ev.target.closest && ev.target.closest(".eleven-hit");
      if (hit) show(hit.getAttribute("data-key"), hit.getAttribute("data-gloss"), hit);
    });
    host.addEventListener("click", function (ev) {
      var hit = ev.target.closest && ev.target.closest(".eleven-hit");
      if (hit) { ev.preventDefault(); show(hit.getAttribute("data-key"), hit.getAttribute("data-gloss"), hit, true); }
    });
    host.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      var hit = ev.target.closest && ev.target.closest(".eleven-hit");
      if (hit) { ev.preventDefault(); show(hit.getAttribute("data-key"), hit.getAttribute("data-gloss"), hit, true); }
    });
    idle();
  }

  function start() {
    var hosts = document.querySelectorAll("[data-eleven-band]");
    for (var i = 0; i < hosts.length; i++) {
      var host = build(hosts[i]);
      if (host && host.getAttribute("data-lines") === "4") wireGloss(host);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
