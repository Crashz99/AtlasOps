"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MapPoint } from "@/lib/types";

type LayerKey = "dark" | "street" | "terrain" | "satellite";

const layers: Record<LayerKey, { label: string; url: string; attribution: string; maxZoom: number }> = {
  dark: { label: "Dark", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", attribution: "&copy; OpenStreetMap contributors &copy; CARTO", maxZoom: 20 },
  street: { label: "Street", url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "&copy; OpenStreetMap contributors", maxZoom: 19 },
  terrain: { label: "Terrain", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attribution: "Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap", maxZoom: 17 },
  satellite: { label: "Satellite", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attribution: "Tiles &copy; Esri", maxZoom: 19 },
};

const svgPaths: Record<string, string> = {
  building: '<path d="M3 21h18M6 21V7l6-4v18M18 21V11l-6-4M9 9h.01M9 13h.01M9 17h.01M15 13h.01M15 17h.01"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5-5l2.1 2.1-2.4 2.4-2.1-2.1a4 4 0 0 0 5 5L5 16l3 3 6.7-7.3a4 4 0 0 0 5-5l-2.1 2.1-2.4-2.4 2.1-2.1Z"/>',
  "triangle-alert": '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
  "clipboard-check": '<rect width="14" height="18" x="5" y="3" rx="2"/><path d="M9 3V1h6v2M9 12l2 2 4-4"/>',
  "map-pinned": '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
  "package-check": '<path d="m16 16 2 2 4-4M21 10 12 5 3 10l9 5 9-5ZM3 10v8l9 5 5-2.8M12 15v8M7.5 7.5 16.5 12"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
  file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>',
};

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}

function markerHtml(point: MapPoint) {
  const path = svgPaths[point.icon] || svgPaths.file;
  return `<div class="atlas-marker"><div class="atlas-marker-pin" style="background:${point.color}"><svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg></div></div>`;
}

export function OnlineMap({ points, compact = false, defaultLayer = "dark", onPointSelect, onMapClick, focusPoint }: {
  points: MapPoint[];
  compact?: boolean;
  defaultLayer?: LayerKey;
  onPointSelect?: (point: MapPoint) => void;
  onMapClick?: (lat: number, lng: number) => void;
  focusPoint?: { lat: number; lng: number; zoom?: number } | null;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const tileRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const onMapClickRef = useRef(onMapClick);
  const onPointSelectRef = useRef(onPointSelect);
  const pointsRef = useRef(points);
  const [layer, setLayer] = useState<LayerKey>(defaultLayer);
  const [ready, setReady] = useState(false);
  const pointsKey = useMemo(() => points.map((p) => `${p.id}:${p.lat}:${p.lng}`).join("|"), [points]);

  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);
  useEffect(() => { onPointSelectRef.current = onPointSelect; }, [onPointSelect]);
  useEffect(() => { pointsRef.current = points; }, [points]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!rootRef.current || mapRef.current) return;
      const leaflet = await import("leaflet");
      if (cancelled || !rootRef.current) return;
      const L = leaflet.default;
      const map = L.map(rootRef.current, { center: [54.2, -2.8], zoom: 5, minZoom: 3, maxZoom: 19, zoomControl: !compact });
      const cfg = layers[defaultLayer];
      const tile = L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: cfg.maxZoom });
      tile.addTo(map);
      const markerLayer = L.layerGroup().addTo(map);
      mapRef.current = map;
      tileRef.current = tile;
      markersRef.current = markerLayer;
      map.on("click", (event: any) => onMapClickRef.current?.(event.latlng.lat, event.latlng.lng));
      setReady(true);
      setTimeout(() => map.invalidateSize(), 20);
    }
    init();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        tileRef.current = null;
        markersRef.current = null;
      }
    };
  }, [compact, defaultLayer]);

  useEffect(() => {
    async function swapLayer() {
      if (!mapRef.current) return;
      const leaflet = await import("leaflet");
      const L = leaflet.default;
      if (tileRef.current) mapRef.current.removeLayer(tileRef.current);
      const cfg = layers[layer];
      tileRef.current = L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: cfg.maxZoom }).addTo(mapRef.current);
    }
    if (ready) swapLayer();
  }, [layer, ready]);

  useEffect(() => {
    async function draw() {
      if (!mapRef.current || !markersRef.current) return;
      const leaflet = await import("leaflet");
      const L = leaflet.default;
      markersRef.current.clearLayers();
      const bounds: Array<[number, number]> = [];
      pointsRef.current.forEach((point) => {
        const icon = L.divIcon({ className: "atlas-div-icon", html: markerHtml(point), iconSize: [34, 42], iconAnchor: [17, 38], popupAnchor: [0, -34] });
        const marker = L.marker([point.lat, point.lng], { icon }).addTo(markersRef.current);
        marker.bindPopup(`<strong style="font-size:11px">${escapeHtml(point.name)}</strong><div style="font-size:9px;color:#9aa7b7;margin-top:4px;max-width:220px">${escapeHtml(point.subtitle || "")}</div>`);
        marker.on("click", () => onPointSelectRef.current?.(point));
        bounds.push([point.lat, point.lng]);
      });
      if (bounds.length && !compact) {
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
      }
    }
    if (ready) draw();
  }, [pointsKey, compact, ready]);


  useEffect(() => {
    if (!mapRef.current || !focusPoint) return;
    mapRef.current.setView([focusPoint.lat, focusPoint.lng], focusPoint.zoom || 11, { animate: true });
  }, [focusPoint]);

  return (
    <div className="map-frame">
      <div ref={rootRef} style={{ position: "absolute", inset: 0 }} />
      <div className="map-toolbar">
        {(Object.keys(layers) as LayerKey[]).map((key) => <button key={key} className={layer === key ? "active" : ""} onClick={() => setLayer(key)}>{layers[key].label}</button>)}
      </div>
      <div className="map-status">ONLINE MAP · {points.length} VISIBLE POINT{points.length === 1 ? "" : "S"}</div>
    </div>
  );
}
