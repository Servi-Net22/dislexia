import type { AppLanguage } from "@/lib/language";

let voicesCache: SpeechSynthesisVoice[] | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  voicesCache = window.speechSynthesis.getVoices();
  return voicesCache;
}

function getVoice(lang: AppLanguage): SpeechSynthesisVoice | undefined {
  const voices = voicesCache?.length ? voicesCache : loadVoices();
  const prefix = lang === "en" ? "en" : "es";
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ??
    voices[0]
  );
}

export function preloadVoices(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  loadVoices();
  window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
}

export function speakTextSync(text: string, lang: AppLanguage, rate = 0.85): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "en" ? "en-US" : "es-ES";
  utterance.rate = rate;
  const voice = getVoice(lang);
  if (voice) utterance.voice = voice;

  activeUtterance = utterance;
  utterance.onend = () => {
    if (activeUtterance === utterance) activeUtterance = null;
  };
  synth.resume();
  synth.speak(utterance);
}
