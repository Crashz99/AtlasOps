import type { Metadata } from "next";
import "./globals.css";
import { AmbientBackground } from "@/components/AmbientBackground";

export const metadata: Metadata = {
  title: {
    default: "AtlasOps — Configurable Operations Workspace",
    template: "%s · AtlasOps",
  },
  description: "Build forms, collect records, map activity and analyse operations in one configurable workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><AmbientBackground />{children}</body>
    </html>
  );
}
