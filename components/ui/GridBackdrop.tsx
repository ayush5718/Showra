"use client";

import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";

interface GridBackdropProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "bright" | "muted";
  cellSize?: number;
  intensity?: number;
}

export function GridBackdrop({
  className,
  variant = "bright",
  cellSize = 140,
  intensity = 0.08,
  style,
  ...props
}: GridBackdropProps) {
  const baseOpacity = variant === "bright" ? intensity + 0.04 : intensity;
  const blend =
    variant === "bright"
      ? ("screen" as const)
      : ("overlay" as const);

  return (
    <div
      {...props}
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,${baseOpacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,${baseOpacity}) 1px, transparent 1px)
        `,
        backgroundSize: `${cellSize}px ${cellSize}px`,
        mixBlendMode: blend,
        ...style,
      }}
    />
  );
}

