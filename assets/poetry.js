/* ─── THE POETRY TAB ───────────────────────────────────────────────────────
   Renders whatever data/poetry.json holds and says so plainly when it holds
   nothing. It never invents a line, and it shows no filter a reader cannot
   use: a bucket with no pieces behind it stays out of the bar.

   Three pieces of furniture, in reading order down the page:

     the wheel    a chronology rail — one stop per year that carries verse,
                  chevrons at each end, arrow keys, scroll-snap. The Eleven
                  Days day-stepper, turned sideways and given a decade.
     the sorting  era / theme / form / length, drawn off the `facets` block
                  that scripts/poetry-curate.py copies out of
                  projects/poetry/taxonomy.json. One list, one source.
     the bays     one full bay per piece, a preface above the verse. Report C
                  section 4: a four-line piece carries the same typographic
                  authority as a sixty-line one.

   The facet values live on the poem objects. Nothing private reaches this
   file — poetry-curate.py's PUBLIC list decides that, upstream.
───────────────────────────────────────────────────────────────────────────*/
(function () {
  "use strict";

  var FACET_ORDER = ["era", "theme", "form", "length_band"];
  var state = { year: "", era: "", theme: "", form: "", length_band: "" };
  var data = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text !== undefined && text !== null) { n.textContent = text; }
    return n;
  }

  function values(facet) {
    var f = data.facets && data.facets[facet];
    if (!f) { return []; }
    return f.values || (f.bands || []);
  }

  function labelFor(facet, slug) {
    var hit = values(facet).filter(function (v) { return v.slug === slug; })[0];
    return hit ? hit.label : slug;
  }

  function holds(poem, facet, slug) {
    var v = poem[facet];
    if (Array.isArray(v)) { return v.indexOf(slug) > -1; }
    return v === slug;
  }

  /* A bucket earns a chip by having verse behind it. */
  function live(facet) {
    return values(facet).filter(function (v) {
      return data.poems.some(function (p) { return holds(p, facet, v.slug); });
    });
  }

  function matches(poem) {
    if (state.year && poem.year !== state.year) { return false; }
    return FACET_ORDER.every(function (facet) {
      return !state[facet] || holds(poem, facet, state[facet]);
    });
  }

  /* Every year that carries verse, with the count the other filters leave
     standing. A year the current sorting empties stays on the rail — the
     chronology keeps its shape — but says so and sits back. */
  function years() {
    var seen = {}, under = {};
    data.poems.forEach(function (p) {
      if (!p.year) { return; }
      seen[p.year] = (seen[p.year] || 0) + 1;
      if (FACET_ORDER.every(function (f) { return !state[f] || holds(p, f, state[f]); })) {
        under[p.year] = (under[p.year] || 0) + 1;
      }
    });
    return Object.keys(seen).sort().map(function (y) {
      return { year: y, count: seen[y], live: under[y] || 0 };
    });
  }

  /* ── The wheel ──────────────────────────────────────────────────────────
     A rail of years rather than a calendar grid: these dates come off journal
     files, so most of them mean "around then". The rail says that much and no
     more. The Eleven Days engine, where a reader plugs in any date at all,
     waits for its own page — docs/website/WEBSITE-ROADMAP.md. */
  function wheel(root) {
    var stops = years();
    if (stops.length < 2) { return; }

    var box = el("div", "date-wheel");
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", "Jump through the years");

    var back = el("button", "wheel-step", "‹");
    back.setAttribute("aria-label", "Earlier");
    var rail = el("div", "wheel-rail");
    var fwd = el("button", "wheel-step", "›");
    fwd.setAttribute("aria-label", "Later");

    var everything = data.poems.filter(function (p) {
      return FACET_ORDER.every(function (f) { return !state[f] || holds(p, f, state[f]); });
    }).length;
    var all = el("button", "wheel-stop is-all");
    all.appendChild(el("span", "stop-year", "All"));
    all.appendChild(el("span", "stop-count",
      everything === 1 ? "1 piece" : everything + " pieces"));
    all.onclick = function () { state.year = ""; draw(); };
    rail.appendChild(all);

    stops.forEach(function (stop) {
      var b = el("button", "wheel-stop" + (stop.live ? "" : " is-empty"));
      b.dataset.year = stop.year;
      b.appendChild(el("span", "stop-year", stop.year));
      b.appendChild(el("span", "stop-count",
        stop.live === 1 ? "1 piece" : stop.live + " pieces"));
      b.onclick = function () {
        state.year = state.year === stop.year ? "" : stop.year;
        draw();
      };
      rail.appendChild(b);
    });

    function step(by) {
      var order = [""].concat(stops.map(function (s) { return s.year; }));
      var at = order.indexOf(state.year) + by;
      if (at < 0 || at >= order.length) { return; }
      state.year = order[at];
      draw();
    }
    back.onclick = function () { step(-1); };
    fwd.onclick = function () { step(1); };
    rail.tabIndex = 0;
    rail.onkeydown = function (e) {
      if (e.key === "ArrowLeft") { step(-1); e.preventDefault(); }
      if (e.key === "ArrowRight") { step(1); e.preventDefault(); }
    };

    box.appendChild(back);
    box.appendChild(rail);
    box.appendChild(fwd);
    root.appendChild(box);

    var current = rail.querySelector(state.year
      ? '.wheel-stop[data-year="' + state.year + '"]'
      : ".wheel-stop.is-all");
    if (current) {
      current.setAttribute("aria-current", "true");
      current.scrollIntoView({ block: "nearest", inline: "center" });
    }
  }

  /* ── The sorting ────────────────────────────────────────────────────── */
  function sorting(root) {
    var bar = el("div", "sorting");
    var drew = false;

    FACET_ORDER.forEach(function (facet) {
      var options = live(facet);
      if (options.length < 2) { return; }
      drew = true;
      var group = el("div", "sort-group");
      var spec = data.facets[facet];
      group.appendChild(el("span", "sort-label", spec.label));
      var chips = el("div", "sort-chips");
      options.forEach(function (v) {
        var b = el("button", "sort-chip", v.label);
        if (v.blurb) { b.title = v.blurb; }
        b.setAttribute("aria-pressed", state[facet] === v.slug);
        b.onclick = function () {
          state[facet] = state[facet] === v.slug ? "" : v.slug;
          draw();
        };
        chips.appendChild(b);
      });
      group.appendChild(chips);
      bar.appendChild(group);
    });

    if (drew) { root.appendChild(bar); }
  }

  /* ── One bay ────────────────────────────────────────────────────────── */
  function preface(poem) {
    var row = el("p", "preface");
    var bits = [];

    if (poem.era) {
      var era = el("span", "era-mark " + poem.era, labelFor("era", poem.era));
      era.title = poem.era === "pre-ai"
        ? "Written before the machines"
        : "Written after the machines arrived";
      bits.push(era);
    }
    if (poem.written) {
      var when = el("span", "when", poem.written);
      if (poem.written_precision === "file-dated") {
        when.textContent = "around " + poem.written;
        when.title = "Dated off the journal file it came out of, so: approximately";
      }
      bits.push(when);
    }
    if (poem.age) { bits.push(el("span", null, "at " + poem.age)); }
    if (poem.season) { bits.push(el("span", null, labelFor("season", poem.season))); }
    if (poem.time_of_day) { bits.push(el("span", null, poem.time_of_day)); }
    if (poem.form) { bits.push(el("span", null, labelFor("form", poem.form))); }

    (poem.theme || []).forEach(function (slug) {
      var t = el("button", "theme-mark", labelFor("theme", slug));
      t.onclick = function () {
        state.theme = state.theme === slug ? "" : slug;
        draw();
      };
      bits.push(t);
    });

    bits.forEach(function (bit, i) {
      if (i) { row.appendChild(el("span", "sep", "·")); }
      row.appendChild(bit);
    });
    return bits.length ? row : null;
  }

  function bay(poem) {
    var art = el("article", "verse-bay");
    art.id = "p-" + poem.slug;
    art.appendChild(el("h2", null, poem.title || "Untitled"));
    var pre = preface(poem);
    if (pre) { art.appendChild(pre); }
    art.appendChild(el("p", "verse", poem.text));
    if (poem.what_i_was_reading) {
      art.appendChild(el("p", "credit", "reading: " + poem.what_i_was_reading));
    }
    if (poem.mood || poem.disposition) {
      art.appendChild(el("p", "credit", [poem.mood, poem.disposition].filter(Boolean).join(" · ")));
    }
    return art;
  }

  /* ── The draw ───────────────────────────────────────────────────────── */
  function draw() {
    var root = document.querySelector(".poems");
    if (!root) { return; }
    root.textContent = "";

    /* The hero's standfirst says "none of them here yet", which stops being
       true the moment a piece crosses. The page corrects its own copy rather
       than leaving a stale sentence above live verse. */
    var stand = document.querySelector(".page-hero .standfirst");
    if (stand && data.poems.length) {
      stand.textContent = data.poems.length === 1
        ? "One piece has crossed over. The other eighty-eight sit where only their author reads them."
        : data.poems.length + " pieces have crossed over, oldest first. The rest sit where only their author reads them.";
    }

    if (!data.poems.length) {
      var box = el("div", "dogear");
      box.appendChild(el("p", null, data.waiting || "The verse waits on its author."));
      box.appendChild(el("span", "fold"));
      root.appendChild(box);
      return;
    }

    wheel(root);
    sorting(root);

    /* Oldest first, whatever order the data file happens to hold. */
    var showing = data.poems.filter(matches).sort(function (a, b) {
      return (a.year || "0000").localeCompare(b.year || "0000");
    });
    var tally = el("p", "tally");
    tally.textContent = showing.length === data.poems.length
      ? data.poems.length + " pieces, oldest first"
      : showing.length + " of " + data.poems.length + " pieces";
    if (showing.length !== data.poems.length) {
      var clear = el("button", "clear", "clear");
      clear.onclick = function () {
        state = { year: "", era: "", theme: "", form: "", length_band: "" };
        draw();
      };
      tally.appendChild(document.createTextNode(" · "));
      tally.appendChild(clear);
    }
    root.appendChild(tally);

    if (!showing.length) {
      root.appendChild(el("p", "nothing", "Nothing sits in that corner yet."));
      return;
    }
    showing.forEach(function (poem) { root.appendChild(bay(poem)); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.querySelector(".poems");
    if (!root) { return; }
    var req = new XMLHttpRequest();
    req.open("GET", "data/poetry.json", true);
    req.onload = function () {
      try { data = JSON.parse(req.responseText); } catch (e) { return; }
      if (!Array.isArray(data.poems)) { data.poems = []; }
      draw();
    };
    req.send();
  });
})();
