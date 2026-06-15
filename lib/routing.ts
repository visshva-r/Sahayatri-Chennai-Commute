import type {
  Edge,
  Priority,
  RouteLeg,
  RouteOption,
  TimeOfDay,
} from "./types";
import { EDGES, STOPS } from "./data/chennai";
import { legBreakdownCache, safetyBand, scoreLeg, scoreRoute } from "./safety";
import { CAR_CO2_PER_KM, co2Leg, comfortLeg } from "./metrics";
import { haversineKm } from "./geo";

// Adjacency list built once at module load.
const ADJ: Map<string, Edge[]> = (() => {
  const m = new Map<string, Edge[]>();
  for (const e of EDGES) {
    if (!m.has(e.from)) m.set(e.from, []);
    m.get(e.from)!.push(e);
  }
  return m;
})();

const RISK_K = 4; // how strongly the "safest" objective avoids risky legs
const COMFORT_K = 2.4; // how strongly the "comfortable" objective avoids rough legs
const WALK_PENALTY = 2.0; // discourages long walks when optimising for cost

// Cost of changing service (mode or line). Transfers mean waiting and walking,
// so every objective pays for them - this keeps routes practical instead of
// stitching many cheap hops together.
const TRANSFER_PENALTY: Record<Priority, number> = {
  fastest: 5, // ~5 min of waiting/walking per change
  comfortable: 9, // changes are uncomfortable
  safest: 6,
  cheapest: 22, // a string of cheap bus hops should not beat a near-direct ride
};

function edgeWeight(e: Edge, priority: Priority, tod: TimeOfDay): number {
  if (priority === "cheapest") {
    // Walking is free but tiring, so price its time instead of letting the
    // optimiser chain long walks to shave a few rupees.
    if (e.mode === "walk") return e.timeMin * WALK_PENALTY;
    return e.costINR + e.timeMin * 0.1;
  }
  if (priority === "safest") {
    const { score } = scoreLeg(STOPS[e.from], STOPS[e.to], e.mode, tod);
    return e.timeMin * (1 + RISK_K * (1 - score / 100));
  }
  if (priority === "comfortable") {
    const c = comfortLeg(STOPS[e.from], STOPS[e.to], e.mode);
    return e.timeMin * (1 + COMFORT_K * (1 - c / 100));
  }
  return e.timeMin; // fastest
}

const serviceKey = (e: Edge) => `${e.mode}::${e.line ?? ""}`;

/**
 * Transfer-aware Dijkstra. State = stop + the service boarded to reach it, so we
 * can charge a penalty whenever the next edge changes mode or line. Returns the
 * ordered list of edges, or null if unreachable.
 */
function dijkstra(
  fromId: string,
  toId: string,
  priority: Priority,
  tod: TimeOfDay,
): Edge[] | null {
  const START = `${fromId}::start`;
  const dist = new Map<string, number>([[START, 0]]);
  const prev = new Map<string, { edge: Edge; from: string }>();
  const visited = new Set<string>();
  const nodeOf = (state: string) => state.slice(0, state.indexOf("::"));
  const serviceOf = (state: string) => state.slice(state.indexOf("::") + 2);

  let goal: string | null = null;

  while (true) {
    let u: string | null = null;
    let best = Infinity;
    for (const [state, d] of dist) {
      if (!visited.has(state) && d < best) {
        best = d;
        u = state;
      }
    }
    if (u === null) break;
    if (nodeOf(u) === toId) {
      goal = u;
      break;
    }
    visited.add(u);

    const service = serviceOf(u);
    for (const e of ADJ.get(nodeOf(u)) ?? []) {
      const next = `${e.to}::${serviceKey(e)}`;
      if (visited.has(next)) continue;
      const isTransfer = service !== "start" && service !== serviceKey(e);
      const nd = best + edgeWeight(e, priority, tod) + (isTransfer ? TRANSFER_PENALTY[priority] : 0);
      if (nd < (dist.get(next) ?? Infinity)) {
        dist.set(next, nd);
        prev.set(next, { edge: e, from: u });
      }
    }
  }

  if (!goal) return null;
  const path: Edge[] = [];
  let cur = goal;
  while (cur !== START) {
    const step = prev.get(cur);
    if (!step) return null;
    path.push(step.edge);
    cur = step.from;
  }
  return path.reverse();
}

/** Merge consecutive edges that share a mode + line into display legs. */
function edgesToLegs(edges: Edge[], tod: TimeOfDay): RouteLeg[] {
  const legs: RouteLeg[] = [];
  let group: Edge[] = [];

  const flush = () => {
    if (group.length === 0) return;
    const first = group[0];
    const last = group[group.length - 1];
    const timeMin = +group.reduce((s, e) => s + e.timeMin, 0).toFixed(1);
    const costINR = group.reduce((s, e) => s + e.costINR, 0);
    const distanceKm = +group.reduce((s, e) => s + e.distanceKm, 0).toFixed(2);

    // time-weighted safety + comfort across the merged edges
    let safety = 0;
    let comfort = 0;
    const bAcc = {
      lighting: 0, crowd: 0, cctv: 0, helpPoints: 0, womenFeedback: 0, modeFactor: 0, timeFactor: 0,
    };
    for (const e of group) {
      const { score, breakdown } = scoreLeg(STOPS[e.from], STOPS[e.to], e.mode, tod);
      const w = e.timeMin / (timeMin || 1);
      safety += score * w;
      comfort += comfortLeg(STOPS[e.from], STOPS[e.to], e.mode) * w;
      bAcc.lighting += breakdown.lighting * w;
      bAcc.crowd += breakdown.crowd * w;
      bAcc.cctv += breakdown.cctv * w;
      bAcc.helpPoints += breakdown.helpPoints * w;
      bAcc.womenFeedback += breakdown.womenFeedback * w;
      bAcc.modeFactor += breakdown.modeFactor * w;
      bAcc.timeFactor += breakdown.timeFactor * w;
    }

    const path = [STOPS[first.from], ...group.map((e) => STOPS[e.to])].map((s) => ({
      lat: s.lat,
      lng: s.lng,
    }));

    const leg: RouteLeg = {
      mode: first.mode,
      line: first.line,
      fromStop: STOPS[first.from],
      toStop: STOPS[last.to],
      timeMin,
      costINR,
      distanceKm,
      safetyScore: Math.round(safety),
      comfortScore: Math.round(comfort),
      path,
    };
    legBreakdownCache.set(leg, bAcc);
    legs.push(leg);
    group = [];
  };

  for (const e of edges) {
    const prev = group[group.length - 1];
    if (prev && (prev.mode !== e.mode || prev.line !== e.line)) flush();
    group.push(e);
  }
  flush();
  return legs;
}

function buildOption(label: string, edges: Edge[], tod: TimeOfDay): RouteOption {
  const legs = edgesToLegs(edges, tod);
  const totalTimeMin = +legs.reduce((s, l) => s + l.timeMin, 0).toFixed(1);
  const totalCostINR = legs.reduce((s, l) => s + l.costINR, 0);
  const totalDistanceKm = +legs.reduce((s, l) => s + l.distanceKm, 0).toFixed(2);
  const { score, breakdown } = scoreRoute(legs);

  const transfers = Math.max(0, legs.length - 1);
  const comfortRaw =
    legs.reduce((s, l) => s + l.comfortScore * l.timeMin, 0) / (totalTimeMin || 1);
  const comfortScore = Math.round(Math.max(0, Math.min(100, comfortRaw - transfers * 4)));

  const co2Grams = Math.round(legs.reduce((s, l) => s + co2Leg(l.distanceKm, l.mode), 0));

  return {
    id: legs.map((l) => l.fromStop.id).join("-") + "-" + legs[legs.length - 1]?.toStop.id,
    label,
    legs,
    totalTimeMin,
    totalCostINR,
    totalDistanceKm,
    transfers,
    safetyScore: score,
    safetyBand: safetyBand(score),
    breakdown,
    comfortScore,
    co2Grams,
    co2SavedGrams: 0, // filled in by planJourney against a shared car baseline
  };
}

const PRIORITY_LABEL: Record<Priority, string> = {
  fastest: "Fastest",
  cheapest: "Cheapest",
  comfortable: "Comfort",
  safest: "Safest",
};

const ALL_PRIORITIES: Priority[] = ["fastest", "cheapest", "comfortable", "safest"];

function signature(edges: Edge[]): string {
  return (edges[0]?.from ?? "") + "|" + edges.map((e) => `${e.to}:${e.mode}:${e.line}`).join(">");
}

/** Plan a journey: returns distinct route options, ranked by the chosen priority. */
export function planJourney(
  fromId: string,
  toId: string,
  priority: Priority,
  tod: TimeOfDay,
): RouteOption[] {
  if (fromId === toId) return [];
  const order: Priority[] = [priority, ...ALL_PRIORITIES.filter((p) => p !== priority)];

  const bySig = new Map<string, { labels: string[]; edges: Edge[] }>();
  for (const p of order) {
    const path = dijkstra(fromId, toId, p, tod);
    if (!path || path.length === 0) continue;
    const sig = signature(path);
    if (bySig.has(sig)) {
      bySig.get(sig)!.labels.push(PRIORITY_LABEL[p]);
    } else {
      bySig.set(sig, { labels: [PRIORITY_LABEL[p]], edges: path });
    }
  }

  const options = [...bySig.values()].map((v) => {
    const label = v.labels.length >= 3 ? "Best overall" : v.labels.join(" & ");
    return buildOption(label, v.edges, tod);
  });

  // CO2 saved is measured against ONE car trip for this journey (a direct drive
  // with a small detour factor), so every option is compared on equal terms.
  const carKm = haversineKm(STOPS[fromId], STOPS[toId]) * 1.35;
  const carBaseline = carKm * CAR_CO2_PER_KM;
  for (const o of options) {
    o.co2SavedGrams = Math.max(0, Math.round(carBaseline - o.co2Grams));
  }

  options.sort((a, b) => {
    if (priority === "cheapest") return a.totalCostINR - b.totalCostINR;
    if (priority === "safest") return b.safetyScore - a.safetyScore;
    if (priority === "comfortable") return b.comfortScore - a.comfortScore;
    return a.totalTimeMin - b.totalTimeMin;
  });

  return options;
}
