import type { LanguageMode } from "@/lib/language";

/** Une "D A D" → "DAD" cuando OCR separa letras. */
function joinSpacedLetters(line: string): string {
  const parts = line.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && parts.every((p) => p.length === 1)) {
    return parts.join("");
  }
  return line.trim();
}

/** Corrige confusiones frecuentes en palabras en mayúsculas (cartas didácticas). */
function fixCommonUppercaseMisreads(word: string): string {
  if (!/^[A-Z]{2,6}$/.test(word)) return word;

  const fixes: [RegExp, string][] = [
    [/^J([AEIOU])$/i, "D$1"],
    [/^J([A-Z])$/i, "D$1"],
    [/^JP$/i, "DAD"],
    [/^JE$/i, "DAD"],
    [/^0/g, "O"],
    [/^1/g, "I"],
    [/\|/g, "I"],
  ];

  let w = word.toUpperCase();
  for (const [re, rep] of fixes) {
    w = w.replace(re, rep);
  }
  return w;
}

export function cleanupOcrText(
  raw: string,
  mode: LanguageMode = "auto",
): string {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => joinSpacedLetters(l))
    .map((l) => l.replace(/[|_]/g, "I").trim())
    .filter((l) => l.length > 0);

  const english =
    mode === "en" ||
    (mode === "auto" && lines.every((l) => /^[A-Za-z'-]+$/.test(l)));

  const cleaned = lines.map((line) => {
    const word = line.replace(/\s+/g, "");
    return english ? fixCommonUppercaseMisreads(word) : word;
  });

  const unique = [...new Set(cleaned.filter((w) => w.length >= 1))];

  if (english && unique.length > 1) {
    const scored = unique
      .map((w) => ({
        w,
        score:
          w.length * 10 +
          (w === w.toUpperCase() ? 5 : 0) -
          (/^[Jj][pe]$/i.test(w) ? 20 : 0),
      }))
      .sort((a, b) => b.score - a.score);

    const best = scored[0]?.w;
    if (best && best.length >= 2 && scored[0].score > (scored[1]?.score ?? 0) + 5) {
      return best;
    }
  }

  return unique.join("\n");
}
