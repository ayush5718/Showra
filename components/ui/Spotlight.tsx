"use client";

import { motion } from "framer-motion";
import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";

interface SpotlightProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  blur?: number;
  color?: string;
  speed?: number;
}

export function Spotlight({
  size = 520,
  blur = 180,
  color = "rgba(111, 94, 255, 0.28)",
  speed = 22,
  className,
  style,
  ...props
}: SpotlightProps) {
  const dimension = `${size}px`;
  const customStyle: CSSProperties = {
    width: dimension,
    height: dimension,
    filter: `blur(${blur}px)`,
    background: color,
    ...style,
  };

  return (
    <div
      {...props}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 mix-blend-screen"
        style={customStyle}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
      />
    </div>
  );
}

