import type { SafetyBreakdown } from "@/lib/types";

type Band = "Safe" | "Moderate" | "Caution";

export function bandColor(band: Band): { ring: string; text: string; bg: string; border: string } {
  switch (band) {
    case "Safe":
      return { ring: "#12B786", text: "text-teal", bg: "bg-teal/10", border: "border-teal/30" };
    case "Moderate":
      return { ring: "#D9930B", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-300" };
    case "Caution":
      return { ring: "#DC2626", text: "text-red-600", bg: "bg-red-50", border: "border-red-300" };
  }
}

export function ScoreRing({
  score,
  band,
  size = 64,
}: {
  score: number;
  band: Band;
  size?: number;
}) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  const color = bandColor(band).ring;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#E5EAF1" strokeWidth="6" fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-navy font-semibold" fontSize={size * 0.3}>
        {score}
      </text>
    </svg>
  );
}

const FACTORS: { key: keyof SafetyBreakdown; label: string; phrase: string }[] = [
  { key: "womenFeedback", label: "Women feedback", phrase: "women's safety feedback" },
  { key: "lighting", label: "Lighting", phrase: "street lighting" },
  { key: "cctv", label: "CCTV cover", phrase: "CCTV coverage" },
  { key: "crowd", label: "Footfall", phrase: "footfall" },
  { key: "helpPoints", label: "Help points", phrase: "help points" },
];

function barColor(pct: number): string {
  if (pct >= 70) return "bg-teal";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-500";
}

/** A short, human verdict summarising the strongest and weakest safety signals. */
export function safetyVerdict(breakdown: SafetyBreakdown): string {
  const ranked = FACTORS.map((f) => ({ phrase: f.phrase, v: breakdown[f.key] as number }));
  const strong = ranked.filter((e) => e.v >= 0.7).sort((a, b) => b.v - a.v);
  const weak = ranked.filter((e) => e.v < 0.6).sort((a, b) => a.v - b.v);
  const night = breakdown.timeFactor < 1;

  const parts: string[] = [];
  if (strong.length) {
    parts.push(`Good ${strong[0].phrase}${strong[1] ? ` and ${strong[1].phrase}` : ""}`);
  }
  if (weak.length) {
    const lead = parts.length ? "but lower" : "Lower";
    parts.push(`${lead} ${weak[0].phrase}`);
  }
  let sentence = parts.join(", ");
  if (!sentence) sentence = "Balanced safety signals across the route";
  if (night) sentence += " after dark";
  return `${sentence}.`;
}

export function SafetyBreakdownBars({ breakdown }: { breakdown: SafetyBreakdown }) {
  return (
    <div className="space-y-2">
      {FACTORS.map((f) => {
        const pct = Math.round((breakdown[f.key] as number) * 100);
        return (
          <div key={f.key} className="flex items-center gap-3 text-xs">
            <span className="w-28 shrink-0 text-muted">{f.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full rounded-full ${barColor(pct)}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-right font-medium text-ink">{pct}</span>
          </div>
        );
      })}
      <p className="pt-1 text-[11px] text-muted">
        Adjusted for travel mode ({Math.round(breakdown.modeFactor * 100)}%) and time of day (
        {Math.round(breakdown.timeFactor * 100)}%).
      </p>
    </div>
  );
}
