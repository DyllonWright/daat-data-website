# Deploying this page

This folder holds the v0 static landing page for Daat Data Consulting (brand
decided 2026-07-14 — see `docs/POSITIONING.md`). It follows the same free hosting pipeline documented in
the sibling `free-website-workflow` repo: **GitHub stores the file, Cloudflare
Pages serves it, both stay on free tiers.** Total cost: $0.00.

One difference from that guide's default walkthrough: the guide assumes
`index.html` sits at the repo root. In this repo it sits in `website/`, because
this repo holds business documents generally, not just the site. The steps
below account for that.

> Design and copy lessons from the 2026-07-19 revision passes live in
> `docs/WEBSITE-DESIGN-LEARNINGS.md` — read that before the next visual or
> copy change.

## Brand reskin (2026-07-19)

The page now carries the ivory/gold/black chiaroscuro treatment drawn from the
brand art delivered in the repo-root folder `branding logo pfp and banner art/`:

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
brand, 2026-07-14, see `docs/POSITIONING.md`). The site keeps the decided
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
  `CLAUDE.md` and `docs/POSITIONING.md`. Neither wording got changed here.
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
  stay inside the positioning boundaries in `docs/POSITIONING.md`. The copy
  makes no predictive, medical, or outcome claims by design.
- **Display spelling now reads "Da'at Data Consulting"** in the hero, page
  title, and social metas, per the owner's 2026-07-19 layout spec (matching
  the banner art and YouTube bio). The footer disclaimer and © line keep
  "Daat Data Consulting" — the disclaimer awaits attorney sign-off and the
  legal entity name remains undecided, so those two lines stay untouched
  until the owner confirms which spelling the LLC filing uses.

## One-time setup

1. **Push this repo to GitHub** (it already lives at
   `Daat-Data-Spiritual-Consulting-Mental-Chiropracty` — confirm it has a
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

Same as the free-website-workflow pattern: edit `website/index.html` (in
GitHub's web editor, or locally and pushed), commit, and Cloudflare
auto-detects the change and republishes within roughly 30 seconds. No
Cloudflare-side action needed after the one-time setup above.

## Placeholders that still need real values

Before treating this page as launch-ready, fill in the following (each
marked with an HTML comment at its location in `index.html`):

- **Discord invite link** — replace the two `href="#"` placeholders tagged
  `DISCORD INVITE GOES HERE`.
- **Cal.com booking link** — replace the two `href="#"` placeholders tagged
  `CAL.COM BOOKING LINK GOES HERE`, once the Cal.com event type exists (see
  `docs/DISCORD-SPEC.md` for the booking/payment stack recommendation).
- **Newsletter provider** — the signup block currently uses a zero-dependency
  `mailto:` placeholder pending a provider decision; see
  `docs/NEWSLETTER-PIPELINE.md`. Once a provider gets chosen, swap in its
  embed form or form action.
- **Footer disclaimer wording** — marked `SYNC WITH ATTORNEY-APPROVED
  WORDING`; this paraphrases the compliance note in `docs/POSITIONING.md`
  and has not received legal review. Do not treat it as final.

## Optional: custom domain and QR code

Once the `.pages.dev` URL works, the free-website-workflow guide's later
sections cover connecting a custom domain (roughly $10-15/year, verify
current pricing) and generating a QR code for print/flyer use via a
browser's built-in QR generator or a free tool like QR Code Monkey. Both
apply unchanged to this page.
