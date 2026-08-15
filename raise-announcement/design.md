# Preview.io — Launch Announcement Motion Graphic

Design brief for a motion graphic celebrating Preview's launch / $12M funding announcement
(source tweet: [x.com/fejes713/status/2087542309613093129](https://x.com/fejes713/status/2087542309613093129)).

## Context

- **Company**: Preview (preview.io) — "the production platform for AI video." Storyboarding,
  multi-model generation, and directing tools for professional studios (commercials, shorts,
  hybrid films), built by Stefan Fejes (previously grew VEED to $40M ARR).
- **The news**: Preview raised **$12M**, led by **Sequoia**, with **Founders Fund** and
  **Badrul Farooqi** ("farooqib") participating. Positioning line: *"AI video is now part of how
  real productions get made."* 3,000 studios are on the waitlist; they're letting the next
  batch in.
- Reference screenshots pulled directly from their site/socials are in [`references/`](references/):
  - `website-og-image.jpg` — homepage OG card (wordmark + hero line + product screenshot)
  - `twitter-funding-announcement.jpg` — the actual $12M-raised graphic they posted

## Colors

Preview's site and announcement graphic are **strictly monochrome (near-black + white/gray)**,
with a **single noisy rainbow gradient** reserved as their one signature accent device. Don't
introduce other brand colors — the restraint is the point.

| Role | Value | Notes |
|---|---|---|
| Background | `#0A0A0A` | Not pure `#000000` — site's actual near-black |
| Primary text | `#FFFFFF` | Headlines, wordmark |
| Secondary text | `rgba(255,255,255,0.70)` (~`#B2B2B2` on black) | Sub-lines, captions |
| Tertiary / muted text | `rgba(255,255,255,0.50)` | Labels like "Backed by" |
| Hairline / border | `rgba(255,255,255,0.10–0.20)` | Dividers, card outlines |
| Signature gradient | `#E8352B → #FF7A1A → #FFD24C → #FF6FD8 → #6C3CE0 → #241B6E` (red → orange → yellow-white hot core → pink → violet → deep indigo) | Applied with visible **film grain / noise**, never a clean flat gradient. Used as a thin horizontal "bowtie" beam or diagonal light-streak — their one splash of color per composition |

Practical rule: everything is black/white/gray until one accent moment — a light beam, a
progress bar, an underline — where the full gradient (with grain) appears. Don't spread the
gradient across large flat fills; it reads best as a narrow beam, line, or glow.

## Typography

| Role | Font | Weight/Style | Notes |
|---|---|---|---|
| Display / headline | **Suisse Int'l** (Suisse International, by Swiss Typefaces) | Light 300 / Regular 400 / Medium 500, set in tight leading | Used for the wordmark and big hero statements. Wordmark "PREVIEW" is set in uppercase, condensed tracking, medium/bold weight. Large headline text mixes case (e.g. "$12M" bold numerals + "raised" in lighter regular lowercase) |
| Body / UI / secondary | **Inter** | Regular 400 / Medium 500 | Used for descriptions, labels, lists, UI chrome |
| Fallback stack | `"Suisse Intl", "Helvetica Neue", Arial, sans-serif` for display; `Inter, sans-serif` for body | | If Suisse Int'l isn't licensed for this project, **Neue Haas Grotesk** or **Helvetica Neue** are the closest substitutes — avoid anything geometric/rounded (no Poppins/Circular-type faces); it needs to read as a precise European grotesk. |

Type treatment notes:
- Big, confident, tight tracking, generous negative space around it — not dense.
- All-caps only for short labels/wordmark; sentence statements stay mixed-case.
- No drop shadows, no gradients on type — type stays flat white/gray; color lives in the
  background graphic only.

## Layout & motif language

- **Full-bleed near-black canvas**, generous margins, left-aligned text blocks.
- A thin **1px off-white border/frame** around the whole composition (seen in their funding
  graphic) reinforces the "card" feel — consider it for a title card or lower-third frame.
- Signature shape: a **horizontal bowtie/hourglass band** (wide at both ends, pinched in the
  middle) filled with the noisy rainbow gradient — reads like a stylized waveform/light beam.
  Good candidate for a transition element or an animated "signal" motif between scenes.
- Secondary shape language from the OG image: a **diagonal gradient light-streak** cutting
  across a dark UI screenshot — usable as a wipe/transition texture.
- Product screenshots (when shown) sit in dark-chrome app frames (near-black UI, thin hairline
  dividers, small pill/badge UI elements) — keep any app-UI inserts consistent with that chrome
  rather than light-mode.
- Grain/noise texture is applied throughout (visible in the gradient band and image treatments)
  — add subtle film grain over color areas so nothing looks like a flat vector gradient.

## Suggested motion graphic structure

1. **Cold open**: black frame, thin white border draws in, "PREVIEW" wordmark fades/tracks in.
2. **Headline beat**: "$12M raised" (or equivalent launch statement) in Suisse Int'l, bold
   numerals + light lowercase, per their own treatment.
3. **Signature beam**: the bowtie gradient band animates across (grows from a line into the
   pinched-bowtie shape, or sweeps left-to-right as a light streak) — this is the one moment of
   color and energy in an otherwise monochrome piece.
4. **Support line / logos**: "Backed by Sequoia, Founders Fund" etc. in muted gray Inter,
   small caps or regular, beneath a hairline divider.
5. **Close**: return to wordmark + tagline ("The production platform for AI video"), hold on
   black.

Keep pacing restrained and confident — long holds on black, minimal simultaneous motion,
let the one gradient beam be the entire "wow" moment rather than layering multiple effects.
