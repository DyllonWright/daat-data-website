/* Click a Saturn, hear the gong.
 *
 * The channel opens and closes on a gong, and a viewer said they liked it, so
 * the mascots carry it. A visitor's own click starts every sound: nothing
 * plays on load, nothing plays on hover, and nothing plays twice over itself.
 *
 * THE FILE DOES NOT SHIP YET. assets/gong.mp3 has to arrive as a deliberate
 * hand-copy, logged in docs/fleet/PROJECTS.md → Asset provenance, exactly as
 * every other asset under website/ did (CLAUDE.md → the publish boundary). No
 * sibling repo gets linked or submoduled to reach it. Until the file lands
 * this script probes for it once, finds nothing, and stops — no console noise,
 * no broken click, no dead <audio> in the markup.
 *
 * THE PROBE READS THE CONTENT TYPE, not just r.ok. Cloudflare Pages answers a
 * missing file with 200 and the site's own HTML fallback, so
 * daatdata.net/assets/gong.mp3 returned 200 text/html while the file did not
 * exist and r.ok read true. The handlers went on a file that would never play,
 * and the rejected play() got swallowed, so the only symptom read as a Saturn
 * that silently did nothing. Served locally the same path returns a real 404,
 * which is why the logic looked sound on this machine. Anything audio/ counts
 * as the file; anything else counts as the fallback.
 *
 * Keeping it from being annoying:
 *   · a four-second lockout, so a hammered planet rings once
 *   · a quarter volume
 *   · a mute the visitor sets, remembered per browser
 *   · silence when the system asks for reduced motion, which the same people
 *     who hate surprise motion usually also want
 *   · the planets stay aria-hidden decoration: no tab stop, nothing announced,
 *     nothing lost by never hearing it
 */
(function () {
  var SOUND = 'assets/gong.mp3';
  var GAP_MS = 4000;
  var VOLUME = 0.25;
  var KEY = 'daat-gong';

  var reduced = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { return; }

  var muted = false;
  try { muted = window.localStorage.getItem(KEY) === 'off'; } catch (e) { muted = false; }
  if (muted) { return; }

  var last = 0;
  var audio = null;

  function ready() {
    return fetch(SOUND, { method: 'HEAD' })
      .then(function (r) {
        var type = (r.headers.get('content-type') || '').toLowerCase();
        return r.ok && type.indexOf('audio/') === 0;
      })
      .catch(function () { return false; });
  }

  function ring() {
    var now = Date.now();
    if (now - last < GAP_MS) { return; }
    last = now;
    if (!audio) {
      audio = new Audio(SOUND);
      audio.volume = VOLUME;
      audio.preload = 'auto';
    }
    audio.currentTime = 0;
    var played = audio.play();
    if (played && played.catch) { played.catch(function () { /* the browser said no */ }); }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var planets = Array.prototype.filter.call(
      document.querySelectorAll('.sat'),
      function (s) { return !s.closest('a, button'); }
    );
    if (!planets.length) { return; }

    ready().then(function (ok) {
      if (!ok) { return; }
      planets.forEach(function (s) {
        s.style.cursor = 'pointer';
        s.addEventListener('click', ring);
      });
    });
  });
})();
