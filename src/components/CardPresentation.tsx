"use client";

import { useCallback, useEffect, useState } from "react";
import type { DictationWord } from "@/types/dictation";
import { DictationCard } from "@/components/DictationCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { preloadPhonemes } from "@/lib/phonemes";
import { preloadVoices } from "@/lib/speechSync";

type CardPresentationProps = {
  words: DictationWord[];
};

export function CardPresentation({ words }: CardPresentationProps) {
  const [index, setIndex] = useState(0);
  const total = words.length;
  const current = words[index];

  useEffect(() => {
    preloadVoices();
    for (const w of words) {
      preloadPhonemes([...w.text], w.lang);
    }
  }, [words]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(total - 1, i + 1));
  }, [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  if (!current) {
    return (
      <p className="rounded-2xl bg-amber-50 px-4 py-6 text-center text-amber-900">
        No hay palabras. Vuelve al inicio y añade una lista.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <ExportPdfButton words={words} />
      </div>

      <DictationCard word={current} index={index} total={total} />

      <div className="flex flex-wrap items-center justify-center gap-3">
        <NavButton onClick={goPrev} disabled={index === 0} label="Anterior">
          ←
        </NavButton>

        <div className="flex gap-1.5 px-2">
          {words.map((w, i) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ir a la palabra ${w.text}`}
              aria-current={i === index}
              className={`h-2.5 rounded-full transition-all ${
                i === index
                  ? "w-8 bg-sky-600"
                  : "w-2.5 bg-sky-200 hover:bg-sky-400"
              }`}
            />
          ))}
        </div>

        <NavButton
          onClick={goNext}
          disabled={index >= total - 1}
          label="Siguiente"
        >
          →
        </NavButton>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {words.map((w, i) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setIndex(i)}
            className={`font-dyslexic rounded-xl border-2 px-4 py-2 text-lg font-bold transition ${
              i === index
                ? "border-sky-500 bg-sky-100 text-sky-900"
                : "border-sky-100 bg-white text-sky-700 hover:border-sky-300"
            }`}
          >
            {w.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function NavButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-12 min-w-[3rem] items-center justify-center rounded-full border-2 border-sky-200 bg-white px-4 text-xl font-bold text-sky-800 shadow-sm transition hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
