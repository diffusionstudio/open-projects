/* ── words ───────────────────────────────────────────────────────────────── */

// A word keeps its trailing space, so cutting a line apart does not disturb
// the advance. anime's splitText measures live DOM; a line's grid is known up
// front, so the cut is made here and `stagger` is handed the pieces.
const toWords = (s) => s.match(/\S+\s*/g) ?? [];

// "\n" opens a new line box; the words are numbered once across the whole
// body, so one wave crosses every line of it in a single pass.
export function bodyOf(runs) {
  const lines = [[]];
  let n = 0;
  for (const run of runs) {
    run.text.split("\n").forEach((text, i) => {
      if (i > 0) lines.push([]);
      for (const word of toWords(text)) lines.at(-1).push({ text: word, css: run.css, i: n++ });
    });
  }
  return { lines, n };
}
