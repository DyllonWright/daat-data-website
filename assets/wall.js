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

  /* The hook reel — a thumbnail beside a one-line hook.
   *
   * Markup: <div class="reel" data-source="data/hooks.json"
   *              data-videos="data/channel.json"></div>
   *
   * hooks.json carries the hook, written for the site. The thumbnail, title, link and
   * view count come from channel.json, joined by video id, so an entry whose id
   * the channel does not list simply does not render. The thumbnail links out;
   * no player loads on this page. */
  function reelEntry(v, hook) {
    var item = el('figure', 'reel-item');

    var shot = el('a', 'reel-shot');
    shot.href = v.url;
    shot.target = '_blank';
    shot.rel = 'noopener';
    shot.tabIndex = -1;
    shot.setAttribute('aria-hidden', 'true');
    var img = el('img');
    img.src = v.thumb;
    img.alt = 'Thumbnail for the video “' + v.title + '”';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 480;
    img.height = 270;
    shot.appendChild(img);
    item.appendChild(shot);

    var body = el('div', 'reel-body');
    body.appendChild(el('p', 'reel-source', 'Why watch it'));
    body.appendChild(el('p', 'reel-summary', hook.hook));

    var cap = el('figcaption', 'reel-cap');
    var a = el('a', null, v.title);
    a.href = v.url;
    a.target = '_blank';
    a.rel = 'noopener';
    cap.appendChild(a);
    var meta = [views(v.views), minutes(v.durationSeconds)].filter(Boolean).join(' · ');
    if (meta) { cap.appendChild(el('span', 'reel-meta', meta)); }
    body.appendChild(cap);

    item.appendChild(body);
    return item;
  }

  function startReel(root) {
    var hookSource = root.getAttribute('data-source') || 'data/hooks.json';
    var videoSource = root.getAttribute('data-videos') || 'data/channel.json';

    function load(url) {
      return fetch(url, { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) { throw new Error('HTTP ' + r.status); }
        return r.json();
      });
    }

    Promise.all([load(hookSource), load(videoSource)])
      .then(function (both) {
        var hooks = (both[0] && Array.isArray(both[0].entries)) ? both[0].entries : [];
        var list = (both[1] && Array.isArray(both[1].videos)) ? both[1].videos : [];
        var byId = {};
        list.forEach(function (v) { byId[v.id] = v; });

        var shown = hooks.filter(function (h) {
          return h && h.hook && byId[h.id];
        });
        if (!shown.length) { throw new Error('empty'); }

        root.textContent = '';
        shown.forEach(function (h) { root.appendChild(reelEntry(byId[h.id], h)); });
      })
      .catch(function () {
        /* The reel is a bonus. If it fails, its whole section steps aside and
           the catalogue below carries the page. */
        var section = root.closest('section');
        if (section) { section.hidden = true; } else { root.hidden = true; }
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.wall'), start);
    Array.prototype.forEach.call(document.querySelectorAll('.reel'), startReel);
  });
})();
