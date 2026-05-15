export type AppLanguage = "es" | "en";
export type LanguageMode = AppLanguage | "auto";

export const LANG_MODE_KEY = "dislexia-language-mode";

const SPANISH_MARKERS = /[ñáéíóúüÑÁÉÍÓÚÜ]/;

export function detectWordLanguage(word: string): AppLanguage {
  if (SPANISH_MARKERS.test(word)) return "es";
  if (/^[a-zA-Z'-]+$/.test(word)) return "en";
  return "es";
}

export function resolveWordLanguage(
  word: string,
  mode: LanguageMode,
): AppLanguage {
  if (mode === "auto") return detectWordLanguage(word);
  return mode;
}

export function ocrLanguages(mode: LanguageMode): string {
  if (mode === "en") return "eng";
  if (mode === "es") return "spa";
  return "spa+eng";
}

export function languageLabel(lang: AppLanguage): string {
  return lang === "en" ? "English" : "Español";
}
