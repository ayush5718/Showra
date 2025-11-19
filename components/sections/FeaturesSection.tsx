"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import SplitText from "@/components/common/SplitText";

// Dynamically import MagicBento to avoid SSR issues
const MagicBento = dynamic(
  () => import("@/components/react-bits/MagicBento/MagicBento").then((mod) => mod.default || mod),
  { ssr: false }
);

export function FeaturesSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0A] px-4 py-20 sm:px-8">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[20%] top-[20%] h-96 w-96 rounded-full bg-[#9D4BFF]/10 blur-[120px]" />
        <div className="absolute right-[20%] bottom-[20%] h-96 w-96 rounded-full bg-[#00E5FF]/10 blur-[120px]" />
      </div>

      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-white/30" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-white/50">
              Features
            </span>
            <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-white/30" />
          </div>

          <h2 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl mb-4">
            <SplitText
              text="Why Choose Showra"
              tag="span"
              className="block"
              delay={50}
              duration={0.6}
            />
          </h2>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl mt-6">
            Everything you need to showcase your developer profile in style
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <MagicBento
            glowColor="0, 229, 255"
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableMagnetism={true}
            clickEffect={true}
          />
        </motion.div>
      </div>
    </section>
  );
}
