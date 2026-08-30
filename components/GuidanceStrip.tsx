import { Lightbulb, Sparkles } from "lucide-react";

export function GuidanceStrip({ title, children, tone = "blue" }: { title: string; children: React.ReactNode; tone?: "blue" | "green" | "purple" }) {
  return (
    <div className={`guidance-strip ${tone}`}>
      <div className="guidance-icon">{tone === "purple" ? <Sparkles /> : <Lightbulb />}</div>
      <div><strong>{title}</strong><span>{children}</span></div>
    </div>
  );
}
