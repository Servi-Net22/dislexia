"use client";

import { useState } from "react";
import type { AppLanguage } from "@/lib/language";
import { speakLetter } from "@/lib/speech";

type LetterButtonProps = {
  letter: string;
  lang: AppLanguage;
  color: string;
  size?: "md" | "lg";
};

export function LetterButton({
  letter,
  lang,
  color,
  size = "lg",
}: LetterButtonProps) {
  const [playing, setPlaying] = useState(false);

  const dim =
    size === "lg"
      ? "min-h-[3.25rem] min-w-[2.75rem] text-3xl sm:min-h-[3.75rem] sm:min-w-[3.25rem] sm:text-4xl"
      : "min-h-10 min-w-9 text-xl";

  const handleClick = () => {
    setPlaying(true);
    speakLetter(letter, lang);
    window.setTimeout(() => setPlaying(false), 400);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${dim} font-dyslexic flex cursor-pointer items-center justify-center rounded-xl border-2 border-white/80 bg-white/70 font-bold shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
        playing ? "ring-2 ring-sky-400" : ""
      }`}
      style={{ color }}
      aria-label={`Escuchar el fonema de la letra ${letter}`}
    >
      {letter}
    </button>
  );
}
