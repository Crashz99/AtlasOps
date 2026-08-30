"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  ChevronRight,
  Download,
  FilePlus2,
  FileText,
  Filter,
  FormInput,
  Layers3,
  MapPin,
  MapPinned,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Trash2,
  UserPlus,
  Users2,
  ShieldCheck,
} from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";
import { downloadTextFile, findRecordLocation, formatDate, formatValue, getForm, recordSearchText, uid, workspaceMapPoints } from "@/lib/utils";
import type { MapPoint, Member, OpsForm, OrgLocation, OrgUnit, Submission } from "@/lib/types";
import { OnlineMap } from "./OnlineMap";
import { FormIcon } from "./icons";
import { GuideBubble } from "./GuideBubble";
import { Modal } from "./Modal";
import { FormBuilder } from "./FormBuilder";
import { DynamicRecordForm } from "./DynamicRecordForm";
import { GuidanceStrip } from "./GuidanceStrip";
import { canConfigure, canSubmit, canViewAnalytics, currentMember } from "@/lib/permissions";

type Section = "overview" | "submit" | "setup" | "forms" | "records" | "map" | "analytics" | "structure" | "team" | "settings";

export function WorkspaceSection({ section }: { section: Section }) {
  const params = useParams<{ workspaceId: string }>();
  const { workspace, hydrated } = useWorkspace();
  if (!hydrated) return <div className="content"><div className="empty-state"><strong>Loading workspace…</strong></div></div>;
  const member = currentMember(workspace);
  const setupSection = ["setup", "forms", "structure", "team", "settings"].includes(section);
  const denied = (setupSection && !canConfigure(member.role)) || (section === "analytics" && !canViewAnalytics(member.role)) || (section === "submit" && !canSubmit(member.role));
  return <><div className="content">{denied ? <AccessDenied role={member.role} /> : <>
    <SectionGuide section={section} />
    {section === "overview" ? <Overview /> :
    section === "submit" ? <Submit /> :
    section === "setup" ? <SetupHome /> :
    section === "forms" ? <Forms /> :
    section === "records" ? <Records /> :
    section === "map" ? <MapPage /> :
    section === "analytics" ? <Analytics /> :
    section === "structure" ? <Structure /> :
    section === "team" ? <Team /> : <Settings />}
  </>}</div>{workspace.isDemo && <GuideBubble workspaceId={params.workspaceId} />}</>;
}

function PageHeader({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  return <div className="page-header"><div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="header-actions">{actions}</div>}</div>;
}

function SectionGuide({ section }: { section: Section }) {
  const guides: Partial<Record<Section, { title: string; body: string; tone?: "blue" | "green" | "purple" }>> = {
    overview: { title: "This is your work home", body: "AtlasOps only shows the tools your role needs. Use Submit for day-to-day forms, Records for past work, and the map to understand where activity is happening.", tone: "green" },
    submit: { title: "Choose what you need to do", body: "Each tile is a workflow your organisation created for you. You do not need to configure anything — open a form, fill it in, and submit.", tone: "green" },
    records: { title: "Everything submitted, in one place", body: "Search and filter across your organisation's workflows. You can inspect a record without needing to know how the form was built." },
    map: { title: "Your operational picture", body: "Saved sites and any submitted Location fields appear here automatically. Map tiles and place search stay online-only." },
    analytics: { title: "Built from your organisation's own fields", body: "AtlasOps reads compatible form fields and turns them into breakdowns automatically — there are no fixed NGO or incident-only charts.", tone: "purple" },
    setup: { title: "Configuration lives here — separate from everyday work", body: "Use this hub when you need to change how the organisation works. Members and Viewers never see this area in their normal navigation.", tone: "purple" },
    forms: { title: "Setup area — workers never need this", body: "Owners and Admins define the workflows here. Add as many forms, fields and select options as your organisation needs; Members only see the finished forms in Submit.", tone: "purple" },
    structure: { title: "Setup area — model your organisation", body: "Create the regions, teams, programmes or departments that make sense to you. Saved locations feed directly into forms and maps.", tone: "purple" },
    team: { title: "Access follows the person's role", body: "Owners and Admins configure the workspace. Members get a simple working view. Viewers can inspect records and maps without changing operational data.", tone: "purple" },
    settings: { title: "Make AtlasOps feel like your organisation", body: "Change naming, colour and map defaults here. These controls are deliberately kept out of the everyday worker experience.", tone: "purple" },
  };
  const guide = guides[section];
  return guide ? <GuidanceStrip title={guide.title} tone={guide.tone}>{guide.body}</GuidanceStrip> : null;
}

function AccessDenied({ role }: { role: Member["role"] }) {
  return <div className="access-denied"><ShieldCheck /><h2>This area is kept simple for your role.</h2><p>You are signed in with <strong>{role}</strong> access. Organisation setup is handled by Owners and Admins, so it stays out of your everyday workspace.</p><Link className="btn" href="./">Back to my work</Link></div>;
}

function Overview() {
  const { workspace } = useWorkspace();
  const params = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const [submitForm, setSubmitForm] = useState<OpsForm | null>(null);
  const member = currentMember(workspace);
  const isSetupRole = canConfigure(member.role);
  const canCreate = canSubmit(member.role);
  const points = workspaceMapPoints(workspace).filter((point) => point.category !== "marker");
  const relevantRecords = member.role === "Member" ? workspace.submissions.filter((item) => item.createdBy === member.name) : workspace.submissions;
  const recent = relevantRecords.slice(0, 5);
  const today = new Date().toISOString().slice(0, 10);
  const todaysCount = relevantRecords.filter((item) => item.createdAt.slice(0, 10) === today).length;
  const openCount = relevantRecords.filter((item) => !["Complete", "Closed"].includes(item.status)).length;
  const base = `/workspace/${params.workspaceId}`;

  return <>
    <PageHeader
      title={`Hi ${member.name.split(" ")[0]}`}
      description={member.role === "Member" ? `${workspace.name} · Everything you need for today's work, without the setup clutter.` : member.role === "Viewer" ? `${workspace.name} · Read-only operational view.` : `${workspace.name} · Work here, then use the separate Setup section when you need to configure the organisation.`}
      actions={<>
        {isSetupRole && <button className="btn secondary" onClick={() => router.push(`${base}/setup`)}><FormInput /> Organisation setup</button>}
        {canCreate && <button className="btn" onClick={() => router.push(`${base}/submit`)}><Plus /> Submit something</button>}
      </>}
    />

    <div className="role-banner" data-guide="role-banner">
      <div><span className="role-dot" /><strong>{member.role} workspace</strong><p>{member.role === "Member" ? "You can submit your organisation's workflows and work with operational records and maps. Configuration is handled for you." : member.role === "Viewer" ? "You can explore records and maps, but AtlasOps keeps submission and setup controls out of the way." : "You can work normally and configure forms, structure, team access and workspace settings from the Setup section."}</p></div>
      {workspace.isDemo && <span className="role-hint">Use “Preview as” above to see each role.</span>}
    </div>

    <div className="kpi-grid">
      <Kpi label={member.role === "Member" ? "My submissions today" : `${workspace.settings.terminology.records} today`} value={todaysCount} foot={member.role === "Member" ? `${relevantRecords.length} submitted by you` : `${workspace.submissions.length} total ${workspace.settings.terminology.records.toLowerCase()}`} />
      <Kpi label="Available workflows" value={workspace.forms.filter((f) => f.status === "active").length} foot={canCreate ? "Ready for you to use" : "Visible in this workspace"} />
      <Kpi label={workspace.settings.terminology.locations} value={workspace.locations.length} foot="Mapped organisation sites" />
      <Kpi label="Open items" value={openCount} foot={member.role === "Member" ? "In your recent work" : "Across visible workflows"} />
    </div>

    <div className="dashboard-grid">
      <div className="dashboard-stack">
        <div className="card map-card compact elevated-map">
          <div className="map-floating-copy"><div className="card-title">Where your work is happening</div><div className="card-subtitle">Live online map · submitted locations appear automatically</div><Link href={`${base}/map`}>Open full map <ArrowRight /></Link></div>
          <OnlineMap points={points} compact defaultLayer={workspace.settings.defaultMapLayer} />
        </div>
        <div className="card card-pad">
          <div className="card-title-row"><div><div className="card-title">{member.role === "Member" ? "My recent activity" : "Recent activity"}</div><div className="card-subtitle">Latest work across the forms available to you</div></div><Link className="btn ghost small" href={`${base}/records`}>View all <ChevronRight /></Link></div>
          <div className="activity-list">{recent.length ? recent.map((record) => { const form = getForm(workspace, record.formId); const location = findRecordLocation(record); return <div className="activity-item" key={record.id}><div className="activity-icon" style={{ color: form?.accent }}><FormIcon name={form?.icon || "file"} /></div><div className="activity-main"><strong>{form?.name || "Record"}</strong><span>{location?.label || record.createdBy} · {record.status}</span></div><div className="activity-time">{formatDate(record.createdAt, true)}</div></div>; }) : <Empty text="No records yet" />}</div>
        </div>
      </div>

      <div className="dashboard-stack">
        <div className="card card-pad action-card-bright">
          <div className="card-title-row"><div><div className="card-title">What do you want to do?</div><div className="card-subtitle">AtlasOps keeps this list matched to your access.</div></div></div>
          <div className="quick-actions">
            {canCreate && <Quick icon={FilePlus2} title="Submit a form" copy="Choose the workflow you need" onClick={() => router.push(`${base}/submit`)} />}
            <Quick icon={MapPinned} title="Open the map" copy="See sites and mapped records" onClick={() => router.push(`${base}/map`)} />
            <Quick icon={FileText} title={`Find ${workspace.settings.terminology.records.toLowerCase()}`} copy="Search recent and historic work" onClick={() => router.push(`${base}/records`)} />
            {isSetupRole && <Quick icon={FormInput} title="Set up workflows" copy="Build forms and organisation structure" onClick={() => router.push(`${base}/setup`)} />}
          </div>
        </div>
        {canCreate && <div className="card card-pad"><div className="card-title-row"><div><div className="card-title">Start a workflow</div><div className="card-subtitle">No setup decisions here — just choose what you need to submit.</div></div><Link className="btn ghost small" href={`${base}/submit`}>See all <ChevronRight /></Link></div><div className="activity-list">{workspace.forms.filter((form) => form.status === "active").slice(0,5).map((form) => <button key={form.id} onClick={() => setSubmitForm(form)} className="workflow-row"><div className="activity-item"><div className="activity-icon" style={{ color: form.accent }}><FormIcon name={form.icon} /></div><div className="activity-main"><strong>{form.name}</strong><span>{form.description || `${form.fields.length} fields`}</span></div><ArrowRight size={13} color="var(--muted)" /></div></button>)}</div></div>}
      </div>
    </div>
    {submitForm && <Modal title={`New ${submitForm.name}`} size="medium" onClose={() => setSubmitForm(null)}><DynamicRecordForm form={submitForm} onSubmitted={() => setSubmitForm(null)} /></Modal>}
  </>;
}
function Kpi({ label, value, foot }: { label: string; value: number | string; foot: string }) { return <div className="card kpi"><div className="kpi-label">{label}</div><div className="kpi-value">{value}</div><div className="kpi-foot">{foot}</div></div>; }
function Quick({ icon: Icon, title, copy, onClick }: { icon: any; title: string; copy: string; onClick: () => void }) { return <button className="quick-action" onClick={onClick}><Icon /><strong>{title}</strong><span>{copy}</span></button>; }
function Empty({ text }: { text: string }) { return <div className="empty-state"><FileText /><strong>{text}</strong><span>Use the actions above to add your first item.</span></div>; }

function Submit() {
  const { workspace } = useWorkspace();
  const [submitting, setSubmitting] = useState<OpsForm | null>(null);
  const active = workspace.forms.filter((form) => form.status === "active");
  return <>
    <PageHeader title="Submit" description="Pick the task you need. AtlasOps handles the structure behind the scenes so everyday users only see finished, usable workflows." />
    <div className="submit-hero">
      <div><span>YOUR WORKFLOWS</span><h2>What are you doing today?</h2><p>Choose a form below. Your organisation controls what questions are asked; you simply fill in the information needed for the job.</p></div>
    </div>
    <div className="submit-grid">
      {active.map((form, index) => <button className="submit-card" data-guide={index === 0 ? "submit-first-workflow" : undefined} key={form.id} onClick={() => setSubmitting(form)}>
        <div className="submit-card-icon" style={{ color: form.accent, background: `${form.accent}18` }}><FormIcon name={form.icon} /></div>
        <div className="submit-card-copy"><strong>{form.name}</strong><span>{form.description || "Open this workflow"}</span><small>{form.fields.filter((field) => field.type !== "section").length} questions</small></div>
        <ArrowRight />
      </button>)}
      {!active.length && <div className="card"><Empty text="No workflows are available yet" /></div>}
    </div>
    <GuidanceStrip title="You do not need to manage forms here" tone="green">If a question or option needs changing, your organisation Owner or Admin can update the form in Setup. Your working screen stays simple.</GuidanceStrip>
    {submitting && <Modal title={submitting.name} size="medium" onClose={() => setSubmitting(null)}><DynamicRecordForm form={submitting} onSubmitted={() => setSubmitting(null)} /></Modal>}
  </>;
}

function SetupHome() {
  const { workspace } = useWorkspace();
  const params = useParams<{ workspaceId: string }>();
  const base = `/workspace/${params.workspaceId}`;
  const items = [
    { href: `${base}/forms`, icon: FormInput, title: "Forms & workflows", copy: "Create the questions, fields and options your team uses when submitting work.", meta: `${workspace.forms.length} forms` },
    { href: `${base}/structure`, icon: Building2, title: "Organisation & locations", copy: "Model teams, regions, programmes and saved sites that feed forms and maps.", meta: `${workspace.units.length} units · ${workspace.locations.length} locations` },
    { href: `${base}/team`, icon: Users2, title: "People & access", copy: "Invite people and control whether they configure, contribute or simply view.", meta: `${workspace.members.length} people` },
    { href: `${base}/settings`, icon: Settings2, title: "Branding & defaults", copy: "Change workspace identity, terminology, accent colour and online map defaults.", meta: "Workspace settings" },
  ];
  return <>
    <PageHeader title="Organisation setup" description="Configuration is deliberately separated from the screens your team uses every day. Change the system here; do the work from Home, Submit, Records and Map." />
    <div className="setup-intro"><div><span>ADMIN SPACE</span><h2>Shape AtlasOps around your organisation.</h2><p>Nothing here is required for a normal Member doing their job. This area exists for Owners and Admins who need to change workflows, structure or access.</p></div></div>
    <div className="setup-hub-grid" data-guide="setup-hub">
      {items.map(({ href, icon: Icon, title, copy, meta }, index) => <Link href={href} data-guide={index === 0 ? "setup-forms-card" : undefined} className="setup-hub-card" key={title}><div className="setup-hub-icon"><Icon /></div><div><strong>{title}</strong><p>{copy}</p><span>{meta}</span></div><ArrowRight /></Link>)}
    </div>
  </>;
}

function Forms() {
  const { workspace, saveForm, deleteForm } = useWorkspace();
  const [editing, setEditing] = useState<OpsForm | undefined>();
  const [building, setBuilding] = useState(false);
  const [submitting, setSubmitting] = useState<OpsForm | null>(null);
  function openBuilder(form?: OpsForm) { setEditing(form); setBuilding(true); }
  return <>
    <PageHeader title="Forms" description="Create as many workflows as you need. Forms are schema-driven: fields, options, map locations and future analytics all come from what you configure here." actions={<button className="btn" data-guide="forms-create" onClick={() => openBuilder()}><Plus /> Create form</button>} />
    <div className="forms-grid">
      {workspace.forms.map((form) => {
        const count = workspace.submissions.filter((r) => r.formId === form.id).length;
        return <div className="card form-card" key={form.id}><div className="form-card-top"><div className="form-icon" style={{ background: `${form.accent}16`, color: form.accent }}><FormIcon name={form.icon} /></div><span className="status-pill">{form.status}</span></div><h3>{form.name}</h3><p>{form.description || "No description."}</p><div className="form-meta"><span>{form.fields.length} fields</span><span>v{form.version}</span><span>{count} records</span></div><div className="form-card-actions"><button className="btn secondary small" onClick={() => openBuilder(form)}><Settings2 /> Edit</button><button className="btn success small" onClick={() => setSubmitting(form)}><FilePlus2 /> Submit</button><button className="btn danger small" onClick={() => confirm(`Delete ${form.name}? Existing records will be retained.`) && deleteForm(form.id)}><Trash2 /></button></div></div>;
      })}
      <button className="add-form-card" onClick={() => openBuilder()}><div className="add-form-inner"><Plus /><strong>Create another form</strong><span>No fixed form limit.</span></div></button>
    </div>
    {building && <Modal title={editing ? `Edit ${editing.name}` : "Create form"} size="large" onClose={() => setBuilding(false)}><FormBuilder initial={editing} onSave={(form) => { saveForm(form); setBuilding(false); }} /></Modal>}
    {submitting && <Modal title={`New ${submitting.name}`} size="medium" onClose={() => setSubmitting(null)}><DynamicRecordForm form={submitting} onSubmitted={() => setSubmitting(null)} /></Modal>}
  </>;
}

function Records() {
  const { workspace, deleteSubmission } = useWorkspace();
  const member = currentMember(workspace);
  const createAllowed = canSubmit(member.role);
  const [query, setQuery] = useState("");
  const [formId, setFormId] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [chooseForm, setChooseForm] = useState(false);
  const [newRecord, setNewRecord] = useState<OpsForm | null>(null);
  const filtered = useMemo(() => workspace.submissions.filter((record) => (formId === "all" || record.formId === formId) && (status === "all" || record.status === status) && (!query || recordSearchText(workspace, record).includes(query.toLowerCase()))), [workspace, formId, status, query]);
  const statuses = Array.from(new Set(workspace.submissions.map((item) => item.status))).sort();
  function exportJson() { downloadTextFile(`${workspace.id}-records.json`, JSON.stringify(filtered, null, 2), "application/json"); }
  function exportCsv() {
    const rows = filtered.map((record) => ({ id: record.id, form: getForm(workspace, record.formId)?.name || record.formId, status: record.status, createdAt: record.createdAt, createdBy: record.createdBy, ...Object.fromEntries(Object.entries(record.values).map(([key, value]) => [key, formatValue(value)])) }));
    const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    const esc = (value: unknown) => `"${String(value ?? "").replaceAll('"','""')}"`;
    downloadTextFile(`${workspace.id}-records.csv`, [headers.map(esc).join(","), ...rows.map((row) => headers.map((h) => esc((row as any)[h])).join(","))].join("\n"), "text/csv");
  }
  return <>
    <PageHeader title="Records" description="One universal ledger for every custom form. Search across all values, filter by workflow or status, inspect individual submissions and export the current view." actions={<><button className="btn secondary" onClick={exportJson}><Download /> JSON</button><button className="btn secondary" onClick={exportCsv}><Download /> CSV</button>{createAllowed && <button className="btn" onClick={() => setChooseForm(true)}><Plus /> New record</button>}</>} />
    <div className="card card-pad" data-guide="records-table">
      <div className="filters"><div className="filter-search"><Search /><input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search all record text…" /></div><select className="select auto" value={formId} onChange={(e) => setFormId(e.target.value)}><option value="all">All forms</option>{workspace.forms.map((form) => <option value={form.id} key={form.id}>{form.name}</option>)}</select><select className="select auto" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select><button className="btn secondary"><Filter /> {filtered.length} shown</button></div>
      <div className="table-shell"><table><thead><tr><th>Form</th><th>Location / primary value</th><th>Status</th><th>Created by</th><th>Created</th><th /></tr></thead><tbody>{filtered.map((record) => { const form = getForm(workspace, record.formId); const loc = findRecordLocation(record); const first = Object.values(record.values).find((value) => value && typeof value !== "object") as any; return <tr key={record.id} onClick={() => setSelected(record)}><td><div className="table-form"><i className="form-dot" style={{ background: form?.accent }} />{form?.name || "Deleted form"}</div></td><td>{loc?.label || formatValue(first)}</td><td><span className="status-pill">{record.status}</span></td><td>{record.createdBy}</td><td>{formatDate(record.createdAt, true)}</td><td><MoreHorizontal size={14} color="var(--muted)" /></td></tr>; })}</tbody></table>{!filtered.length && <Empty text="No records match these filters" />}</div>
    </div>
    {selected && <RecordDetail record={selected} canDelete={canConfigure(member.role) || (member.role === "Member" && selected.createdBy === member.name)} onClose={() => setSelected(null)} onDelete={() => { deleteSubmission(selected.id); setSelected(null); }} />}
    {chooseForm && <Modal title="Choose a form" size="small" onClose={() => setChooseForm(false)}>{workspace.forms.length ? workspace.forms.filter((form) => form.status === "active").map((form) => <button key={form.id} className="activity-item" style={{ width: "100%", border: 0, borderBottom: "1px solid var(--border)", background: "transparent", color: "inherit", textAlign: "left", cursor: "pointer" }} onClick={() => { setChooseForm(false); setNewRecord(form); }}><div className="activity-icon" style={{ color: form.accent }}><FormIcon name={form.icon} /></div><div className="activity-main"><strong>{form.name}</strong><span>{form.fields.length} fields</span></div><ChevronRight size={14} /></button>) : <Empty text="Create a form first" />}</Modal>}
    {newRecord && <Modal title={`New ${newRecord.name}`} size="medium" onClose={() => setNewRecord(null)}><DynamicRecordForm form={newRecord} onSubmitted={() => setNewRecord(null)} /></Modal>}
  </>;
}

function RecordDetail({ record, canDelete, onClose, onDelete }: { record: Submission; canDelete: boolean; onClose: () => void; onDelete: () => void }) {
  const { workspace } = useWorkspace(); const form = getForm(workspace, record.formId);
  return <Modal title={form?.name || "Record"} size="medium" onClose={onClose} footer={<>{canDelete && <button className="btn danger" onClick={() => confirm("Delete this record?") && onDelete()}><Trash2 /> Delete</button>}<button className="btn secondary" onClick={onClose}>Close</button></>}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 15 }}><Meta label="Record ID" value={record.id} /><Meta label="Form version" value={`v${record.formVersion}`} /><Meta label="Status" value={record.status} /><Meta label="Created" value={formatDate(record.createdAt, true)} /></div><div className="settings-title">Submitted values</div>{Object.entries(record.values).map(([key, value]) => { const field = form?.fields.find((item) => item.id === key); return <div key={key} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}><div style={{ color: "var(--muted)", fontSize: 9, marginBottom: 4 }}>{field?.label || key}</div><div style={{ fontSize: 11, lineHeight: 1.55 }}>{formatValue(value)}</div></div>; })}</Modal>;
}
function Meta({ label, value }: { label: string; value: string }) { return <div className="map-detail" style={{ marginTop: 0 }}><span style={{ fontSize: 8, color: "var(--muted)" }}>{label}</span><strong style={{ marginTop: 4 }}>{value}</strong></div>; }

function MapPage() {
  const { workspace, addMarker, deleteMarker } = useWorkspace();
  const member = currentMember(workspace);
  const mapEditAllowed = canConfigure(member.role);
  const [showLocations, setShowLocations] = useState(true); const [showRecords, setShowRecords] = useState(true); const [showMarkers, setShowMarkers] = useState(true);
  const [selected, setSelected] = useState<MapPoint | null>(null); const [addMode, setAddMode] = useState(false); const [pending, setPending] = useState<{lat:number;lng:number}|null>(null); const [markerName, setMarkerName] = useState(""); const [placeQuery, setPlaceQuery] = useState(""); const [searching, setSearching] = useState(false);
  const all = workspaceMapPoints(workspace); const points = all.filter((point) => point.category === "location" ? showLocations : point.category === "record" ? showRecords : showMarkers);
  async function searchPlace() { if (!placeQuery.trim()) return; setSearching(true); try { const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(placeQuery)}`); const data = await response.json(); if (data?.[0]) { setPending({ lat: Number(data[0].lat), lng: Number(data[0].lon) }); setMarkerName(data[0].display_name?.split(",")[0] || placeQuery); } } finally { setSearching(false); } }
  function saveMarker() { if (!pending) return; addMarker({ id: uid("marker"), name: markerName.trim() || "Custom marker", lat: pending.lat, lng: pending.lng, category: "Custom point", notes: "Added from the AtlasOps online map.", color: "#a78bfa" }); setPending(null); setMarkerName(""); setAddMode(false); }
  return <>
    <PageHeader title="Operational map" description="Online-only mapping across organisation locations, record coordinates and your own custom markers. Switch live basemaps without maintaining local tile files." actions={mapEditAllowed ? <button className={`btn ${addMode ? "danger" : ""}`} onClick={() => setAddMode(!addMode)}><MapPin /> {addMode ? "Cancel marker mode" : "Add map marker"}</button> : undefined} />
    <div className="map-page-grid">
      <div className="card map-sidebar">
        <div className="map-sidebar-section"><div className="settings-title">Search online map</div><div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6 }}><input className="input" value={placeQuery} onChange={(e) => setPlaceQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchPlace()} placeholder="Search a UK place…" /><button className="btn secondary" onClick={searchPlace}>{searching ? "…" : <Search />}</button></div>{pending && <div className="map-detail"><strong>{markerName || "Selected point"}</strong><p>{pending.lat.toFixed(5)}, {pending.lng.toFixed(5)}</p>{mapEditAllowed && <><input className="input" style={{ marginTop: 8 }} value={markerName} onChange={(e) => setMarkerName(e.target.value)} placeholder="Marker name" /><button className="btn small" style={{ marginTop: 7 }} onClick={saveMarker}><Plus /> Save marker</button></>}</div>}</div>
        <div className="map-sidebar-section"><div className="settings-title">Visible layers</div><LayerToggle color={workspace.settings.accent} title="Organisation locations" sub={`${workspace.locations.length} saved sites`} on={showLocations} toggle={() => setShowLocations(!showLocations)} /><LayerToggle color="#52d6a1" title="Record locations" sub={`${workspace.submissions.filter(findRecordLocation).length} geocoded records`} on={showRecords} toggle={() => setShowRecords(!showRecords)} /><LayerToggle color="#a78bfa" title="Custom markers" sub={`${workspace.customMarkers.length} map annotations`} on={showMarkers} toggle={() => setShowMarkers(!showMarkers)} /></div>
        <div className="map-sidebar-section"><div className="settings-title">Selected point</div>{selected ? <div className="map-detail"><strong>{selected.name}</strong><p>{selected.subtitle}</p><p>{selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}</p>{selected.category === "marker" && mapEditAllowed && <button className="btn danger small" style={{ marginTop: 8 }} onClick={() => { deleteMarker(selected.id.replace("marker-", "")); setSelected(null); }}><Trash2 /> Remove</button>}</div> : <div className="card-subtitle">{mapEditAllowed ? "Click a marker to inspect it. Turn on marker mode, then click anywhere on the map to add your own point." : "Click any marker to inspect the location or record. Map editing is managed by your organisation admins."}</div>}</div>
      </div>
      <div className="card map-main-card" data-guide="map-main"><OnlineMap points={points} defaultLayer={workspace.settings.defaultMapLayer} focusPoint={pending ? { ...pending, zoom: 11 } : null} onPointSelect={setSelected} onMapClick={(lat,lng) => addMode && setPending({ lat, lng })} /></div>
    </div>
  </>;
}
function LayerToggle({ color, title, sub, on, toggle }: { color:string; title:string; sub:string; on:boolean; toggle:()=>void }) { return <div className="layer-toggle"><div className="layer-toggle-left"><i className="legend-dot" style={{ background: color }} /><div><strong>{title}</strong><span>{sub}</span></div></div><div className={`switch ${on ? "on" : ""}`} onClick={toggle} /></div>; }

function Analytics() {
  const { workspace } = useWorkspace();
  const [breakdown, setBreakdown] = useState("form");
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); const key = d.toISOString().slice(0,10); return { key, label: d.toLocaleDateString("en-GB", { weekday: "short" }), count: workspace.submissions.filter((record) => record.createdAt.slice(0,10) === key).length }; });
  const max = Math.max(...days.map((d) => d.count), 1);
  const selectFields = workspace.forms.flatMap((form) => form.fields.filter((field) => ["select","multiselect"].includes(field.type)).map((field) => ({ id: `${form.id}:${field.id}`, label: `${form.name} · ${field.label}`, formId: form.id, fieldId: field.id })));
  const breakdownData = useMemo(() => {
    const counts: Record<string,number> = {};
    if (breakdown === "form") workspace.submissions.forEach((record) => { const name = getForm(workspace, record.formId)?.name || "Deleted form"; counts[name] = (counts[name] || 0) + 1; });
    else if (breakdown === "status") workspace.submissions.forEach((record) => { counts[record.status] = (counts[record.status] || 0) + 1; });
    else { const [formId, fieldId] = breakdown.split(":"); workspace.submissions.filter((record) => record.formId === formId).forEach((record) => { const value = record.values[fieldId]; (Array.isArray(value) ? value : [value]).filter(Boolean).forEach((item) => { const key = formatValue(item as any); counts[key] = (counts[key] || 0) + 1; }); }); }
    return Object.entries(counts).sort((a,b) => b[1]-a[1]);
  }, [breakdown, workspace]);
  const totalBreak = Math.max(breakdownData.reduce((sum, [,count]) => sum + count, 0), 1);
  return <>
    <PageHeader title="Analytics" description="Analytics now adapt to your data model. Choose any compatible select field and AtlasOps will break down its submitted values without hard-coded Activity / Incident / Tracking logic." />
    <div className="kpi-grid"><Kpi label="Total records" value={workspace.submissions.length} foot="All forms" /><Kpi label="Forms" value={workspace.forms.length} foot={`${workspace.forms.filter((f) => f.status === "active").length} active`} /><Kpi label="Mapped records" value={workspace.submissions.filter(findRecordLocation).length} foot="Contain location data" /><Kpi label="Organisation sites" value={workspace.locations.length} foot="Available to location fields" /></div>
    <div className="analytics-grid"><div className="card chart-card"><div className="card-title-row"><div><div className="card-title">Submission activity</div><div className="card-subtitle">Last seven days</div></div></div><div className="bar-chart">{days.map((day) => <div className="bar-col" key={day.key}><div className="bar" data-value={day.count} style={{ height: `${Math.max(4, (day.count/max)*100)}%` }} /><div className="bar-label">{day.label}</div></div>)}</div></div><div className="card chart-card"><div className="card-title-row"><div><div className="card-title">Break down by</div><div className="card-subtitle">Use any compatible field from your custom forms</div></div></div><select className="select" value={breakdown} onChange={(e) => setBreakdown(e.target.value)}><option value="form">Form</option><option value="status">Record status</option>{selectFields.map((field) => <option key={field.id} value={field.id}>{field.label}</option>)}</select><div className="breakdown-list">{breakdownData.slice(0,8).map(([label,count]) => <div className="breakdown-row" key={label}><span>{label}</span><div className="breakdown-track"><div className="breakdown-fill" style={{ width: `${(count/totalBreak)*100}%` }} /></div><span className="breakdown-value">{count}</span></div>)}</div></div></div>
  </>;
}

function Structure() {
  const { workspace, addUnit, addLocation } = useWorkspace();
  const [unitOpen, setUnitOpen] = useState(false); const [locOpen, setLocOpen] = useState(false);
  const [unitName, setUnitName] = useState(""); const [unitType, setUnitType] = useState("Team"); const [parentId, setParentId] = useState(workspace.units[0]?.id || "");
  const [loc, setLoc] = useState({ name:"", address:"", lat:"", lng:"", category:"Site" });
  const depth = (unit: OrgUnit) => { let d=0, p=unit.parentId; while(p){d++; p=workspace.units.find((u)=>u.id===p)?.parentId || null;} return d; };
  function saveUnit(){ if(!unitName.trim()) return; addUnit({id:uid("unit"),name:unitName.trim(),type:unitType,parentId:parentId||null}); setUnitName(""); setUnitOpen(false); }
  function saveLoc(){ if(!loc.name.trim() || !loc.lat || !loc.lng) return; addLocation({id:uid("loc"),name:loc.name.trim(),address:loc.address,lat:Number(loc.lat),lng:Number(loc.lng),category:loc.category}); setLoc({name:"",address:"",lat:"",lng:"",category:"Site"}); setLocOpen(false); }
  return <>
    <PageHeader title="Organisation structure" description="Model the way your organisation actually works — regions, departments, programmes, projects, teams or anything else — with no Group A / Group B or fixed depth." actions={<><button className="btn secondary" onClick={()=>setLocOpen(true)}><MapPin /> Add location</button><button className="btn" onClick={()=>setUnitOpen(true)}><Plus /> Add unit</button></>} />
    <div className="structure-grid"><div className="card card-pad"><div className="card-title-row"><div><div className="card-title">Structure</div><div className="card-subtitle">Flexible hierarchy · {workspace.units.length} units</div></div></div><div className="tree">{workspace.units.map((unit)=><div className="tree-node" key={unit.id} style={{ marginLeft: Math.min(depth(unit)*18,72) }}><div className="tree-node-main"><Building2 /><div><strong>{unit.name}</strong><span>{unit.type}</span></div></div></div>)}</div></div><div className="card card-pad"><div className="card-title-row"><div><div className="card-title">Locations</div><div className="card-subtitle">Saved sites are available to every Location field</div></div></div><div className="location-list">{workspace.locations.map((location)=><div className="location-row" key={location.id}><div className="icon"><MapPin /></div><div><strong>{location.name}</strong><span>{location.address || `${location.lat}, ${location.lng}`}</span></div><span className="status-pill">{location.category}</span></div>)}{!workspace.locations.length && <Empty text="No locations yet" />}</div></div></div>
    {unitOpen && <Modal title="Add organisation unit" size="small" onClose={()=>setUnitOpen(false)} footer={<button className="btn" onClick={saveUnit}>Add unit</button>}><div className="field-group"><label>Name</label><input className="input" value={unitName} onChange={(e)=>setUnitName(e.target.value)} /></div><div className="field-group"><label>Type</label><input className="input" value={unitType} onChange={(e)=>setUnitType(e.target.value)} placeholder="Region, Department, Team…" /></div><div className="field-group"><label>Parent</label><select className="select" value={parentId} onChange={(e)=>setParentId(e.target.value)}><option value="">No parent</option>{workspace.units.map((unit)=><option value={unit.id} key={unit.id}>{unit.name}</option>)}</select></div></Modal>}
    {locOpen && <Modal title="Add location" size="small" onClose={()=>setLocOpen(false)} footer={<button className="btn" onClick={saveLoc}>Add location</button>}>{([['name','Name'],['address','Address / label'],['lat','Latitude'],['lng','Longitude'],['category','Category']] as const).map(([key,label])=><div className="field-group" key={key}><label>{label}</label><input className="input" type={key==='lat'||key==='lng'?'number':'text'} step="any" value={loc[key]} onChange={(e)=>setLoc({...loc,[key]:e.target.value})} /></div>)}</Modal>}
  </>;
}

function Team() {
  const { workspace, addMember } = useWorkspace(); const [open,setOpen]=useState(false); const [member,setMember]=useState({name:"",email:"",role:"Member" as Member['role']});
  function save(){ if(!member.name.trim()||!member.email.trim()) return; addMember({id:uid("member"),...member,status:"Invited"}); setOpen(false); setMember({name:"",email:"",role:"Member"}); }
  return <><PageHeader title="Team" description="Manage who belongs to this organisation and the level of access they should have. The rehaul uses organisation memberships rather than one global admin/standard role split." actions={<button className="btn" onClick={()=>setOpen(true)}><UserPlus /> Invite member</button>} /><div className="card card-pad"><div className="table-shell"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>{workspace.members.map((m)=><tr key={m.id}><td><div className="table-form"><div className="avatar">{m.name.split(' ').map((x)=>x[0]).join('').slice(0,2)}</div>{m.name}</div></td><td>{m.email}</td><td>{m.role}</td><td><span className="status-pill">{m.status}</span></td></tr>)}</tbody></table></div></div>{open&&<Modal title="Invite team member" size="small" onClose={()=>setOpen(false)} footer={<button className="btn" onClick={save}>Send invitation</button>}><div className="field-group"><label>Name</label><input className="input" value={member.name} onChange={(e)=>setMember({...member,name:e.target.value})} /></div><div className="field-group"><label>Email</label><input className="input" type="email" value={member.email} onChange={(e)=>setMember({...member,email:e.target.value})} /></div><div className="field-group"><label>Role</label><select className="select" value={member.role} onChange={(e)=>setMember({...member,role:e.target.value as Member['role']})}>{['Owner','Admin','Member','Viewer'].map((r)=><option key={r}>{r}</option>)}</select></div></Modal>}</>;
}

function Settings() {
  const { workspace, updateWorkspace, resetDemo } = useWorkspace();
  const [name,setName]=useState(workspace.name); const [description,setDescription]=useState(workspace.description); const [industry,setIndustry]=useState(workspace.settings.industry); const [accent,setAccent]=useState(workspace.settings.accent); const [layer,setLayer]=useState(workspace.settings.defaultMapLayer);
  const [recordsTerm,setRecordsTerm]=useState(workspace.settings.terminology.records); const [locationsTerm,setLocationsTerm]=useState(workspace.settings.terminology.locations); const [membersTerm,setMembersTerm]=useState(workspace.settings.terminology.members);
  function save(){ updateWorkspace({name,description,settings:{...workspace.settings,industry,accent,defaultMapLayer:layer,terminology:{records:recordsTerm||"Records",locations:locationsTerm||"Locations",members:membersTerm||"Team"}}}); }
  return <><PageHeader title="Workspace settings" description="Customise organisation identity and workspace defaults. This is the start of a broader branding and terminology layer rather than hard-coded NGO wording." actions={<button className="btn" onClick={save}>Save changes</button>} /><div className="structure-grid"><div className="card card-pad"><div className="card-title">Organisation</div><div className="field-group" style={{marginTop:14}}><label>Name</label><input className="input" value={name} onChange={(e)=>setName(e.target.value)} /></div><div className="field-group"><label>Description</label><textarea className="textarea" rows={3} value={description} onChange={(e)=>setDescription(e.target.value)} /></div><div className="field-group"><label>Industry / operating context</label><input className="input" value={industry} onChange={(e)=>setIndustry(e.target.value)} /></div></div><div className="card card-pad"><div className="card-title">Appearance & map</div><div className="field-group" style={{marginTop:14}}><label>Accent colour</label><div style={{display:'grid',gridTemplateColumns:'42px 1fr',gap:8}}><input type="color" value={accent} onChange={(e)=>setAccent(e.target.value)} style={{width:42,height:36,background:'transparent',border:0}}/><input className="input" value={accent} onChange={(e)=>setAccent(e.target.value)} /></div></div><div className="field-group"><label>Default online map layer</label><select className="select" value={layer} onChange={(e)=>setLayer(e.target.value as any)}><option value="dark">Dark</option><option value="street">Street</option><option value="terrain">Terrain</option><option value="satellite">Satellite</option></select></div><div style={{marginTop:18,paddingTop:15,borderTop:'1px solid var(--border)'}}><div className="settings-title">Workspace terminology</div><div className="field-group"><label>Records label</label><input className="input" value={recordsTerm} onChange={(e)=>setRecordsTerm(e.target.value)} placeholder="Records, Cases, Reports…" /></div><div className="field-group"><label>Locations label</label><input className="input" value={locationsTerm} onChange={(e)=>setLocationsTerm(e.target.value)} placeholder="Locations, Sites, Branches…" /></div><div className="field-group"><label>Team label</label><input className="input" value={membersTerm} onChange={(e)=>setMembersTerm(e.target.value)} placeholder="Team, Staff, Members…" /></div></div>{workspace.isDemo&&<div style={{marginTop:20,paddingTop:16,borderTop:'1px solid var(--border)'}}><button className="btn secondary" onClick={()=>confirm('Reset all demo changes?')&&resetDemo()}><RotateCcw/> Reset demo data</button></div>}</div></div></>;
}
