import type { AppLanguage } from "@/lib/language";
import { playPhoneme, unlockAudio } from "@/lib/phonemes";
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
