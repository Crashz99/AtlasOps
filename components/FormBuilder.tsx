"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react";
import type { FieldType, FormField, OpsForm } from "@/lib/types";
import { uid } from "@/lib/utils";
import { FieldIcon, fieldTypeLabels } from "./icons";

const fieldTypes: FieldType[] = ["text","textarea","number","date","datetime","select","multiselect","boolean","email","phone","url","location","section"];
const accents = ["#5f8fb4", "#34d399", "#f59e0b", "#ef6461", "#a78bfa", "#22d3ee", "#f472b6"];
const icons = ["clipboard-check", "wrench", "triangle-alert", "map-pinned", "package-check", "file"];

export function FormBuilder({ initial, onSave }: { initial?: OpsForm; onSave: (form: OpsForm) => void }) {
  const [form, setForm] = useState<OpsForm>(() => initial ? structuredClone(initial) : ({ id: uid("form"), name: "Untitled form", description: "", icon: "clipboard-check", accent: "#5f8fb4", status: "active", version: 1, fields: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  const [selectedId, setSelectedId] = useState<string | null>(form.fields[0]?.id || null);
  const [newType, setNewType] = useState<FieldType>("text");
  const selected = useMemo(() => form.fields.find((field) => field.id === selectedId), [form.fields, selectedId]);

  function patchForm(patch: Partial<OpsForm>) { setForm((current) => ({ ...current, ...patch })); }
  function patchField(fieldId: string, patch: Partial<FormField>) { setForm((current) => ({ ...current, fields: current.fields.map((field) => field.id === fieldId ? { ...field, ...patch } : field) })); }
  function addField() {
    const field: FormField = { id: uid("field"), type: newType, label: fieldTypeLabels[newType], ...(newType === "select" || newType === "multiselect" ? { options: ["Option 1", "Option 2"] } : {}) };
    setForm((current) => ({ ...current, fields: [...current.fields, field] }));
    setSelectedId(field.id);
  }
  function removeField(id: string) {
    setForm((current) => ({ ...current, fields: current.fields.filter((field) => field.id !== id) }));
    setSelectedId(null);
  }
  function duplicateField(field: FormField) {
    const copy = { ...structuredClone(field), id: uid("field"), label: `${field.label} copy` };
    setForm((current) => ({ ...current, fields: [...current.fields, copy] }));
    setSelectedId(copy.id);
  }
  function moveField(id: string, offset: number) {
    setForm((current) => {
      const index = current.fields.findIndex((field) => field.id === id);
      const next = index + offset;
      if (index < 0 || next < 0 || next >= current.fields.length) return current;
      const fields = [...current.fields];
      [fields[index], fields[next]] = [fields[next], fields[index]];
      return { ...current, fields };
    });
  }
  function save() {
    onSave({ ...form, name: form.name.trim() || "Untitled form", updatedAt: new Date().toISOString(), version: initial ? initial.version + 1 : form.version });
  }

  return (
    <>
      <div className="builder">
        <div className="builder-main">
          <div className="builder-title-grid">
            <div><label style={{ color: "var(--muted)", fontSize: 9 }}>FORM NAME</label><input className="input" value={form.name} onChange={(e) => patchForm({ name: e.target.value })} /></div>
            <div><label style={{ color: "var(--muted)", fontSize: 9 }}>STATUS</label><select className="select" value={form.status} onChange={(e) => patchForm({ status: e.target.value as OpsForm["status"] })}><option value="active">Active</option><option value="draft">Draft</option></select></div>
          </div>
          <div className="field-group"><label>Description</label><textarea className="textarea" rows={2} value={form.description} onChange={(e) => patchForm({ description: e.target.value })} placeholder="What does this form capture?" /></div>
          <div className="settings-title" style={{ marginTop: 18 }}>Fields · {form.fields.length}</div>
          <div className="field-list">
            {form.fields.map((field) => <div key={field.id} className={`field-row ${selectedId === field.id ? "selected" : ""}`} onClick={() => setSelectedId(field.id)}><div className="field-type-icon"><FieldIcon type={field.type} /></div><div><strong>{field.label}</strong><span>{fieldTypeLabels[field.type]}{field.required ? " · Required" : ""}</span></div><div className="field-row-actions" onClick={(e) => e.stopPropagation()}><button className="btn ghost small" onClick={() => moveField(field.id, -1)} title="Move up"><ArrowUp /></button><button className="btn ghost small" onClick={() => moveField(field.id, 1)} title="Move down"><ArrowDown /></button><button className="btn ghost small" onClick={() => duplicateField(field)} title="Duplicate"><Copy /></button><button className="btn danger small" onClick={() => removeField(field.id)} title="Remove"><Trash2 /></button></div></div>)}
          </div>
          <div className="add-field"><select className="select" value={newType} onChange={(e) => setNewType(e.target.value as FieldType)}>{fieldTypes.map((type) => <option value={type} key={type}>{fieldTypeLabels[type]}</option>)}</select><button className="btn secondary" onClick={addField}><Plus /> Add field</button></div>
        </div>
        <div className="builder-side">
          <div className="settings-section"><div className="settings-title">Form appearance</div><div className="field-group"><label>Icon</label><select className="select" value={form.icon} onChange={(e) => patchForm({ icon: e.target.value })}>{icons.map((icon) => <option key={icon}>{icon}</option>)}</select></div><div className="field-group"><label>Accent colour</label><div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>{accents.map((accent) => <button key={accent} title={accent} onClick={() => patchForm({ accent })} style={{ width: 26, height: 26, borderRadius: 8, border: form.accent === accent ? "2px solid white" : "1px solid #33404f", background: accent, cursor: "pointer" }} />)}</div></div></div>
          {selected ? <FieldSettings field={selected} patch={(patch) => patchField(selected.id, patch)} /> : <div className="empty-state"><FieldIcon type="text" /><strong>Select a field</strong><span>Choose a field on the left to configure it.</span></div>}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}><span style={{ color: "var(--muted)", fontSize: 9 }}>Edits create a new form version so historical records remain interpretable.</span><button className="btn" onClick={save}>Save form</button></div>
    </>
  );
}

function FieldSettings({ field, patch }: { field: FormField; patch: (patch: Partial<FormField>) => void }) {
  const hasOptions = field.type === "select" || field.type === "multiselect";
  function setOption(index: number, value: string) { const options = [...(field.options || [])]; options[index] = value; patch({ options }); }
  function removeOption(index: number) { patch({ options: (field.options || []).filter((_, i) => i !== index) }); }
  function addOption() { patch({ options: [...(field.options || []), `Option ${(field.options || []).length + 1}`] }); }
  return <div>
    <div className="settings-section"><div className="settings-title">Selected field</div><div className="field-group"><label>Label</label><input className="input" value={field.label} onChange={(e) => patch({ label: e.target.value })} /></div><div className="field-group"><label>Help text</label><input className="input" value={field.helpText || ""} onChange={(e) => patch({ helpText: e.target.value })} placeholder="Optional guidance shown under the field" /></div>{field.type !== "section" && <label className="checkbox-row"><input type="checkbox" checked={Boolean(field.required)} onChange={(e) => patch({ required: e.target.checked })} /> Required field</label>}</div>
    {hasOptions && <div className="settings-section"><div className="settings-title">Options · unlimited</div>{(field.options || []).map((option, index) => <div className="option-row" key={`${index}-${option}`}><input className="input" value={option} onChange={(e) => setOption(index, e.target.value)} /><button className="btn danger icon-only" onClick={() => removeOption(index)}><Trash2 /></button></div>)}<button className="btn secondary small" onClick={addOption}><Plus /> Add option</button></div>}
    {["text","textarea","email","phone","url","number"].includes(field.type) && <div className="settings-section"><div className="field-group"><label>Placeholder</label><input className="input" value={field.placeholder || ""} onChange={(e) => patch({ placeholder: e.target.value })} /></div></div>}
  </div>;
}
