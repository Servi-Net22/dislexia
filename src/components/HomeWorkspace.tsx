"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploadZone } from "@/components/ImageUploadZone";
import { LanguageSelector } from "@/components/LanguageSelector";
import { WordListEditor } from "@/components/WordListEditor";
import { DictationCard } from "@/components/DictationCard";
import { STORAGE_KEY, WORDS_UPDATED_EVENT } from "@/types/dictation";
import {
  LANG_MODE_KEY,
  type LanguageMode,
} from "@/lib/language";
import { parseWordsFromText, toDictationWords, serializeWords } from "@/lib/words";

const SAMPLE_WORDS = "casa\nperro\nárbol\nsol\nmar";

export function HomeWorkspace() {
  const router = useRouter();
  const [rawText, setRawText] = useState(SAMPLE_WORDS);
  const [languageMode, setLanguageMode] = useState<LanguageMode>(() => {
    if (typeof window === "undefined") return "auto";
    const saved = sessionStorage.getItem(LANG_MODE_KEY);
    if (saved === "es" || saved === "en" || saved === "auto") return saved;
    return "auto";
  });

  const handleLanguageChange = (mode: LanguageMode) => {
    setLanguageMode(mode);
    sessionStorage.setItem(LANG_MODE_KEY, mode);
  };

  const words = useMemo(
    () => toDictationWords(parseWordsFromText(rawText), languageMode),
    [rawText, languageMode],
  );

  const preview = words[0];

  const handleCreate = () => {
    if (words.length === 0) return;
    sessionStorage.setItem(STORAGE_KEY, serializeWords(words));
    window.dispatchEvent(new Event(WORDS_UPDATED_EVENT));
    router.push("/cartas");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <section className="text-center sm:text-left">
        <h1 className="font-dyslexic text-3xl font-bold tracking-wide text-sky-950 sm:text-4xl">
          Cartas de dictado adaptadas
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-sky-800/90">
          Sube una foto o escribe palabras en español o inglés. Cada carta usa
          fonemas y voz en el idioma correcto (automático o manual).
        </p>
      </section>

      <LanguageSelector value={languageMode} onChange={handleLanguageChange} />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <ImageUploadZone
            languageMode={languageMode}
            onTextExtracted={(text) => {
              const extracted = parseWordsFromText(text);
              if (extracted.length) {
                setRawText(extracted.join("\n"));
              }
            }}
          />
          <WordListEditor
            value={rawText}
            onChange={setRawText}
            wordCount={words.length}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={words.length === 0}
            className="font-dyslexic w-full rounded-2xl bg-sky-600 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Crear {words.length} carta{words.length === 1 ? "" : "s"}
          </button>
        </div>

        <aside className="space-y-4">
          <h2 className="font-dyslexic text-lg font-bold text-sky-900">
            Vista previa
          </h2>
          {preview ? (
            <DictationCard word={preview} index={0} total={words.length} />
          ) : (
            <p className="rounded-2xl border border-dashed border-sky-200 bg-white/60 px-4 py-12 text-center text-sky-700">
              Añade palabras para ver la carta
            </p>
          )}
          <ul className="rounded-xl bg-sky-50/80 px-4 py-3 text-sm text-sky-800">
            <li>· Auto: palabras con ñ/acentos → español; solo letras latinas → inglés</li>
            <li>· Toca cada letra para el fonema (MP3) en su idioma</li>
            <li>· Escuchar palabra usa la voz del sistema en ES o EN</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
