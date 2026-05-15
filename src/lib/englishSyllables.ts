const VOWELS = "aeiouy";

function isVowel(ch: string): boolean {
  return VOWELS.includes(ch.toLowerCase());
}

/** Separación silábica aproximada para inglés (MVP). */
export function splitEnglishSyllables(word: string): string[] {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return [word];

  const original = word.toLowerCase();
  const syllables: string[] = [];
  let i = 0;

  while (i < clean.length) {
    let chunk = clean[i];
    i++;

    while (i < clean.length && isVowel(clean[i])) {
      chunk += clean[i];
      i++;
    }
    while (i < clean.length && !isVowel(clean[i])) {
      chunk += clean[i];
      i++;
    }

    const start = syllables.join("").length;
    syllables.push(original.slice(start, start + chunk.length) || chunk);
  }

  if (syllables.length === 0) return [word];
  return syllables;
}
