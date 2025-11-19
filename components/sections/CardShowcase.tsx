"use client";

import { motion } from "framer-motion";
import { Download, Share2, Image } from "lucide-react";
import SplitText from "@/components/common/SplitText";
import { DevCardPreview } from "@/components/common/DevCardPreview";
import { SimpleTooltip } from "@/components/common/SimpleTooltip";

export function CardShowcase() {
  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0A] pt-12 sm:pt-20 md:pt-28 pb-12 sm:pb-20 md:pb-28"
    >
      {/* Subtle background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[20%] top-[30%] h-96 w-96 rounded-full bg-[#9D4BFF]/5 blur-[120px]" />
        <div className="absolute right-[20%] bottom-[30%] h-96 w-96 rounded-full bg-[#00E5FF]/5 blur-[120px]" />
      </div>

      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Content Section */}
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20 relative z-50 pb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 mb-4 sm:mb-5">
            <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-white/30" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-white/50">
              Preview
            </span>
            <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-white/30" />
          </div>

          <div className="mb-5 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              <div className="mb-2 text-white">
                <SplitText
                  text="Your Developer Card"
                  tag="span"
                  className="block"
                  delay={50}
                  duration={0.6}
                />
              </div>
              <div className="inline-block [&_.split-char]:bg-gradient-to-r [&_.split-char]:from-[#00E5FF] [&_.split-char]:via-[#FF00CC] [&_.split-char]:to-[#9D4BFF] [&_.split-char]:bg-clip-text [&_.split-char]:text-transparent">
                <SplitText
                  text="In Action"
                  tag="span"
                  className="block"
                  delay={50}
                  duration={0.6}
                />
              </div>
            </h2>
          </div>

          <motion.p
            className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-white/60 mb-8 sm:mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Transform your GitHub profile into a stunning, shareable developer card. 
            Showcase your coding journey, stats, and achievements in a beautiful visual format.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {[
              { icon: Download, tooltip: "Download as Image" },
              { icon: Share2, tooltip: "Share on Social Media" },
              { icon: Image, tooltip: "Embed Anywhere" },
            ].map((feature, i) => (
              <SimpleTooltip key={i} text={feature.tooltip}>
                <button className="rounded-full bg-white/5 backdrop-blur-md border border-white/10 p-3 transition-all hover:bg-white/10 hover:border-white/20">
                  <feature.icon className="h-5 w-5 text-[#00E5FF]" />
                </button>
              </SimpleTooltip>
            ))}
          </motion.div>
        </motion.div>

        {/* Demo Card - Matching Dashboard Layout */}
        <motion.div
          className="relative w-full z-10 flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="w-full max-w-[420px] mx-auto">
            <DevCardPreview />
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
