import type { Mode, Priority, RouteOption, SafetyBreakdown, TimeOfDay } from "./types";
import { MODE_EXPOSURE, MODE_FACTOR, SAFETY_WEIGHTS, TIME_NOTE } from "./safety";
import { ZONES } from "./data/chennai";

export type FactorKey = keyof Pick<
  SafetyBreakdown,
  "womenFeedback" | "lighting" | "cctv" | "crowd" | "helpPoints"
>;

export interface FactorCard {
  key: FactorKey;
  label: string;
  weightPct: number;
  score: number;
  verdict: "strong" | "ok" | "weak";
  why: string;
  evidence: string;
}

const FACTOR_META: {
  key: FactorKey;
  label: string;
  weight: number;
  why: string;
}[] = [
  {
    key: "womenFeedback",
    label: "Women's safety feedback",
    weight: SAFETY_WEIGHTS.womenFeedback,
    why: "Crowd-sourced reports from women riders on how watched and comfortable a stretch feels.",
  },
  {
    key: "lighting",
    label: "Street lighting",
    weight: SAFETY_WEIGHTS.lighting,
    why: "How well the corridor and last-mile streets are lit after dusk.",
  },
  {
    key: "cctv",
    label: "CCTV coverage",
    weight: SAFETY_WEIGHTS.cctv,
    why: "Cameras at stations, terminals and major junctions along the path.",
  },
  {
    key: "crowd",
    label: "Footfall",
    weight: SAFETY_WEIGHTS.crowd,
    why: "Other people around you — empty stretches score lower after dark.",
  },
  {
    key: "helpPoints",
    label: "Help points",
    weight: SAFETY_WEIGHTS.helpPoints,
    why: "Staffed booths, station security and known places to get help.",
  },
];

function zoneNames(option: RouteOption): string[] {
  const ids = new Set<string>();
  for (const leg of option.legs) {
    ids.add(leg.fromStop.zoneId);
    ids.add(leg.toStop.zoneId);
  }
  return [...ids].map((id) => ZONES[id]?.name ?? id);
}

function placeLine(option: RouteOption): string {
  const names = zoneNames(option);
  if (names.length === 0) return "this corridor";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names[0]}, ${names[1]} and nearby zones`;
}

function evidence(key: FactorKey, value: number, option: RouteOption): string {
  const place = placeLine(option);
  const high = value >= 0.75;
  const mid = value >= 0.55;
  switch (key) {
    case "womenFeedback":
      if (high) return `Women riders rate ${place} as well-watched.`;
      if (mid) return `Feedback on ${place} is mixed — usable, not a standout.`;
      return `Women's reports flag ${place} as a weaker stretch.`;
    case "lighting":
      if (high) return `Street lighting is strong around ${place}.`;
      if (mid) return `Lighting is uneven around ${place}; some last-mile bits dimmer.`;
      return `Lighting is a weak point around ${place}.`;
    case "cctv":
      if (high) return `Stations and junctions around ${place} have solid camera cover.`;
      if (mid) return `CCTV is present around ${place} but not wall-to-wall.`;
      return `Camera cover thins out around ${place}.`;
    case "crowd":
      if (high) return `Footfall stays high around ${place}.`;
      if (mid) return `Crowd levels around ${place} are typical, not packed.`;
      return `Quieter streets around ${place} mean fewer eyes on the path.`;
    case "helpPoints":
      if (high) return `Help points and staffed stops are close along ${place}.`;
      if (mid) return `You can find help near hubs on ${place}, with gaps in between.`;
      return `Help points are thinner around ${place}.`;
  }
}

export function factorCards(option: RouteOption): FactorCard[] {
  return FACTOR_META.map((f) => {
    const raw = option.breakdown[f.key];
    const score = Math.round(raw * 100);
    const verdict: FactorCard["verdict"] = score >= 70 ? "strong" : score >= 52 ? "ok" : "weak";
    return {
      key: f.key,
      label: f.label,
      weightPct: Math.round(f.weight * 100),
      score,
      verdict,
      why: f.why,
      evidence: evidence(f.key, raw, option),
    };
  });
}

function mostExposedMode(option: RouteOption): Mode {
  let worst: Mode = option.legs[0]?.mode ?? "walk";
  let factor = MODE_FACTOR[worst];
  for (const leg of option.legs) {
    if (MODE_FACTOR[leg.mode] < factor) {
      factor = MODE_FACTOR[leg.mode];
      worst = leg.mode;
    }
  }
  return worst;
}

function longestLeg(option: RouteOption) {
  return option.legs.reduce((best, leg) => (leg.timeMin > best.timeMin ? leg : best), option.legs[0]);
}

export function explainWhy(
  option: RouteOption,
  tod: TimeOfDay,
): { headline: string; bullets: string[]; formula: string } {
  const cards = factorCards(option);
  const weak = [...cards].sort((a, b) => a.score - b.score)[0];
  const strong = [...cards].sort((a, b) => b.score - a.score)[0];
  const exposed = mostExposedMode(option);
  const long = longestLeg(option);
  const nightish = tod !== "day";

  const whyBits: string[] = [];
  if (nightish) whyBits.push(tod === "night" ? "travel after dark" : "evening light");
  if (MODE_FACTOR[exposed] < 0.9) whyBits.push(`a more exposed ${exposed} leg`);
  if (weak && weak.score < 70) whyBits.push(`softer ${weak.label.toLowerCase()}`);

  const because = whyBits.length ? ` because of ${whyBits.join(", ")}` : "";
  const headline = `${option.safetyScore} ${option.safetyBand}${because}.`;

  const modeName = `${exposed[0].toUpperCase()}${exposed.slice(1)}`;
  const onlyMode = option.legs.every((leg) => leg.mode === exposed);
  const modeLine = onlyMode
    ? `This plan is ${modeName} only. ${MODE_EXPOSURE[exposed]}.`
    : `${modeName} is the most exposed mode on this plan. ${MODE_EXPOSURE[exposed]}.`;
  const bullets = [
    TIME_NOTE[tod],
    modeLine,
    `${strong.label} is the strongest signal (${strong.score}/100). ${weak.label} is the weakest (${weak.score}/100).`,
  ];
  if (long) {
    bullets.push(
      `The longest ride is ${long.line ?? long.mode} from ${long.fromStop.name} to ${long.toStop.name} (${Math.round(long.timeMin)} min, safety ${long.safetyScore}) — it weights the route score the most.`,
    );
  }

  return {
    headline,
    bullets,
    formula:
      "legBase = 30% women feedback + 22% lighting + 18% CCTV + 15% footfall + 15% help points. Then x mode exposure x time of day. Route score is the time-weighted average of legs.",
  };
}

export function compareInsights(options: RouteOption[], priority: Priority): string[] {
  if (options.length === 0) return [];
  if (options.length === 1) {
    return ["Only one distinct plan for this pair — the network treats it as the clear choice."];
  }

  const top = options[0];
  const rest = options.slice(1);
  const cheapest = options.reduce((a, b) => (a.totalCostINR < b.totalCostINR ? a : b));
  const fastest = options.reduce((a, b) => (a.totalTimeMin < b.totalTimeMin ? a : b));
  const safest = options.reduce((a, b) => (a.safetyScore > b.safetyScore ? a : b));
  const lines: string[] = [];

  const vs = rest[0];
  const dMin = Math.round(vs.totalTimeMin - top.totalTimeMin);
  const dCost = vs.totalCostINR - top.totalCostINR;
  const dSafe = vs.safetyScore - top.safetyScore;
  const timeBit = dMin === 0 ? "the same time" : dMin > 0 ? `${dMin} min slower` : `${Math.abs(dMin)} min quicker`;
  const costBit = dCost === 0 ? "the same fare" : dCost > 0 ? `₹${dCost} more` : `₹${Math.abs(dCost)} less`;
  const safeBit =
    dSafe === 0 ? "the same Safe-Route Score" : dSafe > 0 ? `+${dSafe} safety` : `${dSafe} safety`;
  lines.push(`Next option versus your top pick: ${timeBit}, ${costBit}, ${safeBit}.`);

  if (fastest.id !== safest.id) {
    const gap = Math.round(safest.totalTimeMin - fastest.totalTimeMin);
    lines.push(
      `Safest (${safest.safetyScore}) is ${gap === 0 ? "as quick as" : `${Math.abs(gap)} min ${gap > 0 ? "slower than" : "quicker than"}`} the fastest plan.`,
    );
  }
  if (cheapest.id !== fastest.id) {
    lines.push(
      `Cheapest is ₹${cheapest.totalCostINR} vs ₹${fastest.totalCostINR} on the fastest — a classic time/cost tradeoff.`,
    );
  }

  const priNote: Record<Priority, string> = {
    fastest: "Ranked for door-to-platform speed.",
    cheapest: "Ranked to keep the fare down without endless transfers.",
    comfortable: "Ranked for enclosed modes and fewer rough hops.",
    safest: "Ranked so lighting, CCTV and exposure beat raw speed.",
  };
  lines.unshift(priNote[priority]);
  return lines;
}

export const TOD_LABEL: Record<TimeOfDay, string> = {
  day: "Daytime",
  evening: "Evening",
  night: "Night",
};
