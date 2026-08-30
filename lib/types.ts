export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "datetime"
  | "select"
  | "multiselect"
  | "boolean"
  | "email"
  | "phone"
  | "url"
  | "location"
  | "section";

export type RecordValue = string | number | boolean | string[] | LocationValue | null;

export interface LocationValue {
  label: string;
  lat: number;
  lng: number;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
}

export interface OpsForm {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent: string;
  status: "active" | "draft";
  version: number;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  formId: string;
  formVersion: number;
  createdAt: string;
  createdBy: string;
  status: string;
  values: Record<string, RecordValue>;
}

export interface OrgLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  unitId?: string;
}

export interface CustomMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  notes?: string;
  color: string;
}

export interface OrgUnit {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  status: "Active" | "Invited";
}

export interface WorkspaceSettings {
  accent: string;
  industry: string;
  timezone: string;
  terminology: {
    records: string;
    locations: string;
    members: string;
  };
  defaultMapLayer: "dark" | "street" | "terrain" | "satellite";
}

export interface Workspace {
  id: string;
  currentMemberId: string;
  name: string;
  description: string;
  isDemo?: boolean;
  forms: OpsForm[];
  submissions: Submission[];
  locations: OrgLocation[];
  customMarkers: CustomMarker[];
  units: OrgUnit[];
  members: Member[];
  settings: WorkspaceSettings;
}

export interface MapPoint {
  id: string;
  name: string;
  subtitle?: string;
  lat: number;
  lng: number;
  category: "location" | "record" | "marker";
  color: string;
  icon: string;
  recordId?: string;
  formId?: string;
}
