"use client";

import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckSquare,
  ClipboardCheck,
  FileText,
  FormInput,
  Hash,
  Link2,
  Mail,
  MapPin,
  MapPinned,
  PackageCheck,
  Phone,
  Plus,
  Section,
  ToggleLeft,
  Type,
  Wrench,
  CalendarDays,
  Clock3,
  ListChecks,
  AlignLeft,
} from "lucide-react";
import type { FieldType } from "@/lib/types";

export function FormIcon({ name, size = 18 }: { name: string; size?: number }) {
  const props = { size };
  switch (name) {
    case "clipboard-check": return <ClipboardCheck {...props} />;
    case "wrench": return <Wrench {...props} />;
    case "triangle-alert": return <AlertTriangle {...props} />;
    case "map-pinned": return <MapPinned {...props} />;
    case "package-check": return <PackageCheck {...props} />;
    case "building": return <Building2 {...props} />;
    default: return <FileText {...props} />;
  }
}

export function FieldIcon({ type, size = 14 }: { type: FieldType; size?: number }) {
  const props = { size };
  switch (type) {
    case "text": return <Type {...props} />;
    case "textarea": return <AlignLeft {...props} />;
    case "number": return <Hash {...props} />;
    case "date": return <CalendarDays {...props} />;
    case "datetime": return <Clock3 {...props} />;
    case "select": return <FormInput {...props} />;
    case "multiselect": return <ListChecks {...props} />;
    case "boolean": return <ToggleLeft {...props} />;
    case "email": return <Mail {...props} />;
    case "phone": return <Phone {...props} />;
    case "url": return <Link2 {...props} />;
    case "location": return <MapPin {...props} />;
    case "section": return <Section {...props} />;
    default: return <Plus {...props} />;
  }
}

export const fieldTypeLabels: Record<FieldType, string> = {
  text: "Short text",
  textarea: "Long text",
  number: "Number",
  date: "Date",
  datetime: "Date & time",
  select: "Single select",
  multiselect: "Multi select",
  boolean: "Yes / no",
  email: "Email",
  phone: "Phone",
  url: "URL",
  location: "Location / map point",
  section: "Section heading",
};

export { BarChart3, CheckSquare };
