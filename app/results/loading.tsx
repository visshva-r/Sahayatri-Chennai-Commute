import { SiteHeader } from "@/components/Brand";

export default function ResultsLoading() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 h-5 w-64 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-5 lg:grid-cols-[370px_1fr]">
          <div className="space-y-3">
            <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
        </div>
        <p className="mt-4 text-center text-sm text-muted">Planning your commute...</p>
      </div>
    </main>
  );
}
