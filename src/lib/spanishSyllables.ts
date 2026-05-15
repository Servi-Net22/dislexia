const VOWELS = "aeiouáéíóúü";

function isVowel(ch: string): boolean {
  return VOWELS.includes(ch.toLowerCase());
}

/** Separación silábica aproximada para español (MVP). */
export function splitSpanishSyllables(word: string): string[] {
  const clean = word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-zñ]/g, "");

  if (!clean) return [word];

  const original = word.toLowerCase();
  const useOriginal = original.length === clean.length;

  const chars = clean.split("");
  const syllables: string[] = [];
  let i = 0;

  while (i < chars.length) {
    let chunk = chars[i];
    i++;

    if (i < chars.length && !isVowel(chars[i - 1]) && isVowel(chars[i])) {
      while (i < chars.length && isVowel(chars[i])) {
        chunk += chars[i];
        i++;
      }
    } else if (i < chars.length && isVowel(chars[i - 1]) && !isVowel(chars[i])) {
      if (
        i + 1 < chars.length &&
        !isVowel(chars[i + 1]) &&
        chars[i] !== chars[i + 1]
      ) {
        syllables.push(useOriginal ? mapChunk(chunk, original, syllables) : chunk);
        continue;
      }
      chunk += chars[i];
      i++;
      while (i < chars.length && isVowel(chars[i])) {
        chunk += chars[i];
        i++;
      }
    }

    syllables.push(useOriginal ? mapChunk(chunk, original, syllables) : chunk);
  }

  if (syllables.length === 0) return [word];
  return syllables;
}

function mapChunk(chunk: string, original: string, prior: string[]): string {
  const start = prior.join("").length;
  return original.slice(start, start + chunk.length) || chunk;
}

/** Colores suaves por sílaba (referencia Dislexia Campus / materiales adaptados). */
export const SYLLABLE_COLORS = [
  "#4A90A4",
  "#6B9E78",
  "#C17B4E",
  "#8B6BA8",
  "#B85C6E",
  "#5C7EB8",
] as const;
