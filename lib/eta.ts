import type { Mode, TimeOfDay } from "./types";

/** Typical wait before boarding that mode (minutes). Walk needs none. */
export const BOARD_WAIT: Record<Mode, number> = {
  metro: 2.5,
  rail: 5,
  bus: 7,
  walk: 0,
  auto: 2,
};

/** Representative departure clocks used to show a concrete ETA. */
const DEPART: Record<TimeOfDay, [number, number]> = {
  day: [8, 40],
  evening: [18, 20],
  night: [21, 10],
};

export function formatClock(totalMin: number): string {
  let m = Math.round(totalMin);
  let h = Math.floor(m / 60);
  m = m % 60;
  h = ((h % 24) + 24) % 24;
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function journeyClock(
  tod: TimeOfDay,
  doorMin: number,
): { departLabel: string; arriveLabel: string } {
  const [h, m] = DEPART[tod];
  const start = h * 60 + m;
  return {
    departLabel: formatClock(start),
    arriveLabel: formatClock(start + doorMin),
  };
}
