"use client";

import type { DictationWord } from "@/types/dictation";
import { languageLabel } from "@/lib/language";
import { SYLLABLE_COLORS } from "@/lib/spanishSyllables";
import { speakWord } from "@/lib/speech";
import { LetterButton } from "@/components/LetterButton";

type DictationCardProps = {
  word: DictationWord;
  index: number;
  total: number;
  compact?: boolean;
};

export function DictationCard({
  word,
  index,
  total,
  compact = false,
}: DictationCardProps) {
  const letters = [...word.text];

  return (
    <article
      className={`relative flex w-full flex-col items-center justify-center rounded-3xl border-4 border-sky-200/80 bg-gradient-to-b from-[#f8f4e8] to-[#eef6fa] shadow-xl ${
        compact ? "p-6" : "min-h-[min(70vh,520px)] p-8 sm:p-12"
      }`}
    >
      <span className="absolute right-4 top-4 flex gap-2">
        <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-800">
          {languageLabel(word.lang ?? "es")}
        </span>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-800">
          {index + 1} / {total}
        </span>
      </span>

      <p className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-sky-700/80">
        {word.lang === "en" ? "Dictation" : "Dictado"}
      </p>

      <WordDisplay word={word} />

      <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
        {letters.map((letter, i) => (
          <LetterButton
            key={`${word.id}-${i}-${letter}`}
            letter={letter}
            lang={word.lang ?? "es"}
            color={SYLLABLE_COLORS[i % SYLLABLE_COLORS.length]}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => speakWord(word.text, word.lang ?? "es")}
        className="mt-8 flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-sky-700 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        <SpeakerIcon />
        {word.lang === "en" ? "Listen to word" : "Escuchar palabra"}
      </button>
    </article>
  );
}

function WordDisplay({ word }: { word: DictationWord }) {
  const syllables =
    word.syllables.length > 0
      ? word.syllables
      : [word.text];

  const syllableBlocks = syllables.reduce<
    { syllable: string; sIdx: number; letterStart: number }[]
  >((acc, syllable, sIdx) => {
    const letterStart = acc.reduce((n, b) => n + b.syllable.length, 0);
    acc.push({ syllable, sIdx, letterStart });
    return acc;
  }, [] as { syllable: string; sIdx: number; letterStart: number }[]);

  return (
    <div
      className="font-dyslexic flex flex-wrap items-baseline justify-center gap-x-2 gap-y-3 text-center"
      aria-label={`Palabra: ${word.text}`}
    >
      {syllableBlocks.map(({ syllable, sIdx, letterStart }) => {
        const color = SYLLABLE_COLORS[sIdx % SYLLABLE_COLORS.length];
        const chars = [...syllable];

        return (
          <span
            key={`${word.id}-syl-${sIdx}`}
            className="inline-flex rounded-2xl bg-white/50 px-2 py-1 sm:px-3"
          >
            {chars.map((ch, cIdx) => (
              <span
                key={`${word.id}-ch-${letterStart + cIdx}`}
                className="text-5xl font-bold leading-none tracking-[0.12em] sm:text-6xl md:text-7xl"
                style={{ color }}
              >
                {ch}
              </span>
            ))}
          </span>
        );
      })}
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.241 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
      <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6.75 6.75 0 0 1 0 9.546.75.75 0 0 1-1.06-1.061 5.25 5.25 0 0 0 0-7.424.75.75 0 0 1 0-1.061Z" />
    </svg>
  );
}
