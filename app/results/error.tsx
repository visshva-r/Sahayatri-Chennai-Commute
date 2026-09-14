"use client";

import { SiteHeader } from "@/components/Brand";
import { EmptyState } from "@/components/EmptyState";

export default function ResultsError({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <EmptyState
        title="Something went wrong"
        body="The planner hit an unexpected error. Try again, or start from a demo commute."
        actionHref="/#presets"
        actionLabel="Try a demo commute"
      >
        <button
          type="button"
          onClick={reset}
          className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-navy"
        >
          Retry
        </button>
      </EmptyState>
    </main>
  );
}
