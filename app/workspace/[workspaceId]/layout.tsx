import { WorkspaceProvider } from "@/lib/workspace-context";
import { WorkspaceShell } from "@/components/WorkspaceShell";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceProvider><WorkspaceShell>{children}</WorkspaceShell></WorkspaceProvider>;
}
