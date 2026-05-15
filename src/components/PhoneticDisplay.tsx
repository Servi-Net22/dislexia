"use client";

import { useState } from "react";
import type { DictationWord } from "@/types/dictation";
import type { PhoneticSegment } from "@/lib/phoneticSegments";
import type { AppLanguage } from "@/lib/language";
import { SYLLABLE_COLORS } from "@/lib/spanishSyllables";
import { speakPhonemeSegment, speakPhoneticWord } from "@/lib/speech";

type PhoneticDisplayProps = {
  word: DictationWord;
  segments: PhoneticSegment[];
  compact?: boolean;
};

export function PhoneticDisplay({
  word,
  segments,
  compact = false,
}: PhoneticDisplayProps) {
  const lang = word.lang ?? "es";
  const [playingAll, setPlayingAll] = useState(false);

  const syllables =
    word.syllables.length > 0 ? word.syllables : [word.text];

  return (
    <div className="w-full max-w-xl space-y-5" aria-label={`Palabra: ${word.text}`}>
      <WordVisual word={word} syllables={syllables} compact={compact} />

      <div>
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-sky-600/80">
          {lang === "en"
            ? "Tap each sound (phoneme)"
            : "Toca cada sonido (fonema)"}
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {segments.map((segment, idx) => (
            <PhonemeButton
              key={`${word.id}-ph-${idx}-${segment.grapheme}`}
              segment={segment}
              index={idx}
              lang={lang}
              compact={compact}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={playingAll || segments.length === 0}
        onClick={() => {
          setPlayingAll(true);
          void speakPhoneticWord(segments, lang).finally(() =>
            setPlayingAll(false),
          );
        }}
        className="font-dyslexic flex w-full items-center justify-center gap-2 rounded-full border-2 border-violet-300 bg-violet-50 px-6 py-3 text-lg font-bold text-violet-900 shadow-sm transition hover:border-violet-400 hover:bg-violet-100 disabled:opacity-50"
      >
        <SpeakerIcon />
        {playingAll
          ? lang === "en"
            ? "Playing sounds…"
            : "Reproduciendo…"
          : lang === "en"
            ? "Pronounce phonetically"
            : "Pronunciar fonéticamente"}
      </button>
    </div>
  );
}

function WordVisual({
  word,
  syllables,
  compact,
}: {
  word: DictationWord;
  syllables: string[];
  compact?: boolean;
}) {
  const syllableBlocks = syllables.reduce<
    { syllable: string; sIdx: number; letterStart: number }[]
  >((acc, syllable, sIdx) => {
    const letterStart = acc.reduce((n, b) => n + b.syllable.length, 0);
    acc.push({ syllable, sIdx, letterStart });
    return acc;
  }, []);

  return (
    <div className="font-dyslexic flex flex-wrap items-baseline justify-center gap-x-2 gap-y-2">
      {syllableBlocks.map(({ syllable, sIdx, letterStart }) => {
        const color = SYLLABLE_COLORS[sIdx % SYLLABLE_COLORS.length];
        return (
          <span
            key={`${word.id}-syl-${sIdx}`}
            className="inline-flex rounded-2xl bg-white/50 px-2 py-1"
          >
            {[...syllable].map((ch, cIdx) => (
              <span
                key={`${word.id}-ch-${letterStart + cIdx}`}
                className={`font-bold leading-none tracking-[0.1em] ${
                  compact ? "text-4xl" : "text-5xl sm:text-6xl md:text-7xl"
                }`}
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

function PhonemeButton({
  segment,
  index,
  lang,
  compact,
}: {
  segment: PhoneticSegment;
  index: number;
  lang: AppLanguage;
  compact?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const color = SYLLABLE_COLORS[index % SYLLABLE_COLORS.length];
  const label = segment.grapheme.toLowerCase();

  return (
    <button
      type="button"
      onClick={() => {
        setPlaying(true);
        speakPhonemeSegment(segment, lang);
        window.setTimeout(() => setPlaying(false), 450);
      }}
      className={`font-dyslexic flex min-w-[3.5rem] flex-col items-center gap-1 rounded-2xl border-2 border-white bg-white/80 px-3 py-2 shadow-sm transition hover:scale-105 hover:shadow-md active:scale-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
        playing ? "ring-2 ring-sky-400" : ""
      } ${compact ? "min-w-[2.75rem]" : ""}`}
      aria-label={
        lang === "en"
          ? `Sound ${label}`
          : `Sonido ${label}`
      }
    >
      <SpeakerIcon small />
      <span
        className={`text-2xl font-bold leading-none sm:text-3xl ${compact ? "text-xl" : ""}`}
        style={{ color }}
      >
        {label}
      </span>
    </button>
  );
}

function SpeakerIcon({ small = false }: { small?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={small ? "h-4 w-4 text-sky-600" : "h-6 w-6"}
      aria-hidden
    >
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.241 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06Z" />
    </svg>
  );
}
