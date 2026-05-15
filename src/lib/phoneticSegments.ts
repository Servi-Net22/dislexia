import type { AppLanguage } from "@/lib/language";

export type PhoneticSegment = {
  grapheme: string;
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

    segments.push({
      grapheme,
      soundLetter: grapheme[0].toLowerCase(),
    });
    i = next;
  }

  return segments;
}

export function toPhoneticSegments(
  word: string,
  lang: AppLanguage,
): PhoneticSegment[] {
  const segments = splitToSegments(word, lang);
  if (segments.length > 0) return segments;

  return [...word]
    .filter((ch) => /[a-záéíóúñü]/i.test(ch))
    .map((ch) => ({
      grapheme: ch,
      soundLetter: ch.toLowerCase(),
    }));
}
