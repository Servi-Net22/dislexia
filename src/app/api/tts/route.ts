import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const word = request.nextUrl.searchParams.get("word")?.trim();
  const lang = request.nextUrl.searchParams.get("lang") === "en" ? "en" : "es";

  if (!word || word.length > 80) {
    return NextResponse.json({ error: "Palabra inválida" }, { status: 400 });
  }

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(word)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CartasDictado/1.0; +https://project-6dmdo.vercel.app)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "TTS no disponible" }, { status: 502 });
    }

    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Error de red" }, { status: 502 });
  }
}
