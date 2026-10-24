import * as React from "react";
import { cn } from "../../bi/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon, ...props }, ref) => {
    return (
      <div className="relative w-full flex items-center">
        {icon && (
          <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "w-full h-10 min-h-[40px] sm:min-h-[44px] rounded-lg bg-hud-surface border border-white/[0.12] text-sm text-slate-100 placeholder-slate-500",
            icon ? "pl-9 pr-3" : "px-3",
            "focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors duration-150",
            "disabled:cursor-not-allowed disabled:opacity-40",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
