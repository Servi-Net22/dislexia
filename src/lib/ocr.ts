import Tesseract from "tesseract.js";
import type { LanguageMode } from "@/lib/language";
import { ocrLanguages } from "@/lib/language";

export async function extractTextFromImage(
  file: File,
  mode: LanguageMode = "auto",
  onProgress?: (pct: number) => void,
): Promise<string> {
  const result = await Tesseract.recognize(file, ocrLanguages(mode), {
    logger: (m) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        onProgress?.(Math.round(m.progress * 100));
      }
    },
  });

  return result.data.text ?? "";
}
