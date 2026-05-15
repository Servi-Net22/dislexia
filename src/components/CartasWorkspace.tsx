"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DictationWord } from "@/types/dictation";
import { STORAGE_KEY, WORDS_UPDATED_EVENT } from "@/types/dictation";
import { deserializeWords } from "@/lib/words";
import { CardPresentation } from "@/components/CardPresentation";
import { preloadVoices } from "@/lib/speechSync";

function loadWordsFromSession(): DictationWord[] {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return deserializeWords(raw) ?? [];
}

export function CartasWorkspace() {
  const [words, setWords] = useState<DictationWord[] | null>(null);

  useEffect(() => {
    const load = () => setWords(loadWordsFromSession());
    const frame = requestAnimationFrame(load);
    preloadVoices();

    window.addEventListener(WORDS_UPDATED_EVENT, load);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(WORDS_UPDATED_EVENT, load);
    };
  }, []);

  if (words === null) {
    return (
      <p className="py-16 text-center text-sky-700">Cargando cartas…</p>
    );
  }

  if (words.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-dyslexic mb-4 text-xl font-bold text-sky-950">
          Aún no hay cartas
        </p>
        <p className="mb-6 text-sky-800">
          Ve al inicio, sube una imagen o escribe las palabras del dictado.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700"
        >
          Ir al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <CardPresentation words={words} />
    </div>
  );
}
