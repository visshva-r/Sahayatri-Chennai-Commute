import { SELECTABLE_STOPS } from "./data/chennai";
import type { Priority, TimeOfDay } from "./types";

export interface ParsedQuery {
  fromId?: string;
  toId?: string;
  priority: Priority;
  timeOfDay: TimeOfDay;
}

// Extra colloquial names people use that the official stop name does not cover.
const MANUAL_ALIASES: Record<string, string[]> = {
  airport: ["airport"],
  central: ["chennai central", "central"],
  tnagar: ["t nagar", "tnagar", "panagal"],
  annanagar_east: ["anna nagar east", "anna nagar"],
  koyambedu: ["cmbt", "koyambedu"],
  mylapore: ["thirumayilai", "mylapore"],
  adyar: ["adyar"],
  besantnagar: ["besant nagar", "besantnagar"],
  agdms: ["ag dms", "agdms"],
};

interface AliasEntry {
  id: string;
  alias: string;
}

function clean(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Flat alias list, longest-first, so "anna nagar tower" wins over "anna nagar".
const ALIAS_ENTRIES: AliasEntry[] = (() => {
  const out: AliasEntry[] = [];
  for (const s of SELECTABLE_STOPS) {
    const aliases = new Set<string>([clean(s.name), ...(MANUAL_ALIASES[s.id] ?? [])]);
    for (const a of aliases) if (a) out.push({ id: s.id, alias: a });
  }
  return out.sort((a, b) => b.alias.length - a.alias.length);
})();

function detectPriority(q: string): Priority {
  if (/\b(safe|safety|safest|secure|alone|women|woman|girl|well.?lit)\b/.test(q)) return "safest";
  if (/\b(cheap|cheapest|cheaper|budget|affordable|low.?cost|save money|less money)\b/.test(q)) return "cheapest";
  if (/\b(comfort|comfortable|relax|relaxing|seat|seated|fewer transfers|less transfers|easy)\b/.test(q)) return "comfortable";
  if (/\b(fast|fastest|quick|quickest|asap|hurry|soon|in time|rush)\b/.test(q)) return "fastest";
  return "fastest";
}

function detectTimeOfDay(q: string): TimeOfDay {
  if (/\b(night|late|midnight|2[0-3]:\d\d)\b/.test(q)) return "night";

  const m = q.match(/(\d{1,2})\s*(?::\d\d)?\s*(am|pm)/);
  if (m) {
    let hour = parseInt(m[1], 10);
    const pm = m[2] === "pm";
    if (pm && hour !== 12) hour += 12;
    if (!pm && hour === 12) hour = 0;
    if (hour >= 20 || hour < 5) return "night";
    if (hour >= 18) return "evening";
    return "day";
  }

  if (/\b(evening|dusk|after work)\b/.test(q)) return "evening";
  return "day";
}

function detectStops(q: string): { fromId?: string; toId?: string } {
  let scratch = q;
  const found: { id: string; idx: number }[] = [];

  for (const e of ALIAS_ENTRIES) {
    if (found.some((f) => f.id === e.id)) continue;
    const idx = scratch.indexOf(e.alias);
    if (idx >= 0) {
      found.push({ id: e.id, idx });
      // Blank the matched span (same length) so substrings don't re-match.
      scratch = scratch.slice(0, idx) + " ".repeat(e.alias.length) + scratch.slice(idx + e.alias.length);
    }
  }

  if (found.length === 0) return {};
  found.sort((a, b) => a.idx - b.idx);

  let fromId: string | undefined;
  let toId: string | undefined;

  // Anchor on the word "to": the stop after it is the destination, the closest
  // stop before it is the origin. This handles "from X to Y" and "to Y" alike.
  const toIdx = q.search(/\bto\b/);
  if (toIdx >= 0) {
    const before = found.filter((f) => f.idx < toIdx);
    const after = found.filter((f) => f.idx > toIdx);
    if (after.length) toId = after[0].id;
    if (before.length) fromId = before[before.length - 1].id;
  }

  // Fill any remaining slot from the leftover matches, preserving order.
  const used = new Set([fromId, toId].filter(Boolean) as string[]);
  const rest = found.filter((f) => !used.has(f.id));
  if (!fromId && rest.length) fromId = rest.shift()!.id;
  if (!toId && rest.length) toId = rest.shift()!.id;

  return { fromId, toId };
}

/**
 * Deterministic, offline parser. Used as the guaranteed fallback when the LLM
 * is unavailable, and good enough on its own for common phrasings.
 */
export function parseQueryLocal(query: string): ParsedQuery {
  const q = clean(query);
  return {
    ...detectStops(q),
    priority: detectPriority(q),
    timeOfDay: detectTimeOfDay(q),
  };
}
