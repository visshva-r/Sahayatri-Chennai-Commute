export type Mode = "metro" | "rail" | "bus" | "walk" | "auto";

export type Priority = "fastest" | "cheapest" | "comfortable" | "safest";

export type TimeOfDay = "day" | "evening" | "night";

export interface LatLng {
  lat: number;
  lng: number;
}

/** A safety profile for an area of the city (0 = poor, 1 = excellent). */
export interface SafetyZone {
  id: string;
  name: string;
  lighting: number;
  crowd: number;
  cctv: number;
  helpPoints: number;
  womenFeedback: number;
}

export interface Stop extends LatLng {
  id: string;
  name: string;
  zoneId: string;
  modes: Mode[];
}

/** A directed connection between two stops on a given mode. */
export interface Edge {
  from: string;
  to: string;
  mode: Mode;
  line?: string;
  timeMin: number;
  costINR: number;
  distanceKm: number;
}

export interface SafetyBreakdown {
  lighting: number;
  crowd: number;
  cctv: number;
  helpPoints: number;
  womenFeedback: number;
  modeFactor: number;
  timeFactor: number;
}

export interface RouteLeg {
  mode: Mode;
  line?: string;
  fromStop: Stop;
  toStop: Stop;
  timeMin: number;
  costINR: number;
  distanceKm: number;
  safetyScore: number;
  comfortScore: number;
  path: LatLng[];
}

export interface RouteOption {
  id: string;
  label: string;
  legs: RouteLeg[];
  totalTimeMin: number;
  totalCostINR: number;
  totalDistanceKm: number;
  transfers: number;
  safetyScore: number;
  safetyBand: "Safe" | "Moderate" | "Caution";
  breakdown: SafetyBreakdown;
  comfortScore: number;
  co2Grams: number;
  co2SavedGrams: number;
}

export interface PlanRequest {
  fromId: string;
  toId: string;
  priority: Priority;
  timeOfDay: TimeOfDay;
}

export interface PlanResponse {
  request: PlanRequest;
  options: RouteOption[];
}
