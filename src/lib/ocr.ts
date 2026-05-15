import { createWorker, PSM } from "tesseract.js";
import type { LanguageMode } from "@/lib/language";
import { ocrLanguages } from "@/lib/language";
import { cleanupOcrText } from "@/lib/ocrCleanup";
import { buildOcrVariants } from "@/lib/imagePreprocess";
import { extractProminentText } from "@/lib/ocrWords";

type OcrAttempt = {
  text: string;
  confidence: number;
  variant: string;
};

function whitelistForMode(mode: LanguageMode): string {
  if (mode === "en") return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÑÜ";
}

function scoreAttempt(a: OcrAttempt, mode: LanguageMode): number {
  const t = a.text.replace(/\s/g, "");
  let score = a.confidence + Math.min(t.length * 12, 48);

  if (mode === "en" || mode === "auto") {
    if (t === t.toUpperCase() && t.length >= 2) score += 15;
    if (/^[A-Z]{2,8}$/.test(t)) score += 10;
    if (/^[a-z]$/.test(t)) score -= 30;
    if (t.length === 1) score -= 20;
  }

  if (a.variant.includes("crop")) score += 8;
  if (a.variant.includes("blue")) score += 6;

  return score;
}

function pickBestAttempt(
  attempts: OcrAttempt[],
  mode: LanguageMode,
): string {
  const sorted = [...attempts]
    .filter((a) => a.text.length > 0)
    .sort((x, y) => scoreAttempt(y, mode) - scoreAttempt(x, mode));

  return sorted[0]?.text ?? "";
}

export async function extractTextFromImage(
  file: File,
  mode: LanguageMode = "auto",
  onProgress?: (pct: number) => void,
): Promise<string> {
  const variants = await buildOcrVariants(file);
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
    await worker.setParameters({
      tessedit_char_whitelist: whitelist,
    });

    for (const variant of variants) {
      for (const psm of psms) {
        await worker.setParameters({ tessedit_pageseg_mode: psm });
        const { data } = await worker.recognize(variant.blob);
        const prominent = extractProminentText(data, variant.height, mode);

        attempts.push({
          text: prominent.text,
          confidence: prominent.confidence,
          variant: `${variant.label}-${psm}`,
        });

        if (data.text?.trim()) {
          attempts.push({
            text: data.text.trim(),
            confidence: data.confidence ?? 0,
            variant: `${variant.label}-raw-${psm}`,
          });
        }
      }
    }
  } finally {
    await worker.terminate();
  }

  const best = pickBestAttempt(attempts, mode);
  return cleanupOcrText(best, mode);
}
