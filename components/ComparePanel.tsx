import type { RouteOption } from "@/lib/types";
import { formatDuration, formatINR } from "@/lib/geo";
import { compareInsights } from "@/lib/explain";
import type { Priority } from "@/lib/types";
import { ModeIcon, MODE_COLOR } from "./icons";
import { bandColor } from "./SafetyMeter";

export function ComparePanel({
  options,
  selectedId,
  priority,
  onSelect,
}: {
  options: RouteOption[];
  selectedId: string;
  priority: Priority;
  onSelect: (id: string) => void;
}) {
  const cols = options.slice(0, 3);
  const insights = compareInsights(options, priority);

  const bestTime = Math.min(...cols.map((o) => o.totalTimeMin));
  const bestCost = Math.min(...cols.map((o) => o.totalCostINR));
  const bestSafe = Math.max(...cols.map((o) => o.safetyScore));
  const bestComfort = Math.max(...cols.map((o) => o.comfortScore));

  return (
    <div className="space-y-3">
      {insights.map((line) => (
        <p key={line} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-ink shadow-card">
          {line}
        </p>
      ))}

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div
          className="grid min-w-[640px] gap-3"
          style={{ gridTemplateColumns: `7.5rem repeat(${cols.length}, minmax(10rem, 1fr))` }}
        >
          <div />
          {cols.map((o) => {
            const selected = o.id === selectedId;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onSelect(o.id)}
                className={`rounded-2xl border p-3 text-left shadow-card transition ${
                  selected ? "border-brand ring-2 ring-brand/20" : "border-slate-200 bg-white hover:border-brand/40"
                }`}
              >
                <p className="text-xs font-semibold text-navy">{o.label}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {o.legs.map((leg, i) => (
                    <ModeIcon key={i} mode={leg.mode} className={`h-4 w-4 ${MODE_COLOR[leg.mode]}`} />
                  ))}
                </div>
                <p className="mt-2 text-lg font-bold text-navy">{formatDuration(o.totalTimeMin)}</p>
                <p className="text-xs text-muted">
                  {formatINR(o.totalCostINR)} · {o.safetyBand} {o.safetyScore}
                </p>
              </button>
            );
          })}

          <Row label="Door to door">
            {cols.map((o) => (
              <Cell key={o.id} best={o.totalTimeMin === bestTime}>
                {formatDuration(o.doorToDoorMin)}
                <span className="block text-[11px] font-normal text-muted">
                  incl. {Math.round(o.totalWaitMin)} min waits
                </span>
              </Cell>
            ))}
          </Row>
          <Row label="Fare">
            {cols.map((o) => (
              <Cell key={o.id} best={o.totalCostINR === bestCost}>
                {formatINR(o.totalCostINR)}
              </Cell>
            ))}
          </Row>
          <Row label="Safe-Route">
            {cols.map((o) => {
              const c = bandColor(o.safetyBand);
              return (
                <Cell key={o.id} best={o.safetyScore === bestSafe}>
                  <span className={c.text}>
                    {o.safetyScore} {o.safetyBand}
                  </span>
                </Cell>
              );
            })}
          </Row>
          <Row label="Comfort">
            {cols.map((o) => (
              <Cell key={o.id} best={o.comfortScore === bestComfort}>
                {o.comfortScore}/100
              </Cell>
            ))}
          </Row>
          <Row label="Transfers">
            {cols.map((o) => (
              <Cell key={o.id}>{o.transfers}</Cell>
            ))}
          </Row>
          <Row label="CO2 saved">
            {cols.map((o) => (
              <Cell key={o.id}>{(o.co2SavedGrams / 1000).toFixed(1)} kg</Cell>
            ))}
          </Row>
          <Row label="Arrive">
            {cols.map((o) => (
              <Cell key={o.id}>{o.arriveLabel}</Cell>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <div className="flex items-center text-xs font-medium text-muted">{label}</div>
      {children}
    </>
  );
}

function Cell({ children, best }: { children: React.ReactNode; best?: boolean }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
        best ? "border-teal/40 bg-teal/5 text-navy" : "border-slate-200 bg-white text-ink"
      }`}
    >
      {children}
    </div>
  );
}
