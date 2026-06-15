"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LatLngBoundsExpression, LayerGroup, Map as LMap } from "leaflet";
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
    className: "",
    html: `<div style="background:${color};width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;border:2px solid #fff"><span style="transform:rotate(45deg);color:#fff;font:600 11px sans-serif">${label}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });
}

function dotIcon(L: typeof import("leaflet"), color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:#fff;width:14px;height:14px;border-radius:50%;border:3px solid ${color};box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function MapView({ legs, progress }: { legs: RouteLeg[]; progress?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

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
    const map = L.map(containerRef.current, { zoomControl: true }).setView([13.05, 80.24], 12);
    // CARTO Positron: a clean, light basemap (Google-Maps-like) over OpenStreetMap data. No API key.
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
      subdomains: "abcd",
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 120);
  }, [L]);

  useEffect(() => {
    if (!L || !mapRef.current || !layerRef.current) return;
    const map = mapRef.current;
    const group = layerRef.current;
    group.clearLayers();
    if (legs.length === 0) return;

    const all: [number, number][] = [];
    legs.forEach((leg) => {
      const pts = leg.path.map((p) => [p.lat, p.lng] as [number, number]);
      all.push(...pts);
      L.polyline(pts, {
        color: MODE_HEX[leg.mode],
        weight: 5,
        opacity: 0.9,
        dashArray: leg.mode === "walk" ? "2 9" : undefined,
      }).addTo(group);
    });

    const start = legs[0].fromStop;
    const end = legs[legs.length - 1].toStop;
    L.marker([start.lat, start.lng], { icon: pinIcon(L, "#0B1F3A", "A") })
      .bindPopup(start.name)
      .addTo(group);
    L.marker([end.lat, end.lng], { icon: pinIcon(L, "#12B786", "B") })
      .bindPopup(end.name)
      .addTo(group);

    for (let i = 0; i < legs.length - 1; i++) {
      const t = legs[i].toStop;
      L.marker([t.lat, t.lng], { icon: dotIcon(L, MODE_HEX[legs[i].mode]) })
        .bindPopup(`Transfer at ${t.name}`)
        .addTo(group);
    }

    if (typeof progress === "number" && all.length > 1) {
      const idx = Math.min(all.length - 1, Math.max(0, Math.round(progress * (all.length - 1))));
      const here = all[idx];
      L.marker(here, { icon: dotIcon(L, "#DC2626") }).bindPopup("Live position").addTo(group);
    }

    const bounds = all as LatLngBoundsExpression;
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [L, legs, progress]);

  const usedModes = useMemo(
    () => Array.from(new Set(legs.map((l) => l.mode))),
    [legs],
  );

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {usedModes.length > 0 && (
        <div className="pointer-events-none absolute right-2 top-2 z-[500] flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1.5 text-[11px] font-medium text-ink shadow-card backdrop-blur">
          {usedModes.map((m) => (
            <span key={m} className="flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-4 rounded-full"
                style={{ background: MODE_HEX[m] }}
              />
              {MODE_LABEL[m]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
