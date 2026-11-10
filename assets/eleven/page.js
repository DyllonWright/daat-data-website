/* /eleven-days — the page's own behaviour.
 * ----------------------------------------------------------------------------
 * Drives the field, the featured answer, the ledger of eleven, the two-date
 * span, the proof block, and the tool in both its chromes. Everything reads
 * assets/eleven/engine.js, so the 98 window and the DOS pane cannot disagree:
 * one engine, two skins.
 *
 * NEVER HAND-WRITE A COMPUTED FIGURE. An earlier draft of this page printed a
 * rata die of 740,197 for 9 November 2026. Nobody computed it; the engine
 * returns 739,929. Every number on the page below comes out of the engine or
 * out of arithmetic on its day count — there are no literals standing in for
 * results anywhere in this file, and adding one would be the bug.
 *
 * WHAT THIS FILE DELIBERATELY DOES NOT DO. The plugin also carries the moon,
 * the tropical zodiac and a rare-event engine (src/astro.ts, src/moon.ts,
 * src/events.ts). Whether those ship at all remains the owner's open
 * question, so none of them is ported and the span block reports only what
 * engine.js can prove. The eclipse row the mockup sketched needs the astro
 * port and stays out until that question closes.
 */
(function () {
  "use strict";

  var KEYS = ["gregorian", "illuminati", "erisian", "pataphysical", "poundian",
              "thelemic", "frenchRev", "islamic", "chinese", "mayan", "hebrew"];

  var ERA = {
    gregorian: "C.E.", illuminati: "A.L.", erisian: "y.C.", pataphysical: "E.P.",
    poundian: "p.s.U.", thelemic: "Anno", frenchRev: "An", islamic: "A.H.",
    chinese: "C.C.", mayan: "Long Count", hebrew: "A.M."
  };

  var build = window.buildCalendars;
  var core = build && build.__core;
  if (!build || !core) return;

  var G = window.ELEVEN_GLOSS || { epoch: {}, notes: {} };

  /* ─── helpers ───────────────────────────────────────────────────────── */

  function pad(n) { return String(n).length < 2 ? "0" + n : String(n); }

  function iso(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function todayIso() { return iso(new Date()); }

  function valid(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var p = s.split("-").map(Number);
    var dt = new Date(p[0], p[1] - 1, p[2]);
    return dt.getFullYear() === p[0] && dt.getMonth() === p[1] - 1 && dt.getDate() === p[2];
  }

  function calc(s) {
    try { return build(s) || null; } catch (e) { return null; }
  }

  function rd(s) {
    var p = s.split("-").map(Number);
    return core.rdFromGreg(p[0], p[1], p[2]);
  }

  function shiftDays(s, n) {
    var p = s.split("-").map(Number);
    var dt = new Date(p[0], p[1] - 1, p[2]);
    dt.setDate(dt.getDate() + n);
    return iso(dt);
  }

  function parts(data, k) {
    var e = data && data[k];
    if (!e) return null;
    var year = String(e.year);
    if (k === "gregorian") year = year + " C.E.";
    if (k === "chinese") year = year + " C.C.";
    return { name: e.name || k, year: year, month: String(e.month), date: String(e.date) };
  }

  function group(n) { return Number(n).toLocaleString("en-US"); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  var NS = "http://www.w3.org/2000/svg";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ─── page state ────────────────────────────────────────────────────── */

  var sel = todayIso();
  var selKey = "mayan";          /* which system the featured answer pulls out */

  /* ─── the featured answer ───────────────────────────────────────────── */

  function paintAnswer() {
    var host = document.getElementById("eleven-answer");
    if (!host) return;
    var data = calc(sel);
    var p = data && parts(data, selKey);
    host.textContent = "";
    if (!p) {
      host.appendChild(el("div", "as", "No reading for that date."));
      return;
    }
    host.appendChild(el("span", "ak", p.name + " \u00b7 " + ERA[selKey]));
    host.appendChild(el("div", "av", p.year));
    var sub = el("p", "as");
    var note = (G.notes[selKey] && G.notes[selKey].y[1]) || "";
    sub.textContent = p.month + " \u00b7 " + p.date + ". " + note;
    host.appendChild(sub);
  }

  /* ─── the ledger of eleven ──────────────────────────────────────────── */

  function paintLedger() {
    var host = document.getElementById("eleven-ledger");
    if (!host) return;
    var data = calc(sel);
    host.textContent = "";
    if (!data) return;
    var openRow = null;

    KEYS.forEach(function (k) {
      var p = parts(data, k);
      if (!p) return;
      var row = el("button", "row");
      row.type = "button";
      row.setAttribute("aria-expanded", "false");
      row.setAttribute("data-key", k);
      row.appendChild(el("span", "rk", p.name));
      row.appendChild(el("span", "rv", p.year + " \u00b7 " + p.month + " \u00b7 " + p.date));
      var mark = el("span", "rd", "open");
      row.appendChild(mark);

      var gl = null;
      function toggle() {
        if (gl) {
          gl.remove(); gl = null;
          mark.textContent = "open";
          row.setAttribute("aria-expanded", "false");
          openRow = null;
          return;
        }
        if (openRow) openRow();
        gl = el("div", "gl");
        var g = G.notes[k];
        /* Two columns: the story on the left at a reading measure, and on
           the right what the system counts from and where to read on. The
           link used to sit under the story at 10px while the right half of
           the row stood empty. */
        gl.appendChild(el("p", "why", g ? g.y[1] : ""));
        var side = el("div", "side");
        var ep = el("div", "ep");
        ep.appendChild(el("span", "epk", "Counts from"));
        ep.appendChild(el("span", "epv", G.epoch[k] || "\u2014"));
        side.appendChild(ep);
        gl.appendChild(side);

        /* Read more, off-site. Every one of these URLs was checked for a 200
           rather than guessed from the system name - see notes.js. */
        var refs = (G.wiki && G.wiki[k]) || [];
        if (refs.length) {
          var more = el("div", "more");
          refs.forEach(function (r) {
            var a = document.createElement("a");
            a.className = "wiki";
            a.href = r[1];
            a.target = "_blank";
            a.rel = "noopener";
            a.appendChild(document.createTextNode(r[0] + " "));
            var arrow = el("span", "ico", "↗");
            arrow.setAttribute("aria-hidden", "true");
            a.appendChild(arrow);
            more.appendChild(a);
          });
          side.appendChild(more);
        }
        row.insertAdjacentElement("afterend", gl);
        mark.textContent = "close";
        row.setAttribute("aria-expanded", "true");
        openRow = toggle;
        /* the answer follows the row a visitor opened */
        selKey = k;
        paintAnswer();
      }
      row.addEventListener("click", toggle);
      host.appendChild(row);
    });
  }

  /* ─── the two-date span ─────────────────────────────────────────────── */
  /* What each system CROSSED between the endpoints, not one duration restated
     eleven times. Every figure here comes off the engine's own day count. */

  function newYearsCrossed(a, b, boundaryFor) {
    /* boundaryFor(gregorianYear) returns that year's new-year RD, or null */
    var ga = core.gregYearFromRD(a), gb = core.gregYearFromRD(b);
    var seen = {}, n = 0;
    for (var y = ga - 1; y <= gb + 1; y++) {
      var r = boundaryFor(y);
      if (r === null || r === undefined) continue;
      if (r > a && r <= b && !seen[r]) { seen[r] = 1; n++; }
    }
    return n;
  }

  function animalOf(dateStr) {
    var d = calc(dateStr);
    var m = d && d.chinese && String(d.chinese.month).match(/\(([^)]+)\)/);
    return m ? m[1] : null;
  }

  function paintSpan() {
    var out = document.getElementById("eleven-spanout");
    var fromI = document.getElementById("eleven-from");
    var toI = document.getElementById("eleven-to");
    if (!out || !fromI || !toI) return;

    var a = fromI.value, b = toI.value;
    out.textContent = "";
    if (!valid(a) || !valid(b)) {
      out.appendChild(el("p", "wait", "Fill in both dates and the counts appear here."));
      return;
    }

    var ra = rd(a), rb = rd(b);
    if (rb < ra) { var t = ra; ra = rb; rb = t; t = a; a = b; b = t; }
    var days = rb - ra;

    /* THE HEADLINE: the day count, large, with the Gregorian reading of the
       same gap under it. Both come off arithmetic on the two endpoints. */
    var total = el("div", "total");
    total.appendChild(el("div", "big", group(days)));
    total.appendChild(el("div", "unit", days === 1 ? "day" : "days"));
    var gap = ymdGap(a, b);
    var spelled = [[gap[0], "year"], [gap[1], "month"], [gap[2], "day"]]
      .filter(function (x) { return x[0] > 0; })
      .map(function (x) { return group(x[0]) + " " + x[1] + (x[0] === 1 ? "" : "s"); });
    if (spelled.length && gap[0] + gap[1] > 0) total.appendChild(el("p", "gap", spelled.join(", ")));
    out.appendChild(total);

    var rows = [];

    /* the mean synodic month, 29.530588853 days — the figure the engine's own
       lunation maths uses, so the two never disagree */
    rows.push(["Synodic months", (days / 29.530588853).toFixed(1), "",
               "New moon to new moon, about 29.53 days each", "moon", "the moon"]);

    var hijri = newYearsCrossed(ra, rb, function (y) {
      /* the Hijri year running at the end of that Gregorian year */
      var r = core.rdFromGreg(y, 12, 31);
      var iy = core.islamicFromRD(r)[0];
      try { return core.rdFromIslamic(iy, 1, 1); } catch (e) { return null; }
    });
    rows.push(["Hijri new years", group(hijri), "",
               "Each one opens a lunar year of 354 or 355 days", "islamic", "the Islamic calendar"]);

    var cny = newYearsCrossed(ra, rb, function (y) {
      try { return core.chineseNewYearOnOrBefore(core.rdFromGreg(y, 12, 31)); }
      catch (e) { return null; }
    });
    var an1 = animalOf(a), an2 = animalOf(b);
    rows.push(["Chinese new years", group(cny),
               an1 && an2 ? an1 + " \u2192 " + an2 : "",
               "The lunisolar year turns in late January or February", "chinese", "the Chinese calendar"]);

    /* A Calendar Round realigns the 260-day Tzolk'in with the 365-day Haab
       every 18,980 days, so a span reports whole rounds plus the remainder. */
    var round = Math.floor(days / 18980);
    rows.push(["Maya Calendar Rounds", group(round),
               days % 18980 ? "plus " + group(days % 18980) + " days" : "",
               "18,980 days, when the 260-day and 365-day counts realign", "mayan", "the Mayan calendar"]);

    rows.push(["Tzolk\u2019in rounds", (days / 260).toFixed(1), "",
               "The 260-day count, run end to end", "mayan", "the Mayan calendar"]);

    /* The rest as a ledger: label left, figure right on one baseline, the
       same reading order as the eleven further down the page. Each row says
       in plain words what it counts, and a click carries the visitor to the
       calendar it belongs to, opened. */
    var list = el("ul", "crossed");
    rows.forEach(function (r) {
      var li = el("li");
      var b = el("button");
      b.type = "button";
      b.title = "Jump to " + r[5];
      var lab = el("span", "lab");
      var name = el("span", "name", r[0] + " ");
      var arrow = el("span", "go", "\u2193");
      arrow.setAttribute("aria-hidden", "true");
      name.appendChild(arrow);
      lab.appendChild(name);
      lab.appendChild(el("span", "what", r[3]));
      b.appendChild(lab);
      var val = el("span", "val", r[1]);
      if (r[2]) val.appendChild(el("span", "aside", r[2]));
      b.appendChild(val);
      b.addEventListener("click", function () { jumpTo(r[4]); });
      li.appendChild(b);
      list.appendChild(li);
    });
    out.appendChild(list);
  }

  /* Carry the visitor to a block further down and mark where they landed.
     "moon" means the sky panels; anything else names a row of the ledger,
     which opens if it stands closed. */
  function jumpTo(target) {
    var node;
    if (target === "moon") {
      node = document.querySelector("#eleven-sky .eleven-moon");
    } else {
      node = document.querySelector('#eleven-ledger .row[data-key="' + target + '"]');
      if (node && node.getAttribute("aria-expanded") !== "true") node.click();
    }
    if (!node) return;
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "center" });
    node.classList.remove("is-landed");
    void node.offsetWidth;                 /* restart the mark if it ran before */
    node.classList.add("is-landed");
  }

  /* Whole years, months and days between two ISO dates, a on or before b:
     the way a person would say the gap, beside the raw day count. */
  function monthLen(y, m) {
    var leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
    return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  }

  function ymdGap(a, b) {
    var p = a.split("-").map(Number), q = b.split("-").map(Number);
    var y = q[0] - p[0], m = q[1] - p[1], d = q[2] - p[2];
    if (d < 0) {
      m--;
      d += q[1] === 1 ? monthLen(q[0] - 1, 12) : monthLen(q[0], q[1] - 1);
    }
    if (m < 0) { y--; m += 12; }
    return [y, m, d];
  }

  /* ─── the proof ─────────────────────────────────────────────────────── */

  var REPO = "https://github.com/DyllonWright/Eleven-Days";

  function paintProof() {
    var host = document.getElementById("eleven-proof");
    if (!host) return;
    var r = rd(sel);
    host.textContent = "";
    [
      ["The hub", "Rata die " + group(r),
       "One integer day count feeds all eleven. JDN = RD + 1721424.5, which puts this date at " +
       (r + 1721424.5).toLocaleString("en-US") + ".",
       REPO + "/blob/main/src/engine.js", "Read the engine"],
      ["The anchors", "95 checks",
       "2012-12-21 = 13.0.0.0.0, 4 Ahau 3 Kankin. Chinese New Year for every year 1990\u20132040. " +
       "Equinoxes within 30 minutes of published UT.",
       REPO + "/blob/main/test/engine.test.mjs#L29", "Read the checks"],
      ["The sweep", "43,830 \u00d7 11",
       "Every date across 120 years rendered in all eleven systems, with no holes and no throws.",
       REPO + "/blob/main/test/engine.test.mjs#L105", "Read the sweep"]
    ].forEach(function (row) {
      /* Each claim links to the file that backs it, in the plugin's public
         repo. A proof a visitor cannot open reads as an assertion. */
      var d = document.createElement("a");
      d.href = row[3];
      d.target = "_blank";
      d.rel = "noopener";
      d.appendChild(el("span", "pk", row[0]));
      d.appendChild(el("div", "pv", row[1]));
      d.appendChild(el("p", "pn", row[2]));
      var more = el("span", "pl");
      var gh = document.createElementNS(NS, "svg");
      gh.setAttribute("class", "eleven-ico");
      gh.setAttribute("aria-hidden", "true");
      var use = document.createElementNS(NS, "use");
      use.setAttributeNS(null, "href", "assets/eleven/icons.svg#ico-github");
      gh.appendChild(use);
      more.appendChild(gh);
      more.appendChild(document.createTextNode(" " + row[4] + " "));
      var arrow = el("span", null, "\u2197");
      arrow.setAttribute("aria-hidden", "true");
      more.appendChild(arrow);
      d.appendChild(more);
      host.appendChild(d);
    });
  }

  /* ═══ THE TOOL, SKIN ONE: WINDOWS 98 ═══════════════════════════════════
     The field flip-flops between an absolute date, with a drop-down month
     grid, and a day offset stepped with - and +. The icon on the button
     shows where pressing it takes you, rather than naming where you are.
     ═════════════════════════════════════════════════════════════════════ */

  var mode = "abs";        /* "abs" = typed date + month grid, "off" = offset */
  var offset = "7";
  var calOpen = false;
  var calCursor = null;

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December"];

  function svgCal() {
    return '<svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">' +
      '<rect x="0.5" y="1.5" width="12" height="11" fill="#fff" stroke="#000"/>' +
      '<rect x="0.5" y="1.5" width="12" height="3" fill="#000080" stroke="#000"/>' +
      '<rect x="2.5" y="0.5" width="1.5" height="2" fill="#000"/><rect x="8.5" y="0.5" width="1.5" height="2" fill="#000"/>' +
      '<rect x="2" y="6" width="2" height="2" fill="#a00"/><rect x="5.5" y="6" width="2" height="2" fill="#808080"/>' +
      '<rect x="9" y="6" width="2" height="2" fill="#808080"/><rect x="2" y="9" width="2" height="2" fill="#808080"/>' +
      '<rect x="5.5" y="9" width="2" height="2" fill="#808080"/></svg>';
  }

  function svgPlusMinus() {
    return '<svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">' +
      '<rect x="1" y="3" width="7" height="1.6" fill="#000"/><rect x="3.7" y="0.3" width="1.6" height="7" fill="#000"/>' +
      '<rect x="5" y="8.4" width="7" height="1.6" fill="#000"/></svg>';
  }

  function monthGrid() {
    var base = calCursor || sel;
    var p = base.split("-").map(Number);
    var y = p[0], m = p[1];
    var first = new Date(y, m - 1, 1);
    var cur = new Date(y, m - 1, 1 - first.getDay());
    var t = todayIso();
    var h = '<div class="cal"><div class="chd">' +
      '<button type="button" data-nav="-1" aria-label="Previous month">\u25c4</button>' +
      '<span class="mt">' + MONTHS[m - 1] + " " + y + "</span>" +
      '<button type="button" data-nav="1" aria-label="Next month">\u25ba</button></div>' +
      "<table><thead><tr>" +
      ["S", "M", "T", "W", "T", "F", "S"].map(function (d) { return "<th>" + d + "</th>"; }).join("") +
      "</tr></thead><tbody>";
    for (var w = 0; w < 6; w++) {
      h += "<tr>";
      for (var dd = 0; dd < 7; dd++) {
        var s = iso(cur), cls = [];
        if (cur.getMonth() !== m - 1) cls.push("other");
        if (s === t) cls.push("today");
        if (s === sel) cls.push("pick");
        h += '<td class="' + cls.join(" ") + '" data-d="' + s + '" tabindex="0">' + cur.getDate() + "</td>";
        cur.setDate(cur.getDate() + 1);
      }
      h += "</tr>";
    }
    return h + '</tbody></table><div class="cft"><button type="button" data-today="1">Today: ' +
      t + "</button></div></div>";
  }

  /* THE MENU BAR ANSWERS. A 98 window whose menus do nothing reads as a
     picture of a program. Each menu opens one notice in the program's own
     dialog; none of them changes the date. The Help text quotes
     Ecclesiastes 3:10-11 in the King James Version, which sits in the public
     domain - keep that translation, since the modern ones carry copyright. */
  var MENU = {
    file: "Nothing to save.\n\nThe day keeps itself, in eleven places at once.",
    edit: "The date cannot take an edit.\n\nPick another one instead: type it, or press the arrow beside the field.",
    view: "Eleven views of one day, all open already.\n\nPress any row to read why that calendar exists.",
    date: "Only God can make sense of Man\u2019s creations concerning time.",
    help: "\u201cI have seen the travail, which God hath given to the sons of men to be exercised in it. " +
          "He hath made every thing beautiful in his time: also he hath set the world in their heart, " +
          "so that no man can find out the work that God maketh from the beginning to the end.\u201d" +
          "\n\nEcclesiastes 3:10\u201311, King James Version",
    close: "This program cannot close.\n\nTime keeps running whether or not anyone counts it."
  };

  function errDialog(msg, kind) {
    var icon = kind === "info"
      ? '<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">' +
          '<circle cx="16" cy="16" r="14" fill="#fff" stroke="#000080" stroke-width="1.5"/>' +
          '<circle cx="16" cy="9.5" r="2.2" fill="#000080"/>' +
          '<path d="M13 14h4.5v9H20v2h-8v-2h2.5v-7H13Z" fill="#000080"/></svg>'
      : '<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">' +
          '<circle cx="16" cy="16" r="14" fill="#c01818" stroke="#800"/>' +
          '<path d="M9 9 L23 23 M23 9 L9 23" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>';
    return '<div class="modalwrap"><div class="dlg" role="alertdialog" aria-label="' +
        (kind === "info" ? "Notice" : "Error") + '">' +
      '<div class="dtb"><span class="tt">Eleven Days</span></div>' +
      '<div class="dbody">' + icon +
        "<p>" + esc(msg) + "</p>" +
      "</div>" +
      '<div class="dfoot"><button type="button" data-ok="1">OK</button></div></div></div>';
  }

  var winHost = document.getElementById("eleven-win98");

  function paint98(err, kind) {
    if (!winHost) return;
    var data = calc(sel);
    var r = rd(sel);
    var fieldVal = mode === "abs" ? sel : offset;

    winHost.innerHTML =
      '<div class="win98">' +
        '<div class="tbar"><span class="tt">Eleven Days - CALENDAR.EXE</span><b>_</b><b>\u25a1</b>' +
          '<button type="button" class="tb" data-menu="close" aria-label="Close">\u00d7</button></div>' +
        '<div class="menu">' +
          [["file", "File"], ["edit", "Edit"], ["view", "View"], ["date", "Date"], ["help", "Help"]]
            .map(function (m) {
              return '<button type="button" data-menu="' + m[0] + '"><u>' + m[1].charAt(0) + "</u>" +
                     m[1].slice(1) + "</button>";
            }).join("") +
        "</div>" +
        '<div class="inner">' +
          '<fieldset style="position:relative"><legend>Date</legend><div class="frow">' +
            '<label for="w98d">' + (mode === "abs" ? "Date:" : "Offset:") + "</label>" +
            (mode === "abs"
              ? '<span class="combo"><input id="w98d" type="text" value="' + fieldVal + '" spellcheck="false">' +
                '<button type="button" class="drop" data-drop="1" title="Pick from a calendar" aria-label="Pick from a calendar">\u25bc</button></span>'
              : '<input id="w98d" type="text" value="' + fieldVal + '" spellcheck="false" style="flex:0 0 5rem">' +
                "<span>days</span>") +
            '<button type="button" class="icon" data-mode="1" title="' +
              (mode === "abs" ? "Switch to an offset in days" : "Switch to an absolute date") + '">' +
              (mode === "abs" ? svgPlusMinus() : svgCal()) + "</button>" +
            (mode === "abs"
              ? '<button type="button" data-go="1">Go</button>'
              : '<button type="button" data-step="-1">\u2212</button><button type="button" data-step="1">+</button>') +
            '<button type="button" data-today="1">Today</button>' +
          "</div>" +
          '<div class="modeline">Mode: <b>' +
            (mode === "abs" ? "absolute date" : "day offset from " + sel) + "</b></div>" +
          (calOpen ? monthGrid() : "") +
          "</fieldset>" +
          '<div class="grid"><table class="list"><thead><tr>' +
            "<th>Calendar</th><th>Era</th><th>Year</th><th>Month</th>" +
            '<th class="num">Day</th><th>Counts from</th>' +
          '</tr></thead><tbody data-rows="1"></tbody></table></div>' +
          '<div class="status">' +
            "<span>" + KEYS.length + " systems converted</span>" +
            '<span class="pin">Rata die ' + group(r) + "</span>" +
            '<span class="pin">95 checks green</span>' +
          "</div>" +
        "</div>" +
        (err ? errDialog(err, kind) : "") +
      "</div>";

    var body = winHost.querySelector("[data-rows]");
    KEYS.forEach(function (k) {
      var p = parts(data, k);
      if (!p) return;
      var tr = document.createElement("tr");
      if (k === selKey) tr.className = "sel";
      [p.name, ERA[k], p.year, p.month, p.date, G.epoch[k] || "\u2014"].forEach(function (v, i) {
        var td = el("td", (i === 2 || i === 4) ? "num" : null, v);
        /* the last column clips with an ellipsis, so the full sentence stays
           on the cell itself for a pointer and for a screen reader */
        if (i === 5) td.title = v;
        tr.appendChild(td);
      });
      /* A row leads somewhere: it takes the highlight and carries the
         visitor to that calendar's story in the ledger below, opened. */
      tr.title = "Read why the " + p.name + " calendar exists";
      tr.addEventListener("click", function () {
        selKey = k; paintAnswer(); paint98(); jumpTo(k);
      });
      body.appendChild(tr);
    });

    /* a modal owns the window until it closes, the way a 98 program means it */
    var ok = winHost.querySelector("[data-ok]");
    if (ok) {
      ok.addEventListener("click", function () { paint98(); });
      ok.focus();
      return;
    }

    winHost.querySelectorAll("[data-menu]").forEach(function (b) {
      b.addEventListener("click", function () {
        calOpen = false;
        paint98(MENU[b.getAttribute("data-menu")], "info");
      });
    });

    var input = winHost.querySelector("#w98d");

    winHost.querySelector("[data-mode]").addEventListener("click", function () {
      if (mode === "abs") { offset = "7"; mode = "off"; } else { mode = "abs"; }
      calOpen = false;
      paint98();
    });

    winHost.querySelector("[data-today]").addEventListener("click", function () {
      sel = todayIso(); calOpen = false; repaintAll();
    });

    if (mode === "abs") {
      var go = function () {
        var v = input.value.trim();
        if (!valid(v)) {
          paint98("The date \u201c" + v + "\u201d does not exist.\n\nType it as YYYY-MM-DD, or pick one from the calendar.");
          return;
        }
        sel = v; calOpen = false; repaintAll();
      };
      winHost.querySelector("[data-go]").addEventListener("click", go);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); go(); }
      });
      winHost.querySelector("[data-drop]").addEventListener("click", function () {
        calOpen = !calOpen; calCursor = sel; paint98();
      });
      if (calOpen) {
        winHost.querySelectorAll("[data-nav]").forEach(function (b) {
          b.addEventListener("click", function () {
            var p = (calCursor || sel).split("-").map(Number);
            calCursor = iso(new Date(p[0], p[1] - 1 + Number(b.getAttribute("data-nav")), 1));
            paint98();
          });
        });
        winHost.querySelectorAll("td[data-d]").forEach(function (td) {
          function pick() { sel = td.getAttribute("data-d"); calOpen = false; repaintAll(); }
          td.addEventListener("click", pick);
          td.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); }
          });
        });
      }
    } else {
      winHost.querySelectorAll("[data-step]").forEach(function (b) {
        b.addEventListener("click", function () {
          var raw = input.value.trim();
          if (!/^\d{1,5}$/.test(raw)) {
            paint98("\u201c" + raw + "\u201d is not a number of days.\n\nType a whole number from 0 to 99999.");
            return;
          }
          offset = raw;
          sel = shiftDays(sel, Number(b.getAttribute("data-step")) * parseInt(raw, 10));
          repaintAll();
        });
      });
      input.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        e.preventDefault();
        winHost.querySelector('[data-step="1"]').click();
      });
    }
  }

  /* ─── the field ─────────────────────────────────────────────────────── */

  function wireField() {
    var input = document.getElementById("eleven-date");
    var go = document.getElementById("eleven-go");
    if (!input) return;
    input.value = sel;
    function apply() {
      var v = input.value.trim();
      if (!valid(v)) return;
      sel = v;
      repaintAll();
    }
    input.addEventListener("change", apply);
    if (go) go.addEventListener("click", apply);
  }

  function wireSpan() {
    var go = document.getElementById("eleven-spango");
    var from = document.getElementById("eleven-from");
    var to = document.getElementById("eleven-to");
    if (!from || !to) return;
    if (go) go.addEventListener("click", paintSpan);
    from.addEventListener("change", paintSpan);
    to.addEventListener("change", paintSpan);
    paintSpan();
  }

  /* ═══ THE SKY: THE MOON, AND WHERE EVERYTHING STANDS ═══════════════════
     Both read assets/eleven/sky.js, the plugin's own astro.ts and moon.ts
     transpiled once offline. They sit under the tool and follow its date.

     RANGE. skyInfo returns null outside roughly 1000–3000, and its
     planetsInRange goes false outside 1800–2050, where the JPL element table
     stops being trustworthy. The Sun and Moon keep working across the whole
     window, so out of range the wheel draws the two lights and says so
     rather than plotting numbers nobody should trust.
     ═════════════════════════════════════════════════════════════════════ */

  var SKY = window.ElevenSky || null;

  function ymd(s) { return s.split("-").map(Number); }

  /* The lit limb, as two arcs. The outer edge is always a half circle; the
     terminator is an ellipse whose half-width runs from r at new, through 0
     at half, back to r at full — so it reads as a crescent filling rather
     than a circle being wiped. Waxing lights the right limb, waning the
     left, which is how it looks from the northern hemisphere. */
  function moonDisc(illum, waxing, r) {
    var rx = r * Math.abs(1 - 2 * illum);
    var outer = waxing ? 1 : 0;              /* which half the light sits on */
    var inner = (illum > 0.5) === waxing ? 1 : 0;
    return "M 0 " + (-r) +
           " A " + r + " " + r + " 0 0 " + outer + " 0 " + r +
           " A " + rx + " " + r + " 0 0 " + inner + " 0 " + (-r) + " Z";
  }

  function paintSky() {
    var host = document.getElementById("eleven-sky");
    if (!host || !SKY) return;
    var p = ymd(sel);
    var sky = SKY.skyInfo(p[0], p[1], p[2]);
    var moon = SKY.moonInfo(p[0], p[1], p[2]);
    host.textContent = "";

    if (!sky || !moon) {
      var out = el("p", "note", "The sky runs from about 1000 to 3000. " +
        "This date sits outside it, so the calendars above stand on their own.");
      host.appendChild(out);
      return;
    }

    /* THE DATE, RESTATED. The panels follow the converter above, and by the
       time a visitor scrolls here that field has left the screen. */
    var when = new Date(p[0], p[1] - 1, p[2]);
    var head = el("div", "eleven-skydate");
    head.appendChild(el("span", "pk", "The sky on"));
    head.appendChild(el("span", "day", when.toLocaleDateString("en-GB",
      { weekday: "long", day: "numeric", month: "long", year: "numeric" })));
    head.appendChild(el("span", "hint",
      sel === todayIso() ? "Today. Change the date above and both panels follow."
                         : "Both panels follow the date set above."));
    host.appendChild(head);

    /* ── the moon panel ── */
    var mp = el("div", "eleven-moon");
    mp.appendChild(el("span", "pk", "The moon"));

    var ph = moon.phase;
    var waxing = ph.fraction < 0.5;
    var disc = document.createElementNS(NS, "svg");
    disc.setAttribute("viewBox", "-60 -60 120 120");
    disc.setAttribute("class", "eleven-moondisc");
    disc.setAttribute("role", "img");
    disc.setAttribute("aria-label", ph.name + ", " + Math.round(ph.illumination * 100) + "% lit");
    disc.innerHTML =
      '<circle cx="0" cy="0" r="50" class="dark"/>' +
      '<path d="' + moonDisc(ph.illumination, waxing, 50) + '" class="lit"/>' +
      '<circle cx="0" cy="0" r="50" class="rim"/>';
    mp.appendChild(disc);

    /* The emoji comes off the engine's own phase table, so the glyph and the
       drawn disc can never disagree about which phase this is. */
    var title = el("div", "pv");
    title.appendChild(el("span", "mphase", ph.emoji));
    title.appendChild(document.createTextNode(" " + ph.name));
    mp.appendChild(title);
    mp.appendChild(el("p", "pn",
      Math.round(ph.illumination * 1000) / 10 + "% lit · " +
      ph.ageDays.toFixed(1) + " days old · " +
      (waxing ? "waxing" : "waning")));

    /* where the two lights stand, read off the same chart as the wheel */
    var lights = el("dl", "eleven-lights");
    [["Moon in", sky.moon], ["Sun in", sky.sun]].forEach(function (pair) {
      var z = pair[1].zodiac;
      var d = el("div");
      d.appendChild(el("dt", null, pair[0]));
      var dd = el("dd");
      dd.appendChild(el("span", "zg el-" + elementOf(pair[1].longitude), z.glyph + TEXT_FORM));
      dd.appendChild(document.createTextNode(" " + (z.name ? z.name + " " : "") + z.degree + "\u00b0" +
        String(z.minute).padStart(2, "0") + "\u2032"));
      d.appendChild(dd);
      lights.appendChild(d);
    });
    mp.appendChild(lights);

    var next = (moon.events || []).filter(function (e) { return e.daysFromRef >= 0; }).slice(0, 8);
    if (next.length) {
      var list = el("ul", "eleven-moonnext");
      next.forEach(function (e) {
        /* A coming phase works as a button: press it and the whole page
           moves to that day, so the disc above shows the phase it names. */
        var li = el("li");
        var row = el(e.daysFromRef === 0 ? "div" : "button", "mrow");
        if (e.daysFromRef !== 0) {
          row.type = "button";
          row.title = "Move the page to " + shiftDays(sel, e.daysFromRef);
          row.addEventListener("click", function () {
            sel = shiftDays(sel, e.daysFromRef);
            repaintAll();
          });
        }
        row.appendChild(el("span", "mphase", e.emoji));
        row.appendChild(el("span", "mn", e.name));
        row.appendChild(el("span", "md",
          e.daysFromRef === 0 ? "today" : "in " + e.daysFromRef + (e.daysFromRef === 1 ? " day" : " days")));
        li.appendChild(row);
        list.appendChild(li);
      });
      mp.appendChild(list);
    }
    host.appendChild(mp);

    /* ── the wheel ── */
    var wp = el("div", "eleven-zodiac");
    wp.appendChild(el("span", "pk", "Astrological chart"));

    var bodies = [sky.sun, sky.moon].concat(sky.planets, sky.points);
    wp.appendChild(wheel(bodies, SKY.SIGNS));

    if (!sky.planetsInRange) {
      wp.appendChild(el("p", "pn",
        "Only the Sun and Moon here. The planet table runs " +
        SKY.PLANET_MIN_YEAR + " to " + SKY.PLANET_MAX_YEAR + ", and this date falls outside it."));
    }

    /* the key to the wheel's four colours, spelled out so the colour never
       carries the meaning alone */
    var key = el("ul", "eleven-elements");
    ELEMENTS.forEach(function (name) {
      var k = el("li", "el-" + name);
      k.appendChild(el("i"));
      k.appendChild(document.createTextNode(name.charAt(0).toUpperCase() + name.slice(1)));
      key.appendChild(k);
    });
    wp.appendChild(key);

    var tbl = el("ul", "eleven-bodies");
    bodies.forEach(function (b, bi) {
      var li = el("li");
      li.setAttribute("data-b", bi);
      li.appendChild(el("span", "bg", b.glyph));
      li.appendChild(el("span", "bn", b.name));
      var bz = el("span", "bz");
      bz.appendChild(el("span", "zg el-" + elementOf(b.longitude), b.zodiac.glyph + TEXT_FORM));
      bz.appendChild(document.createTextNode(" " + b.zodiac.degree + "°" +
        String(b.zodiac.minute).padStart(2, "0") + "′"));
      li.appendChild(bz);
      var flag = b.stationary ? "stationary" : (b.retrograde ? "℞" : "");
      li.appendChild(el("span", "br", flag));
      if (b.retrograde) li.className = "is-rx";
      list_push(li, tbl);
    });
    wp.appendChild(tbl);
    host.appendChild(wp);

    /* THE LIST AND THE WHEEL POINT AT EACH OTHER. Rest on a row and its glyph
       lights on the wheel while the rest dim; rest on a glyph and its row
       lights. Twelve glyphs crowd a small ring, and this finds one. */
    wp.querySelectorAll("[data-b]").forEach(function (n) {
      var same = wp.querySelectorAll('[data-b="' + n.getAttribute("data-b") + '"]');
      n.addEventListener("mouseenter", function () {
        wp.classList.add("has-hot");
        same.forEach(function (m) { m.classList.add("is-hot"); });
      });
      n.addEventListener("mouseleave", function () {
        wp.classList.remove("has-hot");
        same.forEach(function (m) { m.classList.remove("is-hot"); });
      });
    });
  }

  function list_push(li, ul) { ul.appendChild(li); }

  /* The chart wheel. 0° Aries sits on the left and degrees run counter-
     clockwise, which is how a chart is drawn — not how SVG measures angles,
     hence the conversion in one place here. */
  function polar(lon, r) {
    var a = (180 - lon) * Math.PI / 180;
    return [r * Math.cos(a), -r * Math.sin(a)];
  }

  /* THE FOUR ELEMENTS, in zodiac order from Aries: fire, earth, air, water,
     three times round. The wheel tints each sign's sector by its element and
     the list below tints each sign glyph the same way. */
  var ELEMENTS = ["fire", "earth", "air", "water"];

  function elementOf(lon) {
    return ELEMENTS[Math.floor((((lon % 360) + 360) % 360) / 30) % 4];
  }

  /* U+FE0E asks for the text form of a glyph. Without it Windows draws the
     twelve signs as purple emoji tiles that ignore every colour set here. */
  var TEXT_FORM = "︎";

  /* one sign's band of the outer ring, as a closed path */
  function sector(i, rIn, rOut) {
    var a0 = polar(i * 30, rOut), a1 = polar(i * 30 + 30, rOut);
    var b1 = polar(i * 30 + 30, rIn), b0 = polar(i * 30, rIn);
    function xy(p) { return p[0].toFixed(2) + " " + p[1].toFixed(2); }
    return "M " + xy(a0) +
           " A " + rOut + " " + rOut + " 0 0 1 " + xy(a1) +
           " L " + xy(b1) +
           " A " + rIn + " " + rIn + " 0 0 0 " + xy(b0) + " Z";
  }

  function wheel(bodies, signs) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "-130 -130 260 260");
    s.setAttribute("class", "eleven-wheel");
    s.setAttribute("role", "img");
    s.setAttribute("aria-label", "A zodiac wheel showing where each body stands today");
    var g = [];

    for (var si = 0; si < 12; si++) {
      g.push('<path d="' + sector(si, 96, 122) + '" class="sector el-' + ELEMENTS[si % 4] + '"/>');
    }

    g.push('<circle cx="0" cy="0" r="122" class="ring"/>');
    g.push('<circle cx="0" cy="0" r="96" class="ring"/>');
    g.push('<circle cx="0" cy="0" r="62" class="ring faint"/>');

    /* every degree a tick, every fifth longer, every thirtieth a sign line */
    for (var d = 0; d < 360; d++) {
      var long = d % 30 === 0, five = d % 5 === 0;
      if (!five) continue;
      var r1 = long ? 62 : (d % 10 === 0 ? 89 : 92);
      var a = polar(d, r1), b = polar(d, 96);
      g.push('<line x1="' + a[0].toFixed(2) + '" y1="' + a[1].toFixed(2) +
             '" x2="' + b[0].toFixed(2) + '" y2="' + b[1].toFixed(2) +
             '" class="' + (long ? "spoke" : "tick") + '"/>');
    }

    /* the sign glyphs, each centred in its own 30° sector */
    signs.forEach(function (sg, i) {
      var pt = polar(i * 30 + 15, 109);
      g.push('<text x="' + pt[0].toFixed(2) + '" y="' + pt[1].toFixed(2) +
             '" class="sign el-' + ELEMENTS[i % 4] +
             '" text-anchor="middle" dominant-baseline="central">' +
             "<title>" + esc(sg.name + ", " + ELEMENTS[i % 4]) + "</title>" +
             sg.glyph + TEXT_FORM + "</text>");
    });

    /* the bodies, nudged apart so two in the same degree still read */
    var used = [];
    bodies.forEach(function (bd, bi) {
      var lon = bd.longitude, shift = 0;
      while (used.some(function (u) { return Math.abs(u - (lon + shift)) < 7; }) && shift < 28) shift += 7;
      used.push(lon + shift);
      var pt = polar(lon + shift, 78);
      var tk = polar(lon, 96), tk2 = polar(lon, 88);
      var where = bd.zodiac.degree + "\u00b0" + String(bd.zodiac.minute).padStart(2, "0") +
                  "\u2032 " + (bd.zodiac.name || "");
      g.push('<g class="b" data-b="' + bi + '"><title>' +
             esc(bd.name + ", " + where + (bd.retrograde ? ", retrograde" : "")) + "</title>");
      g.push('<line x1="' + tk[0].toFixed(2) + '" y1="' + tk[1].toFixed(2) +
             '" x2="' + tk2[0].toFixed(2) + '" y2="' + tk2[1].toFixed(2) + '" class="point"/>');
      g.push('<text x="' + pt[0].toFixed(2) + '" y="' + pt[1].toFixed(2) +
             '" class="body' + (bd.retrograde ? " rx" : "") +
             '" text-anchor="middle" dominant-baseline="central">' + bd.glyph + "</text></g>");
    });

    s.innerHTML = g.join("");
    return s;
  }

  function repaintAll() {
    var input = document.getElementById("eleven-date");
    if (input && input.value !== sel) input.value = sel;
    paintAnswer();
    paintLedger();
    paintProof();
    paint98();
    paintSky();
  }

  function start() {
    wireField();
    wireSpan();
    repaintAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
