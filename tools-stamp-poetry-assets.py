#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Re-stamp poetry.html's ?v= tokens with the current asset content hashes.

Assets here serve with `Cache-Control: public, max-age=14400` and the site has
no build step and no site-wide asset versioning, so a changed poetry.js or
poetry.css does not reach a returning reader for four hours: they run
yesterday's script against today's page. Caught in production on 2026-11-02,
when a pushed dial rewrite kept rendering as the old dial.

Run this after editing either asset, before committing:

    python tools-stamp-poetry-assets.py
"""
import hashlib
import io
import re

ASSETS = ("poetry.css", "poetry.js")
PAGE = "poetry.html"


def digest(path):
    with io.open(path, "rb") as fh:
        return hashlib.sha1(fh.read()).hexdigest()[:8]


def main():
    with io.open(PAGE, encoding="utf-8") as fh:
        html = fh.read()
    for asset in ASSETS:
        token = digest("assets/" + asset)
        pattern = re.escape("assets/" + asset) + r"(?:\?v=[0-9a-f]+)?"
        html = re.sub(pattern, "assets/" + asset + "?v=" + token, html)
        print("%-12s -> %s" % (asset, token))
    with io.open(PAGE, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(html)


if __name__ == "__main__":
    main()
