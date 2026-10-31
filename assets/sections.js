/* Renderers for the three sections that each read one JSON file:
 *
 *   .thought-draw + .thought-stream   →  data/thoughts.json
 *   .gags                             →  data/jokes.json
 *   .poems                            →  data/poetry.json
 *
 * One file rather than three, because all three do the same small job and no
 * build step bundles anything here. Adding an entry stays one edit in one data
 * file, exactly as data/videos.json already works.
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

  function link(href, text, cls) {
    var a = el('a', cls, text);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    return a;
  }

  function note(root, heading, body) {
    root.textContent = '';
    var box = el('div', 'note');
    box.appendChild(el('h3', null, heading));
    box.appendChild(el('p', null, body));
    root.appendChild(box);
  }

  function readFail(root, source) {
    note(root, 'That list did not load',
      'This page reads ' + source + ' at load time, and that read failed. Opening the '
      + 'file straight off disk does that — a browser blocks the read over file://. '
      + 'Served over http it works.');
  }

  function load(source, then, roots) {
    fetch(source, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) { throw new Error('HTTP ' + r.status); }
        return r.json();
      })
      .then(then)
      .catch(function () {
        roots.forEach(function (root) { if (root) { readFail(root, source); } });
      });
  }

  /* ── Thought of the Day ────────────────────────────────────────────────────
     One thought draws at random on load, with a control to draw another. The
     whole catalogue streams beneath it, grouped by sefirah, crown to kingdom.
     The owner settled that shape on 2026-10-31: the Tree stays a quiet
     grouping under the draw rather than becoming the page's index. */
  function body(item, cls) {
    if (Array.isArray(item.lines) && item.lines.length) {
      var ul = el('ul', cls);
      item.lines.forEach(function (line) { ul.appendChild(el('li', null, line)); });
      return ul;
    }
    return el('p', cls, item.text || '');
  }

  function thoughts(data) {
    var drawRoot = document.querySelector('.thought-draw');
    var streamRoot = document.querySelector('.thought-stream');
    var list = (data && Array.isArray(data.thoughts)) ? data.thoughts : [];
    var tree = (data && Array.isArray(data.tree)) ? data.tree : [];

    if (!list.length) {
      if (drawRoot) { note(drawRoot, 'Nothing drawn yet', 'The stream fills as the shorts land.'); }
      return;
    }

    if (drawRoot) {
      var shown = -1;
      var draw = function () {
        var i = Math.floor(Math.random() * list.length);
        if (list.length > 1 && i === shown) { i = (i + 1) % list.length; }
        shown = i;
        var item = list[i];

        drawRoot.textContent = '';
        var box = el('div', 'draw');
        box.appendChild(el('p', 'sefirah', item.sefirah));
        box.appendChild(el('p', 'thought', item.title));
        box.appendChild(body(item, 'gloss'));

        var row = el('div', 'cta-row');
        row.appendChild(link(item.url, 'Watch the short', 'btn btn-primary'));
        var again = el('button', 'btn btn-secondary', 'Draw another');
        again.type = 'button';
        again.addEventListener('click', draw);
        row.appendChild(again);
        box.appendChild(row);
        drawRoot.appendChild(box);
      };
      draw();
    }

    if (streamRoot) {
      streamRoot.textContent = '';
      var stream = el('div', 'stream');
      tree.forEach(function (sefirah) {
        var group = list.filter(function (t) { return t.sefirah === sefirah; });
        if (!group.length) { return; }

        var block = el('div', 'stream-group');
        var head = el('h3', null, sefirah);
        head.appendChild(el('span', 'tally', group.length + (group.length === 1 ? ' thought' : ' thoughts')));
        block.appendChild(head);

        group.forEach(function (item) {
          var entry = el('div', 'stream-item');
          entry.appendChild(link(item.url, item.title));
          entry.appendChild(body(item, null));
          if (item.published) { entry.appendChild(el('p', 'when', item.published)); }
          block.appendChild(entry);
        });
        stream.appendChild(block);
      });
      streamRoot.appendChild(stream);
    }
  }

  /* ── Horrible Ideas ──────────────────────────────────────────────────────── */
  function gags(data) {
    var root = document.querySelector('.gags');
    if (!root) { return; }
    var list = (data && Array.isArray(data.jokes)) ? data.jokes : [];
    root.textContent = '';

    if (!list.length) {
      var empty = el('p', 'gag', data && data.emptyState
        ? data.emptyState
        : 'Nothing horrible enough yet.');
      root.appendChild(empty);
      return;
    }

    var ul = el('ul', 'gag-list');
    list.forEach(function (joke) {
      var li = el('li', 'gag', joke.text);
      if (joke.aside) { li.appendChild(el('span', 'aside', joke.aside)); }
      ul.appendChild(li);
    });
    root.appendChild(ul);
  }

  /* ── Poetry ──────────────────────────────────────────────────────────────
     A stub until the owner moves the first pieces across. The page renders
     whatever data/poetry.json holds and says so plainly when it holds nothing;
     it never invents a line. projects/poetry/README.md carries the pipeline. */
  function poems(data) {
    var root = document.querySelector('.poems');
    if (!root) { return; }
    var list = (data && Array.isArray(data.poems)) ? data.poems : [];
    root.textContent = '';

    if (!list.length) {
      var box = el('div', 'dogear');
      box.appendChild(el('p', null, data && data.waiting
        ? data.waiting
        : 'The verse waits on its author.'));
      box.appendChild(el('span', 'fold'));
      root.appendChild(box);
      return;
    }

    list.forEach(function (poem) {
      var bay = el('div', 'verse-bay');
      bay.appendChild(el('h2', null, poem.title));
      bay.appendChild(el('p', 'verse', poem.text));
      if (poem.credit) { bay.appendChild(el('p', 'credit', poem.credit)); }
      root.appendChild(bay);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var drawRoot = document.querySelector('.thought-draw');
    var streamRoot = document.querySelector('.thought-stream');
    if (drawRoot || streamRoot) {
      load('data/thoughts.json', thoughts, [drawRoot, streamRoot]);
    }
    var gagRoot = document.querySelector('.gags');
    if (gagRoot) { load('data/jokes.json', gags, [gagRoot]); }
    var poemRoot = document.querySelector('.poems');
    if (poemRoot) { load('data/poetry.json', poems, [poemRoot]); }
  });
})();
