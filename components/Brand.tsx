import Link from "next/link";

export function Logo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="12" fill="#0B1F3A" />
      <path d="M14 31c4-1 6-4 6-8s-2-6-2-9" stroke="#12B786" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M34 17c-4 1-6 4-6 8s2 6 2 9" stroke="#4D8DFF" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="18" cy="14" r="3" fill="#12B786" />
      <circle cx="30" cy="34" r="3" fill="#4D8DFF" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <div className="leading-tight">
            <div className="text-lg font-semibold text-navy">Sahayatri</div>
            <div className="text-[11px] text-muted">Every mode. One journey. Safer commutes.</div>
          </div>
        </Link>
        <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-muted sm:flex">
          <span className="h-2 w-2 rounded-full bg-teal" />
          Chennai Pilot
        </div>
      </div>
    </header>
  );
}
