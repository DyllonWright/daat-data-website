/* The wall — every published cut, rendered from data/channel.json.
 *
 * Markup: <div class="wall" data-source="data/channel.json" data-step="24"></div>
 *
 * website/data/videos.json describes the four scripted series and what stage
 * each one sits at. It describes nothing the channel has actually published,
 * and the channel contradicted it 69 times, so this file renders the other
 * half of the truth: the catalogue, most viewed first.
 *
 * The first 24 tiles render immediately and a button adds the rest, which
 * keeps the initial paint light without hiding anything behind a scroll
 * listener. Images carry loading="lazy" either way.
 *
 * Every string reaches the DOM through textContent, never innerHTML.
 */
(function () {
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

  function minutes(seconds) {
    if (typeof seconds !== 'number' || seconds <= 0) { return ''; }
    var m = Math.round(seconds / 60);
    return m < 1 ? 'under a minute' : m + ' min';
  }

  function tile(v) {
    var card = el('a', 'wall-card');
    card.href = v.url;
    card.target = '_blank';
    card.rel = 'noopener';

    var shot = el('div', 'shot');
    var img = el('img');
    img.src = v.thumb;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 480;
    img.height = 270;
    shot.appendChild(img);
    card.appendChild(shot);

    card.appendChild(el('h3', null, v.title));
    card.appendChild(el('p', 'meta',
      [views(v.views), minutes(v.durationSeconds)].filter(Boolean).join(' · ')));
    return card;
  }

  function start(root) {
    var source = root.getAttribute('data-source') || 'data/channel.json';
    var step = parseInt(root.getAttribute('data-step'), 10) || 24;

    fetch(source, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) { throw new Error('HTTP ' + r.status); }
        return r.json();
      })
      .then(function (data) {
        var list = (data && Array.isArray(data.videos)) ? data.videos : [];
        if (!list.length) { throw new Error('empty'); }

        root.textContent = '';
        var grid = el('div', 'video-wall');
        root.appendChild(grid);

        var shown = 0;
        var more = el('button', 'btn btn-secondary wall-more');
        more.type = 'button';

        function draw() {
          var end = Math.min(shown + step, list.length);
          for (; shown < end; shown++) { grid.appendChild(tile(list[shown])); }
          if (shown >= list.length) {
            more.remove();
          } else {
            more.textContent = 'Show ' + Math.min(step, list.length - shown) + ' more';
          }
        }

        more.addEventListener('click', draw);
        root.appendChild(more);
        draw();
      })
      .catch(function () {
        root.textContent = '';
        var note = el('div', 'note');
        note.appendChild(el('h3', null, 'The catalogue did not load'));
        note.appendChild(el('p', null, 'This page reads ' + source + ' at load time, and that '
          + 'read failed. Opening the file straight off disk does that — a browser blocks '
          + 'the read over file://. Served over http it works.'));
        var p = el('p');
        var a = el('a', null, 'Go to the YouTube channel');
        a.href = 'https://www.youtube.com/@DaatData';
        a.target = '_blank';
        a.rel = 'noopener';
        p.appendChild(a);
        note.appendChild(p);
        root.appendChild(note);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.wall'), start);
  });
})();
