import type { Priority, TimeOfDay } from "./types";

export interface DemoPreset {
  id: string;
  kicker: string;
  title: string;
  blurb: string;
  fromId: string;
  toId: string;
  priority: Priority;
  timeOfDay: TimeOfDay;
  fromLabel: string;
  toLabel: string;
}

/** Seeded Chennai journeys that always produce a rich compare view. */
export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "office",
    kicker: "Weekday office",
    title: "Guindy IT to Anna Nagar",
    blurb: "A typical cross-city office hop. Compare metro versus bus on time, fare and safety.",
    fromId: "guindy",
    toId: "annanagar_east",
    priority: "fastest",
    timeOfDay: "day",
    fromLabel: "Guindy",
    toLabel: "Anna Nagar East",
  },
  {
    id: "college",
    kicker: "College run",
    title: "Velachery to T. Nagar",
    blurb: "MRTS, bus and last-mile auto for a south-Chennai campus to market stretch.",
    fromId: "velachery",
    toId: "tnagar",
    priority: "comfortable",
    timeOfDay: "day",
    fromLabel: "Velachery",
    toLabel: "T. Nagar",
  },
  {
    id: "airport",
    kicker: "Airport arrival",
    title: "Airport to Central",
    blurb: "Metro Blue Line versus a suburban rail hop via Tirusulam, plus a bus alternative.",
    fromId: "airport",
    toId: "central",
    priority: "fastest",
    timeOfDay: "day",
    fromLabel: "Chennai Airport",
    toLabel: "Chennai Central",
  },
  {
    id: "latenight",
    kicker: "After 9pm",
    title: "Late-night way home",
    blurb: "Same Guindy to Anna Nagar pair, ranked for safety after dark.",
    fromId: "guindy",
    toId: "annanagar_east",
    priority: "safest",
    timeOfDay: "night",
    fromLabel: "Guindy",
    toLabel: "Anna Nagar East",
  },
];

export function presetHref(p: DemoPreset): string {
  return `/results?from=${p.fromId}&to=${p.toId}&priority=${p.priority}&tod=${p.timeOfDay}&preset=${p.id}`;
}

export function getPreset(id?: string | null): DemoPreset | undefined {
  if (!id) return undefined;
  return DEMO_PRESETS.find((p) => p.id === id);
}
