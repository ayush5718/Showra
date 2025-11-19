"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Download, Share2, Code } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/lib/auth/store";
import { supabase } from "@/lib/supabaseClient";
import LightRays from "@/components/react-bits/LigthRays/LightRays";
import SplitText from "@/components/common/SplitText";
import { DevCardPreview } from "@/components/features/card/DevCardPreview";

export function ModernHero() {
  const { user, isAuthenticating, setAuthenticating } = useAuthStore();

  const handleGetStarted = async () => {
    if (isAuthenticating || user) return;
    try {
      setAuthenticating(true);
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
      });
    } catch (error) {
      console.error("GitHub login failed", error);
      setAuthenticating(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* LightRays Background Effect */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#00E5FF"
          raysSpeed={1.5}
          lightSpread={1.2}
          rayLength={2.5}
          pulsating={true}
          fadeDistance={1.2}
          saturation={1.0}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0.1}
          distortion={0.2}
          className="opacity-40"
        />
      </div>

      {/* Gradient overlays */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 z-[2] bg-gradient-to-t from-black via-black/60 to-transparent" />
      
      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-30 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Main Container */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 min-h-screen py-20">
            
            {/* Left Content */}
            <div className="flex-1 w-full lg:max-w-2xl text-center lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8 flex justify-center lg:justify-start"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/70">
                  <Sparkles className="h-3.5 w-3.5 text-[#00E5FF]" />
                  Showcase Your GitHub Profile
                </span>
              </motion.div>

              {/* Main Heading - COMPLETELY REDESIGNED */}
              <div className="mb-10">
                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[1.05] tracking-tight">
                  <div className="mb-3 text-white">
                    <SplitText
                      text="Showcase Your"
                      tag="span"
                      className="block"
                      delay={50}
                      duration={0.6}
                      textAlign="left"
                    />
                  </div>
                  <div className="mb-3 inline-block [&_.split-char]:bg-gradient-to-r [&_.split-char]:from-[#00E5FF] [&_.split-char]:via-[#FF00CC] [&_.split-char]:to-[#9D4BFF] [&_.split-char]:bg-clip-text [&_.split-char]:text-transparent">
                    <SplitText
                      text="GitHub Profile"
                      tag="span"
                      className="block"
                      delay={50}
                      duration={0.6}
                      textAlign="left"
                    />
                  </div>
                  <div className="text-white/90 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black">
                    <SplitText
                      text="As Beautiful Cards"
                      tag="span"
                      className="block"
                      delay={50}
                      duration={0.6}
                      textAlign="left"
                    />
                  </div>
                </h1>
              </div>

              {/* Description - BIGGER */}
              <motion.p
                className="mb-12 text-xl sm:text-2xl md:text-3xl leading-relaxed text-white/70 max-w-2xl mx-auto lg:mx-0 font-semibold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                Transform your GitHub profile into a stunning, shareable developer card. 
                Download as an image and showcase your coding journey on social media.
              </motion.p>

              {/* Feature Pills - REDESIGNED BIGGER */}
              <motion.div
                className="mb-12 flex flex-wrap items-center justify-center lg:justify-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="rounded-2xl bg-gradient-to-r from-[#00E5FF]/20 to-[#00E5FF]/10 backdrop-blur-xl border-2 border-[#00E5FF]/30 px-6 py-3 text-base font-bold text-white shadow-lg shadow-[#00E5FF]/20">
                  ✨ Auto-Generated
                </div>
                <div className="rounded-2xl bg-gradient-to-r from-[#FF00CC]/20 to-[#FF00CC]/10 backdrop-blur-xl border-2 border-[#FF00CC]/30 px-6 py-3 text-base font-bold text-white shadow-lg shadow-[#FF00CC]/20">
                  📊 Real-Time Stats
                </div>
                <div className="rounded-2xl bg-gradient-to-r from-[#9D4BFF]/20 to-[#9D4BFF]/10 backdrop-blur-xl border-2 border-[#9D4BFF]/30 px-6 py-3 text-base font-bold text-white shadow-lg shadow-[#9D4BFF]/20">
                  🎨 Beautiful Design
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex justify-center lg:justify-start"
              >
                {user ? (
                  <Link
                    href="/dashboard"
                    className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] px-12 py-6 text-lg font-black text-white shadow-2xl shadow-[#00E5FF]/30 transition-all hover:shadow-3xl hover:shadow-[#00E5FF]/50 overflow-hidden"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleGetStarted}
                    disabled={isAuthenticating}
                    className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] px-12 py-6 text-lg font-black text-white shadow-2xl shadow-[#00E5FF]/30 transition-all hover:shadow-3xl hover:shadow-[#00E5FF]/50 disabled:cursor-not-allowed disabled:opacity-70 overflow-hidden"
                  >
                    {isAuthenticating ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Getting Started...
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            </div>

            {/* Right Preview Section - Actual DevCard */}
            <div className="flex-1 w-full lg:max-w-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex items-center justify-center"
              >
                {/* DevCard Preview Container */}
                <div className="w-full max-w-[420px] mx-auto scale-90 lg:scale-100 origin-center">
                  <DevCardPreview />
                </div>

                {/* Floating glow effects */}
                <motion.div
                  className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-[#00E5FF]/30 to-[#FF00CC]/30 blur-2xl pointer-events-none"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#9D4BFF]/30 to-[#00E5FF]/30 blur-2xl pointer-events-none"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
