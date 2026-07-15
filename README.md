# Deploying this page

This folder holds the v0 static landing page for Daat Data Consulting (brand
decided 2026-07-14 — see `docs/POSITIONING.md`). It follows the same free hosting pipeline documented in
the sibling `free-website-workflow` repo: **GitHub stores the file, Cloudflare
Pages serves it, both stay on free tiers.** Total cost: $0.00.

One difference from that guide's default walkthrough: the guide assumes
`index.html` sits at the repo root. In this repo it sits in `website/`, because
this repo holds business documents generally, not just the site. The steps
below account for that.

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
