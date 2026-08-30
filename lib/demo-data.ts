import type { Workspace } from "./types";

const now = new Date("2026-08-30T10:00:00.000Z");
const isoDaysAgo = (days: number, hour = 10) => {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const demoWorkspace: Workspace = {
  id: "demo",
  currentMemberId: "m3",
  name: "Northstar Facilities UK",
  description: "Fictional UK field-operations workspace used to demonstrate AtlasOps.",
  isDemo: true,
  settings: {
    accent: "#5f8fb4",
    industry: "Facilities & field operations",
    timezone: "Europe/London",
    terminology: {
      records: "Records",
      locations: "Locations",
      members: "Team",
    },
    defaultMapLayer: "dark",
  },
  units: [
    { id: "u-root", name: "Northstar Facilities UK", type: "Organisation", parentId: null },
    { id: "u-london", name: "London Region", type: "Region", parentId: "u-root" },
    { id: "u-central", name: "Central Operations", type: "Team", parentId: "u-london" },
    { id: "u-east", name: "East Operations", type: "Team", parentId: "u-london" },
    { id: "u-midlands", name: "Midlands Region", type: "Region", parentId: "u-root" },
    { id: "u-north", name: "Northern Region", type: "Region", parentId: "u-root" },
  ],
  members: [
    { id: "m1", name: "Amelia Grant", email: "amelia@example.com", role: "Owner", status: "Active" },
    { id: "m2", name: "Marcus Reed", email: "marcus@example.com", role: "Admin", status: "Active" },
    { id: "m3", name: "Noor Rahman", email: "noor@example.com", role: "Member", status: "Active" },
    { id: "m4", name: "Lewis Carter", email: "lewis@example.com", role: "Viewer", status: "Active" },
  ],
  locations: [
    { id: "loc-london", name: "London Operations Centre", address: "Southwark, London", lat: 51.5033, lng: -0.1195, category: "Operations hub", unitId: "u-london" },
    { id: "loc-manchester", name: "Manchester Service Hub", address: "Ancoats, Manchester", lat: 53.4849, lng: -2.2322, category: "Service hub", unitId: "u-north" },
    { id: "loc-birmingham", name: "Birmingham Depot", address: "Aston, Birmingham", lat: 52.4943, lng: -1.8887, category: "Depot", unitId: "u-midlands" },
    { id: "loc-bristol", name: "Bristol Regional Office", address: "Redcliffe, Bristol", lat: 51.4497, lng: -2.5853, category: "Regional office", unitId: "u-root" },
    { id: "loc-leeds", name: "Leeds Service Hub", address: "Holbeck, Leeds", lat: 53.7899, lng: -1.5486, category: "Service hub", unitId: "u-north" },
  ],
  customMarkers: [
    { id: "mk1", name: "Temporary project site", lat: 52.9548, lng: -1.1581, category: "Project site", notes: "Temporary marker created by the operations team.", color: "#a78bfa" },
  ],
  forms: [
    {
      id: "site-inspection",
      name: "Site Inspection",
      description: "Routine condition, safety and compliance inspections.",
      icon: "clipboard-check",
      accent: "#5f8fb4",
      status: "active",
      version: 3,
      createdAt: isoDaysAgo(45),
      updatedAt: isoDaysAgo(2),
      fields: [
        { id: "location", type: "location", label: "Site", required: true, helpText: "Choose a saved site or enter coordinates." },
        { id: "inspection_date", type: "date", label: "Inspection date", required: true },
        { id: "condition", type: "select", label: "Overall condition", required: true, options: ["Good", "Fair", "Poor", "Critical"] },
        { id: "safety", type: "multiselect", label: "Safety observations", options: ["No issue", "Trip hazard", "Electrical", "Fire safety", "Access", "Water ingress"] },
        { id: "notes", type: "textarea", label: "Inspector notes", placeholder: "Add findings, actions or follow-up..." },
      ],
    },
    {
      id: "maintenance-report",
      name: "Maintenance Report",
      description: "Log defects, repairs and operational maintenance work.",
      icon: "wrench",
      accent: "#f59e0b",
      status: "active",
      version: 2,
      createdAt: isoDaysAgo(40),
      updatedAt: isoDaysAgo(4),
      fields: [
        { id: "location", type: "location", label: "Location", required: true },
        { id: "asset", type: "text", label: "Asset / area", required: true, placeholder: "e.g. Boiler room AHU-2" },
        { id: "priority", type: "select", label: "Priority", required: true, options: ["Routine", "Elevated", "Urgent", "Critical"] },
        { id: "work_type", type: "select", label: "Work type", options: ["Inspection", "Repair", "Replacement", "Cleaning", "Testing", "Other"] },
        { id: "cost", type: "number", label: "Estimated cost (£)" },
        { id: "details", type: "textarea", label: "Work details", required: true },
      ],
    },
    {
      id: "incident-report",
      name: "Incident Report",
      description: "Capture operational, safety or service incidents consistently.",
      icon: "triangle-alert",
      accent: "#ef6461",
      status: "active",
      version: 4,
      createdAt: isoDaysAgo(80),
      updatedAt: isoDaysAgo(1),
      fields: [
        { id: "location", type: "location", label: "Incident location", required: true },
        { id: "occurred_at", type: "datetime", label: "Occurred at", required: true },
        { id: "category", type: "select", label: "Category", required: true, options: ["Health & safety", "Service disruption", "Property damage", "Security", "Environmental", "Near miss", "Other"] },
        { id: "severity", type: "select", label: "Severity", required: true, options: ["Low", "Medium", "High", "Critical"] },
        { id: "immediate_action", type: "textarea", label: "Immediate action taken" },
        { id: "details", type: "textarea", label: "Incident details", required: true },
      ],
    },
    {
      id: "field-visit",
      name: "Field Visit",
      description: "Record site visits, outcomes and next actions.",
      icon: "map-pinned",
      accent: "#34d399",
      status: "active",
      version: 1,
      createdAt: isoDaysAgo(25),
      updatedAt: isoDaysAgo(6),
      fields: [
        { id: "location", type: "location", label: "Visit location", required: true },
        { id: "purpose", type: "select", label: "Purpose", required: true, options: ["Routine visit", "Client meeting", "Quality check", "Survey", "Follow-up", "Other"] },
        { id: "contact", type: "text", label: "Contact / stakeholder" },
        { id: "outcome", type: "select", label: "Outcome", options: ["Complete", "Follow-up required", "Escalated", "Cancelled"] },
        { id: "notes", type: "textarea", label: "Notes" },
      ],
    },
    {
      id: "equipment-check",
      name: "Equipment Check",
      description: "Quick equipment condition and availability check.",
      icon: "package-check",
      accent: "#a78bfa",
      status: "active",
      version: 1,
      createdAt: isoDaysAgo(20),
      updatedAt: isoDaysAgo(5),
      fields: [
        { id: "location", type: "location", label: "Location", required: true },
        { id: "equipment", type: "text", label: "Equipment", required: true },
        { id: "condition", type: "select", label: "Condition", options: ["Operational", "Needs attention", "Out of service"] },
        { id: "serial", type: "text", label: "Asset / serial number" },
        { id: "notes", type: "textarea", label: "Notes" },
      ],
    },
  ],
  submissions: [
    {
      id: "rec-1001", formId: "site-inspection", formVersion: 3, createdAt: isoDaysAgo(0, 8), createdBy: "Noor Rahman", status: "Complete",
      values: { location: { label: "London Operations Centre", lat: 51.5033, lng: -0.1195 }, inspection_date: "2026-08-30", condition: "Good", safety: ["No issue"], notes: "Routine inspection completed. No immediate action required." },
    },
    {
      id: "rec-1002", formId: "maintenance-report", formVersion: 2, createdAt: isoDaysAgo(0, 9), createdBy: "Marcus Reed", status: "Open",
      values: { location: { label: "Manchester Service Hub", lat: 53.4849, lng: -2.2322 }, asset: "Loading bay roller shutter", priority: "Urgent", work_type: "Repair", cost: 620, details: "Motor intermittently stalls during closing cycle." },
    },
    {
      id: "rec-1003", formId: "incident-report", formVersion: 4, createdAt: isoDaysAgo(1, 15), createdBy: "Amelia Grant", status: "Investigating",
      values: { location: { label: "Leeds Service Hub", lat: 53.7899, lng: -1.5486 }, occurred_at: "2026-08-29T14:20", category: "Near miss", severity: "Medium", immediate_action: "Area isolated and supervisor notified.", details: "Loose floor panel identified beside service corridor." },
    },
    {
      id: "rec-1004", formId: "field-visit", formVersion: 1, createdAt: isoDaysAgo(2, 11), createdBy: "Noor Rahman", status: "Complete",
      values: { location: { label: "Bristol Regional Office", lat: 51.4497, lng: -2.5853 }, purpose: "Quality check", contact: "Facilities coordinator", outcome: "Follow-up required", notes: "Minor signage updates requested before next audit." },
    },
    {
      id: "rec-1005", formId: "equipment-check", formVersion: 1, createdAt: isoDaysAgo(3, 13), createdBy: "Marcus Reed", status: "Complete",
      values: { location: { label: "Birmingham Depot", lat: 52.4943, lng: -1.8887 }, equipment: "Portable generator 03", condition: "Operational", serial: "NS-GEN-003", notes: "Fuelled and load-tested." },
    },
    {
      id: "rec-1006", formId: "maintenance-report", formVersion: 2, createdAt: isoDaysAgo(4, 16), createdBy: "Noor Rahman", status: "Scheduled",
      values: { location: { label: "London Operations Centre", lat: 51.5033, lng: -0.1195 }, asset: "Reception air curtain", priority: "Routine", work_type: "Replacement", cost: 410, details: "Bearing noise increasing; replace during planned maintenance window." },
    },
    {
      id: "rec-1007", formId: "site-inspection", formVersion: 3, createdAt: isoDaysAgo(5, 10), createdBy: "Amelia Grant", status: "Complete",
      values: { location: { label: "Manchester Service Hub", lat: 53.4849, lng: -2.2322 }, inspection_date: "2026-08-25", condition: "Fair", safety: ["Access", "Trip hazard"], notes: "Temporary cable route requires a protected crossing." },
    },
    {
      id: "rec-1008", formId: "field-visit", formVersion: 1, createdAt: isoDaysAgo(6, 14), createdBy: "Noor Rahman", status: "Complete",
      values: { location: { label: "Leeds Service Hub", lat: 53.7899, lng: -1.5486 }, purpose: "Client meeting", contact: "Regional manager", outcome: "Complete", notes: "Quarterly service review completed." },
    },
    {
      id: "rec-1009", formId: "incident-report", formVersion: 4, createdAt: isoDaysAgo(8, 12), createdBy: "Marcus Reed", status: "Closed",
      values: { location: { label: "Birmingham Depot", lat: 52.4943, lng: -1.8887 }, occurred_at: "2026-08-22T11:40", category: "Service disruption", severity: "Low", immediate_action: "Alternative bay opened.", details: "Short access-control outage at delivery gate." },
    },
  ],
};

export function createBlankWorkspace(id: string, name = "My Organisation"): Workspace {
  return {
    id,
    currentMemberId: "owner",
    name,
    description: "A configurable AtlasOps workspace.",
    forms: [],
    submissions: [],
    locations: [],
    customMarkers: [],
    units: [{ id: "root", name, type: "Organisation", parentId: null }],
    members: [{ id: "owner", name: "Workspace Owner", email: "owner@example.com", role: "Owner", status: "Active" }],
    settings: {
      accent: "#5f8fb4",
      industry: "General operations",
      timezone: "Europe/London",
      terminology: { records: "Records", locations: "Locations", members: "Team" },
      defaultMapLayer: "dark",
    },
  };
}
