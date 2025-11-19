"use client";

import { forwardRef } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  glow?: boolean;
}

const baseClasses =
  "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primary]/70";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] text-white hover:brightness-110",
  secondary:
    "border border-white/10 bg-white/5 text-[--text-primary] hover:border-[--secondary] hover:text-[--secondary]",
};

const sizeClasses: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", glow = false, className = "", ...props }, ref) => {
    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      glow
        ? variant === "primary"
          ? "shadow-[0_0_40px_rgba(108,99,255,0.45)]"
          : "shadow-[0_0_25px_rgba(0,212,255,0.25)]"
        : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return <button ref={ref} className={classes} {...props} />;
  }
);

Button.displayName = "Button";
