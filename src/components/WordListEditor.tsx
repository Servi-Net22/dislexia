"use client";

type WordListEditorProps = {
  value: string;
  onChange: (value: string) => void;
  wordCount: number;
};

export function WordListEditor({
  value,
  onChange,
  wordCount,
}: WordListEditorProps) {
  return (
    <section className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-dyslexic text-xl font-bold text-sky-950">
            Lista de palabras
          </h2>
          <p className="text-sm text-sky-800/80">
            Una palabra por línea o separadas por comas
          </p>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-800">
          {wordCount} palabra{wordCount === 1 ? "" : "s"}
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder={"casa\nperro\nárbol\n..."}
        className="font-dyslexic w-full resize-y rounded-xl border-2 border-sky-100 bg-[#faf8f2] px-4 py-3 text-lg leading-relaxed text-sky-950 placeholder:text-sky-400/70 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
        spellCheck={false}
      />
    </section>
  );
}
