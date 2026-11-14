/* Copy an address, receive a blessing.
 *
 * The page shows one line of thanks on arrival and deals another each time a
 * visitor presses a copy control. The lines live in data/blessings.json — add
 * one there rather than here.
 *
 * NO REPEATS UNTIL THE POOL RUNS OUT. The script deals from a shuffled bag and
 * remembers, per browser, which lines it has already shown, so a returning
 * visitor meets a new one. When the bag empties it reshuffles. If storage
 * refuses, the bag simply lasts for the visit.
 *
 * THE CHANGE READS AS SHIFTING SAND. The old line blurs, squints and breaks
 * into grain; the new one settles back out of it. An SVG turbulence filter in
 * the page supplies the grain, and this script drives its strength frame by
 * frame. Anyone who asks the system for reduced motion gets a plain swap.
 *
 * Nothing here talks to a wallet, a chain or any other host. The copy control
 * writes one public address to the clipboard and that ends its business.
 */
(function () {
  var out = document.querySelector('[data-blessing]');
  var buttons = document.querySelectorAll('[data-copy]');
  if (!out) { return; }

  var KEY = 'daat-blessings-seen';
  var OUT_MS = 420;
  var IN_MS = 780;
  var GRAIN = 38;
  var BLUR = 5;

  var reduced = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var map = document.getElementById('sand-map');
  var noise = document.getElementById('sand-noise');

  var pool = [];
  var bag = [];
  var seen = [];
  var last = -1;
  var run = 0;

  /* ── the bag ─────────────────────────────────────────────────────────── */
  function recall() {
    try {
      var kept = JSON.parse(window.localStorage.getItem(KEY) || 'null');
      if (kept && kept.n === pool.length && kept.seen instanceof Array) {
        return kept.seen;
      }
    } catch (e) { /* storage refused or held something else: start clean */ }
    return [];
  }

  function remember() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ n: pool.length, seen: seen }));
    } catch (e) { /* the bag lasts for the visit instead */ }
  }

  function refill() {
    bag = [];
    for (var i = 0; i < pool.length; i++) {
      if (seen.indexOf(i) === -1) { bag.push(i); }
    }
    if (!bag.length) {
      seen = [];
      for (var j = 0; j < pool.length; j++) {
        if (j !== last) { bag.push(j); }
      }
    }
    for (var k = bag.length - 1; k > 0; k--) {
      var r = Math.floor(Math.random() * (k + 1));
      var held = bag[k]; bag[k] = bag[r]; bag[r] = held;
    }
  }

  function deal() {
    if (!bag.length) { refill(); }
    last = bag.pop();
    seen.push(last);
    remember();
    return pool[last];
  }

  /* ── the sand ────────────────────────────────────────────────────────── */
  function settle() {
    out.style.filter = '';
    out.style.transform = '';
    out.style.opacity = '';
  }

  function scatter(p) {
    map.setAttribute('scale', (GRAIN * p).toFixed(2));
    out.style.filter = 'url(#sand) blur(' + (BLUR * p).toFixed(2) + 'px)';
    out.style.transform = 'scaleY(' + (1 - 0.42 * p).toFixed(3) + ')';
    out.style.opacity = (1 - 0.6 * p).toFixed(3);
  }

  function shift(text, arriving) {
    var mine = ++run;
    if (reduced || !map || !window.requestAnimationFrame) {
      out.textContent = text;
      settle();
      return;
    }
    var swapped = false;
    var start = null;
    var lead = arriving ? 0 : OUT_MS;
    if (noise) { noise.setAttribute('seed', String(Math.floor(Math.random() * 999))); }
    if (arriving) { out.textContent = text; swapped = true; scatter(1); }

    function finish() {
      if (mine !== run) { return; }
      if (!swapped) { out.textContent = text; swapped = true; }
      settle();
    }

    function frame(now) {
      if (mine !== run) { return; }
      if (start === null) { start = now; }
      var t = now - start;
      if (t < lead) {
        var a = t / lead;
        scatter(a * a);
      } else {
        if (!swapped) { out.textContent = text; swapped = true; }
        var b = 1 - (t - lead) / IN_MS;
        if (b <= 0) { finish(); return; }
        scatter(b * b);
      }
      window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
    /* A background tab pauses animation frames. The line still has to change. */
    window.setTimeout(finish, lead + IN_MS + 400);
  }

  /* ── the copy control ────────────────────────────────────────────────── */
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var box = document.createElement('textarea');
      box.value = text;
      box.setAttribute('readonly', '');
      box.style.position = 'absolute';
      box.style.left = '-9999px';
      document.body.appendChild(box);
      box.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(box);
      if (ok) { resolve(); } else { reject(); }
    });
  }

  function wire(button) {
    var source = document.getElementById(button.getAttribute('data-copy'));
    if (!source) { return; }
    var timer = 0;
    button.addEventListener('click', function () {
      function say(word) {
        button.textContent = word;
        button.classList.add('did');
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          button.textContent = 'copy';
          button.classList.remove('did');
        }, 1600);
      }
      copy(source.textContent.trim()).then(
        function () { say('copied'); },
        function () { say('select it'); }
      );
      if (pool.length) { shift(deal(), false); }
    });
  }

  for (var i = 0; i < buttons.length; i++) { wire(buttons[i]); }
  if (buttons.length) { document.documentElement.classList.add('has-copy'); }

  fetch('data/blessings.json')
    .then(function (r) {
      var type = (r.headers.get('content-type') || '').toLowerCase();
      if (!r.ok || type.indexOf('json') === -1) { throw new Error('no blessings'); }
      return r.json();
    })
    .then(function (data) {
      pool = (data && data.blessings) || [];
      if (!pool.length) { return; }
      seen = recall();
      shift(deal(), true);
    })
    .catch(function () { /* the line written into the page stays put */ });
})();
