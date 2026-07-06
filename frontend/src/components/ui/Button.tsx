"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  primary: "bg-[#1A1A2E] text-white hover:bg-[#2d2d4a]",
  secondary: "bg-[#3B4FE8] dark:bg-indigo-500 text-white hover:bg-[#2d3dd4]",
  outline: "bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#1E293B] dark:text-slate-100 hover:bg-[#F8FAFC] dark:hover:bg-slate-900",
  ghost: "bg-transparent text-[#64748B] dark:text-slate-400 hover:bg-[#F8FAFC] dark:hover:bg-slate-900 hover:text-[#1E293B] dark:hover:text-slate-100",
  danger: "bg-[#EF4444] text-white hover:bg-[#DC2626]",
};

// Sizes are tuned so every interactive control — including icon-only buttons —
// keeps at least a 40x40px hit target (Fitts's Law) instead of the ad-hoc
// p-1/w-5/w-8 mix that was scattered across pages.
const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2 rounded-lg",
  icon: "h-10 w-10 rounded-lg",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed outline-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;
