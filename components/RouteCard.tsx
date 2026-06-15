import type { RouteLeg, RouteOption } from "@/lib/types";
import { formatDuration, formatINR } from "@/lib/geo";
import { bandColor } from "./SafetyMeter";
import { ModeIcon, MODE_COLOR, MODE_LABEL, LeafIcon } from "./icons";

function ModeSequence({ legs }: { legs: RouteLeg[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {legs.map((leg, i) => (
        <span key={i} className="flex items-center gap-1">
          <ModeIcon mode={leg.mode} className={`h-5 w-5 ${MODE_COLOR[leg.mode]}`} />
          {i < legs.length - 1 && <span className="text-sm text-slate-300">›</span>}
        </span>
      ))}
    </div>
  );
}

function SafetyPill({ option }: { option: RouteOption }) {
  const c = bandColor(option.safetyBand);
  return (
    <span
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${c.bg} ${c.text} ${c.border}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.ring }} />
      {option.safetyBand} · {option.safetyScore}
    </span>
  );
}

export function RouteCard({
  option,
  selected,
  recommended,
  greenest,
  onSelect,
}: {
  option: RouteOption;
  selected: boolean;
  recommended?: boolean;
  greenest?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-2xl border bg-white p-4 text-left shadow-card transition ${
        selected ? "border-brand ring-2 ring-brand/20" : "border-slate-200 hover:border-brand/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <ModeSequence legs={option.legs} />
        <SafetyPill option={option} />
      </div>

      <div className="mt-2.5 flex items-baseline gap-2.5">
        <span className="text-xl font-bold text-navy">{formatDuration(option.totalTimeMin)}</span>
        <span className="text-sm font-medium text-ink">{formatINR(option.totalCostINR)}</span>
        <span className="text-xs text-muted">
          {option.transfers} {option.transfers === 1 ? "transfer" : "transfers"}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-navy px-2.5 py-0.5 text-xs font-semibold text-white">
          {option.label}
        </span>
        {recommended && (
          <span className="rounded-full bg-teal/15 px-2.5 py-0.5 text-xs font-semibold text-teal">
            Best match
          </span>
        )}
        {greenest && (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            <LeafIcon className="w-3 h-3" /> Greenest
          </span>
        )}
      </div>
    </button>
  );
}

export function LegList({ legs }: { legs: RouteLeg[] }) {
  const lastStop = legs[legs.length - 1]?.toStop;
  return (
    <ol className="relative space-y-1">
      {legs.map((leg, i) => (
        <li key={i} className="relative flex gap-3">
          <div className="flex flex-col items-center">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 ${MODE_COLOR[leg.mode]}`}>
              <ModeIcon mode={leg.mode} className="w-5 h-5" />
            </span>
            <span className="my-1 w-0.5 flex-1 bg-slate-200" />
          </div>
          <div className="pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold ${MODE_COLOR[leg.mode]}`}>
                {leg.line ?? MODE_LABEL[leg.mode]}
              </span>
              <span className="text-xs font-medium text-ink">{formatDuration(leg.timeMin)}</span>
            </div>
            <p className="mt-1.5 text-sm text-ink">
              {leg.fromStop.name} <span className="text-muted">to</span> {leg.toStop.name}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {leg.distanceKm.toFixed(1)} km
              {leg.costINR > 0 ? ` · ${formatINR(leg.costINR)}` : " · free"} · safety {leg.safetyScore}
            </p>
          </div>
        </li>
      ))}
      {lastStop && (
        <li className="relative flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
            <span className="h-2.5 w-2.5 rounded-full bg-teal" />
          </span>
          <p className="text-sm font-semibold text-navy">{lastStop.name}</p>
        </li>
      )}
    </ol>
  );
}
