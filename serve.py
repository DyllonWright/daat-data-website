#!/usr/bin/env python3
"""Serve this repo the way Cloudflare Pages serves it, for local preview.

Pages drops the .html extension and redirects anything that still carries
one, so the site's internal links read `href="videos"` rather than
`href="videos.html"`. `python -m http.server` knows nothing about that and
answers 404 for every one of them, which makes the nav unusable locally — and
local preview over http is the only check this site has before a push reaches
the public web in about a minute.

So: run this instead.

    python serve.py            # http://127.0.0.1:8000
    python serve.py 8123       # another port

What it mirrors:
  /            -> index.html
  /videos      -> videos.html
  /videos/     -> 308 to /videos
  /videos.html -> 308 to /videos
  /index.html  -> 308 to /
  assets and data files behave exactly as before

ONE DELIBERATE DIFFERENCE, and it matters. Pages answers a MISSING file with
200 and the site's own HTML fallback, not 404 — which is how
assets/gong.mp3 came to read as present in production while it did not exist
(the hub repo's docs/website/AUDIT-FOLLOWUP-BRIEF.md, finding 5). This server returns an
honest 404 instead, so a missing asset shows up here as a missing asset.

The consequence runs both ways, so keep it in mind:
  · a probe that checks only `response.ok` passes here and fails in
    production. Check the content type too.
  · a status code tells you nothing about whether a page deployed. Polling
    production for 200 reports success for a page that does not exist yet.
    Poll for a string only the new version contains.
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class PagesHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path, _, rest = self.path.partition("?")
        suffix = ("?" + rest) if rest else ""

        if path == "/index.html":
            return self.redirect("/" + suffix)

        if path.endswith(".html"):
            return self.redirect(path[: -len(".html")] + suffix)

        if len(path) > 1 and path.endswith("/"):
            return self.redirect(path.rstrip("/") + suffix)

        if path != "/" and not Path(path).suffix:
            candidate = ROOT / path.lstrip("/")
            if candidate.with_suffix(".html").is_file():
                self.path = path + ".html" + suffix

        return super().send_head()

    def redirect(self, location):
        self.send_response(308)
        self.send_header("Location", location)
        self.send_header("Content-Length", "0")
        self.end_headers()
        return None

    def log_message(self, fmt, *args):
        sys.stderr.write("  %s\n" % (fmt % args))


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = partial(PagesHandler, directory=str(ROOT))
    print(f"the site on http://127.0.0.1:{port}  (extensionless, as Pages serves it)")
    print("a missing file returns a real 404 here and 200 plus HTML in production")
    try:
        ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
    except KeyboardInterrupt:
        print()


if __name__ == "__main__":
    main()
