"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  BarChart3,
  Building2,
  FileText,
  FormInput,
  LayoutDashboard,
  MapPinned,
  Search,
  Settings,
  ShieldCheck,
  Users2,
  WandSparkles,
} from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";
import { canConfigure, canSubmit, canViewAnalytics, currentMember } from "@/lib/permissions";
import { AtlasLogo } from "./AtlasLogo";

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams<{ workspaceId: string }>();
  const { workspace, setCurrentMember } = useWorkspace();
  const base = `/workspace/${params.workspaceId}`;
  const member = currentMember(workspace);
  const setupAllowed = canConfigure(member.role);

  const workNav = [
    ["", "Home", LayoutDashboard],
    ...(canSubmit(member.role) ? [["submit", "Submit", FormInput] as const] : []),
    ["records", workspace.settings.terminology.records, FileText],
    ["map", "Map", MapPinned],
    ...(canViewAnalytics(member.role) ? [["analytics", "Analytics", BarChart3] as const] : []),
  ] as const;

  const setupNav = [["setup", "Organisation setup", Settings]] as const;

  function navItem(segment: string, label: string, Icon: typeof LayoutDashboard) {
    const href = segment ? `${base}/${segment}` : base;
    const setupChild = ["forms", "structure", "team", "settings"].some((part) => pathname.startsWith(`${base}/${part}`));
    const active = segment === "setup" ? pathname.startsWith(`${base}/setup`) || setupChild : segment ? pathname.startsWith(href) : pathname === base;
    return <Link data-guide={`nav-${segment || "home"}`} className={`nav-item ${active ? "active" : ""}`} href={href} key={segment || "overview"}><Icon /><span>{label}</span></Link>;
  }

  return (
    <div className="app-shell" style={{ "--accent": workspace.settings.accent } as React.CSSProperties}>
      <aside className="sidebar">
        <Link href="/" className="brand"><AtlasLogo /></Link>
        <div className="workspace-switch">
          <div className="eyebrow">You are working in</div>
          <div className="workspace-name">{workspace.name}</div>
          <div className="workspace-role"><span /> {member.role} access</div>
        </div>

        <div className="nav-label">Your work</div>
        <nav className="nav">{workNav.map(([segment, label, Icon]) => navItem(segment, label, Icon))}</nav>

        {setupAllowed && <>
          <div className="nav-divider" />
          <div className="nav-label">Set up organisation</div>
          <nav className="nav setup-nav">{setupNav.map(([segment, label, Icon]) => navItem(segment, label, Icon))}</nav>
        </>}

        <div className="sidebar-footer">
          {workspace.isDemo && <div className="demo-chip"><ShieldCheck /><div><strong>Safe demo workspace</strong><span>Fictional UK data. Try anything.</span></div></div>}
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-search"><Search /><input placeholder={`Search ${workspace.settings.terminology.records.toLowerCase()}, forms and locations…`} /></div>
          <div className="topbar-right">
            {workspace.isDemo && <label className="role-preview" data-guide="role-preview">
              <span>Preview as</span>
              <select value={member.id} onChange={(e) => setCurrentMember(e.target.value)}>
                {workspace.members.filter((item) => item.status === "Active").map((item) => <option value={item.id} key={item.id}>{item.role}</option>)}
              </select>
            </label>}
            <div className="person-chip"><div className="avatar">{member.name.split(" ").map((part) => part[0]).join("").slice(0,2)}</div><div><strong>{member.name}</strong><span>{member.role}</span></div></div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
