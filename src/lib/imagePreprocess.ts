export type OcrImageVariant = {
  blob: Blob;
  label: string;
  height: number;
};

async function fileToBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

function renderToBlob(
  canvas: HTMLCanvasElement,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("blob"))),
      "image/png",
      1,
    );
  });
}

/** Recorta la franja superior (donde suele estar la palabra en cartas). */
function cropTop(
  bitmap: ImageBitmap,
  ratio = 0.42,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const cropH = Math.max(1, Math.round(bitmap.height * ratio));
  const scale = Math.min(3, Math.max(2, 1600 / Math.max(bitmap.width, 1)));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(cropH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, bitmap.width, cropH, 0, 0, w, h);
  return { canvas, ctx };
}

/** Resalta texto azul/oscuro (cartas tipo DAD). */
function applyBlueTextMask(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const isBlueText = b > r + 25 && b > g + 15 && b > 90;
    const isDark = gray < 120;
    const ink = isBlueText || isDark;
    const v = ink ? 0 : 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }

  ctx.putImageData(imageData, 0, 0);
}

/** Escala de grises suave (sin borrar curvas de letras). */
function applySoftGrayscale(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    gray = (gray - 128) * 1.6 + 128;
    gray = Math.max(0, Math.min(255, gray));
    const v = gray < 140 ? 0 : 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }

  ctx.putImageData(imageData, 0, 0);
}

/** Genera varias versiones de la imagen para OCR. */
export async function buildOcrVariants(file: File): Promise<OcrImageVariant[]> {
  const bitmap = await fileToBitmap(file);
  const variants: OcrImageVariant[] = [];

  const addVariant = async (
    label: string,
    fn: (bm: ImageBitmap) => Promise<HTMLCanvasElement>,
  ) => {
    const canvas = await fn(bitmap);
    variants.push({
      label,
      blob: await renderToBlob(canvas),
      height: canvas.height,
    });
  };

  await addVariant("crop-blue", async (bm) => {
    const { canvas, ctx } = cropTop(bm, 0.42);
    applyBlueTextMask(ctx, canvas.width, canvas.height);
    return canvas;
  });

  await addVariant("crop-soft", async (bm) => {
    const { canvas, ctx } = cropTop(bm, 0.42);
    applySoftGrayscale(ctx, canvas.width, canvas.height);
    return canvas;
  });

  await addVariant("crop-raw", async (bm) => {
    const { canvas } = cropTop(bm, 0.45);
    return canvas;
  });

  await addVariant("full-blue", async (bm) => {
    const scale = Math.min(2.5, Math.max(1.5, 1400 / Math.max(bm.width, 1)));
    const w = Math.round(bm.width * scale);
    const h = Math.round(bm.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bm, 0, 0, w, h);
    applyBlueTextMask(ctx, w, h);
    return canvas;
  });

  bitmap.close();
  return variants;
}

/** @deprecated Usar buildOcrVariants */
export async function preprocessImageForOcr(file: File): Promise<Blob> {
  const variants = await buildOcrVariants(file);
  return variants[0]?.blob ?? file;
}
