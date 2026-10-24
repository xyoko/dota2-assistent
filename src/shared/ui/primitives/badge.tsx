import * as React from "react";
import { cn } from "../../bi/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "radiant" | "dire" | "gold" | "accent" | "gradient";
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles: Record<string, string> = {
    default: "border-sky-500/30 bg-sky-950/60 text-sky-300",
    accent: "border-sky-500/30 bg-sky-950/60 text-sky-300",
    gradient: "border-sky-500/30 bg-sky-950/60 text-sky-300",
    radiant: "border-emerald-500/40 bg-emerald-950/60 text-emerald-300",
    dire: "border-red-500/40 bg-red-950/60 text-red-300",
    destructive: "border-red-500/40 bg-red-950/60 text-red-300",
    gold: "border-amber-500/40 bg-amber-950/60 text-amber-300 font-bold",
    secondary: "border-white/[0.08] bg-hud-raised text-slate-300",
    outline: "border-white/[0.14] text-slate-300 bg-transparent"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-mono font-medium transition-colors select-none",
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
