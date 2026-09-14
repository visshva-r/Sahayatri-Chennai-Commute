import type { RouteOption, TimeOfDay } from "./types";

const TOD_LABEL: Record<TimeOfDay, string> = {
  day: "Daytime",
  evening: "Evening",
  night: "Night",
};

/** Plain-text itinerary a rider can paste to a trusted contact. Not live GPS. */
export function tripSummaryText(args: {
  fromName: string;
  toName: string;
  option: RouteOption;
  timeOfDay: TimeOfDay;
}): string {
  const { fromName, toName, option, timeOfDay } = args;
  const steps = option.legs
    .map((leg, i) => {
      const line = leg.line ?? leg.mode;
      return `${i + 1}. ${line}: ${leg.fromStop.name} to ${leg.toStop.name} (${Math.round(leg.timeMin)} min)`;
    })
    .join("\n");

  return [
    "Sahayatri trip plan",
    `${fromName} to ${toName} (${TOD_LABEL[timeOfDay]})`,
    `Leave ${option.departLabel} · Arrive ${option.arriveLabel}`,
    `${Math.round(option.doorToDoorMin)} min door to door · ₹${option.totalCostINR} · Safe-Route ${option.safetyScore} (${option.safetyBand})`,
    "",
    steps,
    "",
    "This is a planned itinerary, not live GPS tracking.",
  ].join("\n");
}

export async function shareOrCopy(text: string): Promise<"shared" | "copied" | "failed"> {
  if (typeof navigator === "undefined") return "failed";
  try {
    if (navigator.share) {
      await navigator.share({ title: "Sahayatri trip", text });
      return "shared";
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") return "failed";
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
