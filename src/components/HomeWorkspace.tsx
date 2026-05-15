"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploadZone } from "@/components/ImageUploadZone";
import { WordListEditor } from "@/components/WordListEditor";
import { DictationCard } from "@/components/DictationCard";
import { STORAGE_KEY, WORDS_UPDATED_EVENT } from "@/types/dictation";
import { parseWordsFromText, toDictationWords, serializeWords } from "@/lib/words";

const SAMPLE_WORDS = "casa\nperro\nárbol\nsol\nmar";

export function HomeWorkspace() {
  const router = useRouter();
  const [rawText, setRawText] = useState(SAMPLE_WORDS);

  const words = useMemo(
    () => toDictationWords(parseWordsFromText(rawText)),
    [rawText],
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
          Sube una foto de la tarea escolar o escribe las palabras. Generamos
          cartas con tipografía OpenDyslexic, sílabas en color y audio por
          fonema al tocar cada letra.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <ImageUploadZone
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
            <li>· Fuente OpenDyslexic (peso visual en la base de letras)</li>
            <li>· Sílabas coloreadas para facilitar la lectura</li>
            <li>· Toca cada letra para escuchar su fonema</li>
            <li>· Exporta todas las cartas a PDF en el visor</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
