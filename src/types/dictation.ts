import type { AppLanguage } from "@/lib/language";
import type { PhoneticSegment } from "@/lib/phoneticSegments";

export type DictationWord = {
  id: string;
  text: string;
  syllables: string[];
  phonetics: PhoneticSegment[];
  lang: AppLanguage;
};

export const STORAGE_KEY = "dislexia-dictation-words";
export const WORDS_UPDATED_EVENT = "dislexia-words-updated";
