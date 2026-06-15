import type { Edge, Mode, SafetyZone, Stop } from "../types";
import { haversineKm } from "../geo";

/**
 * A compact but realistic slice of Chennai's network: the Metro Blue & Green
 * lines, a few MTC bus corridors, and walk / auto transfers. Coordinates are
 * approximate real locations - good enough for routing and a believable demo.
 *
 * Safety zones carry per-area attributes (0 = poor, 1 = excellent) that feed
 * the Safe-Route Score. These are illustrative, seeded from the kind of signals
 * a real system would use (street lighting, footfall, CCTV, help points, and
 * crowd-sourced women-safety feedback).
 */

export const ZONES: Record<string, SafetyZone> = {
  airport: { id: "airport", name: "Airport / Meenambakkam", lighting: 0.85, crowd: 0.6, cctv: 0.9, helpPoints: 0.85, womenFeedback: 0.8 },
  guindy: { id: "guindy", name: "Guindy Industrial / IT", lighting: 0.7, crowd: 0.55, cctv: 0.7, helpPoints: 0.6, womenFeedback: 0.62 },
  saidapet: { id: "saidapet", name: "Saidapet / Little Mount", lighting: 0.6, crowd: 0.8, cctv: 0.55, helpPoints: 0.5, womenFeedback: 0.5 },
  tnagar: { id: "tnagar", name: "T. Nagar Commercial", lighting: 0.8, crowd: 0.95, cctv: 0.75, helpPoints: 0.7, womenFeedback: 0.68 },
  central: { id: "central", name: "Central / Egmore Hub", lighting: 0.82, crowd: 0.9, cctv: 0.85, helpPoints: 0.8, womenFeedback: 0.66 },
  annanagar: { id: "annanagar", name: "Anna Nagar", lighting: 0.78, crowd: 0.7, cctv: 0.72, helpPoints: 0.68, womenFeedback: 0.74 },
  koyambedu: { id: "koyambedu", name: "Koyambedu / CMBT", lighting: 0.65, crowd: 0.85, cctv: 0.7, helpPoints: 0.75, womenFeedback: 0.55 },
  adyar: { id: "adyar", name: "Adyar / Besant Nagar", lighting: 0.72, crowd: 0.7, cctv: 0.6, helpPoints: 0.55, womenFeedback: 0.7 },
  mylapore: { id: "mylapore", name: "Mylapore / Marina", lighting: 0.76, crowd: 0.8, cctv: 0.62, helpPoints: 0.58, womenFeedback: 0.66 },
  velachery: { id: "velachery", name: "Velachery", lighting: 0.7, crowd: 0.78, cctv: 0.58, helpPoints: 0.52, womenFeedback: 0.6 },
};

interface StopSeed {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoneId: string;
  modes: Mode[];
}

const STOP_SEEDS: StopSeed[] = [
  // Metro Blue line (Airport -> Central)
  { id: "airport", name: "Chennai Airport", lat: 12.9815, lng: 80.1628, zoneId: "airport", modes: ["metro", "auto"] },
  { id: "meenambakkam", name: "Meenambakkam", lat: 12.9905, lng: 80.1719, zoneId: "airport", modes: ["metro"] },
  { id: "nanganallur", name: "Nanganallur Road", lat: 12.9899, lng: 80.1869, zoneId: "airport", modes: ["metro"] },
  { id: "alandur", name: "Alandur", lat: 12.9971, lng: 80.2002, zoneId: "guindy", modes: ["metro", "bus"] },
  { id: "guindy", name: "Guindy", lat: 13.0067, lng: 80.2206, zoneId: "guindy", modes: ["metro", "bus", "auto"] },
  { id: "littlemount", name: "Little Mount", lat: 13.0152, lng: 80.2206, zoneId: "saidapet", modes: ["metro"] },
  { id: "saidapet", name: "Saidapet", lat: 13.0214, lng: 80.2236, zoneId: "saidapet", modes: ["metro", "bus"] },
  { id: "nandanam", name: "Nandanam", lat: 13.0339, lng: 80.2391, zoneId: "tnagar", modes: ["metro", "bus"] },
  { id: "teynampet", name: "Teynampet", lat: 13.0436, lng: 80.2486, zoneId: "tnagar", modes: ["metro", "bus"] },
  { id: "agdms", name: "AG-DMS", lat: 13.0492, lng: 80.254, zoneId: "central", modes: ["metro"] },
  { id: "thousandlights", name: "Thousand Lights", lat: 13.057, lng: 80.2545, zoneId: "central", modes: ["metro"] },
  { id: "lic", name: "LIC", lat: 13.0626, lng: 80.2585, zoneId: "central", modes: ["metro"] },
  { id: "central", name: "Chennai Central", lat: 13.0827, lng: 80.275, zoneId: "central", modes: ["metro", "bus", "auto"] },

  // Metro Green line (Central -> Egmore -> Anna Nagar -> Koyambedu -> Alandur)
  { id: "egmore", name: "Egmore", lat: 13.0732, lng: 80.2609, zoneId: "central", modes: ["metro", "bus"] },
  { id: "nehrupark", name: "Nehru Park", lat: 13.076, lng: 80.247, zoneId: "central", modes: ["metro"] },
  { id: "kilpauk", name: "Kilpauk", lat: 13.0822, lng: 80.2389, zoneId: "annanagar", modes: ["metro"] },
  { id: "pachaiyappas", name: "Pachaiyappa's College", lat: 13.0831, lng: 80.2231, zoneId: "annanagar", modes: ["metro"] },
  { id: "annanagar_east", name: "Anna Nagar East", lat: 13.0846, lng: 80.2205, zoneId: "annanagar", modes: ["metro", "bus"] },
  { id: "annanagar_tower", name: "Anna Nagar Tower", lat: 13.0848, lng: 80.2103, zoneId: "annanagar", modes: ["metro"] },
  { id: "thirumangalam", name: "Thirumangalam", lat: 13.085, lng: 80.2031, zoneId: "annanagar", modes: ["metro", "bus"] },
  { id: "koyambedu", name: "Koyambedu (CMBT)", lat: 13.0694, lng: 80.1948, zoneId: "koyambedu", modes: ["metro", "bus", "auto"] },
  { id: "vadapalani", name: "Vadapalani", lat: 13.0508, lng: 80.2123, zoneId: "koyambedu", modes: ["metro", "bus"] },
  { id: "ashoknagar", name: "Ashok Nagar", lat: 13.0356, lng: 80.2107, zoneId: "koyambedu", modes: ["metro"] },
  { id: "ekkattuthangal", name: "Ekkattuthangal", lat: 13.0185, lng: 80.2045, zoneId: "guindy", modes: ["metro"] },

  // MRTS suburban rail (Chennai Beach - Velachery corridor, southern stretch)
  { id: "mylapore", name: "Thirumayilai (Mylapore)", lat: 13.0335, lng: 80.2657, zoneId: "mylapore", modes: ["rail", "bus"] },
  { id: "mandaveli", name: "Mandaveli", lat: 13.0265, lng: 80.268, zoneId: "mylapore", modes: ["rail"] },
  { id: "greenways", name: "Greenways Road", lat: 13.0125, lng: 80.2585, zoneId: "mylapore", modes: ["rail", "bus"] },
  { id: "kotturpuram", name: "Kotturpuram", lat: 13.014, lng: 80.2435, zoneId: "adyar", modes: ["rail"] },
  { id: "indiranagar", name: "Indira Nagar", lat: 12.9955, lng: 80.2565, zoneId: "adyar", modes: ["rail"] },
  { id: "velachery", name: "Velachery", lat: 12.9792, lng: 80.2205, zoneId: "velachery", modes: ["rail", "bus", "auto"] },

  // Bus / last-mile only neighbourhoods (no metro)
  { id: "tnagar", name: "T. Nagar (Panagal Park)", lat: 13.0418, lng: 80.2341, zoneId: "tnagar", modes: ["bus", "auto"] },
  { id: "adyar", name: "Adyar Depot", lat: 13.0012, lng: 80.2565, zoneId: "adyar", modes: ["bus", "auto"] },
  { id: "besantnagar", name: "Besant Nagar", lat: 12.9986, lng: 80.2669, zoneId: "adyar", modes: ["bus", "auto"] },
];

export const STOPS: Record<string, Stop> = Object.fromEntries(
  STOP_SEEDS.map((s) => [s.id, { ...s }]),
);

// --- segment definitions -------------------------------------------------- //
type Seg = [string, string];

const BLUE_LINE: Seg[] = [
  ["airport", "meenambakkam"], ["meenambakkam", "nanganallur"], ["nanganallur", "alandur"],
  ["alandur", "guindy"], ["guindy", "littlemount"], ["littlemount", "saidapet"],
  ["saidapet", "nandanam"], ["nandanam", "teynampet"], ["teynampet", "agdms"],
  ["agdms", "thousandlights"], ["thousandlights", "lic"], ["lic", "central"],
];

const GREEN_LINE: Seg[] = [
  ["central", "egmore"], ["egmore", "nehrupark"], ["nehrupark", "kilpauk"],
  ["kilpauk", "pachaiyappas"], ["pachaiyappas", "annanagar_east"],
  ["annanagar_east", "annanagar_tower"], ["annanagar_tower", "thirumangalam"],
  ["thirumangalam", "koyambedu"], ["koyambedu", "vadapalani"],
  ["vadapalani", "ashoknagar"], ["ashoknagar", "ekkattuthangal"], ["ekkattuthangal", "alandur"],
];

const RAIL_LINE: Seg[] = [
  ["mylapore", "mandaveli"], ["mandaveli", "greenways"], ["greenways", "kotturpuram"],
  ["kotturpuram", "indiranagar"], ["indiranagar", "velachery"],
];

// MTC bus corridors (id -> ordered stops)
const BUS_ROUTES: Record<string, string[]> = {
  "21G": ["saidapet", "tnagar", "teynampet", "nandanam"],
  "23C": ["guindy", "adyar", "besantnagar"],
  "27B": ["central", "egmore", "annanagar_east", "thirumangalam", "koyambedu"],
  "M51": ["koyambedu", "vadapalani", "tnagar", "saidapet"],
  "5C": ["tnagar", "teynampet", "central"],
  "29C": ["adyar", "greenways", "mandaveli", "mylapore"],
};

// Walk / auto transfers between nearby points (kept short + realistic)
const WALK_LINKS: Seg[] = [
  ["nandanam", "tnagar"],
  ["teynampet", "tnagar"],
  ["central", "egmore"],
];
const AUTO_LINKS: Seg[] = [
  ["adyar", "besantnagar"],
  ["guindy", "tnagar"],
  ["saidapet", "tnagar"],
  ["koyambedu", "annanagar_east"],
  ["velachery", "guindy"],
  ["mylapore", "teynampet"],
];

// --- edge construction ---------------------------------------------------- //
const SPEED_KMH: Record<Mode, number> = { metro: 34, rail: 30, bus: 17, walk: 4.6, auto: 22 };

// Fares are kept distance-proportional (per edge) so that summing the edges of
// a merged leg stays realistic - a multi-stop metro hop is priced by its total
// distance, not by stacking a base fare on every short segment.
function fare(mode: Mode, km: number): number {
  switch (mode) {
    case "metro":
      return Math.round(2.6 * km);
    case "rail":
      return Math.round(1.1 * km);
    case "bus":
      return Math.round(1.4 * km);
    case "auto":
      return 25 + Math.round(km * 16);
    case "walk":
      return 0;
  }
}

function makeEdge(from: string, to: string, mode: Mode, line?: string): Edge {
  const a = STOPS[from];
  const b = STOPS[to];
  const distanceKm = +haversineKm(a, b).toFixed(2);
  const dwell = mode === "metro" || mode === "bus" ? 1.2 : 0;
  const timeMin = +((distanceKm / SPEED_KMH[mode]) * 60 + dwell).toFixed(1);
  return { from, to, mode, line, timeMin, costINR: fare(mode, distanceKm), distanceKm };
}

function addBidirectional(out: Edge[], segs: Seg[], mode: Mode, line?: string) {
  for (const [a, b] of segs) {
    out.push(makeEdge(a, b, mode, line));
    out.push(makeEdge(b, a, mode, line));
  }
}

function buildEdges(): Edge[] {
  const edges: Edge[] = [];
  addBidirectional(edges, BLUE_LINE, "metro", "Blue Line");
  addBidirectional(edges, GREEN_LINE, "metro", "Green Line");
  addBidirectional(edges, RAIL_LINE, "rail", "MRTS");
  for (const [route, stops] of Object.entries(BUS_ROUTES)) {
    const segs: Seg[] = [];
    for (let i = 0; i < stops.length - 1; i++) segs.push([stops[i], stops[i + 1]]);
    addBidirectional(edges, segs, "bus", `Bus ${route}`);
  }
  addBidirectional(edges, WALK_LINKS, "walk", "Walk");
  addBidirectional(edges, AUTO_LINKS, "auto", "Auto");
  return edges;
}

export const EDGES: Edge[] = buildEdges();

/** Stops offered in the origin / destination pickers, sorted by name. */
export const SELECTABLE_STOPS: Stop[] = Object.values(STOPS).sort((a, b) =>
  a.name.localeCompare(b.name),
);

export function getStop(id: string): Stop | undefined {
  return STOPS[id];
}
