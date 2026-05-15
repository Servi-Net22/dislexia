import type { AppLanguage } from "@/lib/language";
import { playPhoneme, unlockAudio } from "@/lib/phonemes";
import type { PhoneticSegment } from "@/lib/phoneticSegments";
import { speakTextSync, preloadVoices } from "@/lib/speechSync";
import { playWordAudio } from "@/lib/wordAudio";

export { preloadVoices, speakTextSync };

export function speakLetter(letter: string, lang: AppLanguage): void {
  void unlockAudio();
  void playPhoneme(letter, lang).then((played) => {
    if (!played) speakTextSync(letter, lang, 0.75);
  });
}

export function speakWord(word: string, lang: AppLanguage): void {
  playWordAudio(word, lang);
}

/** Reproduce el sonido de un segmento fonético (no el nombre de la letra). */
export function speakPhonemeSegment(
  segment: PhoneticSegment,
  lang: AppLanguage,
): void {
  void unlockAudio();

  if (segment.grapheme.length > 1) {
    speakTextSync(segment.grapheme, lang, 0.75);
    return;
  }

  void playPhoneme(segment.soundLetter, lang).then((played) => {
    if (!played) speakTextSync(segment.soundLetter, lang, 0.75);
  });
}
