"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigUp,
  Compass,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import { currentMember } from "@/lib/permissions";

type Interaction = "next" | "click" | "role-admin" | "role-member" | "finish";

type TourStep = {
  id: string;
  title: string;
  body: string;
  target: string;
  route: "home" | "submit" | "records" | "map" | "setup" | "forms";
  interaction: Interaction;
  actionLabel?: string;
  hint?: string;
};

const STORAGE_KEY = "atlasops-demo-tour-step-v3";
const CLOSED_KEY = "atlasops-demo-tour-closed-v3";

const steps: TourStep[] = [
  {
    id: "member-home",
    title: "This is the normal worker view",
    body: "You are Noor, a Member. Notice how AtlasOps keeps administration out of the way: your day-to-day workspace is just the tools you need to do the job.",
    target: '[data-guide="role-banner"]',
    route: "home",
    interaction: "next",
    actionLabel: "Show me",
    hint: "We will walk through the worker experience first.",
  },
  {
    id: "submit-nav",
    title: "Start work here",
    body: "Submit is where a Member starts a task. Forms are already prepared by the organisation, so workers never need to understand the form builder.",
    target: '[data-guide="nav-submit"]',
    route: "home",
    interaction: "click",
    hint: "Click the highlighted Submit button.",
  },
  {
    id: "workflow-card",
    title: "These are finished workflows",
    body: "Each card is something the organisation has made available to you. A worker simply chooses the job they are doing and fills it in.",
    target: '[data-guide="submit-first-workflow"]',
    route: "submit",
    interaction: "next",
    actionLabel: "Got it",
    hint: "Admins can change these later without changing the worker experience.",
  },
  {
    id: "records-nav",
    title: "Records is your history",
    body: "Every submitted workflow becomes a record. You do not need to know which database table or form version produced it.",
    target: '[data-guide="nav-records"]',
    route: "submit",
    interaction: "click",
    hint: "Click Records to continue.",
  },
  {
    id: "records-table",
    title: "Everything stays searchable",
    body: "This ledger brings different workflows together. Filters, statuses and exports work across all of them instead of being hard-coded for three form types.",
    target: '[data-guide="records-table"]',
    route: "records",
    interaction: "next",
    actionLabel: "Next",
  },
  {
    id: "map-nav",
    title: "Now the map",
    body: "AtlasOps treats location as a real field type. Any compatible submission can appear on the operational map automatically.",
    target: '[data-guide="nav-map"]',
    route: "records",
    interaction: "click",
    hint: "Click Map.",
  },
  {
    id: "map-main",
    title: "This is the operational picture",
    body: "Organisation sites, submitted locations and custom map markers live together here. The basemap stays online-only, with switchable street, dark, terrain and satellite layers.",
    target: '[data-guide="map-main"]',
    route: "map",
    interaction: "next",
    actionLabel: "Show admin mode",
  },
  {
    id: "switch-admin",
    title: "Now become an Admin",
    body: "This is the important split. A real login would resolve the person's role automatically. In the demo, use this control to preview what an Admin sees.",
    target: '[data-guide="role-preview"]',
    route: "map",
    interaction: "role-admin",
    hint: "Open the highlighted role menu and choose Admin.",
  },
  {
    id: "setup-nav",
    title: "Admin tools just appeared",
    body: "Organisation setup is intentionally separated from normal work. Members never need to see this navigation item.",
    target: '[data-guide="nav-setup"]',
    route: "map",
    interaction: "click",
    hint: "Click Organisation setup.",
  },
  {
    id: "setup-hub",
    title: "This is the control room",
    body: "Admins configure workflows, organisation structure, people, access and branding here. Everyday operational screens stay uncluttered.",
    target: '[data-guide="setup-hub"]',
    route: "setup",
    interaction: "next",
    actionLabel: "Show form setup",
  },
  {
    id: "setup-forms",
    title: "Forms and workflows live here",
    body: "This is where an Admin decides what the organisation needs to collect. Workers only ever see the finished result.",
    target: '[data-guide="setup-forms-card"]',
    route: "setup",
    interaction: "click",
    hint: "Click Forms & workflows.",
  },
  {
    id: "create-form",
    title: "No three-form limit anymore",
    body: "Create as many forms as you need, with as many fields and select options as you need. The same schema then powers submissions, records, analytics and maps.",
    target: '[data-guide="forms-create"]',
    route: "forms",
    interaction: "next",
    actionLabel: "Return to worker view",
  },
  {
    id: "switch-member",
    title: "Switch back to Member",
    body: "Choose Member again. Watch the setup navigation disappear — this is how the real product should feel after login when a normal employee opens AtlasOps.",
    target: '[data-guide="role-preview"]',
    route: "forms",
    interaction: "role-member",
    hint: "Choose Member in the highlighted menu.",
  },
  {
    id: "finish",
    title: "That is the AtlasOps idea",
    body: "Workers get a focused operational tool. Admins get a powerful setup layer. The same product adapts to both without making either person fight through the other person's controls.",
    target: '[data-guide="role-banner"]',
    route: "home",
    interaction: "finish",
    actionLabel: "Finish tour",
    hint: "You can restart this guide at any time from the Guide button.",
  },
];

type TargetBox = {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

type Placement = {
  cardTop: number;
  cardLeft: number;
  arrowTop: number;
  arrowLeft: number;
  arrowDirection: "left" | "right" | "up" | "down";
};

function expectedPath(base: string, route: TourStep["route"]) {
  return route === "home" ? base : `${base}/${route}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function calculatePlacement(box: TargetBox): Placement {
  const cardWidth = Math.min(390, window.innerWidth - 32);
  const cardHeight = 260;
  const gap = 34;
  const centerX = box.left + box.width / 2;
  const centerY = box.top + box.height / 2;
  const roomRight = window.innerWidth - box.right;
  const roomLeft = box.left;

  if (roomRight > cardWidth + gap && centerX < window.innerWidth * 0.6) {
    return {
      cardTop: clamp(centerY - cardHeight / 2, 18, window.innerHeight - cardHeight - 18),
      cardLeft: clamp(box.right + gap + 30, 16, window.innerWidth - cardWidth - 16),
      arrowTop: centerY - 30,
      arrowLeft: box.right + 10,
      arrowDirection: "left",
    };
  }

  if (roomLeft > cardWidth + gap) {
    return {
      cardTop: clamp(centerY - cardHeight / 2, 18, window.innerHeight - cardHeight - 18),
      cardLeft: clamp(box.left - cardWidth - gap - 30, 16, window.innerWidth - cardWidth - 16),
      arrowTop: centerY - 30,
      arrowLeft: box.left - 70,
      arrowDirection: "right",
    };
  }

  if (box.bottom + cardHeight + gap < window.innerHeight) {
    return {
      cardTop: box.bottom + gap + 28,
      cardLeft: clamp(centerX - cardWidth / 2, 16, window.innerWidth - cardWidth - 16),
      arrowTop: box.bottom + 8,
      arrowLeft: centerX - 30,
      arrowDirection: "up",
    };
  }

  return {
    cardTop: clamp(box.top - cardHeight - gap - 28, 18, window.innerHeight - cardHeight - 18),
    cardLeft: clamp(centerX - cardWidth / 2, 16, window.innerWidth - cardWidth - 16),
    arrowTop: box.top - 70,
    arrowLeft: centerX - 30,
    arrowDirection: "down",
  };
}

export function GuideBubble({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { workspace, setCurrentMember } = useWorkspace();
  const base = `/workspace/${workspaceId}`;
  const [stepIndex, setStepIndex] = useState(0);
  const [open, setOpen] = useState(true);
  const [targetBox, setTargetBox] = useState<TargetBox | null>(null);
  const [ready, setReady] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const current = steps[Math.min(stepIndex, steps.length - 1)];
  const placement = useMemo(() => targetBox ? calculatePlacement(targetBox) : null, [targetBox]);

  useEffect(() => {
    if (workspaceId !== "demo") return;
    const saved = Number(sessionStorage.getItem(STORAGE_KEY) || "0");
    const closed = sessionStorage.getItem(CLOSED_KEY) === "1";
    if (Number.isFinite(saved) && saved >= 0 && saved < steps.length) setStepIndex(saved);
    setOpen(!closed);
    setReady(true);
  }, [workspaceId]);

  useEffect(() => {
    if (!ready || !open || workspaceId !== "demo" || stepIndex !== 0) return;
    const member = currentMember(workspace);
    if (member.role !== "Member") {
      const demoMember = workspace.members.find((item) => item.role === "Member" && item.status === "Active");
      if (demoMember) setCurrentMember(demoMember.id);
    }
  }, [open, ready, setCurrentMember, stepIndex, workspace, workspaceId]);

  useEffect(() => {
    if (!ready || !open || workspaceId !== "demo") return;
    sessionStorage.setItem(STORAGE_KEY, String(stepIndex));
    const wanted = expectedPath(base, current.route);
    if (pathname !== wanted) {
      const timer = window.setTimeout(() => router.replace(wanted), 120);
      return () => window.clearTimeout(timer);
    }
  }, [base, current.route, open, pathname, ready, router, stepIndex, workspaceId]);

  useEffect(() => {
    if (!ready || !open || workspaceId !== "demo") return;
    let target: HTMLElement | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let raf = 0;

    const updateBox = () => {
      if (!target || !document.body.contains(target)) return;
      const rect = target.getBoundingClientRect();
      setTargetBox({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
      });
    };

    const advance = () => {
      const next = Math.min(stepIndex + 1, steps.length - 1);
      sessionStorage.setItem(STORAGE_KEY, String(next));
      setStepIndex(next);
    };

    const handleClick = () => {
      if (current.interaction !== "click") return;
      advance();
    };

    const handleChange = (event: Event) => {
      if (current.interaction !== "role-admin" && current.interaction !== "role-member") return;
      const select = event.target instanceof HTMLSelectElement ? event.target : target?.querySelector("select");
      const role = select instanceof HTMLSelectElement ? select.selectedOptions[0]?.textContent?.trim() : "";
      const expected = current.interaction === "role-admin" ? "Admin" : "Member";
      if (role === expected) {
        advance();
        if (expected === "Member") window.setTimeout(() => router.push(base), 80);
      }
    };

    const attach = () => {
      const nextTarget = document.querySelector(current.target) as HTMLElement | null;
      if (!nextTarget) return false;
      target = nextTarget;
      target.classList.add("tour-target-active");
      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      updateBox();
      resizeObserver = new ResizeObserver(updateBox);
      resizeObserver.observe(target);
      window.addEventListener("resize", updateBox);
      window.addEventListener("scroll", updateBox, true);
      target.addEventListener("click", handleClick, true);
      target.addEventListener("change", handleChange, true);
      return true;
    };

    if (!attach()) {
      mutationObserver = new MutationObserver(() => {
        if (target || !attach()) return;
        mutationObserver?.disconnect();
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    raf = window.requestAnimationFrame(updateBox);

    return () => {
      window.cancelAnimationFrame(raf);
      mutationObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateBox);
      window.removeEventListener("scroll", updateBox, true);
      if (target) {
        target.classList.remove("tour-target-active");
        target.removeEventListener("click", handleClick, true);
        target.removeEventListener("change", handleChange, true);
      }
      setTargetBox(null);
    };
  }, [base, current.interaction, current.target, open, pathname, ready, router, stepIndex, workspaceId]);

  if (workspaceId !== "demo" || !ready) return null;

  function next() {
    const nextStep = Math.min(stepIndex + 1, steps.length - 1);
    sessionStorage.setItem(STORAGE_KEY, String(nextStep));
    setStepIndex(nextStep);
  }

  function back() {
    const previous = Math.max(stepIndex - 1, 0);
    sessionStorage.setItem(STORAGE_KEY, String(previous));
    setStepIndex(previous);
  }

  function close() {
    sessionStorage.setItem(CLOSED_KEY, "1");
    setOpen(false);
  }

  function restart() {
    const demoMember = workspace.members.find((item) => item.role === "Member" && item.status === "Active");
    if (demoMember) setCurrentMember(demoMember.id);
    sessionStorage.removeItem(CLOSED_KEY);
    sessionStorage.setItem(STORAGE_KEY, "0");
    setStepIndex(0);
    setOpen(true);
    router.push(base);
  }

  function finish() {
    sessionStorage.setItem(CLOSED_KEY, "1");
    sessionStorage.setItem(STORAGE_KEY, "0");
    setOpen(false);
  }

  if (!open) {
    return (
      <button className="tour-reopen" onClick={restart} aria-label="Restart AtlasOps guided tour">
        <Compass />
        <span>Guide me</span>
      </button>
    );
  }

  const ArrowIcon = placement?.arrowDirection === "left" ? ArrowBigLeft
    : placement?.arrowDirection === "right" ? ArrowBigRight
    : placement?.arrowDirection === "up" ? ArrowBigUp
    : ArrowBigDown;

  return (
    <div className="tour-layer" aria-live="polite">
      {targetBox && <div className="tour-spotlight" style={{ top: targetBox.top - 7, left: targetBox.left - 7, width: targetBox.width + 14, height: targetBox.height + 14 }} />}
      {placement && <div className={`tour-arrow dir-${placement.arrowDirection}`} style={{ top: placement.arrowTop, left: placement.arrowLeft }}><ArrowIcon /></div>}
      <div
        ref={cardRef}
        className="tour-card"
        style={placement ? { top: placement.cardTop, left: placement.cardLeft } : { right: 24, bottom: 24 }}
      >
        <div className="tour-card-top">
          <div className="tour-eyebrow"><Sparkles /> Interactive guide</div>
          <button className="btn ghost icon-only small" onClick={close} aria-label="Close guide"><X /></button>
        </div>
        <div className="tour-step-count">Step {stepIndex + 1} of {steps.length}</div>
        <h3>{current.title}</h3>
        <p>{current.body}</p>
        {current.hint && <div className="tour-hint">{current.hint}</div>}
        <div className="tour-footer">
          <div className="tour-progress">{steps.map((step, index) => <i className={index === stepIndex ? "active" : index < stepIndex ? "done" : ""} key={step.id} />)}</div>
          <div className="tour-actions">
            {stepIndex > 0 && <button className="btn ghost small" onClick={back}>Back</button>}
            {current.interaction === "next" && <button className="btn small" onClick={next}>{current.actionLabel || "Next"}</button>}
            {current.interaction === "finish" && <button className="btn small" onClick={finish}>{current.actionLabel || "Finish"}</button>}
            {(current.interaction === "click" || current.interaction === "role-admin" || current.interaction === "role-member") && <span className="tour-waiting"><i /> Waiting for you</span>}
          </div>
        </div>
        <button className="tour-restart-link" onClick={restart}><RotateCcw /> Restart tour</button>
      </div>
    </div>
  );
}
