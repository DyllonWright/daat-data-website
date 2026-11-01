/* The arc carousel — vanilla, no dependencies, no build step.
 *
 * Markup: <div class="carousel" data-source="data/channel.json" data-limit="15"></div>
 * The script fills it. Geometry lives in assets/site.css; this file only ever
 * sets a card's data-pos, which keeps the narrow-screen flattening and the
 * reduced-motion case in the stylesheet where a media query can reach them.
 *
 * Report B ranks twelve build decisions. The five that matter most show up
 * here as: z-index per position (in the CSS), an overflow-hidden stage (CSS),
 * transform and opacity only (CSS), tabindex on the focused card alone plus
 * arrow capture on the container, and a transition lock, so a hammered arrow
 * key cannot desynchronise the card index from the label.
 *
 * Every string reaches the DOM through textContent, never innerHTML.
 */
(function () {
  var STEP_MS = 400;
  var DRAG_MIN = 40;
  var PRELOAD = 5;
  var NS = 'http://www.w3.org/2000/svg';

  var reduced = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text) { n.textContent = text; }
    return n;
  }

  function views(n) {
    if (typeof n !== 'number') { return ''; }
    if (n >= 1000) { return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K views'; }
    return n + (n === 1 ? ' view' : ' views');
  }

  function svgNode(tag, attrs) {
    var node = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  /* An original Saturn, from the same ring motif as the masthead lockup: the
     ring passes behind the body and back across its front. It sits behind the
     arc as the focal object. */
  function saturn(cls) {
    var svg = svgNode('svg', {
      viewBox: '0 0 120 120',
      'class': cls,
      'aria-hidden': 'true',
      focusable: 'false'
    });
    var back = svgNode('g', { transform: 'rotate(-16 60 60)' });
    back.appendChild(svgNode('path', {
      d: 'M 8 64 A 52 14 0 0 1 112 64',
      fill: 'none', stroke: '#8a6a2a', 'stroke-width': '2.6', 'stroke-linecap': 'round'
    }));
    var front = svgNode('g', { transform: 'rotate(-16 60 60)' });
    front.appendChild(svgNode('path', {
      d: 'M 112 64 A 52 14 0 0 1 8 64',
      fill: 'none', stroke: '#e8c887', 'stroke-width': '2.6', 'stroke-linecap': 'round'
    }));
    svg.appendChild(back);
    svg.appendChild(svgNode('circle', { cx: '60', cy: '58', r: '27', fill: '#c9a24b', opacity: '0.85' }));
    svg.appendChild(svgNode('circle', { cx: '50', cy: '48', r: '9', fill: '#f7ecd4', opacity: '0.45' }));
    svg.appendChild(front);
    return svg;
  }

  function build(root, items, label) {
    var stage = el('div', 'arc-stage');
    stage.appendChild(saturn('arc-saturn'));

    /* Every card sits in the same box on the stage, stacked by transform, so
       loading="lazy" buys only the first paint: measured over http from
       website/, the shelf fetched all 69 thumbnails the moment the carousel
       scrolled into view, 1.49 MB in one burst. The viewport test the
       attribute runs cannot help when sixty-nine boxes share one rectangle.

       So the src waits for render() instead, and lands only on a card within
       PRELOAD of the focus — two wider than the arc draws, which gives a card
       its picture before it slides in. The attribute stays: it still covers
       the window between build and the first render. */
    var thumbs = [];

    var cards = items.map(function (item, i) {
      var card;
      if (item.empty) {
        card = el('div', 'arc-card empty');
        card.appendChild(el('span', null, item.title));
      } else {
        card = el('a', 'arc-card');
        card.href = item.url;
        card.target = '_blank';
        card.rel = 'noopener';
        var img = el('img');
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.setAttribute('data-thumb', item.thumb);
        card.appendChild(img);
        thumbs[i] = img;
      }
      card.setAttribute('role', 'group');
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', 'Item ' + (i + 1) + ' of ' + items.length + ': ' + item.title);
      card.setAttribute('data-pos', 'out');
      card.tabIndex = -1;
      stage.appendChild(card);
      return card;
    });

    var labelBox = el('div', 'arc-label');
    var title = el('p', 'arc-title');
    var meta = el('p', 'arc-meta');
    labelBox.appendChild(title);
    labelBox.appendChild(meta);

    var controls = el('div', 'arc-controls');
    var prev = el('button', 'arc-btn', '←');
    var count = el('span', 'arc-count');
    var next = el('button', 'arc-btn', '→');
    prev.type = 'button';
    next.type = 'button';
    prev.setAttribute('aria-label', 'Previous');
    next.setAttribute('aria-label', 'Next');
    controls.appendChild(prev);
    controls.appendChild(count);
    controls.appendChild(next);

    var live = el('p', 'visually-hidden');
    live.setAttribute('aria-live', 'polite');

    root.textContent = '';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'carousel');
    root.setAttribute('aria-label', label);
    root.tabIndex = 0;
    root.appendChild(stage);
    root.appendChild(labelBox);
    root.appendChild(controls);
    root.appendChild(live);

    var index = 0;
    var locked = false;

    function render(mode) {
      cards.forEach(function (card, i) {
        var d = i - index;
        var near = Math.abs(d) <= 3;
        card.setAttribute('data-pos', near ? String(d) : 'out');
        card.tabIndex = d === 0 ? 0 : -1;
        card.setAttribute('aria-hidden', near ? 'false' : 'true');

        var img = thumbs[i];
        if (img && !img.getAttribute('src') && Math.abs(d) <= PRELOAD) {
          img.src = img.getAttribute('data-thumb');
        }
      });
      var item = items[index];
      count.textContent = (index + 1) + ' / ' + items.length;

      function swap() {
        title.textContent = item.title;
        meta.textContent = item.empty
          ? (item.note || '')
          : [views(item.views), 'Watch on YouTube'].filter(Boolean).join(' · ');
        labelBox.classList.remove('fading');
      }

      if (reduced || mode === 'first') {
        swap();
      } else {
        labelBox.classList.add('fading');
        window.setTimeout(swap, 150);
      }
      if (mode === 'move') { live.textContent = item.title; }
    }

    function go(to) {
      if (locked) { return; }
      var n = items.length;
      var target = ((to % n) + n) % n;
      if (target === index) { return; }
      index = target;
      render('move');
      if (reduced) { return; }
      locked = true;
      window.setTimeout(function () { locked = false; }, STEP_MS);
    }

    prev.addEventListener('click', function () { go(index - 1); });
    next.addEventListener('click', function () { go(index + 1); });

    cards.forEach(function (card, i) {
      card.addEventListener('click', function (event) {
        if (i !== index) {
          event.preventDefault();
          go(i);
        }
      });
    });

    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
    });

    var startX = null;
    stage.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    stage.addEventListener('pointerup', function (e) {
      if (startX === null) { return; }
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) >= DRAG_MIN) { go(index + (dx < 0 ? 1 : -1)); }
    });
    stage.addEventListener('pointercancel', function () { startX = null; });

    render('first');
  }

  /* Whoever serves this folder locally wants to know why this fires: a browser
     blocks the read over file://, so the fetch fails when the page opens
     straight off disk and works the moment it arrives over http. A visitor can
     act on none of that, so the note on screen says only that the shelf did
     not load, and points at the channel. */
  function fail(root) {
    root.textContent = '';
    var note = el('div', 'note');
    note.appendChild(el('h3', null, 'The shelf did not load'));
    var p = el('p');
    var a = el('a', null, 'Go to the YouTube channel');
    a.href = 'https://www.youtube.com/@DaatData';
    a.target = '_blank';
    a.rel = 'noopener';
    p.appendChild(a);
    note.appendChild(p);
    root.appendChild(note);
  }

  function start(root) {
    var source = root.getAttribute('data-source') || 'data/channel.json';
    var limit = parseInt(root.getAttribute('data-limit'), 10);
    var label = root.getAttribute('data-label') || 'The shelf';

    fetch(source, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) { throw new Error('HTTP ' + r.status); }
        return r.json();
      })
      .then(function (data) {
        var list = (data && Array.isArray(data.videos)) ? data.videos : [];
        if (!list.length) {
          build(root, [{
            empty: true,
            title: 'Nothing cut yet.',
            note: 'The shelf fills as the work lands.'
          }], label);
          return;
        }
        if (limit > 0) { list = list.slice(0, limit); }
        build(root, list, label);
      })
      .catch(function () { fail(root); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.carousel'), start);
  });
})();
