import type { Member, Workspace } from "./types";

export type WorkspaceRole = Member["role"];

export function currentMember(workspace: Workspace): Member {
  return workspace.members.find((member) => member.id === workspace.currentMemberId)
    || workspace.members.find((member) => member.status === "Active")
    || workspace.members[0]
    || { id: "guest", name: "Guest", email: "", role: "Viewer", status: "Active" };
}

export function canConfigure(role: WorkspaceRole) {
  return role === "Owner" || role === "Admin";
}

export function canSubmit(role: WorkspaceRole) {
  return role === "Owner" || role === "Admin" || role === "Member";
}

export function canViewAnalytics(role: WorkspaceRole) {
  return role === "Owner" || role === "Admin";
}
