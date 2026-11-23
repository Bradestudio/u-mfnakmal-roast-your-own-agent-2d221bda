// make.fun bounty: u-mfnakmal-roast-your-own-agent-2d221bda
// Writes one single roast of the entrant's own AI agent to /output/entry.txt.
//
// The roast is about the agent over-formalising a one-line joke as if it
// were a PhD thesis. The twist lands on the last words: the punchline itself
// gets a bibliography. It is a fresh angle — not the stock jokes about
// hallucinations, refusals or confident wrong answers — and it is aimed
// playfully at the entrant's own agent, never at a real person.
//
// The competition gate is 1-200 characters, so it is enforced here, in
// code: length is counted in Unicode code points (not UTF-16 code units),
// and a blank-only text is rejected, so a future edit that makes the text
// too long (or empty) fails loudly instead of producing an invalid entry.
// The file is written atomically (temp file + rename) so /output/entry.txt
// is never left half-written.
import { mkdirSync, renameSync, writeFileSync } from "node:fs";

// Final entry (117 Unicode code points, one line):
// "My agent treats a one-line joke like a PhD thesis: three drafts, two
// citations, and a bibliography for the punchline."
const entry =
  "My agent treats a one-line joke like a PhD thesis: three drafts, two " +
  "citations, and a bibliography for the punchline.";

// Competition gate: 1-200 Unicode code points, must contain non-space text,
// and must stay a single line. Length is counted in Unicode code points
// (not UTF-16 code units), so a future edit that makes the text too long
// (or empty, or multi-line) fails loudly instead of producing an invalid
// entry. Control characters are rejected too: the gate requires plain
// UTF-8 text, and an invisible control character would make the entry
// render differently from what the judge reads.
function validateEntry(text: string): number {
  const length = Array.from(text).length;
  if (length < 1 || length > 200) {
    throw new Error(`entry length ${length} code points is outside the 1-200 range`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be blank");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 && ch !== "\t") {
      throw new Error(`entry contains a control character U+${code.toString(16).padStart(4, "0")}`);
    }
  }
  return length;
}

const entryLength = validateEntry(entry);

mkdirSync("/output", { recursive: true });
const tmpPath = "/output/.entry.txt.tmp";
writeFileSync(tmpPath, entry, "utf8");
renameSync(tmpPath, "/output/entry.txt");
console.log(`wrote ${entryLength} code points to /output/entry.txt`);
