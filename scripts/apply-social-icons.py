#!/usr/bin/env python3
"""Put a monochrome brand glyph beside the name in every social row.

The owner asked for the logos next to the names, black and white, matching
the theme (2026-11-01). No build step runs on this site, so the glyphs live
in one sprite sheet, assets/social-sprite.svg, and every row
references them with <use>. The icon inherits the link's colour through
currentColor, so the gold hover carries the glyph along with the word.

Every page kept its own hand-written copy of the row, and those copies read
byte-identical, so this script rewrites them all rather than asking anyone to
edit eleven footers. It runs idempotently: an anchor that already carries a
glyph gets left alone.

The footers themselves stay hand-kept, unlike the masthead, because two of
them differ — consulting.html and index.html carry the protected legal
disclaimer, which no generator may touch.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT

# Which glyph each host answers to. Matched against the href, so a handle
# change costs nothing here.
GLYPHS = {
    "youtube.com": "soc-youtube",
    "tiktok.com": "soc-tiktok",
    "instagram.com": "soc-instagram",
    "x.com": "soc-x",
    "threads.com": "soc-threads",
}

LINK = re.compile(
    r'<a class="social-link" href="(?P<href>[^"]+)"'
    r'(?P<attrs>[^>]*)>(?P<label>[^<]+)</a>'
)


def glyph_for(href):
    for host, symbol in GLYPHS.items():
        if host in href:
            return symbol
    return None


def rewrite(match):
    href = match.group("href")
    symbol = glyph_for(href)
    if symbol is None:
        return match.group(0)
    label = match.group("label").strip()
    # aria-hidden on the glyph, because the name sits right beside it and a
    # screen reader announcing both would say the brand twice.
    icon = (
        f'<svg class="social-ico" aria-hidden="true">'
        f'<use href="assets/social-sprite.svg#{symbol}"/></svg>'
    )
    return (
        f'<a class="social-link" href="{href}"{match.group("attrs")}>'
        f'{icon}<span>{label}</span></a>'
    )


def main():
    pages = sorted(PAGES.glob("*.html"))
    if not pages:
        sys.exit("no pages found")
    touched = 0
    for path in pages:
        html = path.read_text(encoding="utf-8")
        out = LINK.sub(rewrite, html)
        if out != html:
            path.write_text(out, encoding="utf-8")
            print(f"  wrote {path.name}")
            touched += 1
        else:
            print(f"  unchanged {path.name}")
    print(f"{touched} page(s) rewritten")


if __name__ == "__main__":
    main()
