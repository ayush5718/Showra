"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "../../lib/utils/cn";

interface HeroHighlightProps extends React.HTMLAttributes<HTMLDivElement> {
  containerClassName?: string;
}

export function HeroHighlight({
  children,
  className,
  containerClassName,
  ...props
}: HeroHighlightProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-white/8 via-white/4 to-transparent p-[1px] shadow-[0_60px_120px_-40px_rgba(30,64,175,0.4)] sm:rounded-[40px]",
        containerClassName,
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-[#070712]">
        <motion.div
          className="absolute left-1/2 top-0 h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(118,106,255,0.32),transparent_65%)] blur-3xl"
          initial={{ opacity: 0, scale: 0.75, y: -60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute left-[18%] top-1/2 h-[340px] w-[360px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.22),transparent_68%)] blur-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.9, scale: 1.05 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="absolute right-[14%] top-[62%] h-[280px] w-[320px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(192,128,255,0.18),transparent_70%)] blur-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.85, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div
        className={cn(
          "relative z-10 flex min-h-[420px] flex-col items-center justify-center bg-gradient-to-b from-white/5/[0.06] via-transparent to-transparent px-4 py-10 sm:min-h-[460px] sm:px-12 sm:py-20",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface HighlightProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function Highlight({ children, className, ...props }: HighlightProps) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center text-balance",
        className,
      )}
      {...props}
    >
      <span className="absolute inset-x-0 bottom-1 h-4 rounded-full bg-gradient-to-r from-[#6c63ff]/35 via-[#7f7bff]/22 to-[#00d4ff]/45 blur-2xl" />
      <span className="relative">{children}</span>
    </span>
  );
}

