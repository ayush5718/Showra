"use client";

import { motion } from "framer-motion";
import { InputBox } from "./InputBox";
import { HeroHighlight, Highlight } from "./ui/HeroHighlight";
import { Sparkles, BarChart3, Share2, Coffee } from "lucide-react";

interface HeroSectionProps {
  onGenerate: (value: string) => void;
}

export function HeroSection({ onGenerate }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 pb-20 pt-28 text-center sm:px-10 sm:pb-24 sm:pt-32">
      <HeroHighlight containerClassName="w-full max-w-[68rem]">
        <motion.div
          className="flex w-full max-w-[58rem] flex-col items-center gap-6 px-3 sm:gap-7 sm:px-10"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.32em] text-white/70 sm:px-5 sm:text-xs sm:tracking-[0.4em]"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Share your build in style
          </motion.span>

          <motion.div
            className="flex w-full max-w-[46rem] flex-col items-center gap-4 text-balance text-white"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-white/70 sm:hidden">
              Build in style
            </span>
            <motion.h1 className="text-[1.55rem] font-semibold leading-[1.08] sm:text-[2.45rem] md:text-[3.15rem]">
              Turn your GitHub repo into{" "}
              <Highlight className="text-white">a shareable project card</Highlight>
            </motion.h1>
          </motion.div>

          <motion.p
            className="w-full max-w-[46rem] text-balance text-sm leading-relaxed text-white/70 sm:text-base md:text-lg"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            Create a beautiful project card you can instantly share with investors, communities, and social feeds. Paste
            the repo link below to generate your showcase.
          </motion.p>

          <motion.div
            className="grid w-full max-w-[32rem] grid-cols-3 gap-2 text-[0.73rem] text-white/70 sm:max-w-full sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-3 sm:text-sm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.06] px-2.5 py-2 text-center font-medium text-white/75 shadow-[0_18px_40px_-32px_rgba(88,106,255,0.7)] sm:flex-row sm:gap-2 sm:px-4 sm:py-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-[#6c63ff] via-[#7f7bff] to-[#33d3ff] text-white sm:h-7 sm:w-7">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="leading-tight">AI-crafted highlights</span>
            </span>
            <span className="flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.06] px-2.5 py-2 text-center font-medium text-white/75 shadow-[0_18px_40px_-32px_rgba(50,194,255,0.7)] sm:flex-row sm:gap-2 sm:px-4 sm:py-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-[#00d4ff] via-[#33d3ff] to-[#7f7bff] text-white sm:h-7 sm:w-7">
                <BarChart3 className="h-3.5 w-3.5" />
              </span>
              <span className="leading-tight">Automatic repo stats</span>
            </span>
            <span className="flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.06] px-2.5 py-2 text-center font-medium text-white/75 shadow-[0_18px_40px_-32px_rgba(86,92,255,0.7)] sm:flex-row sm:gap-2 sm:px-4 sm:py-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-[#7f7bff] via-[#6c63ff] to-[#4b66ff] text-white sm:h-7 sm:w-7">
                <Share2 className="h-3.5 w-3.5" />
              </span>
              <span className="leading-tight">One-click sharing</span>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[38rem]"
          >
            <InputBox onSubmit={onGenerate} />
          </motion.div>

          <motion.p
            className="text-xs text-white/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Powered by Showra.io • Auto refresh every 24h
          </motion.p>
        </motion.div>
      </HeroHighlight>

      <motion.a
        href="https://www.buymeacoffee.com/showra"
        target="_blank"
        rel="noopener noreferrer"
        className="group pointer-events-auto absolute -bottom-10 right-10 hidden select-none lg:flex"
        initial={{ opacity: 0, scale: 0.8, x: 40 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          className="relative inline-flex items-center gap-3 rounded-full border border-[#ffeba1]/70 bg-gradient-to-r from-[#ffe27a] via-[#ffcd4f] to-[#ffad38] px-5 py-3 text-sm font-semibold text-[#3b1a00] shadow-[0_28px_65px_-28px_rgba(255,188,74,0.9)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_36px_85px_-30px_rgba(255,190,72,1)]"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Coffee className="hidden h-5 w-5 drop-shadow-[0_6px_10px_rgba(0,0,0,0.2)] sm:inline-block" />
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d38d00] sm:hidden">
            buy me a coffee
          </span>
          <span className="hidden leading-tight sm:inline">
            Brewing brilliance since midnight ideas ☕💡
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#3b1a00]/80 px-3 py-1 text-[0.72rem] font-semibold text-[#ffd96d] sm:ml-1 sm:text-xs">
            Fuel the magic →
          </span>
        </motion.span>
      </motion.a>

      <motion.a
        href="https://www.buymeacoffee.com/showra"
        target="_blank"
        rel="noopener noreferrer"
        className="group pointer-events-auto absolute inset-x-6 bottom-6 flex select-none items-center justify-center rounded-full border border-[#ffeba1]/70 bg-gradient-to-r from-[#ffe27a] via-[#ffcd4f] to-[#ffad38] px-4 py-3 text-sm font-semibold text-[#3b1a00] shadow-[0_26px_60px_-28px_rgba(255,188,74,0.85)] transition duration-300 hover:shadow-[0_32px_80px_-30px_rgba(255,188,72,0.95)] sm:inset-x-10 lg:hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="inline-flex items-center gap-2">
          <Coffee className="h-5 w-5 drop-shadow-[0_6px_10px_rgba(0,0,0,0.2)]" />
          <span className="text-xs uppercase tracking-[0.32em] text-[#d38d00]">
            buy me a coffee
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#3b1a00]/80 px-3 py-1 text-[0.7rem] font-semibold text-[#ffd96d]">
            Fuel the magic →
          </span>
        </span>
      </motion.a>
    </section>
  );
}
