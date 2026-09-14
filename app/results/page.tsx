import { SiteHeader } from "@/components/Brand";
import { ResultsView } from "@/components/ResultsView";
import { EmptyState } from "@/components/EmptyState";
import { getStop } from "@/lib/data/chennai";
import { planJourney } from "@/lib/routing";
import type { Priority, TimeOfDay } from "@/lib/types";

const PRIORITIES: Priority[] = ["fastest", "cheapest", "comfortable", "safest"];
const TIMES: TimeOfDay[] = ["day", "evening", "night"];

function pick<T extends string>(v: string | string[] | undefined, allowed: T[], fallback: T): T {
  const s = Array.isArray(v) ? v[0] : v;
  return allowed.includes(s as T) ? (s as T) : fallback;
}

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default function ResultsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const fromId = first(searchParams.from);
  const toId = first(searchParams.to);
  const priority = pick<Priority>(searchParams.priority, PRIORITIES, "fastest");
  const timeOfDay = pick<TimeOfDay>(searchParams.tod, TIMES, "day");
  const query = first(searchParams.q) || undefined;
  const presetId = first(searchParams.preset) || undefined;

  const fromStop = getStop(fromId);
  const toStop = getStop(toId);

  if (!fromId || !toId) {
    return (
      <main className="min-h-screen">
        <SiteHeader />
        <EmptyState
          title="Pick your stops"
          body="Start a journey from the home page, or tap a Chennai demo commute."
          actionLabel="Open planner"
        />
      </main>
    );
  }

  if (!fromStop || !toStop) {
    return (
      <main className="min-h-screen">
        <SiteHeader />
        <EmptyState
          title="Unknown stop"
          body="That origin or destination is not on the seeded Chennai network."
          actionLabel="Choose a listed stop"
        />
      </main>
    );
  }

  if (fromId === toId) {
    return (
      <main className="min-h-screen">
        <SiteHeader />
        <EmptyState
          title="Same origin and destination"
          body="Pick two different stops to plan a journey."
        />
      </main>
    );
  }

  const options = planJourney(fromId, toId, priority, timeOfDay);

  return (
    <main className="min-h-screen pb-8">
      <SiteHeader />
      <ResultsView
        options={options}
        request={{ fromId, toId, priority, timeOfDay }}
        fromName={fromStop.name}
        toName={toStop.name}
        query={query}
        presetId={presetId}
      />
    </main>
  );
}
