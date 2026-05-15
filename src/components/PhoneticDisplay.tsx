"use client";

import { useState } from "react";
import type { PhoneticSegment } from "@/lib/phoneticSegments";
import type { AppLanguage } from "@/lib/language";
import { SYLLABLE_COLORS } from "@/lib/spanishSyllables";
import { speakPhonemeSegment } from "@/lib/speech";

type PhoneticDisplayProps = {
  wordId: string;
  wordText: string;
  segments: PhoneticSegment[];
  lang: AppLanguage;
  compact?: boolean;
};

export function PhoneticDisplay({
  wordId,
  wordText,
  segments,
  lang,
  compact = false,
}: PhoneticDisplayProps) {
  return (
    <div className="w-full max-w-xl space-y-3" aria-label={`Palabra fonética: ${wordText}`}>
      <p
        className={`font-dyslexic text-center font-bold text-sky-900/90 ${
          compact ? "text-2xl" : "text-3xl sm:text-4xl"
        }`}
      >
        {wordText}
      </p>

      <p className="text-center text-xs font-medium uppercase tracking-widest text-sky-600/80">
        {lang === "en" ? "Sounds (not letter names)" : "Sonidos (no nombres de letra)"}
      </p>

      <div className="space-y-2">
        {segments.map((segment, idx) => (
          <PhoneticRow
            key={`${wordId}-ph-${idx}-${segment.grapheme}`}
            segment={segment}
            lang={lang}
            color={SYLLABLE_COLORS[idx % SYLLABLE_COLORS.length]}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

function PhoneticRow({
  segment,
  lang,
  color,
  compact,
}: {
  segment: PhoneticSegment;
  lang: AppLanguage;
  color: string;
  compact?: boolean;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setPlaying(true);
        speakPhonemeSegment(segment, lang);
        window.setTimeout(() => setPlaying(false), 500);
      }}
      className={`font-dyslexic w-full overflow-hidden rounded-2xl border-2 border-white/90 bg-white/60 px-3 py-2 text-left font-bold leading-none tracking-tight shadow-sm transition hover:bg-white hover:shadow-md active:scale-[0.99] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
        playing ? "ring-2 ring-sky-400" : ""
      } ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}
      style={{ color }}
      aria-label={`Escuchar el sonido ${segment.grapheme}`}
    >
      <span className="block truncate">{segment.display}</span>
    </button>
  );
}
