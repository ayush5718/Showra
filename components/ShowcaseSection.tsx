"use client";

import { motion } from "framer-motion";
import { RepoCard, type RepoCardProps } from "./RepoCard";
import { useParallax } from "../lib/hooks/useParallax";

interface ShowcaseSectionProps {
  repo: RepoCardProps;
}

export function ShowcaseSection({ repo }: ShowcaseSectionProps) {
  const topHaloRef = useParallax(0.08);
  const bottomHaloRef = useParallax(-0.05);

  return (
    <section className="relative z-10 mt-[-5rem] flex min-h-[560px] w-full justify-center overflow-hidden px-4 pb-28 pt-[16rem] sm:mt-[-6rem] sm:min-h-[660px] sm:px-10 sm:pb-40 sm:pt-[19rem]">
      <div className="pointer-events-none absolute left-[12%] top-32 -z-5 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,107,255,0.32),transparent_60%)] blur-[120px]" />
      <div className="pointer-events-none absolute right-[8%] bottom-16 -z-5 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.22),transparent_62%)] blur-[150px]" />
      <div className="pointer-events-none absolute inset-x-0 top-[18%] -z-15 h-[420px] -translate-y-[55%] rounded-[50%] bg-[radial-gradient(80%_60%_at_50%_50%,rgba(118,108,255,0.18),transparent_80%)] blur-[120px]" />
      {/* Halo animations tied to parallax */}
      <div
        ref={topHaloRef}
        className="pointer-events-none absolute top-[14%] left-1/2 -z-2 h-[320px] w-[min(88vw,52rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(129,120,255,0.4),transparent_75%)] blur-[140px] opacity-70"
      />
      <div
        ref={bottomHaloRef}
        className="pointer-events-none absolute bottom-[-32%] left-1/2 -z-2 h-[420px] w-[min(96vw,54rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.2),transparent_70%)] blur-[200px] opacity-60"
      />

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <RepoCard {...repo} />
      </motion.div>
    </section>
  );
}
