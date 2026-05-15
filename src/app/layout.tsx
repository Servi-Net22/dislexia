import type { Metadata } from "next";
import "./globals.css";
import { AudioProvider } from "@/components/AudioProvider";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Cartas Dictado | Adaptado para dislexia",
  description:
    "Genera cartas de dictado con tipografía OpenDyslexic, fonemas, sílabas en color y exportación PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="flex min-h-full flex-col">
        <AudioProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
        </AudioProvider>
        <footer className="border-t border-sky-100/80 py-4 text-center text-xs text-sky-700/70">
          Tipografía{" "}
          <a
            href="https://opendyslexic.org/"
            className="underline hover:text-sky-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenDyslexic
          </a>
          · MVP educativo
        </footer>
      </body>
    </html>
  );
}
