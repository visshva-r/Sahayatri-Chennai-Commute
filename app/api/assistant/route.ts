import { NextResponse } from "next/server";
import { getStop, SELECTABLE_STOPS } from "@/lib/data/chennai";
import { parseQueryLocal, type ParsedQuery } from "@/lib/assistant";
import type { Priority, TimeOfDay } from "@/lib/types";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const PRIORITIES: Priority[] = ["fastest", "cheapest", "comfortable", "safest"];
const TIMES: TimeOfDay[] = ["day", "evening", "night"];

/** Ask Gemini to turn free text into a structured trip request. Returns null on any issue. */
async function parseWithGemini(query: string): Promise<ParsedQuery | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const ids = SELECTABLE_STOPS.map((s) => s.id);
  const stopList = SELECTABLE_STOPS.map((s) => `${s.id} = ${s.name}`).join("\n");

  const prompt = [
    "You convert a commuter's request into a structured trip for a Chennai journey planner.",
    "Pick fromId and toId ONLY from this list of stop ids:",
    stopList,
    "",
    "Rules:",
    "- If a place is not listed, choose the nearest listed stop.",
    "- priority: 'safest' if they mention safety, travelling alone, women, or being out at night for safety; 'cheapest' for budget/cheap; 'comfortable' for comfort/fewer transfers; otherwise 'fastest'.",
    "- timeOfDay: infer from clock times (e.g. '9 pm' or 'late' = night, '6-7 pm' = evening), else 'day'.",
    `User request: "${query}"`,
  ].join("\n");

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          fromId: { type: "STRING", enum: ids },
          toId: { type: "STRING", enum: ids },
          priority: { type: "STRING", enum: PRIORITIES },
          timeOfDay: { type: "STRING", enum: TIMES },
        },
        required: ["fromId", "toId", "priority", "timeOfDay"],
      },
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const parsed = JSON.parse(text);
    if (!getStop(parsed.fromId) || !getStop(parsed.toId)) return null;
    if (!PRIORITIES.includes(parsed.priority)) parsed.priority = "fastest";
    if (!TIMES.includes(parsed.timeOfDay)) parsed.timeOfDay = "day";
    return parsed as ParsedQuery;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: Request) {
  let query = "";
  try {
    ({ query } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Empty query." }, { status: 400 });
  }

  let parsed = await parseWithGemini(query);
  let source: "gemini" | "rules" = "gemini";
  if (!parsed) {
    parsed = parseQueryLocal(query);
    source = "rules";
  }

  const understood = Boolean(parsed.fromId && parsed.toId && parsed.fromId !== parsed.toId);
  return NextResponse.json({ ...parsed, source, understood });
}
