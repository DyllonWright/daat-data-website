#!/usr/bin/env python3
"""Derive display-sized copies of the brand art in assets/.

Measured 2026-10-31, over http at 400px: index.html pulled 2.2 MB of its own
assets — banner.png at 1.7 MB and logo-mark.png at 530 KB — against Report D's
250 KB page ceiling (research/reports/06-rawilson-site-audit-d-gemini.md,
do-not-copy 1). Both files render far smaller than they ship: the banner sits
behind the hero blurred 12px at 0.35 opacity, and the monogram never exceeds
112px on screen.

This script writes derived copies beside the originals. It overwrites nothing
it did not write. The originals stay in place, logged in
docs/fleet/PROJECTS.md → Asset provenance, and remain the source for any
future derivation.

  banner.png     1672x941  ->  hero-bg.jpg         836x470, blur baked in
  logo-mark.png  1254x1254 ->  logo-mark-224.png   224x224
  logo.png       1254x1254 ->  favicon-64.png      64x64

The 2026-10-31 audit caught the one this pass first missed. The novel's cover
shipped at 401 KB and carried exit-interview.html 63% past the same ceiling,
the only page that broke it. .cover-layout caps the art at 280px wide, 260px
on a phone, so 560px covers a 2x screen with nothing to spare:

  exit-interview-cover.jpg  1024x1536 -> exit-interview-cover-560.jpg  560x840

Two social cards, added the same day (audit finding 8). Nine pages pointed
og:image at banner.png, 1.7 MB. The browser never fetches it, so it cost no
page weight, but every link unfurl did. Cards render at 1200x630, the size
both Open Graph and a large Twitter card ask for:

  banner.png                1672x941  -> social-card.jpg           1200x630
  exit-interview-cover.jpg  1024x1536 -> exit-interview-card.jpg   1200x630

The novel's cover stands portrait, so its card centres the art on the site's
own near-black rather than cropping the title off the top.

Re-run after replacing an original. Needs Pillow.
"""

from pathlib import Path

from PIL import Image, ImageFilter

CARD = (1200, 630)
BACKDROP = (6, 5, 4)

ASSETS = Path(__file__).resolve().parent.parent / "assets"


def main():
    banner = Image.open(ASSETS / "banner.png").convert("RGB")
    banner = banner.resize((836, 470), Image.LANCZOS).filter(ImageFilter.GaussianBlur(5))
    banner.save(ASSETS / "hero-bg.jpg", quality=78, optimize=True, progressive=True)

    mark = Image.open(ASSETS / "logo-mark.png").convert("RGBA")
    mark.resize((224, 224), Image.LANCZOS).save(ASSETS / "logo-mark-224.png", optimize=True)

    icon = Image.open(ASSETS / "logo.png").convert("RGB")
    icon.resize((64, 64), Image.LANCZOS).save(ASSETS / "favicon-64.png", optimize=True)

    cover_src = Image.open(ASSETS / "exit-interview-cover.jpg").convert("RGB")
    cover_src.resize((560, 840), Image.LANCZOS).save(
        ASSETS / "exit-interview-cover-560.jpg", quality=80, optimize=True,
        progressive=True)

    card = Image.open(ASSETS / "banner.png").convert("RGB")
    scale = max(CARD[0] / card.width, CARD[1] / card.height)
    card = card.resize((round(card.width * scale), round(card.height * scale)), Image.LANCZOS)
    left = (card.width - CARD[0]) // 2
    top = (card.height - CARD[1]) // 2
    card.crop((left, top, left + CARD[0], top + CARD[1])).save(
        ASSETS / "social-card.jpg", quality=82, optimize=True, progressive=True)

    art = cover_src.copy()
    art.thumbnail((CARD[1] - 40, CARD[1] - 40), Image.LANCZOS)
    plate = Image.new("RGB", CARD, BACKDROP)
    plate.paste(art, ((CARD[0] - art.width) // 2, (CARD[1] - art.height) // 2))
    plate.save(ASSETS / "exit-interview-card.jpg", quality=82, optimize=True,
               progressive=True)

    for name in ("banner.png", "hero-bg.jpg", "logo-mark.png", "logo-mark-224.png",
                 "logo.png", "favicon-64.png",
                 "exit-interview-cover.jpg", "exit-interview-cover-560.jpg",
                 "social-card.jpg", "exit-interview-card.jpg"):
        print(f"{name:22} {(ASSETS / name).stat().st_size // 1024:>5} KB")


if __name__ == "__main__":
    main()
