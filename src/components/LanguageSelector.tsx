"use client";

import type { LanguageMode } from "@/lib/language";

type LanguageSelectorProps = {
  value: LanguageMode;
  onChange: (mode: LanguageMode) => void;
};

const OPTIONS: { value: LanguageMode; label: string; hint: string }[] = [
  { value: "auto", label: "Auto", hint: "Detecta por palabra" },
  { value: "es", label: "Español", hint: "Fonemas y voz en español" },
  { value: "en", label: "English", hint: "Phonemes and voice in English" },
];

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <fieldset className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <legend className="font-dyslexic px-1 text-sm font-bold text-sky-950">
        Idioma del dictado
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-xl border-2 px-4 py-2 text-left transition ${
              value === opt.value
                ? "border-sky-500 bg-sky-50 text-sky-900"
                : "border-sky-100 bg-[#faf8f2] text-sky-800 hover:border-sky-300"
            }`}
          >
            <span className="font-dyslexic block font-bold">{opt.label}</span>
            <span className="block text-xs text-sky-700/80">{opt.hint}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
