import type { DictationWord } from "@/types/dictation";
import { splitSpanishSyllables } from "@/lib/spanishSyllables";

export function parseWordsFromText(text: string): string[] {
  return text
    .split(/[\s,;.\n\r]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && /[a-záéíóúñüA-ZÁÉÍÓÚÑÜ]/i.test(w));
}

export function toDictationWords(words: string[]): DictationWord[] {
  const seen = new Set<string>();

  return words
    .map((raw) => raw.trim())
    .filter(Boolean)
    .filter((w) => {
      const key = w.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((text, index) => ({
      id: `word-${index}-${text.toLowerCase()}`,
      text,
      syllables: splitSpanishSyllables(text),
    }));
}

export function serializeWords(words: DictationWord[]): string {
  return JSON.stringify(words);
}

export function deserializeWords(json: string): DictationWord[] | null {
  try {
    const parsed = JSON.parse(json) as DictationWord[];
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((w) => w?.text && Array.isArray(w.syllables));
  } catch {
    return null;
  }
}
