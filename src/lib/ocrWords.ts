import type { LanguageMode } from "@/lib/language";

type Bbox = { x0: number; y0: number; x1: number; y1: number };

type OcrWord = {
  text: string;
  confidence: number;
  bbox: Bbox;
};

type PageData = {
  text?: string;
  confidence?: number;
  words?: OcrWord[];
};

function wordHeight(w: OcrWord): number {
  return w.bbox.y1 - w.bbox.y0;
}

function isNoiseToken(text: string, mode: LanguageMode): boolean {
  const t = text.trim();
  if (!t) return true;
  if (t.length === 1 && /[a-z]/.test(t) && mode !== "es") return true;
  if (/^[^a-zA-Záéíóúñü]+$/.test(t)) return true;
  return false;
}

/** Extrae la palabra principal por tamaño y posición (ignora dibujo inferior). */
export function extractProminentText(
  data: PageData,
  imageHeight: number,
  mode: LanguageMode,
): { text: string; confidence: number } {
  const words = (data.words ?? []).filter(
    (w) => w.text?.trim() && (w.confidence ?? 0) > 25,
  );

  if (words.length === 0) {
    return { text: (data.text ?? "").trim(), confidence: data.confidence ?? 0 };
  }

  const topWords = words.filter((w) => w.bbox.y0 < imageHeight * 0.65);
  const pool = topWords.length > 0 ? topWords : words;

  const sorted = [...pool].sort((a, b) => wordHeight(b) - wordHeight(a));
  const maxH = wordHeight(sorted[0] ?? { bbox: { y0: 0, y1: 1, x0: 0, x1: 0 }, text: "", confidence: 0 });

  const big = sorted.filter((w) => {
    if (isNoiseToken(w.text, mode)) return false;
    return wordHeight(w) >= maxH * 0.45;
  });

  if (big.length === 0) {
    return { text: (data.text ?? "").trim(), confidence: data.confidence ?? 0 };
  }

  const lineThreshold = Math.max(12, maxH * 0.5);
  const mainLineY = big[0].bbox.y0;
  const lineWords = big
    .filter((w) => Math.abs(w.bbox.y0 - mainLineY) <= lineThreshold)
    .sort((a, b) => a.bbox.x0 - b.bbox.x0);

  const joined = lineWords
    .map((w) => w.text.replace(/\s/g, ""))
    .join("")
    .trim();

  const avgConf =
    lineWords.reduce((s, w) => s + (w.confidence ?? 0), 0) / lineWords.length;

  if (joined.length >= 2) {
    return { text: joined, confidence: avgConf };
  }

  const fallback = big[0].text.trim();
  return { text: fallback, confidence: big[0].confidence ?? 0 };
}
