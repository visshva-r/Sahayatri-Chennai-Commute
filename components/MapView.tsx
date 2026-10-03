"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LatLngBoundsExpression, LayerGroup, Map as LMap, Marker } from "leaflet";
import type { Mode, RouteLeg } from "@/lib/types";
import { MODE_LABEL } from "./icons";

const MODE_HEX: Record<Mode, string> = {
  metro: "#1A56DB",
  rail: "#6366F1",
  bus: "#12B786",
  walk: "#64748B",
  auto: "#F59E0B",
};

function pinIcon(L: typeof import("leaflet"), color: string, label: string) {
  return L.divIcon({
    className: "sahayatri-pin",
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;border:2px solid #fff"><span style="transform:rotate(45deg);color:#fff;font:700 12px sans-serif">${label}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

function dotIcon(L: typeof import("leaflet"), color: string) {
  return L.divIcon({
    className: "sahayatri-dot",
    html: `<div style="background:#fff;width:16px;height:16px;border-radius:50%;border:3px solid ${color};box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function routeKey(legs: RouteLeg[]): string {
  return legs.map((l) => `${l.mode}:${l.fromStop.id}>${l.toStop.id}`).join("|");
}

export default function MapView({ legs, progress }: { legs: RouteLeg[]; progress?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const liveRef = useRef<Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  const signature = useMemo(() => routeKey(legs), [legs]);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (!cancelled) setL(mod.default ?? (mod as unknown as typeof import("leaflet")));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!L || !containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
      tapTolerance: 20,
      zoomSnap: 0.25,
    }).setView([13.05, 80.24], 12);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
      subdomains: "abcd",
      attribution: "&copy; OpenStreetMap &copy; CARTO",
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setReady(true);

    const kick = () => map.invalidateSize();
    const t1 = window.setTimeout(kick, 80);
    const t2 = window.setTimeout(kick, 400);
    const observer = new ResizeObserver(kick);
    observer.observe(containerRef.current);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      liveRef.current = null;
      setReady(false);
    };
  }, [L]);

  useEffect(() => {
    if (!ready || !L || !mapRef.current || !layerRef.current) return;
    const map = mapRef.current;
    const group = layerRef.current;
    group.clearLayers();
    liveRef.current = null;
    if (legs.length === 0) return;

    const all: [number, number][] = [];
    legs.forEach((leg) => {
      const pts = leg.path.map((p) => [p.lat, p.lng] as [number, number]);
      all.push(...pts);
      L.polyline(pts, {
        color: MODE_HEX[leg.mode],
        weight: 6,
        opacity: 0.92,
        dashArray: leg.mode === "walk" ? "1 10" : undefined,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(group);
    });

    const start = legs[0].fromStop;
    const end = legs[legs.length - 1].toStop;
    L.marker([start.lat, start.lng], { icon: pinIcon(L, "#0B1F3A", "A"), keyboard: true })
      .bindPopup(start.name)
      .addTo(group);
    L.marker([end.lat, end.lng], { icon: pinIcon(L, "#12B786", "B"), keyboard: true })
      .bindPopup(end.name)
      .addTo(group);

    for (let i = 0; i < legs.length - 1; i++) {
      const t = legs[i].toStop;
      L.marker([t.lat, t.lng], { icon: dotIcon(L, MODE_HEX[legs[i].mode]) })
        .bindPopup(`Transfer at ${t.name}`)
        .addTo(group);
    }

    map.invalidateSize();
    map.fitBounds(all as LatLngBoundsExpression, { padding: [36, 36], maxZoom: 14, animate: false });
  }, [L, ready, signature, legs]);

  useEffect(() => {
    if (!ready || !L || !layerRef.current) return;
    if (liveRef.current) {
      liveRef.current.remove();
      liveRef.current = null;
    }
    if (typeof progress !== "number" || legs.length === 0) return;
    const all = legs.flatMap((leg) => leg.path.map((p) => [p.lat, p.lng] as [number, number]));
    if (all.length < 2) return;
    const idx = Math.min(all.length - 1, Math.max(0, Math.round(progress * (all.length - 1))));
    liveRef.current = L.marker(all[idx], { icon: dotIcon(L, "#DC2626"), zIndexOffset: 800 })
      .bindPopup("Demo position (simulated, not GPS)")
      .addTo(layerRef.current);
  }, [L, ready, legs, progress]);

  const usedModes = useMemo(() => Array.from(new Set(legs.map((l) => l.mode))), [legs]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full"
        role="img"
        aria-label={
          legs.length
            ? `Map from ${legs[0].fromStop.name} to ${legs[legs.length - 1].toStop.name}`
            : "Route map"
        }
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-sm text-muted">
          Loading map...
        </div>
      )}
      {usedModes.length > 0 && (
        <div className="pointer-events-none absolute bottom-2 left-2 z-[500] flex max-w-[calc(100%-5.5rem)] flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 text-[11px] font-medium text-ink shadow-card">
          {usedModes.map((m) => (
            <span key={m} className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-4 rounded-full" style={{ background: MODE_HEX[m] }} />
              {MODE_LABEL[m]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
