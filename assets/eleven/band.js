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

  function cell(data, key, href) {
    var p = parts(data, key);
    if (!p) return null;
    var c = document.createElement("a");
    c.className = "eleven-cell";
    c.href = href;
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

  function build(host) {
    var href = host.getAttribute("data-href") || "eleven-days";
    var data;
    try {
      data = window.buildCalendars(null);
    } catch (e) {
      data = null;
    }
    if (!data) { fallback(host, href); return; }

    var track = document.createElement("div");
    track.className = "eleven-track";
    var faces = faceRun(KEYS.length);
    var built = 0;
    for (var pass = 0; pass < 2; pass++) {
      var run = document.createElement("div");
      run.className = "eleven-run";
      for (var i = 0; i < KEYS.length; i++) {
        var c = cell(data, KEYS[i], href);
        if (!c) continue;
        run.appendChild(c);
        /* the trailing mascot belongs here too, and both runs read the same
           face at the same index — see the header note */
        run.appendChild(joint(faces[i]));
        built++;
      }
      track.appendChild(run);
    }
    if (!built) { fallback(host, href); return; }

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
