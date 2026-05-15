"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import type { DictationWord } from "@/types/dictation";
import { STORAGE_KEY, WORDS_UPDATED_EVENT } from "@/types/dictation";
import { deserializeWords } from "@/lib/words";
import { CardPresentation } from "@/components/CardPresentation";
import { preloadVoices } from "@/lib/speech";

function loadWordsFromSession(): DictationWord[] {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return deserializeWords(raw) ?? [];
}

function subscribeWords(onStoreChange: () => void) {
  window.addEventListener(WORDS_UPDATED_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(WORDS_UPDATED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function CartasWorkspace() {
  const words = useSyncExternalStore(
    subscribeWords,
    loadWordsFromSession,
    () => [] as DictationWord[],
  );

  useEffect(() => {
    preloadVoices();
  }, []);

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
