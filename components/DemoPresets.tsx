import Link from "next/link";
import { DEMO_PRESETS, presetHref } from "@/lib/presets";
import { PinIcon } from "./icons";

export function DemoPresets() {
  return (
    <section id="presets" className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-navy">Try a Chennai commute</h2>
        <p className="mt-1 text-sm text-muted">
          Four seeded journeys that always return real alternatives — office, college, airport and late night.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_PRESETS.map((p) => (
          <Link
            key={p.id}
            href={presetHref(p)}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-brand/40"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wide text-teal">{p.kicker}</span>
            <h3 className="mt-1 font-semibold text-navy">{p.title}</h3>
            <p className="mt-1.5 flex-1 text-sm text-muted">{p.blurb}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-ink">
              <PinIcon className="h-3.5 w-3.5 text-navy" />
              {p.fromLabel} to {p.toLabel}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
