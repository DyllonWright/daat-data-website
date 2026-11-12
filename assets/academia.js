/* ACADEMIA — the pencil writes itself in.
   ──────────────────────────────────────────────────────────────────────────
   Each pencil note on the clipboards stays hidden until the entry it
   annotates scrolls into view, then wipes in left to right, the direction a
   hand writes. The wipe itself lives in academia.css; this file only says
   when.

   IT WATCHES THE ENTRY, NOT THE NOTE. A note waiting to appear sits clipped
   to nothing, and an observer pointed at a fully clipped box never reports
   it as visible, so the note would wait for ever. The list item around it
   carries no clip.

   Without JavaScript the notes simply stand there, because the hiding rule
   hangs off a class this script adds. A visitor who asked for reduced
   motion gets the same: notes present, nothing moving. */
(function () {
  "use strict";

  var notes = document.querySelectorAll(".sheet .hand");
  if (!notes.length || !window.IntersectionObserver) { return; }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce && reduce.matches) { return; }

  document.documentElement.classList.add("ink");

  var watch = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) { continue; }
      var held = entries[i].target.inkNotes || [];
      for (var k = 0; k < held.length; k++) { held[k].classList.add("written"); }
      watch.unobserve(entries[i].target);
    }
  }, { rootMargin: "0px 0px -15% 0px", threshold: 0.5 });

  for (var n = 0; n < notes.length; n++) {
    var note = notes[n];
    /* The entry it sits in; for the sign-off under a list, that list's last
       entry; failing both, whatever holds it. */
    var anchor = note.closest("li, figure");
    if (!anchor && note.previousElementSibling) {
      anchor = note.previousElementSibling.lastElementChild;
    }
    anchor = anchor || note.parentNode;
    if (!anchor.inkNotes) { anchor.inkNotes = []; watch.observe(anchor); }
    anchor.inkNotes.push(note);
  }
}());

/* ACADEMIA — the prints: two arrows and a count.
   ──────────────────────────────────────────────────────────────────────────
   The row of photographs scrolls and snaps by CSS alone. This adds what CSS
   cannot: a button either side that steps one print, a "3 / 12" under them,
   and arrow keys while the row holds focus. The buttons and the count sit
   hidden in the markup, so without this file a visitor still swipes the row
   and simply sees no dead controls. */
(function () {
  "use strict";

  var boxes = document.querySelectorAll("[data-prints]");
  for (var b = 0; b < boxes.length; b++) { wire(boxes[b]); }

  function wire(box) {
    var track = box.querySelector(".prints-track");
    var prev = box.querySelector(".prints-nav.prev");
    var next = box.querySelector(".prints-nav.next");
    var count = box.querySelector(".prints-count");
    if (!track || !prev || !next || !count) { return; }
    var total = track.children.length;

    function at() {
      /* a stack on a hidden tab measures zero wide; it stands on its first print */
      if (!track.clientWidth) { return 0; }
      return Math.max(0, Math.min(total - 1, Math.round(track.scrollLeft / track.clientWidth)));
    }
    /* A second click lands before the first scroll finishes, so the buttons
       step from where the row is HEADED rather than from where it stands. */
    var want = null;
    function go(i) {
      want = Math.max(0, Math.min(total - 1, i));
      track.scrollTo({ left: want * track.clientWidth });
    }
    function step(dir) { go((want === null ? at() : want) + dir); }
    function show() {
      var i = at();
      if (i === want) { want = null; }
      count.textContent = (i + 1) + " / " + total;
      prev.disabled = i === 0;
      next.disabled = i === total - 1;
    }

    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });
    track.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowLeft") { ev.preventDefault(); step(-1); }
      if (ev.key === "ArrowRight") { ev.preventDefault(); step(1); }
    });

    var pending = null;
    track.addEventListener("scroll", function () {
      if (pending) { return; }
      pending = window.requestAnimationFrame(function () { pending = null; show(); });
    });
    window.addEventListener("resize", show);

    /* one print needs no arrows and no count */
    if (total > 1) { prev.hidden = false; next.hidden = false; count.hidden = false; }
    show();
  }
}());

/* ACADEMIA — the tabs over the prints.
   ──────────────────────────────────────────────────────────────────────────
   The markup holds three stacks of prints, each a .roll with a data-tab
   name, standing one under the other. This builds a tab row from those
   names and shows one stack at a time. Left and right arrow keys move
   between tabs while one holds focus, the way a tablist should.

   A stack that just became visible has to re-measure, since it stood zero
   pixels wide while hidden; a resize event tells the print rows to do so. */
(function () {
  "use strict";

  var sets = document.querySelectorAll("[data-rolls]");
  for (var s = 0; s < sets.length; s++) { wire(sets[s]); }

  function wire(box) {
    var rolls = box.querySelectorAll(".roll");
    if (rolls.length < 2) { return; }

    var bar = document.createElement("div");
    bar.className = "rolls-tabs";
    bar.setAttribute("role", "tablist");
    bar.setAttribute("aria-label", "Photograph sets");
    var tabs = [];

    function pick(i, focus) {
      for (var k = 0; k < rolls.length; k++) {
        var on = k === i;
        rolls[k].hidden = !on;
        tabs[k].setAttribute("aria-selected", on ? "true" : "false");
        tabs[k].tabIndex = on ? 0 : -1;
      }
      if (focus) { tabs[i].focus(); }
      window.dispatchEvent(new Event("resize"));
    }

    for (var r = 0; r < rolls.length; r++) {
      (function (i) {
        var tab = document.createElement("button");
        tab.type = "button";
        tab.id = rolls[i].id + "-tab";
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-controls", rolls[i].id);
        var num = document.createElement("span");
        num.className = "n";
        num.textContent = String(i + 1);
        tab.appendChild(num);
        tab.appendChild(document.createTextNode(rolls[i].getAttribute("data-tab") || ""));
        tab.addEventListener("click", function () { pick(i, false); });
        tab.addEventListener("keydown", function (ev) {
          if (ev.key === "ArrowRight") { ev.preventDefault(); pick((i + 1) % rolls.length, true); }
          if (ev.key === "ArrowLeft") { ev.preventDefault(); pick((i + rolls.length - 1) % rolls.length, true); }
        });
        rolls[i].setAttribute("role", "tabpanel");
        rolls[i].setAttribute("aria-labelledby", tab.id);
        bar.appendChild(tab);
        tabs.push(tab);
      }(r));
    }

    box.insertBefore(bar, box.firstChild);
    box.classList.add("tabbed");
    pick(0, false);
  }
}());
