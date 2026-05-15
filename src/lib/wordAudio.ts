import type { AppLanguage } from "@/lib/language";
import { unlockAudio } from "@/lib/phonemes";
import { speakTextSync } from "@/lib/speechSync";

let activeWordAudio: HTMLAudioElement | null = null;

/** Reproduce la palabra completa vía API (fiable en móvil y Vercel). */
export function playWordAudio(word: string, lang: AppLanguage): void {
  if (typeof window === "undefined") return;

  void unlockAudio();

  if (activeWordAudio) {
    activeWordAudio.pause();
    activeWordAudio = null;
  }

  const clean = word.trim();
  if (!clean) return;

  const audio = new Audio(
    `/api/tts?word=${encodeURIComponent(clean)}&lang=${lang}`,
  );
  activeWordAudio = audio;

  const fallback = () => speakTextSync(clean, lang, 0.82);

  audio.addEventListener("error", fallback, { once: true });
  void audio.play().catch(fallback);
}
