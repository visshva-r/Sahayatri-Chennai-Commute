import { NextResponse } from "next/server";
import { getStop } from "@/lib/data/chennai";
import { planJourney } from "@/lib/routing";
import type { PlanResponse, Priority, TimeOfDay } from "@/lib/types";

const PRIORITIES: Priority[] = ["fastest", "cheapest", "comfortable", "safest"];
const TIMES: TimeOfDay[] = ["day", "evening", "night"];

function plan(fromId: string, toId: string, priority: Priority, timeOfDay: TimeOfDay) {
  if (!getStop(fromId) || !getStop(toId)) {
    return NextResponse.json({ error: "Unknown origin or destination stop." }, { status: 400 });
  }
  if (fromId === toId) {
    return NextResponse.json({ error: "Origin and destination must differ." }, { status: 400 });
  }
  if (!PRIORITIES.includes(priority)) priority = "fastest";
  if (!TIMES.includes(timeOfDay)) timeOfDay = "day";

  const options = planJourney(fromId, toId, priority, timeOfDay);
  const body: PlanResponse = { request: { fromId, toId, priority, timeOfDay }, options };
  return NextResponse.json(body);
}

export async function POST(req: Request) {
  try {
    const { fromId, toId, priority, timeOfDay } = await req.json();
    return plan(fromId, toId, priority ?? "fastest", timeOfDay ?? "day");
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
}

export function GET(req: Request) {
  const url = new URL(req.url);
  const fromId = url.searchParams.get("from") ?? "";
  const toId = url.searchParams.get("to") ?? "";
  const priority = (url.searchParams.get("priority") as Priority) ?? "fastest";
  const timeOfDay = (url.searchParams.get("tod") as TimeOfDay) ?? "day";
  return plan(fromId, toId, priority, timeOfDay);
}
