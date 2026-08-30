"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Building2, Database, MapPinned, PanelTop, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Modal } from "./Modal";
import { createWorkspace } from "@/lib/workspace-storage";
import { AtlasLogo } from "./AtlasLogo";

const features: Array<{ icon: LucideIcon; title: string; copy: string }> = [
  { icon: PanelTop, title: "Unlimited form builder", copy: "Add whatever fields and options you need. Every form is generated from its schema." },
  { icon: Database, title: "Universal record ledger", copy: "Search, filter and export submissions from every custom form in one consistent workspace." },
  { icon: MapPinned, title: "Online operational maps", copy: "Any form with location data can appear automatically on the dashboard and full map." },
  { icon: BarChart3, title: "Schema-aware analytics", copy: "Break down your own select fields and form activity instead of using fixed charts." },
  { icon: Building2, title: "Flexible organisation structure", copy: "Model regions, departments, programmes, sites or teams without Group A / Group B." },
  { icon: Sparkles, title: "Guided demo", copy: "A populated fictional UK organisation teaches the product before you create your own workspace." },
];

export function LandingPage() {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const router = useRouter();

  function create() {
    const workspace = createWorkspace(name || "My Organisation", industry || "General operations");
    router.push(`/workspace/${workspace.id}`);
  }

  return (
    <main className="landing">
      <nav className="landing-nav">
        <div className="brand" style={{ padding: 0 }}><AtlasLogo /></div>
        <div className="landing-actions">
          <Link className="btn secondary" href="/workspace/demo">Explore demo</Link>
          <button className="btn" onClick={() => setCreating(true)}>Create workspace <ArrowRight /></button>
        </div>
      </nav>

      <section className="hero">
        <div>
          <div className="hero-kicker"><Sparkles size={12} /> Built around your operation</div>
          <h1>Build the operational system your organisation actually needs.</h1>
          <p>
            Create unlimited custom forms, collect structured records, map activity, organise teams and turn day-to-day data into useful operational insight — without forcing your organisation into a fixed template.
          </p>
          <div className="hero-ctas">
            <Link className="btn" href="/workspace/demo">Explore UK demo <ArrowRight /></Link>
            <button className="btn secondary" onClick={() => setCreating(true)}>Create your organisation</button>
          </div>
          <div className="hero-note">The demo uses fictional Northstar Facilities UK data. No account is required.</div>
        </div>

        <div className="hero-ui">
          <div className="hero-glow" />
          <div className="hero-window">
            <div className="hero-window-bar"><i /><i /><i /></div>
            <div className="hero-window-body">
              <div className="hero-mini-side">
                <div className="hero-mini-logo" />
                <div className="hero-mini-nav active" />
                <div className="hero-mini-nav" />
                <div className="hero-mini-nav" />
                <div className="hero-mini-nav" />
                <div className="hero-mini-nav" />
              </div>
              <div className="hero-mini-main">
                <div style={{ width: "38%", height: 10, borderRadius: 5, background: "#273441" }} />
                <div className="hero-mini-kpis"><div className="hero-mini-kpi" /><div className="hero-mini-kpi" /><div className="hero-mini-kpi" /></div>
                <div className="hero-mini-map" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-head">
          <h2>One workspace, shaped by your organisation.</h2>
          <p>AtlasOps keeps the useful operational ideas from the original project — ledger, maps, hierarchy and analytics — and removes the hard-coded form assumptions underneath them.</p>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, copy }) => (
            <div className="card feature-card" key={title}>
              <Icon size={18} />
              <strong>{title}</strong>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      {creating && (
        <Modal
          title="Create your organisation"
          size="small"
          onClose={() => setCreating(false)}
          footer={<><button className="btn secondary" onClick={() => setCreating(false)}>Cancel</button><button className="btn" onClick={create}>Create workspace <ArrowRight /></button></>}
        >
          <div className="field-group">
            <label>Organisation name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Westfield Community Services" autoFocus />
          </div>
          <div className="field-group">
            <label>Industry / operating context</label>
            <input className="input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Facilities, charity, field services, research..." />
          </div>
          <p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.6, marginBottom: 0 }}>
            Your new workspace starts blank. You can then create forms, locations, organisation units and team members in any order.
          </p>
        </Modal>
      )}
    </main>
  );
}
