"use client";

import { useCallback, useRef, useState } from "react";
import type { LanguageMode } from "@/lib/language";
import { extractTextFromImage } from "@/lib/ocr";

type ImageUploadZoneProps = {
  languageMode?: LanguageMode;
  onTextExtracted: (text: string) => void;
  disabled?: boolean;
};

export function ImageUploadZone({
  languageMode = "auto",
  onTextExtracted,
  disabled = false,
}: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Selecciona una imagen (JPG, PNG, etc.).");
        return;
      }

      setError(null);
      setHint(null);
      setLoading(true);
      setProgress(0);

      const url = URL.createObjectURL(file);
      setPreview(url);

      try {
        const text = await extractTextFromImage(file, languageMode, setProgress);
        onTextExtracted(text);
        if (!text.trim()) {
          setError(
            "No se detectó texto. Prueba otra foto con buena luz o escribe las palabras a mano.",
          );
        } else {
          setHint(
            "Revisa la lista y corrige si hace falta. Con cartas en inglés elige «English». Foto: buena luz, palabra arriba y centrada.",
          );
        }
      } catch {
        setError("No se pudo leer la imagen. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    },
    [languageMode, onTextExtracted],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || loading) return;
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  };

  return (
    <section className="rounded-2xl border-2 border-dashed border-sky-200 bg-white p-6 shadow-sm">
      <h2 className="font-dyslexic mb-1 text-xl font-bold text-sky-950">
        Subir foto del dictado
      </h2>
      <p className="mb-4 text-sm text-sky-800/80">
        Sube una foto de la lista de palabras. Leeremos el texto automáticamente.
      </p>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-sky-100 bg-sky-50/50 p-6 transition hover:border-sky-300 hover:bg-sky-50 ${
          disabled || loading ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Vista previa de la tarea subida"
            className="mb-3 max-h-40 rounded-lg object-contain shadow"
          />
        ) : (
          <UploadIcon />
        )}

        {loading ? (
          <div className="mt-2 w-full max-w-xs text-center">
            <p className="text-sm font-medium text-sky-800">
              Leyendo imagen… {progress}%
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-sky-100">
              <div
                className="h-full rounded-full bg-sky-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-center text-sm text-sky-800">
            Arrastra una imagen o haz clic para elegir
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled || loading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void processFile(file);
        }}
      />

      {hint && (
        <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-900">
          {hint}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </p>
      )}
    </section>
  );
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-12 w-12 text-sky-400"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}
