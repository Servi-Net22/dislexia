/**
 * Genera MP3 de fonemas en public/audio/fonemas/{es|en}/
 * Ejecutar: npm run generate:phonemes
 */
import gtts from "google-tts-api";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(__dirname, "../public/audio/fonemas");

const LETTERS = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n",
  "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
];

async function generate(lang, outDir, textMap = {}) {
  await mkdir(outDir, { recursive: true });
  const files = lang === "es" ? [...LETTERS, "enie"] : LETTERS;

  for (const file of files) {
    const text = textMap[file] ?? file;
    const url = gtts.getAudioUrl(text, { lang, slow: false });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${lang}/${file}: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(path.join(outDir, `${file}.mp3`), buf);
    console.log(`ok ${lang}/${file}.mp3`);
  }
}

await generate("es", path.join(BASE, "es"), { enie: "ñ" });
await generate("en", path.join(BASE, "en"));

console.log("\nFonemas listos en public/audio/fonemas/es y /en");
