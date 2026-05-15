/** Mapeo letra → archivo de fonema en /public/audio/fonemas/ */
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

const audioCache = new Map<string, HTMLAudioElement>();
let audioUnlocked = false;
let activeAudio: HTMLAudioElement | null = null;

export function normalizeLetterKey(letter: string): string | null {
  const key = letter.toLowerCase().trim();
  return LETTER_TO_PHONEME_FILE[key] ?? null;
}

/** Desbloquea audio en el navegador (requiere gesto del usuario). */
export async function unlockAudio(): Promise<void> {
  if (audioUnlocked || typeof window === "undefined") return;

  const silent = new Audio(
    "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA",
  );
  silent.volume = 0.01;
  try {
    await silent.play();
    audioUnlocked = true;
  } catch {
    /* se reintentará en el primer clic */
  }
}

function getAudio(fileKey: string): HTMLAudioElement {
  let audio = audioCache.get(fileKey);
  if (!audio) {
    audio = new Audio(`/audio/fonemas/${fileKey}.mp3`);
    audio.preload = "auto";
    audioCache.set(fileKey, audio);
  }
  return audio;
}

export function preloadPhonemes(letters: string[]): void {
  if (typeof window === "undefined") return;
  for (const letter of letters) {
    const key = normalizeLetterKey(letter);
    if (key) getAudio(key);
  }
}

/** Reproduce el fonema de una letra (MP3 local). */
export async function playPhoneme(letter: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  await unlockAudio();

  const fileKey = normalizeLetterKey(letter);
  if (!fileKey) return false;

  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }

  const audio = new Audio(`/audio/fonemas/${fileKey}.mp3`);
  audio.preload = "auto";
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

export function hasPhonemeAudio(letter: string): boolean {
  return normalizeLetterKey(letter) !== null;
}
