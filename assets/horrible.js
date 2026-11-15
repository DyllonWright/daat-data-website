/* Horrible Ideas: the quote list, the shirt bay and the downloadable card.
 *   .q-list  ←  data/jokes.json
 *   card QR  ←  data/quote-qr.json (baked by scripts/build-quote-qr.py)
 */
(function () {
  'use strict';

  var SHIRT = '<svg viewBox="0 0 400 432" aria-hidden="true">' +
    '<path class="cloth" d="M140 22 L60 52 L8 132 L66 170 L96 134 L96 414 L304 414 L304 134 L334 170 L392 132 L340 52 L260 22 Q200 NECK 140 22 Z"/>' +
    '<path class="seam" d="M140 22 Q200 COLLAR 260 22"/></svg>';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  }
  function getJSON(url) {
    return fetch(url).then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  var list = document.querySelector('.q-list');
  var bay = document.querySelector('.bay');
  if (!list || !bay) { return; }

  var stage = bay.querySelector('.stage');
  var shirt = bay.querySelector('.shirt');
  var front = bay.querySelector('.side.front');
  var rear = bay.querySelector('.side.rear');
  var canvas = bay.querySelector('canvas');
  var views = { shirt: bay.querySelector('.shirt-view'), card: bay.querySelector('.card-view') };
  var tabs = bay.querySelectorAll('[data-view]');
  var quotes = [], codes = {}, fallback = 'https://daatdata.net/horrible-ideas';
  var current = null, turn = 0;
  var logo = new Image();
  logo.src = 'assets/logo-mark-224.png';
  logo.onload = function () { if (current) { drawCard(current); } };

  front.innerHTML = SHIRT.replace('NECK', '58').replace('COLLAR', '66') + '<div class="print"></div>';
  rear.innerHTML = SHIRT.replace('NECK', '34').replace('COLLAR', '40') +
    '<div class="print nape"></div><div class="print"></div>';

  /* ── shirt ── */
  function fit(box, text) {
    box.textContent = text;
    var size = 30;
    box.style.fontSize = size + 'px';
    while (size > 8 && (box.scrollHeight > box.clientHeight || box.scrollWidth > box.clientWidth)) {
      size -= 1;
      box.style.fontSize = size + 'px';
    }
  }
  function setTurn(deg) {
    turn = deg;
    shirt.style.setProperty('--turn', deg + 'deg');
  }
  function dressShirt(q) {
    var prints = rear.querySelectorAll('.print');
    fit(front.querySelector('.print'), q.text);
    prints[0].textContent = q.back ? '' : 'Da’at Data';
    fit(prints[1], q.back || '');
    setTurn(Math.round(turn / 360) * 360);
  }

  var dragFrom = null;
  stage.addEventListener('pointerdown', function (e) {
    dragFrom = { x: e.clientX, turn: turn };
    stage.classList.add('drag');
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', function (e) {
    if (dragFrom) { setTurn(dragFrom.turn + (e.clientX - dragFrom.x) * 0.9); }
  });
  function drop(e) {
    if (!dragFrom) { return; }
    var moved = Math.abs(e.clientX - dragFrom.x);
    dragFrom = null;
    stage.classList.remove('drag');
    setTurn(moved < 4 ? turn + 180 : Math.round(turn / 180) * 180);
  }
  stage.addEventListener('pointerup', drop);
  stage.addEventListener('pointercancel', drop);
  bay.querySelector('.flip-btn').addEventListener('click', function () {
    setTurn(Math.round(turn / 180) * 180 + 180);
  });
  bay.querySelectorAll('.swatch').forEach(function (s) {
    s.addEventListener('click', function () {
      shirt.classList.toggle('bone', s.dataset.cloth === 'bone');
      bay.querySelectorAll('.swatch').forEach(function (o) {
        o.setAttribute('aria-pressed', String(o === s));
      });
    });
  });

  /* ── card ── */
  function wrap(ctx, text, maxW) {
    var lines = [], line = '';
    text.split(' ').forEach(function (word) {
      var test = line ? line + ' ' + word : word;
      if (line && ctx.measureText(test).width > maxW) { lines.push(line); line = word; }
      else { line = test; }
    });
    if (line) { lines.push(line); }
    return lines;
  }
  function drawCard(q) {
    var W = canvas.width, H = canvas.height, ctx = canvas.getContext('2d');
    var serif = '"Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = '#0d0b08';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#c9a24b';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, W - 48, H - 48);
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 36, W - 72, H - 72);

    /* The quote: the largest size whose wrapped block clears the footer. */
    var parts = q.back ? [q.text, q.back] : [q.text];
    var maxW = W - 200, maxH = 330, size = 92, blocks, lh;
    do {
      size -= 4;
      ctx.font = '600 ' + size + 'px ' + serif;
      lh = size * 1.12;
      blocks = parts.map(function (p) { return wrap(ctx, p, maxW); });
    } while (size > 28 && (blocks[0].length + (blocks[1] ? blocks[1].length : 0)) * lh > maxH);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var total = blocks.reduce(function (n, b) { return n + b.length; }, 0);
    var y = 70 + (maxH - total * lh) / 2 + lh / 2;
    blocks.forEach(function (b, i) {
      ctx.fillStyle = i ? '#e8c887' : '#f2ead9';
      ctx.font = (i ? 'italic ' : '') + '600 ' + size + 'px ' + serif;
      b.forEach(function (ln) { ctx.fillText(ln, W / 2, y); y += lh; });
    });

    /* Footer: mark and name on the left, QR on the right. */
    var base = H - 70;
    if (logo.complete && logo.naturalWidth) { ctx.drawImage(logo, 70, base - 110, 110, 110); }
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e8c887';
    ctx.font = '600 40px ' + serif;
    ctx.fillText('— Da’at Data', 200, base - 72);
    ctx.fillStyle = '#8a8171';
    ctx.font = '22px ui-monospace, Consolas, monospace';
    ctx.fillText('daatdata.net/horrible-ideas', 202, base - 28);

    var rows = codes[q.url] || codes[fallback];
    if (rows) {
      var box = 150, pad = 10, cell = (box - pad * 2) / rows.length;
      var x0 = W - 70 - box, y0 = base - box;
      ctx.fillStyle = '#f2ead9';
      ctx.fillRect(x0, y0, box, box);
      ctx.fillStyle = '#0d0b08';
      rows.forEach(function (row, r) {
        for (var c = 0; c < row.length; c++) {
          if (row.charAt(c) === '1') {
            ctx.fillRect(x0 + pad + c * cell, y0 + pad + r * cell, cell + 0.5, cell + 0.5);
          }
        }
      });
      ctx.textAlign = 'right';
      ctx.fillStyle = '#8a8171';
      ctx.fillText(q.url && codes[q.url] ? 'watch the source' : 'more like this', x0 - 18, base - 28);
    }
  }
  bay.querySelector('.save-btn').addEventListener('click', function () {
    if (!current) { return; }
    canvas.toBlob(function (blob) {
      var a = el('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'daat-data-' + current.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40).replace(/-$/, '') + '.png';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    }, 'image/png');
  });

  /* ── selection ── */
  function show(view) {
    Object.keys(views).forEach(function (k) { views[k].hidden = k !== view; });
    tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t.dataset.view === view)); });
    if (view === 'shirt' && current) { dressShirt(current); }
  }
  function pick(i, byHand) {
    current = quotes[i];
    list.querySelectorAll('.q').forEach(function (li, n) { li.classList.toggle('on', n === i); });
    drawCard(current);
    if (!views.shirt.hidden) { dressShirt(current); }
    /* On a phone the bay sits above the list, so bring it back into view. */
    if (byHand && window.matchMedia('(max-width: 820px)').matches) {
      bay.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  var copyBtn = bay.querySelector('.copy-btn');
  copyBtn.addEventListener('click', function () {
    if (!current || !navigator.clipboard) { return; }
    var line = '“' + current.text + (current.back ? ' ' + current.back : '') + '” — Da’at Data';
    navigator.clipboard.writeText(line).then(function () {
      copyBtn.textContent = 'Copied';
      setTimeout(function () { copyBtn.textContent = 'Copy quote'; }, 1400);
    });
  });
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { show(t.dataset.view); });
  });

  function render() {
    list.textContent = '';
    quotes.forEach(function (q, i) {
      var li = el('li', 'q');
      var body = el('div');
      var p = el('p', 'q-text', q.text);
      if (q.back) { p.appendChild(document.createTextNode(' ')); p.appendChild(el('span', 'back', q.back)); }
      var meta = el('div', 'q-meta');
      if (q.url) {
        var a = el('a', null, (q.src || 'Source') + ' ↗');
        a.href = q.url; a.target = '_blank'; a.rel = 'noopener';
        meta.appendChild(a);
      } else if (q.src) { meta.appendChild(el('span', null, q.src)); }
      body.appendChild(p);
      if (meta.firstChild) { body.appendChild(meta); }
      li.appendChild(body);
      li.tabIndex = 0;
      li.addEventListener('click', function (e) {
        if (!e.target.closest('a')) { pick(i, true); }
      });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target === li) { pick(i, true); }
      });
      list.appendChild(li);
    });
  }

  Promise.all([getJSON('data/jokes.json'), getJSON('data/quote-qr.json')]).then(function (got) {
    var data = got[0], qr = got[1];
    quotes = (data && Array.isArray(data.jokes)) ? data.jokes : [];
    if (qr && qr.codes) { codes = qr.codes; fallback = qr.fallback || fallback; }
    if (!quotes.length) {
      list.appendChild(el('li', 'q-text', (data && data.emptyState) || 'Nothing horrible enough yet.'));
      bay.hidden = true;
      return;
    }
    render();
    var ready = document.fonts && document.fonts.load
      ? document.fonts.load('600 60px "Cormorant Garamond"').catch(function () {})
      : Promise.resolve();
    ready.then(function () { pick(0); show('card'); });
  });
})();
