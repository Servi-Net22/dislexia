import type { AppLanguage } from "@/lib/language";
import { normalizeLetterKey, unlockAudio } from "@/lib/phonemes";
import type { PhoneticSegment } from "@/lib/phoneticSegments";
import { speakTextSync, preloadVoices } from "@/lib/speechSync";
import { playWordAudio } from "@/lib/wordAudio";

export { preloadVoices, speakTextSync };

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function playPhonemeAsync(
  segment: PhoneticSegment,
  lang: AppLanguage,
): Promise<void> {
  return new Promise((resolve) => {
    if (segment.grapheme.length > 1) {
      speakTextSync(segment.grapheme, lang, 0.75);
      window.setTimeout(resolve, 550);
      return;
    }

    void unlockAudio();
    const key =
      normalizeLetterKey(segment.grapheme[0] ?? segment.soundLetter) ??
      segment.soundLetter;
    const audio = new Audio(`/audio/fonemas/${lang}/${key}.mp3`);
    audio.onended = () => resolve();
    audio.onerror = () => {
      speakTextSync(segment.soundLetter, lang, 0.75);
      window.setTimeout(resolve, 500);
    };
    void audio.play().catch(() => {
      speakTextSync(segment.soundLetter, lang, 0.75);
      window.setTimeout(resolve, 500);
    });
  });
}

export function speakPhonemeSegment(
  segment: PhoneticSegment,
  lang: AppLanguage,
): void {
  void playPhonemeAsync(segment, lang);
}

/** Reproduce todos los fonemas en orden (c → a → s → a). */
export async function speakPhoneticWord(
  segments: PhoneticSegment[],
  lang: AppLanguage,
): Promise<void> {
  void unlockAudio();
  for (const segment of segments) {
    await playPhonemeAsync(segment, lang);
    await delay(280);
  }
}

export function speakLetter(letter: string, lang: AppLanguage): void {
  speakPhonemeSegment(
    { grapheme: letter, soundLetter: letter.toLowerCase() },
    lang,
  );
}

export function speakWord(word: string, lang: AppLanguage): void {
  playWordAudio(word, lang);
}
