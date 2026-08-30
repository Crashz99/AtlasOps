"use client";

import { useMemo, useState } from "react";
import type { LocationValue, OpsForm, RecordValue, Submission } from "@/lib/types";
import { uid } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace-context";

export function DynamicRecordForm({ form, onSubmitted }: { form: OpsForm; onSubmitted?: () => void }) {
  const { workspace, addSubmission } = useWorkspace();
  const [values, setValues] = useState<Record<string, RecordValue>>({});
  const [status, setStatus] = useState("Open");
  const [error, setError] = useState("");

  const locationOptions = useMemo(() => workspace.locations, [workspace.locations]);

  function setValue(fieldId: string, value: RecordValue) {
    setValues((current) => ({ ...current, [fieldId]: value }));
  }

  function submit() {
    const missing = form.fields.filter((field) => field.required && field.type !== "section" && (values[field.id] === undefined || values[field.id] === null || values[field.id] === "" || (Array.isArray(values[field.id]) && (values[field.id] as string[]).length === 0)));
    if (missing.length) {
      setError(`Please complete: ${missing.map((field) => field.label).join(", ")}`);
      return;
    }
    const submission: Submission = {
      id: uid("rec"),
      formId: form.id,
      formVersion: form.version,
      createdAt: new Date().toISOString(),
      createdBy: "Workspace Owner",
      status,
      values,
    };
    addSubmission(submission);
    onSubmitted?.();
  }

  return (
    <>
      <div className="dynamic-form">
        <div className="field-group">
          <label>Record status</label>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {['Open','Scheduled','Investigating','Complete','Closed'].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="field-group">
          <label>Form version</label>
          <input className="input" value={`v${form.version}`} readOnly />
        </div>

        {form.fields.map((field) => {
          const value = values[field.id];
          if (field.type === "section") return <div className="dynamic-section" key={field.id}><strong>{field.label}</strong>{field.helpText && <div className="card-subtitle">{field.helpText}</div>}</div>;
          const span2 = ["textarea", "location", "multiselect"].includes(field.type);
          return (
            <div className={`field-group ${span2 ? "span-2" : ""}`} key={field.id}>
              <label>{field.label}{field.required ? " *" : ""}</label>
              {field.type === "text" && <input className="input" value={(value as string) || ""} placeholder={field.placeholder} onChange={(e) => setValue(field.id, e.target.value)} />}
              {field.type === "textarea" && <textarea className="textarea" rows={4} value={(value as string) || ""} placeholder={field.placeholder} onChange={(e) => setValue(field.id, e.target.value)} />}
              {field.type === "number" && <input className="input" type="number" value={(value as number | string) ?? ""} placeholder={field.placeholder} onChange={(e) => setValue(field.id, e.target.value === "" ? null : Number(e.target.value))} />}
              {field.type === "date" && <input className="input" type="date" value={(value as string) || ""} onChange={(e) => setValue(field.id, e.target.value)} />}
              {field.type === "datetime" && <input className="input" type="datetime-local" value={(value as string) || ""} onChange={(e) => setValue(field.id, e.target.value)} />}
              {field.type === "email" && <input className="input" type="email" value={(value as string) || ""} placeholder={field.placeholder} onChange={(e) => setValue(field.id, e.target.value)} />}
              {field.type === "phone" && <input className="input" type="tel" value={(value as string) || ""} placeholder={field.placeholder} onChange={(e) => setValue(field.id, e.target.value)} />}
              {field.type === "url" && <input className="input" type="url" value={(value as string) || ""} placeholder={field.placeholder} onChange={(e) => setValue(field.id, e.target.value)} />}
              {field.type === "boolean" && <label className="checkbox-row"><input type="checkbox" checked={Boolean(value)} onChange={(e) => setValue(field.id, e.target.checked)} /> Yes</label>}
              {field.type === "select" && <select className="select" value={(value as string) || ""} onChange={(e) => setValue(field.id, e.target.value)}><option value="">Choose an option…</option>{(field.options || []).map((option) => <option key={option}>{option}</option>)}</select>}
              {field.type === "multiselect" && <div className="multi-options">{(field.options || []).map((option) => { const selected = Array.isArray(value) && value.includes(option); return <button type="button" key={option} className={`multi-option ${selected ? "selected" : ""}`} onClick={() => { const current = Array.isArray(value) ? value : []; setValue(field.id, selected ? current.filter((item) => item !== option) : [...current, option]); }}>{option}</button>; })}</div>}
              {field.type === "location" && <LocationField value={value as LocationValue | undefined} locations={locationOptions} onChange={(location) => setValue(field.id, location)} />}
              {field.helpText && <div className="card-subtitle">{field.helpText}</div>}
            </div>
          );
        })}
      </div>
      {error && <div style={{ color: "#ff9997", fontSize: 10, marginTop: 12 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}><button className="btn" onClick={submit}>Save record</button></div>
    </>
  );
}

function LocationField({ value, locations, onChange }: { value?: LocationValue; locations: { id: string; name: string; lat: number; lng: number }[]; onChange: (location: LocationValue) => void }) {
  const [custom, setCustom] = useState(false);
  const current = value || { label: "", lat: 0, lng: 0 };
  if (!custom) {
    return <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 7 }}><select className="select" value={value?.label || ""} onChange={(e) => { const location = locations.find((item) => item.name === e.target.value); if (location) onChange({ label: location.name, lat: location.lat, lng: location.lng }); }}><option value="">Choose a saved location…</option>{locations.map((location) => <option key={location.id}>{location.name}</option>)}</select><button className="btn secondary" type="button" onClick={() => setCustom(true)}>Coordinates</button></div>;
  }
  return <div className="location-input-grid"><input className="input" placeholder="Place label" value={current.label} onChange={(e) => onChange({ ...current, label: e.target.value })} /><input className="input" type="number" step="any" placeholder="Latitude" value={current.lat || ""} onChange={(e) => onChange({ ...current, lat: Number(e.target.value) })} /><input className="input" type="number" step="any" placeholder="Longitude" value={current.lng || ""} onChange={(e) => onChange({ ...current, lng: Number(e.target.value) })} /></div>;
}
