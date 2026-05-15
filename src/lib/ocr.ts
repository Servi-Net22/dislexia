import { createWorker, PSM } from "tesseract.js";
import type { LanguageMode } from "@/lib/language";
import { ocrLanguages } from "@/lib/language";
import { cleanupOcrText } from "@/lib/ocrCleanup";
import { preprocessImageForOcr } from "@/lib/imagePreprocess";

type OcrAttempt = {
  text: string;
  confidence: number;
};

function whitelistForMode(mode: LanguageMode): string | null {
  if (mode === "en") return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzáéíóúñüÁÉÍÓÚÑÜ";
}

function pickBestAttempt(attempts: OcrAttempt[]): string {
  const scored = attempts
    .filter((a) => a.text.length > 0)
    .map((a) => ({
      ...a,
      score:
        a.confidence +
        Math.min(a.text.replace(/\s/g, "").length * 8, 40) +
        (a.text === a.text.toUpperCase() && a.text.length >= 2 ? 10 : 0),
    }))
    .sort((x, y) => y.score - x.score);

  return scored[0]?.text ?? "";
}

export async function extractTextFromImage(
  file: File,
  mode: LanguageMode = "auto",
  onProgress?: (pct: number) => void,
): Promise<string> {
  const blob = await preprocessImageForOcr(file);
  const lang = ocrLanguages(mode);
  const whitelist = whitelistForMode(mode);

  const worker = await createWorker(lang, 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        onProgress?.(Math.round(m.progress * 100));
      }
    },
  });

  const attempts: OcrAttempt[] = [];
  const psms = [PSM.SINGLE_WORD, PSM.SINGLE_LINE, PSM.SINGLE_BLOCK];

  try {
    for (const psm of psms) {
      const params: Record<string, string> = {
        tessedit_pageseg_mode: psm,
      };
      if (whitelist) params.tessedit_char_whitelist = whitelist;

      await worker.setParameters(params);
      const { data } = await worker.recognize(blob);
      attempts.push({
        text: (data.text ?? "").trim(),
        confidence: data.confidence ?? 0,
      });
    }
  } finally {
    await worker.terminate();
  }

  const best = pickBestAttempt(attempts);
  return cleanupOcrText(best, mode);
}
