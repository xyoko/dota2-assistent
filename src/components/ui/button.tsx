import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-indigo-600 text-white shadow hover:opacity-85",
      destructive: "bg-red-600 text-white shadow-sm hover:opacity-85",
      outline: "border border-slate-700 bg-transparent text-slate-200 shadow-sm hover:bg-slate-800 hover:opacity-90",
      secondary: "bg-slate-800 text-slate-100 shadow-sm hover:opacity-85",
      ghost: "text-slate-300 hover:bg-slate-800 hover:opacity-90",
      link: "text-indigo-400 underline-offset-4 hover:underline",
      gradient: "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg hover:opacity-85"
    };

    const sizeStyles = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-11 rounded-md px-8 text-base",
      icon: "h-9 w-9"
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 btn-fade",
          variantStyles[variant],
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
