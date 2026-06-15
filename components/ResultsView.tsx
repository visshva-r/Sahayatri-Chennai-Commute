"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { PlanRequest, RouteOption } from "@/lib/types";
import { RouteCard, LegList } from "./RouteCard";
import { CompanionMode } from "./CompanionMode";
import { ScoreRing, SafetyBreakdownBars, bandColor, safetyVerdict } from "./SafetyMeter";
import { JourneyForm } from "./JourneyForm";
import { AssistantBox } from "./AssistantBox";
import { PinIcon, ComfortIcon, LeafIcon, ClockIcon, RupeeIcon, TransferIcon, SparkleIcon, InfoIcon } from "./icons";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-muted">
      Loading map...
    </div>
  ),
});

const TOD_LABEL = { day: "Daytime", evening: "Evening", night: "Night" } as const;

export function ResultsView({
  options,
  request,
  fromName,
  toName,
  query,
}: {
  options: RouteOption[];
  request: PlanRequest;
  fromName: string;
  toName: string;
  query?: string;
}) {
  const [selectedId, setSelectedId] = useState(options[0]?.id ?? "");
  const [companionActive, setCompanionActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deviation, setDeviation] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [safetyInfoOpen, setSafetyInfoOpen] = useState(false);

  // When a new search loads (new options), reset selection to the top route.
  useEffect(() => {
    setSelectedId(options[0]?.id ?? "");
    setCompanionActive(false);
    setProgress(0);
    setDeviation(false);
  }, [options]);

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
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-lg font-semibold text-navy">No route found</p>
        <p className="mt-2 text-sm text-muted">
          We could not connect {fromName} and {toName}. Try a different pair of stops.
        </p>
        <div className="mt-6 text-left">
          <JourneyForm compact initial={{ from: request.fromId, to: request.toId, priority: request.priority, tod: request.timeOfDay }} />
        </div>
      </div>
    );
  }

  const c = bandColor(selected.safetyBand);

  const PRIORITY_LABEL = {
    fastest: "Fastest",
    cheapest: "Cheapest",
    comfortable: "Comfortable",
    safest: "Safest",
  } as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
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
        <div className="flex items-center gap-2 pt-1 text-sm">
          <PinIcon className="w-4 h-4 text-navy" />
          <span className="font-semibold text-navy">{fromName}</span>
          <span className="text-muted">to</span>
          <span className="font-semibold text-navy">{toName}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-muted">
            {TOD_LABEL[request.timeOfDay]}
          </span>
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
              <div className="absolute right-0 z-20 mt-2 w-[min(92vw,420px)] space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
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
            <div className="h-72 w-full sm:h-80">
              <MapView legs={selected.legs} progress={companionActive ? progress : undefined} />
            </div>
          </div>

          <div>
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
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <TransferIcon className="w-3.5 h-3.5" />
              {selected.transfers} {selected.transfers === 1 ? "transfer" : "transfers"} · {selected.totalDistanceKm.toFixed(1)} km total
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
              <h3 className="mb-3 text-sm font-semibold text-navy">Step by step</h3>
              <LegList legs={selected.legs} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
              <div className="mb-3 flex items-center gap-3">
                <ScoreRing score={selected.safetyScore} band={selected.safetyBand} size={64} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-navy">Safe-Route Score</h3>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSafetyInfoOpen((o) => !o)}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-muted transition hover:bg-slate-100 hover:text-navy"
                        aria-label="How the Safe-Route Score works"
                      >
                        <InfoIcon className="h-4 w-4" />
                      </button>
                      {safetyInfoOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setSafetyInfoOpen(false)} aria-hidden />
                          <div className="absolute left-0 top-7 z-20 w-72 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-lg">
                            <p className="mb-2 text-xs font-semibold text-navy">How it&rsquo;s scored</p>
                            <p className="mb-2 text-[11px] leading-relaxed text-muted">
                              A 0&ndash;100 score from five signals, weighted by how much each affects real safety:
                            </p>
                            <ul className="space-y-1 text-[11px] text-ink">
                              <li className="flex justify-between"><span>Women&rsquo;s safety feedback</span><span className="font-semibold">30%</span></li>
                              <li className="flex justify-between"><span>Street lighting</span><span className="font-semibold">22%</span></li>
                              <li className="flex justify-between"><span>CCTV coverage</span><span className="font-semibold">18%</span></li>
                              <li className="flex justify-between"><span>Footfall</span><span className="font-semibold">15%</span></li>
                              <li className="flex justify-between"><span>Help points</span><span className="font-semibold">15%</span></li>
                            </ul>
                            <p className="mt-2 text-[11px] leading-relaxed text-muted">
                              Then adjusted for how exposed your mode is (a metro coach beats a walk) and the time of day (lower after dark), and time-weighted across every leg.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${c.bg} ${c.text} ${c.border}`}>
                    {selected.safetyBand}
                  </span>
                </div>
              </div>
              <p className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-ink">
                {safetyVerdict(selected.breakdown)}
              </p>
              <SafetyBreakdownBars breakdown={selected.breakdown} />
            </div>
          </div>

          <CompanionMode
            option={selected}
            active={companionActive}
            progress={progress}
            deviation={deviation}
            onToggle={toggleCompanion}
            onSimulateDeviation={() => setDeviation(true)}
          />
        </div>
      </div>
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
