import type { AppLanguage } from "@/lib/language";

export type PhoneticSegment = {
  /** Letra o grupo (sh, ch, rr) */
  grapheme: string;
  /** Texto visual repetido: ddddd… */
  display: string;
  /** Clave para el audio del fonema */
  soundLetter: string;
};

const ENGLISH_DIGRAPHS = [
  "sh",
  "ch",
  "th",
  "ph",
  "wh",
  "ck",
  "ng",
  "qu",
  "ee",
  "oo",
  "ea",
  "ai",
  "ay",
  "oa",
];

const SPANISH_DIGRAPHS = ["ch", "ll", "rr", "qu", "gu"];

function isVowel(ch: string): boolean {
  return /[aeiouáéíóúü]/i.test(ch);
}

function repeatGrapheme(grapheme: string, vowel: boolean): string {
  const g = grapheme.toLowerCase();
  const count = vowel ? 20 : 16;
  return g.repeat(count);
}

function nextGrapheme(
  word: string,
  i: number,
  digraphs: string[],
): { grapheme: string; next: number } {
  for (const d of digraphs) {
    if (word.slice(i, i + d.length).toLowerCase() === d) {
      return { grapheme: word.slice(i, i + d.length), next: i + d.length };
    }
  }
  return { grapheme: word[i], next: i + 1 };
}

function splitToSegments(
  word: string,
  lang: AppLanguage,
): PhoneticSegment[] {
  const digraphs = lang === "en" ? ENGLISH_DIGRAPHS : SPANISH_DIGRAPHS;
  const clean = word.trim();
  if (!clean) return [];

  const segments: PhoneticSegment[] = [];
  let i = 0;

  while (i < clean.length) {
    const { grapheme, next } = nextGrapheme(clean, i, digraphs);
    if (!grapheme || !/[a-záéíóúñü]/i.test(grapheme)) {
      i = next;
      continue;
    }

    const vowel = isVowel(grapheme[0]);
    const soundLetter = grapheme[0].toLowerCase();

    segments.push({
      grapheme,
      display: repeatGrapheme(grapheme, vowel),
      soundLetter,
    });
    i = next;
  }

  return segments;
}

/** Fonemas en orden (d→a→d), no deletreo (d→a→d como nombres). */
export function toPhoneticSegments(
  word: string,
  lang: AppLanguage,
): PhoneticSegment[] {
  const segments = splitToSegments(word, lang);
  if (segments.length > 0) return segments;

  return [...word].map((ch) => ({
    grapheme: ch,
    display: repeatGrapheme(ch, isVowel(ch)),
    soundLetter: ch.toLowerCase(),
  }));
}
