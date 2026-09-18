---
name: take-on-me
description: >-
  Turn a short story idea into a hand-drawn pencil-animation film in the spirit of a-ha's 1985
  "Take On Me" video: a colour world, a boiling graphite sketch world, and a character who crosses
  between them. Built entirely from code in Diffusion Studio, no footage or generated images. Use
  when the user asks for a "Take On Me" style video, a rotoscope / pencil-sketch animation, or a
  story where someone falls into (or out of) a drawing.
---

# Take On Me

You are making a 15–30 s silent animated short from a story idea. Every mark on screen is a procedural pencil or marker stroke drawn into one `<surface>` of a Diffusion Studio project. **No footage, images, AI-generated pictures, fonts, or libraries.** The film is artistic, not physically accurate: motion follows animation principles and emotion, never simulation.

What makes it "Take On Me" is not the pencil alone, it is the **two worlds and the crossing between them**:

- **Colour world ("toon")** — home. Flat colour fills and a steady, slightly wobbly black marker line. No hatching, no grain on the line.
- **Sketch world ("pencil")** — the other side. Soft graphite on pale lavender paper, drawn on twos, every drawing a fresh attempt so the lines boil. Tone is hatching, never fills.
- **Crossovers are the point.** A pencil thing inside the colour world sits on its own patch of paper (a reflection, a hand reaching out, a souvenir). The only colour inside the pencil world is light leaking in from home.

## Inputs

```
IDEA:      one to three sentences
DURATION:  seconds (default 20)
MUST SHOW: optional — specific moments or a final image
```

Don't interrogate the user. If the idea has no portal, antagonist, or ending, invent them and say so in the brief.

## Files in this skill

| Path | Use |
| --- | --- |
| [references/story.md](references/story.md) | How to turn the idea into a two-world shot list. Read before writing the brief. |
| [references/look.md](references/look.md) | The non-negotiable rules of both looks, the timing, the acceptance checklist. Read before drawing anything. |
| [references/engine.md](references/engine.md) | The `pen` API and how to build characters as rigs of solid forms. |
| [template/](template) | Starting project: `engine.ts` (never redesign it), `index.tsx`, `package.json` (24 fps export), and a `shots.ts` look test. |
| [example/fish-heist/](example/fish-heist) | A finished 25 s film. `brief.md` is the model for a brief, `shots.ts` for staging and crossovers, `cast.ts` for character rigs that draw in either world. |

## Diffusion Studio

The app's tools arrive over MCP (`open`, `check`, `capture`, `logs`, …) or as the `dapi` CLI (`dapi capture` = `capture`). If neither is available, install with `brew install --cask diffusionstudio/tap/editor`; if tools answer "The app has no window", ask the user to bring the app up.

The docs ship with the app at `/Applications/Diffusion Studio.app/Contents/Resources/docs` and win over anything written here. Read `skills/editor.md`, `reference/jsx/surface-paint.md`, `reference/jsx/lifecycle.md`, `reference/jsx/variables.md`, and `reference/tools/{open,check,capture}.md` once per session.

## Process

1. **Brief.** Read `references/story.md`, then write `brief.md` in a fresh project folder (default `~/Movies/Diffusion Studio/<slug>`): the premise in two lines, the two worlds and what crosses over, the shot list as a table (`# · time · world · framing · what happens`), status, open decisions. Every cut on a multiple of 0.5 s. Tell the user the shot list in a few lines and keep going.
2. **Project.** Copy `template/*` (including `.gitignore`) into the folder, set `name` in `package.json` and the scene `name` in `index.tsx`, and `open` it. `capture` scene `film` at `0.5`, `2.5`, `4.5` — you should see the look test (toon ball, pencil ball, pencil ball on a paper patch in the colour room). If it doesn't match `references/look.md`, fix that before any story work.
3. **Pass 1 — blocking.** Replace the look test with the real shot table. All shots, rough: staging, timing, readable silhouettes. Put characters and sets in `cast.ts` as rigs that take `{ x, y, s, toon?, …pose }`; keep `shots.ts` to staging and acting. After each shot: `check`, then `capture` 3–4 times inside it.
4. **Pass 2 — detail.** Character design, acting (anticipation, squash, settle), backgrounds, energy marks (speed lines, bursts, scribbles). Fix the biggest visible problem first.
5. **Pass 3 — look.** Boil check per pencil shot: capture two consecutive drawings (`2` and `2.09`) — background clearly different, subject nearly the same. Twos check: `2` and `2.04` identical. Walk the checklist in `references/look.md`.
6. Keep `brief.md`'s status current. Never export to verify — `capture` is the same render. Export only when the user asks.

## Hard rules

- Composition time is the only clock: the picture is a pure function of `drawing = floor(time × 12)`. No `Math.random()`, `Date.now()`, `requestAnimationFrame`, `frame()`, or async setup. Use the seeded `R` you are handed.
- Everything visible is drawn inside the one surface. No `<text>`, `<html>`, `<rect>`, `<image>`, `<video>`, `<effect>`, transitions, or `generate.*`. The one exception: a music track the user supplies is an `<audio>` clip next to the surface, and cuts land on its beats. Never use the actual a-ha recording unless the user confirms they hold the rights.
- Hard cuts only, and they live in the shot table, not on the timeline. 1–3 s per shot; change framing every cut.
- No on-screen text unless MUST SHOW demands it — then hand-letter it with the pen.
- `engine.ts` is topic-independent. Add a primitive only when a shot truly cannot be drawn without it, and keep the existing ones untouched.
- The film is an homage, not a copy: borrow the language (sketch world, comic-panel frames, the hand reaching out, helmeted pursuers, the tear in the wall), never trace frames or draw the real performers' likenesses.
