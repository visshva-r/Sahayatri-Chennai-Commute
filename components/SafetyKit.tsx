"use client";

import { useMemo, useState } from "react";
import type { RouteOption, TimeOfDay } from "@/lib/types";
import { shareOrCopy, tripSummaryText } from "@/lib/share";
import { AlertIcon, CheckIcon, CopyIcon, PhoneIcon, ShareIcon, ShieldIcon } from "./icons";

const CHECKS = [
  { id: "share", label: "Share this trip summary with someone you trust" },
  { id: "light", label: "If you arrive after dark, prefer the well-lit exit and a busy last mile" },
  { id: "numbers", label: "Keep 112 (emergency) and 1091 (women helpline) saved on your phone" },
  { id: "coach", label: "On metro or rail, sit near the guard or in a busier coach" },
];

export function SafetyKit({
  fromName,
  toName,
  option,
  timeOfDay,
}: {
  fromName: string;
  toName: string;
  option: RouteOption;
  timeOfDay: TimeOfDay;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [shareState, setShareState] = useState<"idle" | "shared" | "copied" | "failed">("idle");

  const text = useMemo(
    () => tripSummaryText({ fromName, toName, option, timeOfDay }),
    [fromName, toName, option, timeOfDay],
  );

  const share = async () => {
    const result = await shareOrCopy(text);
    setShareState(result);
    if (result === "shared" || result === "copied") {
      setDone((d) => ({ ...d, share: true }));
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
          <ShieldIcon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-navy">Safety kit</h3>
          <p className="text-[11px] text-muted">A checklist and numbers — this app does not dispatch emergency services.</p>
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {CHECKS.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={Boolean(done[item.id])}
                onChange={() => setDone((d) => ({ ...d, [item.id]: !d[item.id] }))}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-teal"
              />
              <span>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={share}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
        >
          <ShareIcon className="h-4 w-4" />
          Share trip status
        </button>
        <button
          type="button"
          onClick={async () => {
            const result = await shareOrCopy(text);
            setShareState(result === "shared" ? "copied" : result);
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50"
        >
          <CopyIcon className="h-4 w-4" />
          Copy
        </button>
      </div>
      {shareState === "copied" && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-teal">
          <CheckIcon className="h-3.5 w-3.5" /> Trip status copied — paste it to a contact.
        </p>
      )}
      {shareState === "shared" && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-teal">
          <CheckIcon className="h-3.5 w-3.5" /> Shared from your device. We do not stream live GPS.
        </p>
      )}
      {shareState === "failed" && (
        <p className="mt-2 text-xs text-amber-700">Share was cancelled or blocked. You can still copy the text.</p>
      )}

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
          <AlertIcon className="h-4 w-4" />
          If you feel unsafe — you take the call
        </p>
        <ul className="mt-2 space-y-1.5 text-xs text-amber-900">
          <li className="flex items-start gap-2">
            <PhoneIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>India emergency: <strong>112</strong> · Women helpline: <strong>1091</strong></span>
          </li>
          <li>Share your live location from your phone (WhatsApp / Maps), not from this demo.</li>
          <li>Move to a staffed station, lit stop or shop if you can.</li>
        </ul>
      </div>
    </div>
  );
}
