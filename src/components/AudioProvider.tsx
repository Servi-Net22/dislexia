"use client";

import { useEffect } from "react";
import { unlockAudio, preloadPhonemes } from "@/lib/phonemes";
import { preloadVoices } from "@/lib/speech";

type AudioProviderProps = {
  children: React.ReactNode;
};

export function AudioProvider({ children }: AudioProviderProps) {
  useEffect(() => {
    preloadVoices();
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");
    preloadPhonemes(letters, "es");
    preloadPhonemes(letters, "en");
  }, []);

  useEffect(() => {
    const unlock = () => {
      void unlockAudio();
    };
    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  return children;
}
