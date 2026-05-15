import type { AppLanguage } from "@/lib/language";

const LETTER_TO_PHONEME_FILE: Record<string, string> = {
  a: "a",
  á: "a",
  b: "b",
  c: "c",
  d: "d",
  e: "e",
  é: "e",
  f: "f",
  g: "g",
  h: "h",
  i: "i",
  í: "i",
  j: "j",
  k: "k",
  l: "l",
  m: "m",
  n: "n",
  ñ: "enie",
  o: "o",
  ó: "o",
  p: "p",
  q: "q",
  r: "r",
  s: "s",
  t: "t",
  u: "u",
  ú: "u",
  ü: "u",
  v: "v",
  w: "w",
  x: "x",
  y: "y",
  z: "z",
};

let audioUnlocked = false;
let activeAudio: HTMLAudioElement | null = null;

export function normalizeLetterKey(letter: string): string | null {
  const key = letter.toLowerCase().trim();
  return LETTER_TO_PHONEME_FILE[key] ?? null;
}

export async function unlockAudio(): Promise<void> {
  if (audioUnlocked || typeof window === "undefined") return;

  const silent = new Audio(
    "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA",
  );
  silent.volume = 0.01;
  try {
    await silent.play();
    silent.pause();
    audioUnlocked = true;
  } catch {
    /* reintento en el clic */
  }
}

function phonemeUrl(lang: AppLanguage, fileKey: string): string {
  return `/audio/fonemas/${lang}/${fileKey}.mp3`;
}

export function preloadPhonemes(letters: string[], lang: AppLanguage): void {
  if (typeof window === "undefined") return;
  for (const letter of letters) {
    const key = normalizeLetterKey(letter);
    if (key) {
      const audio = new Audio(phonemeUrl(lang, key));
      audio.preload = "auto";
    }
  }
}

export async function playPhoneme(
  letter: string,
  lang: AppLanguage,
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const fileKey = normalizeLetterKey(letter);
  if (!fileKey) return false;

  if (lang === "es" && fileKey === "enie") {
    /* ok */
  } else if (lang === "en" && fileKey === "enie") {
    return false;
  }

  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }

  const audio = new Audio(phonemeUrl(lang, fileKey));
  activeAudio = audio;

  try {
    await audio.play();
    audio.onended = () => {
      if (activeAudio === audio) activeAudio = null;
    };
    return true;
  } catch {
    return false;
  }
}
