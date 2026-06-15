import type { Mode, Stop } from "./types";
import { ZONES } from "./data/chennai";

/** Baseline comfort per mode (1 = best). Enclosed, seated rides score higher. */
const MODE_COMFORT: Record<Mode, number> = {
  metro: 0.9,
  rail: 0.8,
  bus: 0.62,
  auto: 0.55,
  walk: 0.45,
};

/**
 * Grams of CO2 per passenger-kilometre. Public transit is far cleaner per head
 * than a single-occupancy car, which is the baseline we compare against.
 */
const CO2_PER_KM: Record<Mode, number> = {
  metro: 25,
  rail: 30,
  bus: 55,
  auto: 110,
  walk: 0,
};

export const CAR_CO2_PER_KM = 170;

/** Comfort of a single leg (0-100): mode baseline, reduced by crowding. */
export function comfortLeg(fromStop: Stop, toStop: Stop, mode: Mode): number {
  const crowd = (ZONES[fromStop.zoneId].crowd + ZONES[toStop.zoneId].crowd) / 2;
  const c = MODE_COMFORT[mode] * (1 - 0.25 * crowd);
  return Math.max(0, Math.min(1, c)) * 100;
}

export function co2Leg(distanceKm: number, mode: Mode): number {
  return distanceKm * CO2_PER_KM[mode];
}
