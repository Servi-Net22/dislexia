"use client";

import { useState } from "react";
import type { DictationWord } from "@/types/dictation";
import { exportDictationToPdf } from "@/lib/exportPdf";

type ExportPdfButtonProps = {
  words: DictationWord[];
};

export function ExportPdfButton({ words }: ExportPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (words.length === 0) return;
    setLoading(true);
    try {
      await exportDictationToPdf(words);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleExport()}
      disabled={loading || words.length === 0}
      className="inline-flex items-center gap-2 rounded-full border-2 border-sky-300 bg-white px-5 py-2.5 text-sm font-semibold text-sky-800 shadow-sm transition hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <PdfIcon />
      {loading ? "Generando PDF…" : "Exportar PDF"}
    </button>
  );
}

function PdfIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6Zm7 1.5V9h5.5L13 3.5ZM8 13h2.5v5H8v-5Zm4.25 0H15c.966 0 1.75.784 1.75 1.75v1.5A1.75 1.75 0 0 1 15 18h-2.75v-5ZM10 14.5v2H13.5a.25.25 0 0 0 .25-.25v-1.5a.25.25 0 0 0-.25-.25H10Z" />
    </svg>
  );
}
