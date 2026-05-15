import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { DictationWord } from "@/types/dictation";
import { SYLLABLE_COLORS } from "@/lib/spanishSyllables";

export function buildCardHtml(
  word: DictationWord,
  index: number,
  total: number,
): string {
  const syllableHtml = word.syllables
    .map((syllable, sIdx) => {
      const color = SYLLABLE_COLORS[sIdx % SYLLABLE_COLORS.length];
      const chars = [...syllable]
        .map(
          (ch) =>
            `<span style="color:${color};font-size:56px;font-weight:bold;letter-spacing:0.12em;font-family:OpenDyslexic,'Segoe UI',sans-serif">${ch}</span>`,
        )
        .join("");
      return `<span style="display:inline-flex;background:rgba(255,255,255,0.5);border-radius:12px;padding:4px 12px;margin:0 4px">${chars}</span>`;
    })
    .join("");

  const letters = [...word.text]
    .map(
      (l, i) =>
        `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:44px;height:52px;margin:4px;border:2px solid #fff;border-radius:12px;background:rgba(255,255,255,0.7);color:${SYLLABLE_COLORS[i % SYLLABLE_COLORS.length]};font-size:28px;font-weight:bold;font-family:OpenDyslexic,sans-serif">${l}</span>`,
    )
    .join("");

  return `
    <article style="position:relative;width:700px;min-height:420px;padding:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:4px solid #bae6fd;border-radius:24px;background:linear-gradient(180deg,#f8f4e8,#eef6fa);font-family:OpenDyslexic,'Segoe UI',sans-serif;box-sizing:border-box">
      <span style="position:absolute;top:16px;right:16px;background:#e0f2fe;color:#0c4a6e;padding:4px 12px;border-radius:999px;font-size:14px;font-weight:600">${index + 1} / ${total}</span>
      <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.2em;color:#0369a1">Dictado</p>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:baseline;margin:16px 0">${syllableHtml}</div>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;margin-top:24px">${letters}</div>
      <p style="margin-top:24px;font-size:18px;color:#0369a1;font-weight:600">${word.text}</p>
    </article>
  `;
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
