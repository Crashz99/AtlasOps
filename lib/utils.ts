import type { FormField, LocationValue, OpsForm, RecordValue, Submission, Workspace, MapPoint } from "./types";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function uid(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatDate(iso: string, includeTime = false) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(d);
}

export function formatValue(value: RecordValue): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object" && "lat" in value && "lng" in value) {
    const loc = value as LocationValue;
    return loc.label || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
  }
  return String(value);
}

export function getForm(workspace: Workspace, formId: string) {
  return workspace.forms.find((form) => form.id === formId);
}

export function fieldById(form: OpsForm | undefined, fieldId: string): FormField | undefined {
  return form?.fields.find((field) => field.id === fieldId);
}

export function recordSearchText(workspace: Workspace, record: Submission) {
  const form = getForm(workspace, record.formId);
  return [
    record.id,
    record.status,
    record.createdBy,
    form?.name,
    ...Object.values(record.values).map(formatValue),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function findRecordLocation(record: Submission): LocationValue | null {
  for (const value of Object.values(record.values)) {
    if (value && typeof value === "object" && !Array.isArray(value) && "lat" in value && "lng" in value) {
      return value as LocationValue;
    }
  }
  return null;
}

export function workspaceMapPoints(workspace: Workspace): MapPoint[] {
  const locationPoints: MapPoint[] = workspace.locations.map((location) => ({
    id: `location-${location.id}`,
    name: location.name,
    subtitle: location.address,
    lat: location.lat,
    lng: location.lng,
    category: "location",
    color: workspace.settings.accent,
    icon: "building",
  }));

  const recordPoints: MapPoint[] = workspace.submissions.flatMap((record) => {
    const location = findRecordLocation(record);
    if (!location) return [];
    const form = getForm(workspace, record.formId);
    return [{
      id: `record-${record.id}`,
      name: form?.name || "Record",
      subtitle: `${location.label} · ${formatDate(record.createdAt, true)}`,
      lat: location.lat,
      lng: location.lng,
      category: "record" as const,
      color: form?.accent || "#34d399",
      icon: form?.icon || "file",
      recordId: record.id,
      formId: record.formId,
    }];
  });

  const customPoints: MapPoint[] = workspace.customMarkers.map((marker) => ({
    id: `marker-${marker.id}`,
    name: marker.name,
    subtitle: marker.notes || marker.category,
    lat: marker.lat,
    lng: marker.lng,
    category: "marker",
    color: marker.color,
    icon: "pin",
  }));

  return [...locationPoints, ...recordPoints, ...customPoints];
}

export function downloadTextFile(filename: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
