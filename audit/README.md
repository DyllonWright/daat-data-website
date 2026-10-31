# The Ontology Audit — data contract

Status: v0.1, dated 2026-09-18. Phase 0 of `docs/funnel/MVP-BUILD-PLAN.md`. The instrument itself
lives in `docs/funnel/INSTRUMENT-ONTOLOGY-AUDIT.md`; this folder holds the machine-readable form and
(later) the page that runs it.

## The fact layer and the prose layer stay separate

`instrument.json` splits every object into two layers. The split borrows the atomic-fact
modeling from the Great Work (see `.claude/skills/repo-router` rule 6); the Great Work's own
material stays in its own repo.

| Layer | Holds | Changes when |
|---|---|---|
| **`facts`** | The proposition each question tests, which pole it loads, which traditions it separates, each position's core claims and coordinates | The *instrument* changes — and a change here invalidates scoring, so it needs a version bump |
| **`prose`** | The words a respondent reads. Stems, options, labels, result copy | Any time. Freely. Regenerating every word costs nothing downstream |

**Why it matters here.** The instrument's validity rests on the propositions; the product's
credibility rests on the voice. Tangling them means every rewording risks the scoring, and
every scoring fix disturbs the voice. Split, the owner can regenerate prose from any model,
in any register, as many times as wanted, and the instrument keeps measuring the same thing.

## Prose variants and selection

Each `prose` block holds an array of `variants` and one `selected` id. A variant records:

```json
{
  "id": "v2",
  "author": "who or what wrote it",
  "humanized": true,
  "note": "optional — what this variant was trying to do differently"
}
```

Workflow: generate variants freely, run `/humanizer` over them, set `selected` to the best
one. Nothing gets deleted — a rejected variant costs a few bytes and records what already
got tried, which stops the same wording getting re-proposed three sessions later.

The page reads only the `selected` variant. Everything else sits there as history.

## Layout

```
website/audit/
  README.md          this file — the contract
  instrument.json    axes, 20 questions, 16 positions, scoring constants
  (page files)       phase 4 of the build plan; nothing here yet
```

## Invariants — anything that breaks one of these breaks the instrument

1. **Every axis carries exactly four questions**, and exactly one of them sets
   `"tiebreaker": true` with `"weight": 1.5`. That weight exists to make a 2–2 block
   impossible to tie; removing it reintroduces ties the code has no branch for.
2. **`pole_positive` and `pole_negative` stay fixed per axis.** The five-letter code, the
   coordinate signs in every position, and the whole 16-position library all read from them.
   Flipping one silently inverts an axis across the entire library.
3. **A position's `coords` stay inside −4…+4 on every axis**, matching the range four
   questions can actually produce. **A library position may sit at 0**, which renders its code
   letter lowercase for that axis (`TPwLC`) and means *this position declines to commit here*.
   Neoplatonic theurgy uses it: refusing the will/surrender dichotomy counts as Iamblichus's
   own move, and a coordinate that declines states that better than either pole would. A
   respondent can never reach 0 — the 1.5× tiebreaker forbids it — so a lowercase letter never
   appears in a result code.
4. **Prose never carries scoring information.** If the code reads anything out of a `prose`
   block to compute a result, the split has already failed.
5. **No invented citations.** An `entry_texts` entry names a book that exists in a form a
   reader can obtain, or it does not appear. A fabricated source is the one failure this
   product cannot survive — the whole differentiator rests on citations being checkable.
   **Every entry currently reads `"status": "drafted-unverified"`** and none of the 42 drafted
   titles has met a real catalogue yet. Nothing here reaches a paying customer until it does.
   Three positions carry an acknowledged `gaps` entry instead of a title, which counts as the
   correct outcome rather than a hole to plug.

## Open

- Coherence-score coefficients read `"status": "uncalibrated"`. They need a few hundred real
  runs before the numbers mean anything (`docs/funnel/MVP-BUILD-PLAN.md` → Phase 4, run logging).
- Position citations read `"status": "temple-pending"` — that pass belongs to the Temple
  capability scan, per the routing in the build plan. Do not run it from this repo.
- Question wording stays **unfrozen** until the phase-0 audit lands. Nothing should build 32
  position write-ups on top of it before then.
