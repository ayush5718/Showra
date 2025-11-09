"use client";

import { motion } from "framer-motion";
import { InputBox } from "./InputBox";
import { HeroHighlight, Highlight } from "./ui/HeroHighlight";
import { Sparkles, BarChart3, Share2, Coffee, ArrowUpRight } from "lucide-react";

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

      <motion.div
        className="relative mt-6 w-full max-w-[26rem] sm:mt-10"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.62, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute left-1/2 top-0 -z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,215,103,0.4),transparent_70%)] blur-2xl" />
        <motion.div
          className="group relative overflow-hidden rounded-[22px] border border-[#ffeba1]/70 bg-gradient-to-br from-[#ffe27a] via-[#ffcd4f] to-[#ffad38] p-[1px] shadow-[0_30px_70px_-30px_rgba(255,188,74,0.8)]"
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative flex flex-col items-center gap-4 rounded-[21px] bg-[#150b00]/60 px-5 py-6 text-center backdrop-blur-2xl sm:flex-row sm:justify-between sm:text-left">
            <motion.span
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#fff1a3] to-[#ffc54b] text-[#351400] shadow-[0_16px_30px_-14px_rgba(255,188,72,0.8)]"
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Coffee className="h-6 w-6" />
            </motion.span>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#ffd652]/90">
                buy me a coffee
              </p>
              <p className="text-base font-semibold text-[#ffe9b0] sm:text-lg">
                Sip-powered creativity keeps Showra glowing.
              </p>
              <p className="text-xs text-[#ffe9b0]/80 sm:text-sm">
                Sponsor a brew and unlock bonus card templates + early features.
              </p>
            </div>
            <a
              href="https://www.buymeacoffee.com/showra"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#150b00]/70 px-4 py-2 text-sm font-semibold text-[#ffd24c] shadow-[0_12px_30px_-20px_rgba(0,0,0,0.45)] transition hover:bg-[#150b00]/90 hover:text-[#ffdf72]"
            >
              Fuel the magic
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
