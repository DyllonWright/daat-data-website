/* ─── THE INSPIRATION TAB ──────────────────────────────────────────────────
   Renders data/reading.json and nothing else. The hub repo writes that file
   with `python scripts/reading-timeline.py`; six fields a book, no excerpt.

   One picture and one list:

     the dial   a spiral, one loop per year, winding OUTWARD — the first year
                at the centre, the latest at the rim. Outward on purpose, the
                reverse of the poetry dial: the reading thickens with time and
                the recent loops want the circumference. A book draws as an arc
                from its first logged sitting to its last. Books open at once
                step inward into lanes, so an overlap shows as stacked arcs.
                Small hollow rings mark the poems written in the same months,
                read from data/poetry.json when it loads.

     the shelf  every book in the order I started it, grouped by year, each
                row naming what I read alongside it.
───────────────────────────────────────────────────────────────────────────*/
(function () {
  "use strict";

  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
             "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAY = 86400000;
  var CX = 300, CY = 300, ROUT = 262, RIN = 40, LANE = 8.5;

  var BOOKS = [], SHELVES = [], POEMS = [];
  var shelf = null, sel = null, T0 = 0, T1 = 0;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function T(iso) { return new Date(iso + "T00:00:00Z").getTime(); }
  function shortd(iso) {
    var p = iso.split("-");
    return MON[+p[1] - 1] + " " + (+p[2]);
  }
  function range(b) {
    var y = " ’" + b.end.slice(2, 4);
    if (b.start === b.end) { return shortd(b.start) + y; }
    if (b.start.slice(0, 4) !== b.end.slice(0, 4)) {
      return shortd(b.start) + " ’" + b.start.slice(2, 4) + " – " + shortd(b.end) + y;
    }
    return shortd(b.start) + " – " + shortd(b.end) + y;
  }
  function cvar(k) {
    return getComputedStyle(document.documentElement)
             .getPropertyValue("--in-" + k).trim() || "#888";
  }
  function label(k) {
    var s = SHELVES.filter(function (x) { return x.slug === k; })[0];
    return s ? s.label : k;
  }

  /* angle = time of year, January straight up; radius grows with the date */
  function polar(ms, lane) {
    var d = new Date(ms), y = d.getUTCFullYear();
    var frac = (ms - Date.UTC(y, 0, 1)) / (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1));
    var r = RIN + (ROUT - RIN) * (ms - T0) / (T1 - T0) - (lane || 0) * LANE;
    var a = (frac * 360 - 90) * Math.PI / 180;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  }
  function pts(a, b, lane) {
    var out = [], n = Math.max(2, Math.ceil((b - a) / (3 * DAY))), i, p;
    for (i = 0; i <= n; i++) {
      p = polar(a + (b - a) * (i / n), lane);
      out.push(p[0].toFixed(1) + "," + p[1].toFixed(1));
    }
    return out.join(" ");
  }

  /* greedy lanes: a book takes the first lane whose last tenant already closed */
  function assignLanes() {
    var ends = [];
    BOOKS.forEach(function (b) {
      var i = 0;
      while (i < ends.length && ends[i] >= b.a - 2 * DAY) { i++; }
      ends[i] = b.b;
      b.lane = i;
    });
  }
  function overlaps(b) {
    return BOOKS.filter(function (o) { return o !== b && o.a <= b.b && o.b >= b.a; });
  }

  function drawDial() {
    var s = '<svg viewBox="-34 -30 668 662" role="img" aria-label="A spiral of ' +
      BOOKS.length + ' books. One loop is one year, winding outward from the first year ' +
      'at the centre. Each arc runs from the first logged sitting of a book to the last, ' +
      'and arcs stack where I read books side by side.">';
    s += '<polyline class="in-guide" points="' + pts(T0, T1, 0) + '"/>';
    MON.forEach(function (m, i) {
      var a = (i * 30 + 15 - 90) * Math.PI / 180, rr = ROUT + 24;
      s += '<text class="in-mlab" x="' + (CX + rr * Math.cos(a)).toFixed(0) + '" y="' +
           (CY + rr * Math.sin(a) + 3).toFixed(0) + '" text-anchor="middle">' + m + "</text>";
    });
    POEMS.forEach(function (q) {
      var c = polar(T(q.date), -1.6);
      s += '<circle class="in-poem" cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) +
           '" r="3"><title>A poem: ' + esc(q.title) + "</title></circle>";
    });
    BOOKS.forEach(function (b, i) {
      var on = (shelf === null || b.shelf === shelf);
      var cls = "in-arc" + (on ? "" : " dim") + (sel === i ? " sel" : "");
      var tip = "<title>" + esc(b.title) + " · " + range(b) + "</title>";
      var at = ' data-i="' + i + '" tabindex="0" role="button" aria-label="' +
               esc(b.title) + ", " + range(b) + '"';
      if (b.b - b.a < 4 * DAY) {
        var c = polar((b.a + b.b) / 2, b.lane);
        s += '<circle class="' + cls + ' pt"' + at + ' cx="' + c[0].toFixed(1) + '" cy="' +
             c[1].toFixed(1) + '" r="3.4" fill="' + cvar(b.shelf) + '">' + tip + "</circle>";
      } else {
        s += '<polyline class="' + cls + '"' + at + ' points="' + pts(b.a, b.b, b.lane) +
             '" stroke="' + cvar(b.shelf) + '">' + tip + "</polyline>";
      }
    });
    /* year marks last, so no arc buries them */
    var y, p;
    for (y = new Date(T0).getUTCFullYear() + 1; Date.UTC(y, 0, 1) < T1; y++) {
      p = polar(Date.UTC(y, 0, 1), 0);
      s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) +
           '" r="2" fill="var(--in-soft)"/><text class="in-ylab" x="' +
           (p[0] + 6).toFixed(1) + '" y="' + (p[1] + 12).toFixed(1) + '">' + y + "</text>";
    }
    document.getElementById("in-dial").innerHTML = s + "</svg>";
  }

  function readout(b) {
    document.getElementById("in-readout").innerHTML = b
      ? '<p class="t">' + esc(b.title) + '</p><p class="m">' +
        (b.author ? esc(b.author) + " · " : "") + range(b) + "</p>"
      : '<p class="e">Hover an arc, or pick one.</p>';
  }

  function buildShelf() {
    var h = "", year = "";
    BOOKS.forEach(function (b, i) {
      if (b.start.slice(0, 4) !== year) {
        year = b.start.slice(0, 4);
        h += '<h3 class="in-year" id="in-y-' + year + '">' + year + "</h3>";
      }
      var o = overlaps(b), along = "";
      if (o.length && o.length <= 3) {
        along = "alongside " + o.map(function (x) { return esc(x.title); }).join(", ");
      } else if (o.length) {
        along = "alongside " + o.length + " others";
      }
      h += '<div class="in-row" id="in-b-' + i + '" data-i="' + i + '" data-sh="' + b.shelf +
           '"><span class="dt">' + range(b) + '</span><span class="nm">' + esc(b.title) +
           (b.author ? " <em>" + esc(b.author) + "</em>" : "") +
           (along ? '<small>' + along + "</small>" : "") + "</span>" +
           '<span class="rt"><span class="se" style="background:' + cvar(b.shelf) +
           '" title="' + esc(label(b.shelf)) + '"></span><span class="ln">' +
           (b.sittings ? b.sittings + (b.sittings === 1 ? " sitting" : " sittings") : "noted") +
           "</span></span></div>";
    });
    document.getElementById("in-shelf").innerHTML = h;
  }

  function render() {
    drawDial();
    Array.prototype.forEach.call(document.querySelectorAll(".in-chip"), function (c) {
      var a = (shelf === c.getAttribute("data-shelf"));
      c.setAttribute("aria-pressed", String(a));
      c.classList.toggle("dim", shelf !== null && !a);
    });
    Array.prototype.forEach.call(document.querySelectorAll(".in-row"), function (el) {
      el.classList.toggle("hide", shelf !== null && el.getAttribute("data-sh") !== shelf);
      el.classList.toggle("sel", sel === +el.getAttribute("data-i"));
    });
    Array.prototype.forEach.call(document.querySelectorAll(".in-year"), function (el) {
      var n = el.nextElementSibling, any = false;
      while (n && n.classList.contains("in-row")) {
        if (!n.classList.contains("hide")) { any = true; }
        n = n.nextElementSibling;
      }
      el.hidden = !any;
    });
  }
  function choose(i, scroll) {
    sel = (sel === i ? null : i);
    render();
    readout(sel === null ? null : BOOKS[sel]);
    if (sel !== null && scroll) {
      document.getElementById("in-b-" + sel)
        .scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function start(data) {
    SHELVES = data.shelves || [];
    BOOKS = (data.books || []).filter(function (b) { return b.start && b.end; });
    if (!BOOKS.length) { return; }
    BOOKS.forEach(function (b) { b.a = T(b.start); b.b = T(b.end); });
    T0 = Date.UTC(new Date(BOOKS[0].a).getUTCFullYear(), 0, 1);
    T1 = Math.max.apply(null, BOOKS.map(function (b) { return b.b; })) + 20 * DAY;
    assignLanes();

    document.getElementById("in-waiting").hidden = true;
    document.getElementById("in-stage").hidden = false;
    document.getElementById("in-chips").innerHTML = SHELVES.map(function (s) {
      var n = BOOKS.filter(function (b) { return b.shelf === s.slug; }).length;
      return n ? '<button class="in-chip" type="button" data-shelf="' + s.slug +
        '" style="--sw:' + cvar(s.slug) + '"><i></i>' + esc(s.label) +
        " <u>" + n + "</u></button>" : "";
    }).join("");
    buildShelf();

    var dial = document.getElementById("in-dial");
    dial.addEventListener("click", function (e) {
      var d = e.target.closest("[data-i]");
      if (d) { choose(+d.getAttribute("data-i"), true); }
    });
    dial.addEventListener("keydown", function (e) {
      var d = e.target.closest("[data-i]");
      if (d && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault(); choose(+d.getAttribute("data-i"), true);
      }
    });
    dial.addEventListener("pointerover", function (e) {
      var d = e.target.closest("[data-i]");
      if (d) { readout(BOOKS[+d.getAttribute("data-i")]); }
    });
    document.getElementById("in-chips").addEventListener("click", function (e) {
      var c = e.target.closest(".in-chip");
      if (!c) { return; }
      var k = c.getAttribute("data-shelf");
      shelf = (shelf === k ? null : k); sel = null; render(); readout(null);
    });
    document.getElementById("in-shelf").addEventListener("click", function (e) {
      var r = e.target.closest(".in-row");
      if (r) { choose(+r.getAttribute("data-i"), false); }
    });

    readout(null);
    render();
  }

  function get(url, done) {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.onload = function () {
      var d = null;
      try { d = JSON.parse(req.responseText); } catch (e) { d = null; }
      done(d);
    };
    req.onerror = function () { done(null); };
    req.send();
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("in-dial")) { return; }
    get("data/reading.json", function (data) {
      if (!data || !Array.isArray(data.books)) { return; }
      start(data);
      /* the poems ride along when they load; the page stands without them */
      get("data/poetry.json", function (pd) {
        if (!pd || !Array.isArray(pd.poems)) { return; }
        POEMS = pd.poems.filter(function (p) {
          return p.date && T(p.date) >= T0 && T(p.date) <= T1;
        });
        if (POEMS.length) { drawDial(); }
      });
    });
  });
})();
