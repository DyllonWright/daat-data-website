/* The arc carousel — vanilla, no dependencies, no build step.
 *
 * Markup: <div class="carousel" data-source="data/channel.json" data-limit="15"></div>
 * The script fills it. Geometry lives in assets/site.css, and at rest this
 * file only sets a card's data-pos, which keeps the narrow-screen flattening
 * and the reduced-motion case in the stylesheet where a media query can reach
 * them. A drag is the one exception: WIDE and narrowTable() below restate the
 * stylesheet's own numbers so the script can read the places BETWEEN two
 * positions, and it paints those inline. The inline styles clear the frame
 * after the settle lands, so CSS owns every resting position again. Keep the
 * two tables in step with site.css if either changes.
 *
 * Report B ranks twelve build decisions. The five that matter most show up
 * here as: z-index per position (in the CSS), an overflow-hidden stage (CSS),
 * transform and opacity only (CSS), tabindex on the focused card alone plus
 * arrow capture on the container, and a transition lock, so a hammered arrow
 * key cannot desynchronise the card index from the label.
 *
 * Input: arrow keys (Home and End too), the two buttons, a click on any side
 * card, and pointer drag or touch swipe along the stage.
 *
 * THE DRAG, retuned 2026-11-01 on the owner's call. He compared a stepped
 * carousel against a free one and chose the stepped feel, with the free one's
 * finger tracking and none of its float. So: the cards follow the pointer one
 * to one, the release lands within one card of where the finger stopped, and
 * an ease-out carries it there over SETTLE_MS. An ease-out cannot pass its
 * target, so nothing overshoots and nothing bounces. The ends hold rather than
 * wrapping mid-drag. Buttons and keys keep the stepped 400ms transition.
 *
 * Vertical touch still scrolls the page (touch-action: pan-y on the stage),
 * and a visitor who asked for reduced motion keeps the old stepped drag,
 * because the stylesheet's transform: none !important outranks any inline
 * style the continuous path would write.
 *
 * Every string reaches the DOM through textContent, never innerHTML.
 */
(function () {
  var STEP_MS = 400;
  var DRAG_STEP = 70;
  var DRAG_ARM = 8;
  var FLICK = 40;
  /* The settle after a drag. Short, and eased out to the target rather than
     sprung at it: an ease-out cannot pass its target, so it has no overshoot
     and therefore no bounce to damp. The owner asked for exactly that
     (2026-11-01) — the finger tracking of a free carousel, none of the float. */
  var SETTLE_MS = 220;
  /* How many frames of release velocity count toward the card you land on.
     Low, and the landing gets clamped to one card either side regardless, so
     a hard flick advances one card instead of sailing through five. */
  var CARRY = 1.6;

  /* The arc, position by position, in the same numbers site.css carries for
     [data-pos]. CSS still owns every resting position; this table exists so a
     drag can read the places between them. Index = |offset|; the last row
     stands in for 'out'. Mirror x and rotateY for a card left of focus. */
  var WIDE = [
    { x: 0,   y: 0,  z: 0,    ry: 0,  sc: 1,    op: 1 },
    { x: 145, y: 6,  z: -90,  ry: 25, sc: 0.89, op: 0.8 },
    { x: 280, y: 24, z: -200, ry: 38, sc: 0.78, op: 0.5 },
    { x: 420, y: 48, z: -320, ry: 45, sc: 0.65, op: 0.2 },
    { x: 420, y: 60, z: -420, ry: 45, sc: 0.5,  op: 0 }
  ];

  /* Under 640px the arc flattens: no Z, no Y-rotation, and offsets measured in
     card widths so nothing reaches past the stage. site.css, Report B's
     decision 2. */
  function narrowTable(cw) {
    return [
      { x: 0,         y: 0,  z: 0, ry: 0, sc: 1,    op: 1 },
      { x: cw * 0.76, y: 4,  z: 0, ry: 0, sc: 0.85, op: 0.42 },
      { x: cw * 1.10, y: 14, z: 0, ry: 0, sc: 0.7,  op: 0.16 },
      { x: cw * 1.35, y: 22, z: 0, ry: 0, sc: 0.6,  op: 0.06 },
      { x: cw * 1.35, y: 30, z: 0, ry: 0, sc: 0.5,  op: 0 }
    ];
  }

  function sample(table, ad) {
    var top = table.length - 1;
    if (ad >= top) { return table[top]; }
    var i = Math.floor(ad), f = ad - i, a = table[i], b = table[i + 1];
    return {
      x: a.x + (b.x - a.x) * f,
      y: a.y + (b.y - a.y) * f,
      z: a.z + (b.z - a.z) * f,
      ry: a.ry + (b.ry - a.ry) * f,
      sc: a.sc + (b.sc - a.sc) * f,
      op: a.op + (b.op - a.op) * f
    };
  }
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
       website/, the page fetched all 69 thumbnails the moment the carousel
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
    root.appendChild(stage);
    root.appendChild(labelBox);
    root.appendChild(controls);
    root.appendChild(live);

    var index = 0;
    var locked = false;
    var labelTimer = null;

    /* THE CONTINUOUS LAYER. These inline styles live only between the moment a
       drag arms and the moment the settle lands; clearPaint() hands every
       resting position back to the stylesheet. That matters twice over: the
       narrow-screen flattening stays in its media query, and the reduced-motion
       rule's `transform: none !important` outranks an inline style anyway, so
       the drag path simply never runs when a visitor asked for less motion. */
    var pos = 0;
    var settling = null;

    function geomTable() {
      var cw = cards.length ? cards[0].offsetWidth : 280;
      return (window.matchMedia && window.matchMedia('(max-width: 640px)').matches)
        ? narrowTable(cw) : WIDE;
    }

    /* The drag maps pixels to cards through the first neighbour's own offset,
       so a card travels under the finger at the same rate on either layout. */
    function pitch() { return geomTable()[1].x || 145; }

    function paint(p) {
      var t = geomTable();
      cards.forEach(function (card, i) {
        var d = i - p, ad = Math.abs(d), g = sample(t, ad);
        card.style.transform = 'translate3d('
          + (d < 0 ? -g.x : g.x).toFixed(1) + 'px,'
          + g.y.toFixed(1) + 'px,' + g.z.toFixed(1) + 'px) rotateY('
          + (d < 0 ? g.ry : -g.ry).toFixed(1) + 'deg) scale(' + g.sc.toFixed(3) + ')';
        card.style.opacity = g.op.toFixed(3);
        card.style.zIndex = String(Math.max(0, Math.round(100 - ad * 10)));
        /* The stylesheet eases every card over 0.4s, which would fight a value
           rewritten each frame. Off while the finger or the settle drives it. */
        card.style.transition = 'none';
      });
    }

    function clearPaint() {
      cards.forEach(function (card) {
        card.style.transform = '';
        card.style.opacity = '';
        card.style.zIndex = '';
        card.style.transition = '';
      });
    }

    /* Ease out to the landing card, then hand back to CSS. The data-pos swap
       happens while the inline styles still cover it and the clear waits a
       frame, so the two never disagree on screen. */
    function settle(to) {
      var from = pos;
      var t0 = (window.performance && performance.now) ? performance.now() : Date.now();
      var target = Math.max(0, Math.min(items.length - 1, to));
      if (settling) { window.cancelAnimationFrame(settling); settling = null; }
      (function step() {
        var now = (window.performance && performance.now) ? performance.now() : Date.now();
        var k = Math.min(1, (now - t0) / SETTLE_MS);
        pos = from + (target - from) * (1 - Math.pow(1 - k, 3));
        paint(pos);
        if (k < 1) { settling = window.requestAnimationFrame(step); return; }
        settling = null;
        pos = target;
        paint(pos);
        var hadFocus = cards.indexOf(document.activeElement) !== -1;
        index = target;
        render('move');
        if (hadFocus) { cards[index].focus({ preventScroll: true }); }
        window.requestAnimationFrame(clearPaint);
      })();
    }

    function paintLabel() {
      var item = items[index];
      title.textContent = item.title;
      meta.textContent = item.empty
        ? (item.note || '')
        : [views(item.views), 'Watch on YouTube'].filter(Boolean).join(' · ');
      labelBox.classList.remove('fading');
    }

    function render(mode) {
      cards.forEach(function (card, i) {
        var d = i - index;
        var near = Math.abs(d) <= 3;
        card.setAttribute('data-pos', near ? String(d) : 'out');
        /* z-index computes from distance, 100 - |offset| x 10, so DOM order
           never decides which card sits on top mid-transition. */
        card.style.zIndex = near ? String(100 - Math.abs(d) * 10) : '0';
        card.tabIndex = d === 0 ? 0 : -1;
        card.setAttribute('aria-hidden', near ? 'false' : 'true');
        card.setAttribute('aria-current', d === 0 ? 'true' : 'false');

        var img = thumbs[i];
        if (img && !img.getAttribute('src') && Math.abs(d) <= PRELOAD) {
          img.src = img.getAttribute('data-thumb');
        }
      });
      count.textContent = (index + 1) + ' / ' + items.length;

      window.clearTimeout(labelTimer);
      if (reduced || mode === 'first') {
        paintLabel();
      } else {
        labelBox.classList.add('fading');
        labelTimer = window.setTimeout(paintLabel, 150);
      }
      if (mode === 'move') { live.textContent = items[index].title; }
    }

    /* Returns true when the carousel moved. During a transition it refuses,
       so rapid input cannot push the card index ahead of the label. */
    function go(to) {
      if (locked) { return false; }
      var n = items.length;
      var target = ((to % n) + n) % n;
      if (target === index) { return false; }

      var hadFocus = cards.indexOf(document.activeElement) !== -1;
      index = target;
      pos = target;
      render('move');
      /* Focus follows the active card, so the roving tab stop and the ring
         move together when a visitor works the keyboard or clicks a side card. */
      if (hadFocus) { cards[index].focus({ preventScroll: true }); }

      if (!reduced) {
        locked = true;
        window.setTimeout(function () { locked = false; }, STEP_MS);
      }
      return true;
    }

    prev.addEventListener('click', function () { go(index - 1); });
    next.addEventListener('click', function () { go(index + 1); });

    /* A drag that ends over a card must not also follow that card's link. */
    var swallowClick = false;

    cards.forEach(function (card, i) {
      card.addEventListener('click', function (event) {
        if (swallowClick) {
          event.preventDefault();
          event.stopPropagation();
          swallowClick = false;
          return;
        }
        if (i !== index) {
          event.preventDefault();
          go(i);
        }
      });
    });

    root.addEventListener('keydown', function (event) {
      var k = event.key;
      if (k === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
      else if (k === 'ArrowRight') { event.preventDefault(); go(index + 1); }
      else if (k === 'Home') { event.preventDefault(); go(0); }
      else if (k === 'End') { event.preventDefault(); go(items.length - 1); }
    });

    /* Pointer drag and touch swipe. Capture waits until the pointer travels
       DRAG_ARM pixels, so a plain click on a card still reaches the card. */
    var anchorX = null;
    var pointerId = null;
    var dragging = false;
    var dragFrom = 0, lastX = 0, lastT = 0, vel = 0;

    function endDrag() {
      if (dragging) {
        stage.classList.remove('is-dragging');
        /* The click that follows a real drag lands on whatever sits under the
           pointer; clear the flag again in case none arrives. */
        window.setTimeout(function () { swallowClick = false; }, 0);
      }
      if (pointerId !== null && stage.hasPointerCapture
          && stage.hasPointerCapture(pointerId)) {
        stage.releasePointerCapture(pointerId);
      }
      anchorX = null;
      pointerId = null;
      dragging = false;
    }

    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) { return; }
      anchorX = e.clientX;
      pointerId = e.pointerId;
      dragging = false;
    });

    stage.addEventListener('pointermove', function (e) {
      if (anchorX === null || e.pointerId !== pointerId) { return; }
      var dx = e.clientX - anchorX;
      if (!dragging) {
        if (Math.abs(dx) < DRAG_ARM) { return; }
        dragging = true;
        swallowClick = true;
        stage.classList.add('is-dragging');
        dragFrom = pos;
        lastX = e.clientX;
        lastT = (window.performance && performance.now) ? performance.now() : Date.now();
        vel = 0;
        if (settling) { window.cancelAnimationFrame(settling); settling = null; }
        if (stage.setPointerCapture) { stage.setPointerCapture(pointerId); }
      }

      /* Reduced motion keeps the old stepped drag: no continuous travel, just
         the swap the stylesheet already allows. */
      if (reduced) {
        if (Math.abs(dx) >= DRAG_STEP) {
          if (go(index + (dx < 0 ? 1 : -1))) { anchorX = e.clientX; }
        }
        return;
      }

      /* Otherwise the cards track the finger one to one. The ends hold rather
         than wrapping mid-drag, so a pull past the last card stops there
         instead of teleporting to the first. */
      var px = pitch();
      pos = Math.max(-0.45, Math.min(items.length - 0.55, dragFrom - dx / px));
      var now = (window.performance && performance.now) ? performance.now() : Date.now();
      var dt = Math.max(8, now - lastT);
      vel = ((lastX - e.clientX) / px) * (16 / dt);
      lastX = e.clientX;
      lastT = now;
      paint(pos);
    });

    stage.addEventListener('pointerup', function (e) {
      if (dragging && !reduced) {
        /* Momentum, damped hard. Velocity decides only whether a half-pulled
           card counts as pulled; the landing never travels more than one card
           from where the finger left off, so a hard flick advances one card
           rather than sailing through five. */
        var near = Math.round(pos);
        var to = Math.round(pos + vel * CARRY);
        endDrag();
        settle(Math.max(near - 1, Math.min(near + 1, to)));
        return;
      }
      /* A short flick that never reached DRAG_STEP still counts. */
      if (dragging && anchorX !== null && Math.abs(e.clientX - anchorX) >= FLICK) {
        go(index + (e.clientX < anchorX ? 1 : -1));
      }
      endDrag();
    });
    stage.addEventListener('pointercancel', function () {
      var wasDragging = dragging && !reduced;
      endDrag();
      if (wasDragging) { settle(Math.round(pos)); }
    });

    render('first');
  }

  /* Whoever serves this folder locally wants to know why this fires: a browser
     blocks the read over file://, so the fetch fails when the page opens
     straight off disk and works the moment it arrives over http. A visitor can
     act on none of that, so the note on screen says only that the carousel did
     not load, and points at the channel. */
  function fail(root) {
    root.textContent = '';
    var note = el('div', 'note');
    note.appendChild(el('h3', null, 'The carousel did not load'));
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
    var label = root.getAttribute('data-label') || 'Videos';

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
            note: 'The channel fills as the work lands.'
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
