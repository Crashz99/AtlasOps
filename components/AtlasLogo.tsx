import { Globe2 } from "lucide-react";

export function AtlasLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`atlas-logo ${compact ? "compact" : ""}`} aria-label="AtlasOps">
      <div className="atlas-logo-mark">
        <Globe2 strokeWidth={1.7} />
        <span className="atlas-orbit" />
      </div>
      {!compact && <div className="brand-copy"><strong>AtlasOps</strong><span>Operations, your way</span></div>}
    </div>
  );
}
