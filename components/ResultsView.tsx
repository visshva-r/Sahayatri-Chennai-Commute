"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { PlanRequest, RouteOption } from "@/lib/types";
import { RouteCard, LegList } from "./RouteCard";
import { CompanionMode } from "./CompanionMode";
import { JourneyForm } from "./JourneyForm";
import { AssistantBox } from "./AssistantBox";
import { ComparePanel } from "./ComparePanel";
import { SafetyExplain } from "./SafetyExplain";
import { SafetyKit } from "./SafetyKit";
import { EmptyState } from "./EmptyState";
import { TOD_LABEL } from "@/lib/explain";
import { getPreset } from "@/lib/presets";
import {
  PinIcon,
  ComfortIcon,
  LeafIcon,
  ClockIcon,
  RupeeIcon,
  TransferIcon,
  SparkleIcon,
  CompareIcon,
} from "./icons";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[16rem] w-full items-center justify-center bg-slate-100 text-sm text-muted">
      Loading map...
    </div>
  ),
});

export function ResultsView({
  options,
  request,
  fromName,
  toName,
  query,
  presetId,
}: {
  options: RouteOption[];
  request: PlanRequest;
  fromName: string;
  toName: string;
  query?: string;
  presetId?: string;
}) {
  const [selectedId, setSelectedId] = useState(options[0]?.id ?? "");
  const [companionActive, setCompanionActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deviation, setDeviation] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [view, setView] = useState<"routes" | "compare">("routes");

  const journeyKey = `${request.fromId}|${request.toId}|${request.priority}|${request.timeOfDay}|${options.map((o) => o.id).join(",")}`;

  useEffect(() => {
    setSelectedId(options[0]?.id ?? "");
    setCompanionActive(false);
    setProgress(0);
    setDeviation(false);
    setView("routes");
    // Reset only when the journey or the set of plans changes, not on unrelated rerenders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyKey]);

  const selected = useMemo(
    () => options.find((o) => o.id === selectedId) ?? options[0],
    [options, selectedId],
  );

  const greenestId = useMemo(
    () =>
      options.reduce(
        (best, o) => (o.co2SavedGrams > (best?.co2SavedGrams ?? -1) ? o : best),
        options[0],
      )?.id,
    [options],
  );

  useEffect(() => {
    if (!companionActive || progress >= 1) return;
    const id = setInterval(() => {
      setProgress((p) => Math.min(1, +(p + 0.02).toFixed(3)));
    }, 350);
    return () => clearInterval(id);
  }, [companionActive, progress]);

  const selectRoute = (id: string) => {
    setSelectedId(id);
    setCompanionActive(false);
    setProgress(0);
    setDeviation(false);
    setView("routes");
  };

  const toggleCompanion = () => {
    setCompanionActive((a) => {
      const next = !a;
      if (next) {
        setProgress(0);
        setDeviation(false);
      }
      return next;
    });
  };

  if (!selected) {
    return (
      <EmptyState
        title="No route found"
        body={`We could not connect ${fromName} and ${toName} on the seeded network. Try another pair or a demo preset.`}
        actionLabel="Try a demo commute"
        actionHref="/#presets"
      >
        <JourneyForm
          compact
          initial={{ from: request.fromId, to: request.toId, priority: request.priority, tod: request.timeOfDay }}
        />
      </EmptyState>
    );
  }

  const PRIORITY_LABEL = {
    fastest: "Fastest",
    cheapest: "Cheapest",
    comfortable: "Comfortable",
    safest: "Safest",
  } as const;

  const preset = getPreset(presetId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {preset && (
        <div className="mb-4 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2 text-sm text-navy">
          <span className="font-semibold">{preset.kicker}:</span> {preset.blurb}
        </div>
      )}
      {query && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-teal/30 bg-teal/5 px-3 py-2 text-sm">
          <SparkleIcon className="w-4 h-4 text-teal" />
          <span className="text-muted">From your words</span>
          <span className="font-medium text-navy">&ldquo;{query}&rdquo;</span>
          <span className="text-muted">understood as</span>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-navy shadow-card">
            {PRIORITY_LABEL[request.priority]}
          </span>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-navy shadow-card">
            {TOD_LABEL[request.timeOfDay]}
          </span>
        </div>
      )}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 pt-1 text-sm">
          <PinIcon className="w-4 h-4 shrink-0 text-navy" />
          <span className="font-semibold text-navy">{fromName}</span>
          <span className="text-muted">to</span>
          <span className="font-semibold text-navy">{toName}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-muted">
            {TOD_LABEL[request.timeOfDay]}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={() => setView("routes")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                view === "routes" ? "bg-navy text-white" : "text-muted hover:text-navy"
              }`}
            >
              Routes
            </button>
            <button
              type="button"
              onClick={() => setView("compare")}
              className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold ${
                view === "compare" ? "bg-navy text-white" : "text-muted hover:text-navy"
              }`}
            >
              <CompareIcon className="h-3.5 w-3.5" />
              Compare
            </button>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setEditOpen((o) => !o)}
              className="cursor-pointer select-none rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-slate-50"
            >
              Edit journey
            </button>
            {editOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setEditOpen(false)} aria-hidden />
                <div className="fixed inset-x-3 bottom-3 z-20 max-h-[min(80vh,640px)] space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-lg sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:mt-2 sm:max-h-[70vh] sm:w-[min(92vw,420px)]">
                  <AssistantBox tone="light" compact onNavigate={() => setEditOpen(false)} />
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted">
                    <span className="h-px flex-1 bg-slate-200" />
                    or set it manually
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>
                  <JourneyForm
                    compact
                    initial={{ from: request.fromId, to: request.toId, priority: request.priority, tod: request.timeOfDay }}
                    onNavigate={() => setEditOpen(false)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {view === "compare" ? (
        <ComparePanel
          options={options}
          selectedId={selected.id}
          priority={request.priority}
          onSelect={selectRoute}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[370px_1fr]">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {options.length} route {options.length === 1 ? "option" : "options"}
            </p>
            {options.map((o, i) => (
              <RouteCard
                key={o.id}
                option={o}
                selected={o.id === selected.id}
                recommended={i === 0}
                greenest={o.id === greenestId}
                onSelect={() => selectRoute(o.id)}
              />
            ))}
          </div>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-card">
              <div className="h-64 w-full min-h-[16rem] sm:h-80">
                <MapView legs={selected.legs} progress={companionActive ? progress : undefined} />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted">
                Leave {selected.departLabel} · Arrive {selected.arriveLabel}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatPill icon={<ClockIcon className="w-4 h-4" />} label="Travel time" value={`${Math.round(selected.totalTimeMin)} min`} />
                <StatPill icon={<RupeeIcon className="w-4 h-4" />} label="Fare" value={`₹${selected.totalCostINR}`} />
                <StatPill icon={<ComfortIcon className="w-4 h-4" />} label="Comfort" value={`${selected.comfortScore}/100`} />
                <StatPill
                  icon={<LeafIcon className="w-4 h-4" />}
                  label="CO2 saved vs car"
                  value={`${(selected.co2SavedGrams / 1000).toFixed(1)} kg`}
                  green
                />
              </div>
              <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                <TransferIcon className="w-3.5 h-3.5" />
                {selected.transfers} {selected.transfers === 1 ? "transfer" : "transfers"} · {selected.totalDistanceKm.toFixed(1)} km
                · {Math.round(selected.totalWaitMin)} min typical waits
                · {Math.round(selected.doorToDoorMin)} min door to door
              </p>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
                <h3 className="mb-3 text-sm font-semibold text-navy">Step by step</h3>
                <LegList legs={selected.legs} />
              </div>
              <SafetyExplain option={selected} timeOfDay={request.timeOfDay} />
            </div>

            <CompanionMode
              option={selected}
              active={companionActive}
              progress={progress}
              deviation={deviation}
              onToggle={toggleCompanion}
              onSimulateDeviation={() => setDeviation(true)}
            />

            <SafetyKit
              fromName={fromName}
              toName={toName}
              option={selected}
              timeOfDay={request.timeOfDay}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  green,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-card">
      <div className={`flex items-center gap-1.5 text-xs ${green ? "text-green-600" : "text-muted"}`}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-semibold text-navy">{value}</div>
    </div>
  );
}
