import { playPhoneme, unlockAudio } from "@/lib/phonemes";

let voicesCache: SpeechSynthesisVoice[] | null = null;
let voicesReady: Promise<void> | null = null;

function waitForVoices(): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve();
  }

  if (voicesCache?.length) return Promise.resolve();

  if (!voicesReady) {
    voicesReady = new Promise((resolve) => {
      const load = () => {
        voicesCache = window.speechSynthesis.getVoices();
        if (voicesCache.length > 0) {
          resolve();
          return true;
        }
        return false;
      };

      if (load()) return;

      const onVoices = () => {
        if (load()) {
          window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
        }
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoices);

      window.setTimeout(() => {
        load();
        resolve();
      }, 500);
    });
  }

  return voicesReady;
}

function getSpanishVoice(): SpeechSynthesisVoice | undefined {
  if (!voicesCache?.length) return undefined;
  return (
    voicesCache.find((v) => v.lang.startsWith("es")) ??
    voicesCache.find((v) => v.lang.includes("ES")) ??
    voicesCache[0]
  );
}

export async function speakText(text: string, rate = 0.85): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  await unlockAudio();
  await waitForVoices();

  const synth = window.speechSynthesis;
  synth.resume();

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = rate;
    const voice = getSpanishVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    synth.cancel();
    window.setTimeout(() => {
      synth.resume();
      synth.speak(utterance);
    }, 80);
  });
}

/** Fonema (MP3) con respaldo a TTS del nombre de la letra. */
export async function speakLetter(letter: string): Promise<void> {
  const played = await playPhoneme(letter);
  if (!played) {
    const name = letter.toLowerCase();
    await speakText(name === "ñ" ? "eñe" : name, 0.7);
  }
}

export async function speakWord(word: string): Promise<void> {
  await speakText(word, 0.8);
}

export function preloadVoices(): void {
  if (typeof window === "undefined") return;
  void waitForVoices();
}
