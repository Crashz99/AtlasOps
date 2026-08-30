"use client";

import { useEffect } from "react";

export function AmbientBackground() {
  useEffect(() => {
    const move = (event: PointerEvent) => {
      const x = `${(event.clientX / window.innerWidth) * 100}%`;
      const y = `${(event.clientY / window.innerHeight) * 100}%`;
      document.documentElement.style.setProperty("--pointer-x", x);
      document.documentElement.style.setProperty("--pointer-y", y);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return <div className="ambient-bg" aria-hidden="true"><i /><i /><i /></div>;
}
