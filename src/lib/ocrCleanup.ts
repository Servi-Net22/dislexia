import type { LanguageMode } from "@/lib/language";

function joinSpacedLetters(line: string): string {
  const parts = line.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && parts.every((p) => p.length === 1)) {
    return parts.join("");
  }
  return line.trim();
}

const OCR_CHAR_FIX: Record<string, string> = {
  "0": "O",
  "1": "I",
  "|": "I",
  "¡": "I",
  "¿": "",
};

function fixChar(ch: string): string {
  return OCR_CHAR_FIX[ch] ?? ch;
}

/** Corrige lecturas típicas en palabras MAYÚSCULAS de cartas. */
function fixUppercaseWord(word: string): string {
  const w = word
    .toUpperCase()
    .split("")
    .map(fixChar)
    .join("")
    .replace(/[^A-Z]/g, "");

  const known: Record<string, string> = {
    AA: "DAD",
    AAA: "DAD",
    JP: "DAD",
    JE: "DAD",
    Jp: "DAD",
    DaD: "DAD",
    OAD: "DAD",
    BAD: "DAD",
    AAD: "DAD",
  };

  return known[w] ?? w;
}

function isEnglishMode(mode: LanguageMode, lines: string[]): boolean {
  return (
    mode === "en" ||
    (mode === "auto" && lines.every((l) => /^[A-Za-z'-]+$/.test(l)))
  );
}

export function cleanupOcrText(
  raw: string,
  mode: LanguageMode = "auto",
): string {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => joinSpacedLetters(l))
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const english = isEnglishMode(mode, lines);

  let tokens = lines.flatMap((line) => {
    const compact = line.replace(/\s+/g, "");
    if (!compact) return [];
    return [compact];
  });

  if (english) {
    tokens = tokens
      .map((t) => fixUppercaseWord(t))
      .filter((t) => t.length >= 2 || (t.length === 1 && t === t.toUpperCase()));
    tokens = tokens.filter((t) => !/^[a-z]$/.test(t));
  }

  const unique = [...new Set(tokens)];

  if (english && unique.length > 0) {
    const scored = unique
      .map((w) => ({
        w,
        score:
          w.length * 15 +
          (w === w.toUpperCase() ? 10 : 0) -
          (/^[Aa]{1,3}$/.test(w) ? 5 : 0),
      }))
      .sort((a, b) => b.score - a.score);

    const best = scored[0]?.w;
    if (best && best.length >= 2) {
      if (unique.length === 1 || (scored[0].score - (scored[1]?.score ?? 0)) >= 8) {
        return best;
      }
    }
  }

  return unique.join("\n");
}
