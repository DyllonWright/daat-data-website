# daatdata.net

The public site. Static HTML, no build step, no framework, no bundler: a
browser reads exactly the files in this repo. Cloudflare Pages serves them at
[daatdata.net](https://daatdata.net), and a push to `main` reaches the public
web in about a minute. **No staging exists.**

```
python serve.py            # http://127.0.0.1:8000
```

Use that rather than `python -m http.server`. Pages drops the `.html`
extension, so the site's links read `href="videos"`, and the stock server
answers 404 for every one of them. `serve.py` mirrors what Pages does,
redirects included.

## The shape of it

| | |
|---|---|
| `index.html` | the hub page; one card per body of work |
| `videos.html` `exodus.html` `non-nominalism.html` `exit-interview.html` `poetry.html` `horrible-ideas.html` `thoughts.html` `techne.html` `academia.html` `consulting.html` | a page per project |
| `assets/` | one stylesheet (`site.css`), a small script per section, images, SVG sprites |
| `data/` | the JSON each page renders — add an entry here rather than editing markup |
| `_redirects` | Cloudflare's redirect table |

The masthead is generated. Pages carry a `MASTHEAD:BEGIN/END` block written by
a script in the private hub repo, so **edit one page's masthead and the next
run overwrites it** — say what you want changed instead.

## Contributing

Open a pull request. `main` takes no direct pushes; every change lands through
a PR the owner reviews. Branch from `main`, keep one subject per PR, and say in
the description what a visitor sees differently.

Three things worth knowing before the first one:

1. **Everything here is already public.** Not only the pages — every file in
   this repo sits at a URL, `data/*.json` and this README included, and so does
   every commit message. Write them for a reader.
2. **No build step, on purpose.** No npm, no bundler, no framework. If a change
   seems to need one, raise it as an issue first.
3. **Nothing arrives from another repo by machine.** No submodules, no
   symlinks, no fetching from a private source at page load. An image or a
   quote reaches this repo as a deliberate hand-copy, and the owner logs where
   it came from. The rest of the body of work lives in private repos and stays
   there.

The design reasoning, the roadmap and the infrastructure record live in the
private hub repo and do not travel.

---

# The original deploy notes

Written while this folder sat inside the hub repo as `website/`, before the
split on 2026-11-01. Paths below that read `website/...` now mean the repo
root, and paths that read `docs/...` point into the private hub repo.

# Deploying this page

This folder holds the v0 static landing page for Daat Data Consulting (brand
decided 2026-07-14 — see `docs/business/POSITIONING.md`). It follows the same free hosting pipeline documented in
the sibling `free-website-workflow` repo: **GitHub stores the file, Cloudflare
Pages serves it, both stay on free tiers.** Total cost: $0.00.

One difference from that guide's default walkthrough: the guide assumes
`index.html` sits at the repo root. In this repo it sits in `website/`, because
this repo holds business documents generally, not just the site. The steps
below account for that.

> Design and copy lessons from the 2026-07-19 revision passes live in
> `docs/website/WEBSITE-DESIGN-LEARNINGS.md` — read that before the next visual or
> copy change.

## Brand reskin (2026-07-19)

The page now carries the ivory/gold/black chiaroscuro treatment drawn from the
brand art delivered in the repo-root folder `brand/`:

- `website/assets/logo.png` — copied from `profile pic.png` (ivory "DD" serif
  monogram, gold Saturn ring, sun flare on black). Serves as the favicon, the
  hero mark, and the source of the palette.
- `website/assets/banner.png` — copied from `banner art.png` (the monogram over
  a sun/Saturn spacescape). Serves as the darkened full-bleed hero background
  and the Open Graph / Twitter-card preview image (relative paths only — no
  public domain exists yet).

**Naming discrepancy, left for the owner to reconcile:** the brand now appears
in three spellings across live surfaces — "Da'at Data" (banner art and the
YouTube bio header, observed 2026-07-19), "daathdata" with an "h" (the business
email, Linktree, and Threads handle), and "Daat Data Consulting" (the decided
brand, 2026-07-14, see `docs/business/POSITIONING.md`). The site keeps the decided
spelling; the art and channels keep theirs. Reconcile before launch.

**From the owner's YouTube bio (2026-07-19), folded in or flagged:**

- The tagline "Where Consciousness Meets Complexity" (also on the banner art)
  now appears in the hero, along with the Consulting/Creating/Curating triad.
- The X link now reads `x.com/DaatData` (no "h"), matching the bio's own link
  list; the page previously guessed `DaathData`. All other handles matched.
- The bio names services in esoteric terms (Divination, Astrology, Tarot,
  Dream Interpretation, Shadow Work, Western Esotericism) that the site's
  tier copy does not use, and it carries its own disclaimer wording
  ("Educational and spiritual guidance only… Exoterically / Esoterically…")
  that differs from the site's footer draft. **Flag for legal review:** the
  attorney reviewing the footer disclaimer should see the bio wording too, so
  the two surfaces end up consistent — see the legal-caution rule in
  `CLAUDE.md` and `docs/business/POSITIONING.md`. Neither wording got changed here.
- The bio's Linktree (`linktr.ee/daathdata`) stays unlinked on this page —
  the Discord/Cal.com funnel remains the site's primary path.

The existing Cloudflare Pages setting **build output directory: `website`**
already covers the new `website/assets/` folder — no deployment change needed.

**Layout and copy refactor (2026-07-19, three passes):** the landing now opens
text-first — logo, brand line, tagline, thesis headline ("Most people choose
between science and spirituality. We study the systems beneath both."),
one supporting paragraph naming tarot, astrology, dream analysis, and Western
esotericism as symbolic technologies, and the two CTAs — all in the first
viewport. The banner artwork sits *beneath* the hero as atmosphere: ~25%
opacity under a vignette that melts into the page black, so the art glows
under the text without competing with it (an earlier mid-page divider
placement sat loose in the flow and got removed). The banner still serves as
the Open Graph / Twitter-card image at full strength. **Flags:**

- The hero and premises now name divination practices publicly — the owner
  (and the attorney reviewing the footer disclaimer) should confirm the lines
  stay inside the positioning boundaries in `docs/business/POSITIONING.md`. The copy
  makes no predictive, medical, or outcome claims by design.
- **Display spelling now reads "Da'at Data Consulting"** in the hero, page
  title, and social metas, per the owner's 2026-07-19 layout spec (matching
  the banner art and YouTube bio). The footer disclaimer and © line keep
  "Daat Data Consulting" — the disclaimer awaits attorney sign-off and the
  legal entity name remains undecided, so those two lines stay untouched
  until the owner confirms which spelling the LLC filing uses.

## ⚠️ Deployment reality check (2026-07-25)

The one-time setup below describes the *intended* pipeline. What actually runs
differs, and the gap matters:

- A Cloudflare Pages project exists at **`website-9t2.pages.dev`** (HTTP 200),
  but it builds from **`github.com/daathdata/website`** (private) — **not this
  repo.** The page it serves is a different, older design that still carries
  the pre-2026-07-19 social handles (`x.com/DaathData`, `tiktok.com/@daathdata5`)
  this repo already corrected, and it has no Discord invite, no Cal.com
  placeholder, no newsletter block, and no disclaimer.
- The custom domain **`daatdata.net`** (registered 2026-07-25) returns **HTTP
  522** at the apex and **525** on `www` — leftover Namecheap parking records
  sit proxied in the Cloudflare zone and the Pages custom domain never
  completed attachment.

**This repo holds the current, correct copy of the site.** Full diagnosis, the
DNS evidence, and the fix sequence live in `docs/website/INFRASTRUCTURE.md` → **Known
problems** and **Recommended next actions**. Repointing the existing Pages
project at this repo (build output directory `website`) resolves both — no
migration, one settings change.

## One-time setup

1. **Push this repo to GitHub** (it already lives at
   `DyllonWright/daat-data` (renamed 2026-10-31) — confirm it has a
   remote and the latest commit includes `website/index.html`).
2. **Create a Cloudflare account** (or reuse an existing one) at
   [cloudflare.com](https://www.cloudflare.com) — free, no card required.
3. In the Cloudflare dashboard, open **Workers & Pages** → **Create
   application** → **Pages** tab → **Connect to Git**.
4. Authorize Cloudflare's GitHub connection and select this repository.
5. On the build configuration screen, set:
   - **Build command:** leave blank (no build step — the page has no compile
     stage).
   - **Build output directory:** `website` (not the repo root — this setting
     alone differs from the default free-website-workflow steps).
6. Click **Save and Deploy**. Cloudflare builds and serves the page at a
   `*.pages.dev` URL within about 30-60 seconds.

## Making updates

Same as the free-website-workflow pattern: edit the relevant file under
`website/` (in GitHub's web editor, or locally and pushed), commit, and
Cloudflare auto-detects the change and republishes within roughly 30 seconds.
No Cloudflare-side action needed after the one-time setup above.

Which file: copy and layout per page live in that page's own `.html`; the
palette, type and every shared component live once in `assets/site.css`; the
video list lives once in `data/videos.json`. See **Structure** below.

⚠️ **None of that reaches the public yet.** The Pages project builds a
different repository, and `daatdata.net` returns 522 — both verified still open
on 2026-10-31. See the reality check below and `docs/website/INFRASTRUCTURE.md`.

## Structure (restructured 2026-10-31)

One page became a hub plus a page per body of work. **The no-build constraint
holds** — plain HTML and CSS, no compile stage, relative paths only.

```
website/
  index.html            the hub: thesis, the work, the email capture
  videos.html           all four video series, rendered from data/videos.json
  exodus.html           Project Exodus  ⚖️ every line needs legal review
  treatise.html         the philosophical treatise
  exit-interview.html   the novel
  consulting.html       a quiet stub — no tiers, no prices, no booking
  assets/
    site.css            THE shared stylesheet. Edit the brand here, once
    logo.png  banner.png  exit-interview-cover.jpg
  data/
    videos.json         THE video list. One edit here adds a video
```

**Adding a video:** append one object to the right series' `videos` array in
`data/videos.json`. Nothing else, anywhere. Set `url` to the direct YouTube
watch link — never a playlist URL, since no comprehensive playlist exists.
Leaving `url` as `null` renders a non-clickable card showing the stage instead.

**One caveat the no-build constraint buys:** `videos.html` reads that JSON with
`fetch()` at load time, which browsers block over `file://`. Opening the file
straight off disk shows an explanatory message rather than the list. Serve the
folder over http to preview it; Cloudflare Pages serves it over http, where it
works.

**Preview with `python scripts/serve-website.py`, not `python -m http.server`.**
Pages drops the `.html` extension, so every internal link reads `href="videos"`.
`http.server` answers 404 for all of them and the nav stops working. The script
mirrors the rewriting, including the 308s Pages issues for `/videos.html` and
`/videos/`, so a local preview matches what a visitor gets.

It differs from Pages in exactly one way, deliberately: a missing file returns
an honest 404 locally, where Pages answers 200 with the site's own HTML
fallback. Two consequences follow, and both have cost real time —
a probe that checks only `response.ok` passes locally and fails in production,
and polling production for a status code reports success for a page that has
not deployed yet. Check the content type; poll for a string the new version
contains.

**Asset provenance** — what each file in `assets/` is and where it came from —
lives in `docs/fleet/PROJECTS.md`, along with the publish boundary that governs what
may enter this folder at all. Read it before copying anything in from a sibling
repo. Every one of those repos reads private; this folder goes to the public web.

## Placeholders — resolved, removed, or still open

**Removed rather than filled (2026-10-31):**

- ~~**Cal.com booking link**~~ — both `href="#"` placeholders deleted along with
  the booking path itself. Selling got shelved; `consulting.html` now says so
  plainly. Do not re-add a booking button without the owner asking.
- ~~**Newsletter `mailto:` form**~~ — deleted. A `mailto:` form action fails
  silently in most browsers, so it dropped every submission it ever received.
  Replaced by a plain visible `contact@daatdata.net` plus the Discord link, and
  an honest line saying no list exists yet.

**Still open:**

- **Newsletter provider** — no account exists. `docs/funnel/NEWSLETTER-PIPELINE.md`
  compares Buttondown, beehiiv and Substack, and leans Buttondown for its
  markdown-native drafting and API. **The owner needs to create that account**;
  once it exists, swap the plain address for the provider's embed form.
- **Footer disclaimer wording** — marked `SYNC WITH ATTORNEY-APPROVED WORDING`
  on `index.html` and `consulting.html`; paraphrases `docs/business/POSITIONING.md` and
  has not received legal review. Not final.
- **⚖️ `exodus.html`, line by line.** Written against
  `../project-exodus/docs/IP-AND-CLAIMS.md` §2, §7 and §9 — trademarks absent
  from every machine-read surface, benefit vocabulary limited to the permitted
  list, the negative finding unhedged with its citation, the safety text
  verbatim. Written against those rules, not cleared against them.
- **Hero background images** — `banner.png` still stands in, blurred, for the
  three purpose-built text-free backgrounds specced in `assets/site.css`.

## Custom domain and QR code — done, with one fault outstanding

No longer optional and no longer hypothetical:

- **Domain:** `daatdata.net`, registered 2026-07-25 through Namecheap (~$12/yr),
  DNS delegated to Cloudflare. It does **not** serve yet — see the reality
  check above. `docs/website/INFRASTRUCTURE.md` carries the record and the fix.
- **Email:** `contact@daatdata.net` forwards to the owner's Gmail via
  Cloudflare Email Routing, tested working. Receive-only for now.
- **QR codes:** already scripted, not hand-made. `discord/assets/generate-qr.py`
  writes brand-marked codes for the invite, every social handle, the Linktree,
  and the contact address into `discord/assets/qr/`. The **website QR stays
  commented out** in that script until `daatdata.net` returns 200 — uncomment
  and re-run then.
