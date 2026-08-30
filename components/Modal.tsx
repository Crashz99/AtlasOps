"use client";

import { X } from "lucide-react";

export function Modal({
  title,
  children,
  onClose,
  footer,
  size = "medium",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  size?: "small" | "medium" | "large";
}) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <div className={`modal ${size === "small" ? "small" : size === "medium" ? "medium" : ""}`}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn ghost icon-only" onClick={onClose} aria-label="Close dialog"><X /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
