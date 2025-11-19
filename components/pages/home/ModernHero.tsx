"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ArrowDown } from "lucide-react";
import Link from "next/link";
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
    <section className="relative flex items-center justify-center overflow-hidden bg-[#0A0A0A] lg:max-h-[900px] pt-16 min-h-[600px] before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-[#00E5FF]/10 before:via-[#FF00CC]/5 before:to-[#9D4BFF]/10 before:rounded-full before:top-0 before:blur-3xl before:-z-10">
      {/* LightRays Background Effect */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#9D4BFF"
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
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 py-20">
            {/* Left Content - 70% */}
            <div className="flex-[0.7] w-full text-center lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mb-4 sm:mb-6 flex justify-center lg:justify-start"
              >
                <span className="group relative inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.1em] sm:tracking-[0.15em]">
                  {/* Gradient border using pseudo-element technique */}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] p-[1px] opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="block h-full w-full rounded-full bg-[#0A0A0A]" />
                  </span>

                  {/* Content with gradient text */}
                  <span className="relative z-10 flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] bg-clip-text text-transparent">
                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#00E5FF] group-hover:text-[#FF00CC] transition-colors flex-shrink-0" />
                    <span className="whitespace-nowrap">Showcase Your GitHub Profile</span>
                  </span>
                </span>
              </motion.div>

              {/* Main Heading - REDESIGNED with smaller text */}
              <div className="mb-6">
                <h1 className="leading-[1.05] tracking-tight">
                  <div className="text-white">
                    <SplitText
                      text="Showcase"
                      tag="span"
                      className="block"
                      delay={50}
                      duration={0.6}
                      textAlign="left"
                    />
                  </div>
                  <div className="inline-block [&_.split-char]:bg-gradient-to-r [&_.split-char]:from-[#00E5FF] [&_.split-char]:via-[#FF00CC] [&_.split-char]:to-[#9D4BFF] [&_.split-char]:bg-clip-text [&_.split-char]:text-transparent">
                    <SplitText
                      text="GitHub Profile"
                      tag="span"
                      className="block"
                      delay={50}
                      duration={0.6}
                      textAlign="left"
                    />
                  </div>
                  <div className="text-white/90">
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

              {/* Description - Smaller */}
              <motion.p
                className="mb-6 text-base sm:text-lg md:text-xl leading-relaxed text-white/70 max-w-xl mx-auto lg:mx-0 font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                Transform your GitHub profile into a stunning, shareable developer card.
                Download as an image and showcase your coding journey on social media.
              </motion.p>

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
                    className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#00E5FF]/30 transition-all hover:shadow-2xl hover:shadow-[#00E5FF]/50 overflow-hidden"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleGetStarted}
                    disabled={isAuthenticating}
                    className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#00E5FF]/30 transition-all hover:shadow-2xl hover:shadow-[#00E5FF]/50 disabled:cursor-not-allowed disabled:opacity-70 overflow-hidden"
                  >
                    {isAuthenticating ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Getting Started...
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            </div>

            {/* Right Preview Section - Actual DevCard - 30% */}
            <div className="flex-[0.3] w-full flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex items-center justify-center w-full"
              >
                {/* DevCard Preview Container */}
                <div className="w-full max-w-[380px] mx-auto scale-90 lg:scale-100 origin-center">
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

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <button
          onClick={() => {
            const nextSection = document.getElementById('features-section');
            if (nextSection) {
              nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="flex flex-col items-center gap-2 text-white/60 hover:text-white/90 transition-colors group"
          aria-label="Scroll to features"
        >
          <span className="text-xs uppercase tracking-wider font-semibold">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 p-2 group-hover:bg-white/20 transition-colors"
          >
            <ArrowDown className="h-5 w-5" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  );
}
