"use client";

import { createBlankWorkspace, demoWorkspace } from "./demo-data";
import type { Workspace } from "./types";

const STORAGE_KEY = "atlasops.workspaces.v2";

function normalizeWorkspace(workspace: Workspace): Workspace {
  const fallbackMember = workspace.members?.find((member) => member.status === "Active") || workspace.members?.[0];
  return {
    ...workspace,
    currentMemberId: workspace.currentMemberId || fallbackMember?.id || "owner",
  };
}

function safeParse(raw: string | null): Record<string, Workspace> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, Workspace>;
  } catch {
    return {};
  }
}

export function loadAllWorkspaces(): Record<string, Workspace> {
  if (typeof window === "undefined") return {};
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function saveAllWorkspaces(workspaces: Record<string, Workspace>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
}

export function loadWorkspace(id: string): Workspace {
  if (typeof window === "undefined") {
    return id === "demo" ? structuredClone(demoWorkspace) : createBlankWorkspace(id);
  }
  const all = loadAllWorkspaces();
  if (all[id]) return normalizeWorkspace(all[id]);
  const workspace = id === "demo" ? structuredClone(demoWorkspace) : createBlankWorkspace(id);
  all[id] = workspace;
  saveAllWorkspaces(all);
  return normalizeWorkspace(workspace);
}

export function saveWorkspace(workspace: Workspace) {
  const all = loadAllWorkspaces();
  all[workspace.id] = normalizeWorkspace(workspace);
  saveAllWorkspaces(all);
}

export function resetDemoWorkspace() {
  const all = loadAllWorkspaces();
  all.demo = structuredClone(demoWorkspace);
  saveAllWorkspaces(all);
  return all.demo;
}

export function createWorkspace(name: string, industry: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "workspace";
  const all = loadAllWorkspaces();
  let id = base;
  let suffix = 2;
  while (all[id] || id === "demo") {
    id = `${base}-${suffix++}`;
  }
  const workspace = createBlankWorkspace(id, name.trim() || "My Organisation");
  workspace.settings.industry = industry.trim() || "General operations";
  all[id] = workspace;
  saveAllWorkspaces(all);
  return workspace;
}
