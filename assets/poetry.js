/* ─── THE POETRY TAB ───────────────────────────────────────────────────────
   Renders data/poetry.json and nothing else; if `poems` is empty the page
   keeps its waiting line and none of this draws. That file is written by
   `python scripts/poetry-curate.py --publish` in the hub repo. Nothing
   reaches it by hand and the private fields never travel — the hub's
   projects/poetry/README.md says which, and poetry-curate.py's PUBLIC list
   enforces it upstream of here.

   Replaced the chronology rail and facet bar on 2026-11-02, when the verse
   actually arrived and the shape of it became knowable. Two things now:

     the dial   a spiral, one loop per year, winding INWARD — 2021 at the rim,
                2026 at the centre. Inward on purpose: 2021 alone holds nearly
                half the pieces and wants the circumference. Angle is position
                in the year, so a season keeps a fixed bearing across five
                loops. Dotted stretches are months he kept nothing from; that
                negative space is the point, not an artefact. The animated
                layer is a SEPARATE svg behind the interactive one, drawn once
                and never touched, so a click never restarts a 7-minute turn.

     the book   28 chapters, which were the journal notes, shut by default.
                One poem opens at a time, with its verse, its photograph where
                one exists, and the reviewed note behind the "?".
───────────────────────────────────────────────────────────────────────────*/
(function () {
  "use strict";

  var SEASONS = [["spring", "Spring"], ["summer", "Summer"],
                 ["autumn", "Autumn"], ["winter", "Winter"]];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
             "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MOOD_FACE = { happy: "sat-smile", sad: "sat-done-for" };
  var QUIET_MONTHS = 3;
  var CX = 300, CY = 300, ROUT = 252, RIN = 62;

  var POEMS = [], CHAPTERS = [], PAIRS = [], MOODS = {}, SILENCES = [];
  var season = null, sel = null, lastPick = {};

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function T(iso) { return new Date(iso + "T00:00:00Z").getTime(); }
  function months(a, b) { return Math.round((T(b) - T(a)) / 2629800000); }
  function pretty(iso) {
    var p = iso.split("-");
    return MON[+p[1] - 1] + " " + (+p[2]) + ", " + p[0];
  }
  function shortd(iso) {
    var p = iso.split("-");
    return MON[+p[1] - 1] + " ’" + p[0].slice(2);
  }
  function cvar(name) {
    return getComputedStyle(document.documentElement)
             .getPropertyValue("--pp-" + name).trim() || "#888";
  }
  function count(k) {
    return POEMS.filter(function (p) { return p.season === k; }).length;
  }

  /* ── the spiral ───────────────────────────────────────────────────────── */
  function yearFrac(iso) {
    var p = iso.split("-").map(Number);
    return (((p[1] - 3 + 12) % 12) + (p[2] - 1) / 31) / 12;
  }
  function polar(iso, t0, t1) {
    var prog = (T(iso) - t0) / (t1 - t0);
    var r = ROUT - (ROUT - RIN) * prog;
    var a = (yearFrac(iso) * 360 - 90) * Math.PI / 180;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  }
  /* seeded, so the debris does not shimmer every time the dial redraws */
  function rng(seed) {
    return function () {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }
  var DEBRIS = (function () {
    var r = rng(20210402), out = [], i, ang, rad, q;
    for (i = 0; i < 320; i++) {
      ang = r() * Math.PI * 2;
      rad = RIN + 10 + Math.pow(r(), 0.62) * (ROUT + 18 - RIN - 10);
      q = Math.floor(((((ang * 180 / Math.PI + 90) % 360) + 360) % 360) / 90);
      out.push({ x: CX + rad * Math.cos(ang), y: CY + rad * Math.sin(ang),
                 r: 0.4 + r() * 1.5, k: SEASONS[q][0], o: 0.10 + r() * 0.30 });
    }
    return out;
  })();

  /* The whole spiral as one continuous path, used only by the falling motes.
     The data's own line is drawn separately in front, broken at the silences. */
  function spiralPath(t0, t1) {
    var d = "", i, pt;
    for (i = 0; i <= 420; i++) {
      pt = polar(new Date(t0 + (t1 - t0) * (i / 420)).toISOString().slice(0, 10), t0, t1);
      d += (i ? " L " : "M ") + pt[0].toFixed(1) + " " + pt[1].toFixed(1);
    }
    return d;
  }

  function backdrop(t0, t1) {
    var s = '<svg class="back" viewBox="-34 -30 668 662" aria-hidden="true">';
    s += '<defs><radialGradient id="pp-fade">' +
         '<stop offset="18%" stop-color="#fff" stop-opacity="0"/>' +
         '<stop offset="78%" stop-color="#fff" stop-opacity="1"/>' +
         '<stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
         '<mask id="pp-softmask"><circle cx="' + CX + '" cy="' + CY + '" r="' + (ROUT + 20) +
         '" fill="url(#pp-fade)"/></mask>' +
         /* the quadrants have no edges of their own; this is what makes them weather */
         '<filter id="pp-nebula" x="-14%" y="-14%" width="128%" height="128%">' +
         '<feGaussianBlur stdDeviation="19"/></filter>' +
         '<radialGradient id="pp-eh">' +
         '<stop offset="48%" stop-color="var(--pp-horizon)" stop-opacity="1"/>' +
         '<stop offset="100%" stop-color="var(--pp-horizon)" stop-opacity="0"/>' +
         '</radialGradient></defs>';
    s += '<g class="pp-wedges" mask="url(#pp-softmask)" opacity="var(--pp-wedge)">' +
         '<g filter="url(#pp-nebula)">';
    SEASONS.forEach(function (sn, i) {
      /* overlapping past 90 degrees, so neighbours bleed into one another */
      var a0 = (i * 90 - 90 - 13) * Math.PI / 180,
          a1 = ((i + 1) * 90 - 90 + 13) * Math.PI / 180, R = ROUT + 26;
      s += '<path class="s-' + sn[0] + '" d="M ' + CX + ' ' + CY +
           ' L ' + (CX + R * Math.cos(a0)).toFixed(1) + ' ' + (CY + R * Math.sin(a0)).toFixed(1) +
           ' A ' + R + ' ' + R + ' 0 0 1 ' + (CX + R * Math.cos(a1)).toFixed(1) + ' ' +
           (CY + R * Math.sin(a1)).toFixed(1) + ' Z" fill="' + cvar(sn[0]) + '"/>';
    });
    s += '</g></g>';
    /* the field. Each mote's pulse is delayed by how far out it sits, so the
       swell reads as one ripple travelling through them rather than 320 twitches. */
    s += '<g class="pp-debris" mask="url(#pp-softmask)" opacity="var(--pp-debris)">';
    DEBRIS.forEach(function (d) {
      var dist = Math.sqrt((d.x - CX) * (d.x - CX) + (d.y - CY) * (d.y - CY));
      var delay = -((dist - RIN) / (ROUT - RIN)) * 5.2;
      s += '<circle class="s-' + d.k + '" style="--o:' + d.o.toFixed(2) +
           ';--d:' + delay.toFixed(2) + 's" cx="' + d.x.toFixed(1) + '" cy="' +
           d.y.toFixed(1) + '" r="' + d.r.toFixed(2) + '" fill="' + cvar(d.k) + '"/>';
    });
    s += '</g>';
    /* three motes running the spiral inward, which is the only direction it goes */
    var dpath = spiralPath(t0, t1);
    s += '<g class="pp-stream" mask="url(#pp-softmask)">';
    [0, 1, 2].forEach(function (n) {
      s += '<path class="pp-mote m' + n + '" d="' + dpath + '" pathLength="1000" ' +
           'fill="none" stroke="var(--pp-gold)" stroke-linecap="round"/>';
    });
    s += "</g>";
    /* the centre. The spiral stops at r=62, so nothing ever crosses it. */
    s += '<circle cx="' + CX + '" cy="' + CY + '" r="44" fill="url(#pp-eh)"/>' +
         '<circle cx="' + CX + '" cy="' + CY + '" r="22" fill="var(--pp-horizon)" ' +
         'stroke="var(--pp-gold)" stroke-width="1.2" stroke-opacity=".55"/>' +
         '<text class="pp-ehlab" x="' + CX + '" y="' + (CY + 48) + '" text-anchor="middle" ' +
         'fill="var(--pp-gold)">DA’AT</text>';
    return s + "</svg>";
  }

  /* The spiral starts on 1 March of the first year, not at the first poem, so every
     year label lands on the same ray straight up. It opens with a few empty weeks;
     that costs nothing and buys a readable axis. */
  function span() {
    var y0 = +POEMS[0].date.slice(0, 4);
    var t0 = T(y0 + "-03-01");
    if (t0 > T(POEMS[0].date)) { t0 = T((y0 - 1) + "-03-01"); }
    return [t0, T(POEMS[POEMS.length - 1].date)];
  }

  function drawDial() {
    var sp = span(), t0 = sp[0], t1 = sp[1];
    var s = '<svg class="front" viewBox="-34 -30 668 662" role="img" aria-label="' +
      'A spiral of ' + POEMS.length + ' poems. One loop is one year, winding inward from the ' +
      'first year at the rim toward a dark centre at the last. Position around each loop is the ' +
      'time of year, so every season keeps a fixed bearing. Dotted stretches are months with ' +
      'nothing written.">';
    /* No spokes. The quadrants are weather in the backdrop, not compartments. */
    /* the guide, broken wherever he stopped writing */
    var run = [], runSilent = null, i, ms, pt, quiet;
    function flush() {
      if (run.length > 1) {
        s += '<polyline class="' + (runSilent ? "pp-silent" : "pp-guide") +
             '" points="' + run.join(" ") + '"/>';
      }
    }
    for (i = 0; i <= 900; i++) {
      ms = t0 + (t1 - t0) * (i / 900);
      pt = polar(new Date(ms).toISOString().slice(0, 10), t0, t1);
      quiet = SILENCES.some(function (v) { return ms > v.a && ms < v.b; });
      if (runSilent === null) { runSilent = quiet; }
      if (quiet !== runSilent) {
        run.push(pt[0].toFixed(1) + "," + pt[1].toFixed(1));
        flush(); run = []; runSilent = quiet;
      }
      run.push(pt[0].toFixed(1) + "," + pt[1].toFixed(1));
    }
    flush();
    SILENCES.filter(function (v) { return v.g >= 6; }).forEach(function (v) {
      var p = polar(new Date((v.a + v.b) / 2).toISOString().slice(0, 10), t0, t1);
      var ang = Math.atan2(p[1] - CY, p[0] - CX);
      s += '<text class="pp-sillab" x="' + (p[0] + 13 * Math.cos(ang)).toFixed(1) +
           '" y="' + (p[1] + 13 * Math.sin(ang) + 3).toFixed(1) +
           '" text-anchor="middle">' + v.g + ' mo</text>';
    });
    SEASONS.forEach(function (sn, i) {
      var a = ((i * 90) + 45 - 90) * Math.PI / 180, rr = ROUT + 30, act = (season === sn[0]);
      s += '<text class="pp-slab" data-season="' + sn[0] + '" tabindex="0" role="button" ' +
           'aria-pressed="' + act + '" x="' + (CX + rr * Math.cos(a)).toFixed(0) +
           '" y="' + (CY + rr * Math.sin(a) + 4).toFixed(0) + '" text-anchor="middle" fill="' +
           (act ? cvar(sn[0]) : "var(--pp-soft)") + '" style="font-weight:' +
           (act ? 500 : 400) + '">' + sn[1] + "</text>";
    });
    /* every year on the same ray, the first one included */
    var y, iso, p;
    for (y = +POEMS[0].date.slice(0, 4);
         y <= +POEMS[POEMS.length - 1].date.slice(0, 4); y++) {
      iso = y + "-03-01";
      if (T(iso) < t0 || T(iso) > t1) { continue; }
      p = polar(iso, t0, t1);
      s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) +
           '" r="2" fill="var(--pp-soft)"/><text class="pp-ylab" x="' +
           (p[0] + 7).toFixed(1) + '" y="' + (p[1] - 5).toFixed(1) + '">' + y + "</text>";
    }
    POEMS.forEach(function (q) {
      var pt2 = polar(q.date, t0, t1);
      var r = 2 + Math.min(5, Math.sqrt(+q.lines || 1) * 0.75);
      var on = (season === null || q.season === season);
      s += '<circle class="pp-dot' + (on ? "" : " dim") + (sel === q.slug ? " sel" : "") +
           '" data-s="' + q.slug + '" tabindex="0" role="button" cx="' + pt2[0].toFixed(1) +
           '" cy="' + pt2[1].toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + cvar(q.season) +
           '" fill-opacity=".88" aria-label="' + esc(q.title) + ', ' + pretty(q.date) +
           '"><title>' + esc(q.title) + " · " + q.lines + " lines</title></circle>";
    });
    var dial = document.getElementById("poem-dial");
    if (!dial.querySelector(".back")) {
      dial.insertAdjacentHTML("afterbegin", backdrop(t0, t1));
    }
    var old = dial.querySelector(".front");
    if (old) { old.outerHTML = s + "</svg>"; }
    else { dial.insertAdjacentHTML("beforeend", s + "</svg>"); }
    if (season) { dial.setAttribute("data-season", season); }
    else { dial.removeAttribute("data-season"); }
  }

  /* ── side rail ────────────────────────────────────────────────────────── */
  function readout(p) {
    document.getElementById("poem-readout").innerHTML = p
      ? '<p class="t">' + esc(p.title) + '</p><p class="m">' + pretty(p.date) +
        (p.age ? " · age " + p.age : "") + " · " + p.lines +
        (+p.lines === 1 ? " line" : " lines") + " · " + p.season + "</p>"
      : '<p class="e">Hover the spiral, or pick a dot.</p>';
  }
  function choose(slug) {
    sel = (sel === slug ? null : slug);
    render();
    if (!sel) { readout(null); return; }
    var p = POEMS.filter(function (q) { return q.slug === sel; })[0];
    var ch = document.getElementById("pp-ch-" + p.ci);
    var row = document.getElementById("pp-p-" + sel);
    if (ch) { ch.open = true; }
    if (row) { row.open = true; row.scrollIntoView({ behavior: "smooth", block: "center" }); }
    readout(p);
  }
  function pickSeason(k) { season = (season === k ? null : k); sel = null; render(); }

  /* ── the book ─────────────────────────────────────────────────────────── */
  function buildBook() {
    var h = "";
    CHAPTERS.forEach(function (c, ci) {
      var items = POEMS.filter(function (p) { return p.ci === ci; });
      if (!items.length) { return; }
      if (ci > 0 && CHAPTERS[ci - 1]) {
        var g = months(CHAPTERS[ci - 1].date, c.date);
        if (g > QUIET_MONTHS) {
          h += '<div class="pp-gap" style="--w:' + Math.min(96, g * 9) + 'px">' +
               '<span class="lb">' + g + ' months</span><span class="ln2"></span></div>';
        }
      }
      h += '<details class="pp-ch" id="pp-ch-' + ci + '"><summary>' +
           '<span class="no">' + String(ci + 1).padStart(2, "0") + '</span>' +
           '<span class="ti">' + esc(c.title) + '</span>' +
           '<span class="me">' + shortd(c.date) + " · " + items.length +
           '</span></summary><div class="pp-chbody">';
      items.forEach(function (p) {
        var mir = PAIRS.filter(function (x) { return x[0] === p.slug || x[1] === p.slug; })
          .map(function (x) {
            var other = POEMS.filter(function (q) {
              return q.slug === (x[0] === p.slug ? x[1] : x[0]);
            })[0];
            return other ? esc(other.title) +
              ' <span style="color:var(--pp-soft)">— ' + esc(x[2]) + "</span>" : null;
          }).filter(Boolean);
        var tags = [p.age ? "age " + p.age : "", p.season + " " + (p.year || ""),
                    (p.theme || []).join(" · ")].filter(Boolean).join(" · ");
        h += '<details class="pp-p" id="pp-p-' + p.slug + '" data-s="' + p.slug +
             '" data-se="' + p.season + '"><summary>' +
             '<span class="dt">' + shortd(p.date) + '</span>' +
             '<span class="nm">' + esc(p.title) + '</span>' +
             '<span class="rt">' +
             (p.image ? '<span class="pp-pic" title="Has a photograph">ph</span>' : "") +
             '<span class="se" style="background:' + cvar(p.season) + '" title="' + p.season +
             '"></span><span class="ln">' + p.lines + '</span>' +
             '<span class="pp-q" title="Context">?</span></span></summary>' +
             '<div class="pp-pbody">' +
             '<div class="pp-bay"><p class="pp-verse">' + esc(p.text) + "</p></div>" +
             (p.image ? '<figure class="pp-shot"><img src="assets/poetry/' +
               esc(p.image.file) + '" alt="' + esc(p.image.caption) + '" loading="lazy">' +
               '<figcaption>' + esc(p.image.caption) + "</figcaption></figure>" : "") +
             '<div class="pp-ctx">' +
             (p.notes && p.notes.length
               ? "<ul>" + p.notes.map(function (n) {
                   return "<li>" + esc(n) + "</li>";
                 }).join("") + "</ul>"
               : "") +
             (mir.length ? '<p class="mir">Answers → ' + mir.join("; ") + "</p>" : "") +
             '<p class="tags">' + esc(tags) + "</p>" +
             "</div></div></details>";
      });
      h += "</div></details>";
    });
    document.getElementById("grimoire").innerHTML =
      h + '<p class="pp-empty" id="pp-none" hidden>Nothing from that season.</p>';
  }

  function syncAll() {
    var btn = document.getElementById("pp-allbtn");
    var shut = Array.prototype.slice
      .call(document.querySelectorAll("#grimoire .pp-ch:not(.hide)"))
      .some(function (d) { return !d.open; });
    btn.textContent = shut ? "Open all" : "Close all";
  }

  function render() {
    drawDial();
    Array.prototype.forEach.call(document.querySelectorAll(".pp-chip"), function (b) {
      var a = (season === b.getAttribute("data-season"));
      b.setAttribute("aria-pressed", String(a));
      b.classList.toggle("dim", season !== null && !a);
    });
    var shown = 0;
    Array.prototype.forEach.call(document.querySelectorAll("#grimoire .pp-p"), function (el) {
      var on = (season === null || el.getAttribute("data-se") === season);
      el.classList.toggle("hide", !on);
      el.classList.toggle("sel", sel === el.getAttribute("data-s"));
      if (!on && el.open) { el.open = false; }
      if (on) { shown++; }
    });
    Array.prototype.forEach.call(document.querySelectorAll("#grimoire .pp-ch"), function (el) {
      var any = Array.prototype.slice.call(el.querySelectorAll(".pp-p"))
        .some(function (p) { return !p.classList.contains("hide"); });
      el.classList.toggle("hide", !any);
      if (season !== null && any) { el.open = true; }
      if (season === null && !sel) { el.open = false; }
    });
    Array.prototype.forEach.call(document.querySelectorAll("#grimoire .pp-gap"), function (el) {
      el.hidden = (season !== null);
    });
    document.getElementById("pp-none").hidden = (shown > 0);
    syncAll();
  }

  /* ── wiring ───────────────────────────────────────────────────────────── */
  function start(data) {
    POEMS = (data.poems || []).filter(function (p) { return p.date; });
    if (!POEMS.length) { return; }          /* the waiting line stays */
    CHAPTERS = data.chapters || [];
    PAIRS = data.pairs || [];
    MOODS = {};
    POEMS.forEach(function (p) {
      (p.moods || []).forEach(function (m) {
        MOODS[m] = MOODS[m] || [];
        MOODS[m].push(p.slug);
      });
    });
    var i, g;
    for (i = 1; i < POEMS.length; i++) {
      g = months(POEMS[i - 1].date, POEMS[i].date);
      if (g > QUIET_MONTHS) {
        SILENCES.push({ a: T(POEMS[i - 1].date), b: T(POEMS[i].date), g: g });
      }
    }
    var waiting = document.getElementById("poem-waiting");
    if (waiting) { waiting.hidden = true; }
    document.getElementById("poem-stage").hidden = false;

    var quiet = SILENCES.reduce(function (n, v) { return n + v.g; }, 0);
    var run = months(POEMS[0].date, POEMS[POEMS.length - 1].date);
    var lens = POEMS.map(function (p) { return +p.lines || 0; });
    var ages = POEMS.map(function (p) { return +p.age; }).filter(function (a) { return a; });
    document.getElementById("pp-nerd").innerHTML = [
      [POEMS.length, "pieces kept, of 89"],
      [lens.reduce(function (a, b) { return a + b; }, 0).toLocaleString(), "lines of verse"],
      [CHAPTERS.length, "journal notes"],
      [ages.length ? Math.min.apply(null, ages) + "–" + Math.max.apply(null, ages) : "—",
       "his age across it"],
      [quiet + " / " + run, "months he wrote nothing"],
      [18, "failed romances, one per woman"],
      [1, "powerlifting mentor lost"],
      [PAIRS.length, "poems answering another poem"],
      [Math.max.apply(null, lens) + " / " + Math.min.apply(null, lens),
       "longest and shortest, in lines"]
    ].map(function (r) {
      return "<div><b>" + r[0] + "</b><span>" + r[1] + "</span></div>";
    }).join("");

    document.getElementById("poem-chips").innerHTML = SEASONS.map(function (s) {
      return '<button class="pp-chip" type="button" data-season="' + s[0] +
             '" style="--sw:' + cvar(s[0]) + '"><i></i>' + s[1] +
             " <u>" + count(s[0]) + "</u></button>";
    }).join("");
    document.getElementById("poem-picks").innerHTML =
      Object.keys(MOOD_FACE).filter(function (m) { return (MOODS[m] || []).length; })
      .map(function (m) {
        return '<button type="button" data-mood="' + m + '"><span class="lbl">' +
          '<svg class="sat" aria-hidden="true"><use href="assets/planet-sprite.svg#' +
          MOOD_FACE[m] + '"/></svg>' + m.charAt(0).toUpperCase() + m.slice(1) +
          "</span><u>" + MOODS[m].length + "</u></button>";
      }).join("");
    var years = POEMS.map(function (p) { return p.date.slice(0, 4); })
      .filter(function (v, i2, a) { return a.indexOf(v) === i2; });
    document.getElementById("poem-jump").innerHTML =
      years.map(function (y) {
        return '<button type="button" data-y="' + y + '">' + y + "</button>";
      }).join("") + '<button type="button" data-y="top">top</button>';

    buildBook();

    var dial = document.getElementById("poem-dial");
    dial.addEventListener("click", function (e) {
      var t = e.target.closest("[data-season]");
      if (t) { pickSeason(t.getAttribute("data-season")); return; }
      var d = e.target.closest("[data-s]");
      if (d) { choose(d.getAttribute("data-s")); }
    });
    dial.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") { return; }
      var t = e.target.closest("[data-season]");
      if (t) { e.preventDefault(); pickSeason(t.getAttribute("data-season")); return; }
      var d = e.target.closest("[data-s]");
      if (d) { e.preventDefault(); choose(d.getAttribute("data-s")); }
    });
    dial.addEventListener("pointerover", function (e) {
      var d = e.target.closest("[data-s]");
      if (d) {
        readout(POEMS.filter(function (p) {
          return p.slug === d.getAttribute("data-s");
        })[0]);
      }
    });
    document.getElementById("poem-chips").addEventListener("click", function (e) {
      var b = e.target.closest(".pp-chip");
      if (b) { pickSeason(b.getAttribute("data-season")); }
    });
    document.getElementById("poem-picks").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-mood]");
      if (!b) { return; }
      var m = b.getAttribute("data-mood");
      var pool = MOODS[m].filter(function (s) { return s !== lastPick[m]; });
      if (!pool.length) { return; }
      var slug = pool[Math.floor(Math.random() * pool.length)];
      lastPick[m] = slug;
      season = null; sel = null; render(); choose(slug);
    });
    document.getElementById("poem-jump").addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) { return; }
      if (b.getAttribute("data-y") === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      var p = POEMS.filter(function (q) {
        return q.date.slice(0, 4) === b.getAttribute("data-y");
      })[0];
      if (!p) { return; }
      var ch = document.getElementById("pp-ch-" + p.ci);
      if (ch) { ch.open = true; ch.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
    document.getElementById("grimoire").addEventListener("toggle", function (e) {
      var d = e.target;
      if (!d.classList || !d.classList.contains("pp-p")) { return; }
      if (d.open) {
        sel = d.getAttribute("data-s");
        readout(POEMS.filter(function (p) { return p.slug === sel; })[0]);
        Array.prototype.forEach.call(
          document.querySelectorAll("#grimoire .pp-p[open]"),
          function (o) { if (o !== d) { o.open = false; } });
        Array.prototype.forEach.call(document.querySelectorAll("#grimoire .pp-p"),
          function (o) { o.classList.toggle("sel", o === d); });
        drawDial();
      } else if (sel === d.getAttribute("data-s")) {
        sel = null; d.classList.remove("sel"); drawDial(); readout(null);
      }
      syncAll();
    }, true);
    document.getElementById("pp-allbtn").addEventListener("click", function () {
      var open = document.getElementById("pp-allbtn").textContent.trim() === "Open all";
      Array.prototype.forEach.call(
        document.querySelectorAll("#grimoire .pp-ch:not(.hide)"),
        function (d) { d.open = open; });
      syncAll();
    });

    readout(null);
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("poem-dial")) { return; }
    var req = new XMLHttpRequest();
    req.open("GET", "data/poetry.json", true);
    req.onload = function () {
      var data;
      try { data = JSON.parse(req.responseText); } catch (e) { return; }
      if (!Array.isArray(data.poems)) { return; }
      start(data);
    };
    req.send();
  });
})();
