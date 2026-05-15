/**
 * Genera MP3 de fonemas en public/audio/fonemas/
 * Ejecutar: npm run generate:phonemes
 */
import gtts from "google-tts-api";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/audio/fonemas");

const FILES = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n",
  "enie", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
];

const TEXT = {
  enie: "ñ",
};

await mkdir(OUT_DIR, { recursive: true });

for (const file of FILES) {
  const text = TEXT[file] ?? file;
  const url = gtts.getAudioUrl(text, { lang: "es", slow: false });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${file}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(path.join(OUT_DIR, `${file}.mp3`), buf);
  console.log(`ok ${file}.mp3`);
}

console.log(`\n${FILES.length} archivos en public/audio/fonemas/`);
