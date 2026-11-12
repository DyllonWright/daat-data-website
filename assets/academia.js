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
