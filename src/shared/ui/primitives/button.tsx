import * as React from "react";
import { cn } from "../../bi/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "radiant" | "dire" | "gold" | "accent" | "gradient";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantStyles: Record<string, string> = {
      default: "bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold shadow-sm",
      accent: "bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold shadow-sm",
      gradient: "bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold shadow-sm",
      destructive: "bg-red-600 hover:bg-red-500 text-white font-semibold shadow-sm",
      dire: "bg-red-600 hover:bg-red-500 text-white font-semibold shadow-sm",
      radiant: "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm",
      gold: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-sm",
      outline: "border border-white/[0.14] bg-hud-raised hover:bg-hud-elevated text-slate-200 hover:border-white/[0.24]",
      secondary: "bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700",
      ghost: "text-slate-300 hover:bg-white/[0.06] hover:text-white",
      link: "text-sky-400 underline-offset-4 hover:underline p-0 h-auto"
    };

    const sizeStyles = {
      default: "h-10 px-4 py-2 text-sm rounded-lg min-h-[40px] sm:min-h-[44px]",
      sm: "h-8 rounded-md px-3 text-xs min-h-[32px]",
      lg: "h-12 rounded-lg px-6 text-base min-h-[48px]",
      icon: "h-10 w-10 rounded-lg min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px]"
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 select-none cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a0f]",
          "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
          variantStyles[variant] || variantStyles.default,
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
