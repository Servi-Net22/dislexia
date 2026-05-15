import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-sky-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span
            className="font-dyslexic flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-xl font-bold text-white shadow-sm"
            aria-hidden
          >
            D
          </span>
          <div>
            <p className="font-dyslexic text-lg font-bold leading-tight text-sky-950">
              Cartas Dictado
            </p>
            <p className="text-xs text-sky-700/80">Adaptado para dislexia</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 font-medium text-sky-800 transition hover:bg-sky-50"
          >
            Inicio
          </Link>
          <Link
            href="/cartas"
            className="rounded-lg bg-sky-600 px-3 py-2 font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            Ver cartas
          </Link>
        </nav>
      </div>
    </header>
  );
}
