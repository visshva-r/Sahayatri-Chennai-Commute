import Link from "next/link";
import { SiteHeader } from "@/components/Brand";
import { ResultsView } from "@/components/ResultsView";
import { getStop } from "@/lib/data/chennai";
import { planJourney } from "@/lib/routing";
import type { Priority, TimeOfDay } from "@/lib/types";

const PRIORITIES: Priority[] = ["fastest", "cheapest", "comfortable", "safest"];
const TIMES: TimeOfDay[] = ["day", "evening", "night"];

function pick<T extends string>(v: string | string[] | undefined, allowed: T[], fallback: T): T {
  const s = Array.isArray(v) ? v[0] : v;
  return allowed.includes(s as T) ? (s as T) : fallback;
}

export default function ResultsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const fromId = (Array.isArray(searchParams.from) ? searchParams.from[0] : searchParams.from) ?? "";
  const toId = (Array.isArray(searchParams.to) ? searchParams.to[0] : searchParams.to) ?? "";
  const priority = pick<Priority>(searchParams.priority, PRIORITIES, "fastest");
  const timeOfDay = pick<TimeOfDay>(searchParams.tod, TIMES, "day");
  const query = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;

  const fromStop = getStop(fromId);
  const toStop = getStop(toId);

  if (!fromStop || !toStop) {
    return (
      <main className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-lg font-semibold text-navy">Pick your stops</p>
          <p className="mt-2 text-sm text-muted">Start a journey from the home page to see route options.</p>
          <Link href="/" className="mt-6 inline-block rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white">
            Go to planner
          </Link>
        </div>
      </main>
    );
  }

  const options = planJourney(fromId, toId, priority, timeOfDay);

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <ResultsView
        options={options}
        request={{ fromId, toId, priority, timeOfDay }}
        fromName={fromStop.name}
        toName={toStop.name}
        query={query}
      />
    </main>
  );
}
