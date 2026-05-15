import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { DictationWord } from "@/types/dictation";
import { toPhoneticSegments } from "@/lib/phoneticSegments";
import { SYLLABLE_COLORS } from "@/lib/spanishSyllables";

export function buildCardHtml(
  word: DictationWord,
  index: number,
  total: number,
): string {
  const lang = word.lang ?? "es";
  const phonetics =
    word.phonetics?.length > 0
      ? word.phonetics
      : toPhoneticSegments(word.text, lang);

  const syllables = word.syllables.length > 0 ? word.syllables : [word.text];
  const wordHtml = syllables
    .map((syl, sIdx) => {
      const color = SYLLABLE_COLORS[sIdx % SYLLABLE_COLORS.length];
      const chars = [...syl]
        .map(
          (ch) =>
            `<span style="color:${color};font-size:56px;font-weight:bold">${ch}</span>`,
        )
        .join("");
      return `<span style="display:inline-flex;margin:0 4px">${chars}</span>`;
    })
    .join("");

  const phonemeChips = phonetics
    .map((seg, idx) => {
      const color = SYLLABLE_COLORS[idx % SYLLABLE_COLORS.length];
      return `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:48px;padding:8px 14px;margin:4px;border:2px solid #fff;border-radius:12px;background:rgba(255,255,255,0.8);font-size:28px;font-weight:bold;color:${color}">${seg.grapheme}</span>`;
    })
    .join("");

  const title = lang === "en" ? "Phonetic dictation" : "Dictado fonético";

  return [
    '<article style="position:relative;width:700px;min-height:420px;padding:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:4px solid #bae6fd;border-radius:24px;background:linear-gradient(180deg,#f8f4e8,#eef6fa);font-family:OpenDyslexic,\'Segoe UI\',sans-serif">',
    `<span style="position:absolute;top:16px;right:16px;background:#e0f2fe;padding:4px 12px;border-radius:999px;font-size:14px">${index + 1} / ${total}</span>`,
    `<p style="font-size:12px;text-transform:uppercase;color:#0369a1">${title}</p>`,
    `<div style="margin:16px 0">${wordHtml}</div>`,
    `<p style="font-size:14px;color:#0369a1;margin-bottom:8px">${lang === "en" ? "Sounds:" : "Sonidos:"}</p>`,
    `<div style="display:flex;flex-wrap:wrap;justify-content:center">${phonemeChips}</div>`,
    `<p style="margin-top:16px;font-size:16px;color:#5b21b6">${lang === "en" ? "Pronounce phonetically" : "Pronunciar fonéticamente"}</p>`,
    "</article>",
  ]
    .join("")
}

export async function exportDictationToPdf(
  words: DictationWord[],
  filename = "dictado-cartas.pdf",
): Promise<void> {
  if (words.length === 0) return;

  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  container.style.cssText =
    "position:fixed;left:-9999px;top:0;z-index:-1;pointer-events:none";
  document.body.appendChild(container);

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  try {
    for (let i = 0; i < words.length; i++) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = buildCardHtml(words[i], i, words.length);
      container.appendChild(wrapper);

      const target = wrapper.querySelector("article");
      if (!target) continue;

      const canvas = await html2canvas(target, {
        scale: 2,
        backgroundColor: "#eef6fa",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const margin = 10;
      const imgW = pageW - margin * 2;
      const imgH = (canvas.height * imgW) / canvas.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        (pageH - imgH) / 2,
        imgW,
        Math.min(imgH, pageH - margin * 2),
      );

      container.removeChild(wrapper);
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}
