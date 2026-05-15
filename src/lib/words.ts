import type { DictationWord } from "@/types/dictation";
import type { AppLanguage, LanguageMode } from "@/lib/language";
import { detectWordLanguage, resolveWordLanguage } from "@/lib/language";
import { splitEnglishSyllables } from "@/lib/englishSyllables";
import { toPhoneticSegments } from "@/lib/phoneticSegments";
import { splitSpanishSyllables } from "@/lib/spanishSyllables";

export function parseWordsFromText(text: string): string[] {
  return text
    .split(/[\s,;.\n\r]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && /[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ'-]/i.test(w));
}

function splitSyllables(text: string, lang: AppLanguage): string[] {
  return lang === "en" ? splitEnglishSyllables(text) : splitSpanishSyllables(text);
}

export function toDictationWords(
  words: string[],
  mode: LanguageMode = "auto",
): DictationWord[] {
  const seen = new Set<string>();

  return words
    .map((raw) => raw.trim())
    .filter(Boolean)
    .filter((w) => {
      const key = `${resolveWordLanguage(w, mode)}:${w.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((text, index) => {
      const lang = resolveWordLanguage(text, mode);
      return {
        id: `word-${index}-${lang}-${text.toLowerCase()}`,
        text,
        syllables: splitSyllables(text, lang),
        phonetics: toPhoneticSegments(text, lang),
        lang,
      };
    });
}

export function serializeWords(words: DictationWord[]): string {
  return JSON.stringify(words);
}

export function deserializeWords(json: string): DictationWord[] | null {
  try {
    const parsed = JSON.parse(json) as DictationWord[];
    if (!Array.isArray(parsed)) return null;
    return parsed
      .filter((w) => w?.text && Array.isArray(w.syllables))
      .map((w) => {
        const lang =
          w.lang === "en" || w.lang === "es"
            ? w.lang
            : detectWordLanguage(w.text);
        return {
          ...w,
          lang,
          syllables:
            w.syllables?.length > 0 ? w.syllables : splitSyllables(w.text, lang),
          phonetics:
            w.phonetics?.length > 0
              ? w.phonetics
              : toPhoneticSegments(w.text, lang),
        };
      });
  } catch {
    return null;
  }
}
