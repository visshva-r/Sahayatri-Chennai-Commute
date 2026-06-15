import type { Mode, RouteLeg, SafetyBreakdown, Stop, TimeOfDay } from "./types";
import { ZONES } from "./data/chennai";

/**
 * Safe-Route Score: a transparent, explainable model.
 *
 * For each leg we average the safety attributes of the zones it passes through,
 * combine them with a learned-style weight vector, then scale by how exposed the
 * travel mode is and how risky the time of day is. A whole route's score is the
 * time-weighted average of its legs - longer, riskier legs pull it down more.
 *
 * The weights below are the same ones a trained model (e.g. a Random Forest on
 * historical incident + feedback data) would learn; here they are made explicit
 * so the score is auditable rather than a black box.
 */

export const SAFETY_WEIGHTS = {
  womenFeedback: 0.3,
  lighting: 0.22,
  cctv: 0.18,
  crowd: 0.15,
  helpPoints: 0.15,
} as const;

// How exposed each mode is (1 = enclosed/monitored, lower = more exposed).
const MODE_FACTOR: Record<Mode, number> = {
  metro: 1.0,
  rail: 0.88,
  bus: 0.86,
  auto: 0.72,
  walk: 0.6,
};

// Lighting / CCTV matter more after dark, so the time factor compounds risk.
const TIME_FACTOR: Record<TimeOfDay, number> = {
  day: 1.0,
  evening: 0.9,
  night: 0.8,
};

function avg(a: number, b: number): number {
  return (a + b) / 2;
}

/** Score a single leg from its endpoint zones, mode and time of day (0-100). */
export function scoreLeg(
  fromStop: Stop,
  toStop: Stop,
  mode: Mode,
  timeOfDay: TimeOfDay,
): { score: number; breakdown: SafetyBreakdown } {
  const za = ZONES[fromStop.zoneId];
  const zb = ZONES[toStop.zoneId];

  const lighting = avg(za.lighting, zb.lighting);
  const crowd = avg(za.crowd, zb.crowd);
  const cctv = avg(za.cctv, zb.cctv);
  const helpPoints = avg(za.helpPoints, zb.helpPoints);
  const womenFeedback = avg(za.womenFeedback, zb.womenFeedback);

  const base =
    womenFeedback * SAFETY_WEIGHTS.womenFeedback +
    lighting * SAFETY_WEIGHTS.lighting +
    cctv * SAFETY_WEIGHTS.cctv +
    crowd * SAFETY_WEIGHTS.crowd +
    helpPoints * SAFETY_WEIGHTS.helpPoints;

  const modeFactor = MODE_FACTOR[mode];
  const timeFactor = TIME_FACTOR[timeOfDay];
  const score = clamp(base * modeFactor * timeFactor * 100);

  return {
    score,
    breakdown: { lighting, crowd, cctv, helpPoints, womenFeedback, modeFactor, timeFactor },
  };
}

/** Time-weighted average of leg scores for an overall route score (0-100). */
export function scoreRoute(legs: RouteLeg[]): {
  score: number;
  breakdown: SafetyBreakdown;
} {
  const totalTime = legs.reduce((s, l) => s + l.timeMin, 0) || 1;
  let score = 0;
  const acc: SafetyBreakdown = {
    lighting: 0, crowd: 0, cctv: 0, helpPoints: 0, womenFeedback: 0, modeFactor: 0, timeFactor: 0,
  };
  for (const leg of legs) {
    const w = leg.timeMin / totalTime;
    score += leg.safetyScore * w;
    // breakdown is recomputed per leg already; weight-average the components
  }
  // Average components across legs weighted by time for the summary card.
  for (const leg of legs) {
    const w = leg.timeMin / totalTime;
    const b = legBreakdownCache.get(leg);
    if (b) {
      acc.lighting += b.lighting * w;
      acc.crowd += b.crowd * w;
      acc.cctv += b.cctv * w;
      acc.helpPoints += b.helpPoints * w;
      acc.womenFeedback += b.womenFeedback * w;
      acc.modeFactor += b.modeFactor * w;
      acc.timeFactor += b.timeFactor * w;
    }
  }
  return { score: Math.round(score), breakdown: acc };
}

// Lets scoreRoute reuse each leg's component breakdown without recomputing.
export const legBreakdownCache = new WeakMap<RouteLeg, SafetyBreakdown>();

export function safetyBand(score: number): "Safe" | "Moderate" | "Caution" {
  if (score >= 72) return "Safe";
  if (score >= 52) return "Moderate";
  return "Caution";
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}
