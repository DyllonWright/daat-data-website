/* THE CALENDAR RAIL — today in eleven calendars, along the bottom of every page.
 * ----------------------------------------------------------------------------
 * Fills every element carrying [data-eleven-band]. One form only: a single
 * line of type per system, in the site's ivory and gold, with a chain link
 * between entries.
 *
 * WHAT CAME OUT, 2026-11-09, and should not go back without the owner asking.
 * An earlier pass ran two rails — this one plus a four-line copy below the
 * masthead — and gave each system the plugin's own hue with a drawn motif
 * behind it. Eleven saturated hues fought every page they sat on, and the
 * second rail pushed the page itself below the fold. Both cut. The rail keeps
 * two colours and one line.
 *
 * WHY TWO RUNS. The loop animates translateX(0) -> translateX(-50%), which
 * closes seamlessly only when the two runs measure identically. Every cell is
 * followed by a joint, the LAST ONE INCLUDED. Drop that trailing joint from
 * one run and the seam shows a half-empty chain link.
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

  /* ONE LINK OF CHAIN: two half rings and a free ellipse, interlocked.
     The half rings bulge INWARD, toward the ellipse. A ring emerging from the
     entry on the left shows its RIGHT half, so its open side faces the words
     it comes out of and its curve hooks through the ellipse. Bulge them
     outward and each one reads as a bracket cupping away from the link, which
     is what the first version drew and the owner caught.
     Each chord sits on the viewBox edge and the rx carries the bulge inward
     to x=11 and x=57, so nothing draws outside the box. */
  function joint() {
    var d = document.createElement("span");
    d.className = "eleven-joint";
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 68 24");
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "2");
    s.setAttribute("stroke-linecap", "round");
    s.innerHTML =
      /* the left ring's right half: chord on x=0, bulging in to x=11 */
      '<path d="M 0 5 A 11 7 0 0 1 0 19"/>' +
      /* the right ring's left half: chord on x=68, bulging in to x=57 */
      '<path d="M 68 5 A 11 7 0 0 0 68 19"/>' +
      /* the free link threaded through both */
      '<ellipse cx="34" cy="12" rx="24" ry="7"/>';
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
    var built = 0;
    for (var pass = 0; pass < 2; pass++) {
      var run = document.createElement("div");
      run.className = "eleven-run";
      for (var i = 0; i < KEYS.length; i++) {
        var c = cell(data, KEYS[i], href);
        if (!c) continue;
        run.appendChild(c);
        /* the trailing joint belongs here too — see the header note */
        run.appendChild(joint());
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
