"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { demoWorkspace } from "./demo-data";
import { loadWorkspace, resetDemoWorkspace, saveWorkspace } from "./workspace-storage";
import type { CustomMarker, Member, OpsForm, OrgLocation, OrgUnit, Submission, Workspace } from "./types";

interface WorkspaceContextValue {
  workspace: Workspace;
  hydrated: boolean;
  updateWorkspace: (patch: Partial<Workspace>) => void;
  saveForm: (form: OpsForm) => void;
  deleteForm: (formId: string) => void;
  addSubmission: (submission: Submission) => void;
  deleteSubmission: (submissionId: string) => void;
  addLocation: (location: OrgLocation) => void;
  addMarker: (marker: CustomMarker) => void;
  deleteMarker: (markerId: string) => void;
  addUnit: (unit: OrgUnit) => void;
  addMember: (member: Member) => void;
  setCurrentMember: (memberId: string) => void;
  resetDemo: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId || "demo";
  const [workspace, setWorkspace] = useState<Workspace>(() => workspaceId === "demo" ? structuredClone(demoWorkspace) : ({ ...structuredClone(demoWorkspace), id: workspaceId, name: "Workspace", isDemo: false }));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setWorkspace(loadWorkspace(workspaceId));
    setHydrated(true);
  }, [workspaceId]);

  const commit = useCallback((updater: (current: Workspace) => Workspace) => {
    setWorkspace((current) => {
      const next = updater(current);
      saveWorkspace(next);
      return next;
    });
  }, []);

  const value = useMemo<WorkspaceContextValue>(() => ({
    workspace,
    hydrated,
    updateWorkspace: (patch) => commit((current) => ({ ...current, ...patch })),
    saveForm: (form) => commit((current) => ({
      ...current,
      forms: current.forms.some((item) => item.id === form.id)
        ? current.forms.map((item) => item.id === form.id ? form : item)
        : [...current.forms, form],
    })),
    deleteForm: (formId) => commit((current) => ({
      ...current,
      forms: current.forms.filter((form) => form.id !== formId),
    })),
    addSubmission: (submission) => commit((current) => ({ ...current, submissions: [submission, ...current.submissions] })),
    deleteSubmission: (submissionId) => commit((current) => ({ ...current, submissions: current.submissions.filter((record) => record.id !== submissionId) })),
    addLocation: (location) => commit((current) => ({ ...current, locations: [...current.locations, location] })),
    addMarker: (marker) => commit((current) => ({ ...current, customMarkers: [...current.customMarkers, marker] })),
    deleteMarker: (markerId) => commit((current) => ({ ...current, customMarkers: current.customMarkers.filter((marker) => marker.id !== markerId) })),
    addUnit: (unit) => commit((current) => ({ ...current, units: [...current.units, unit] })),
    addMember: (member) => commit((current) => ({ ...current, members: [...current.members, member] })),
    setCurrentMember: (memberId) => commit((current) => ({ ...current, currentMemberId: memberId })),
    resetDemo: () => {
      const next = resetDemoWorkspace();
      setWorkspace(next);
    },
  }), [workspace, hydrated, commit]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return context;
}
