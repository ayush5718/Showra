"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Download, Share2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/lib/auth/store";
import { supabase } from "@/lib/supabaseClient";
import Hyperspeed from "@/components/react-bits/Hyperspeed/Hyperspeed";
import SplitText from "@/components/common/SplitText";

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
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0A] px-4 py-20 sm:px-8">
      {/* Hyperspeed Background Effect */}
      <div className="absolute inset-0 z-0 opacity-70">
        <Hyperspeed
          effectOptions={{
            onSpeedUp: () => {},
            onSlowDown: () => {},
            distortion: 'turbulentDistortion',
            length: 400,
            roadWidth: 10,
            islandWidth: 2,
            lanesPerRoad: 4,
            fov: 90,
            fovSpeedUp: 150,
            speedUp: 2,
            carLightsFade: 0.4,
            totalSideLightSticks: 20,
            lightPairsPerRoadWay: 40,
            shoulderLinesWidthPercentage: 0.05,
            brokenLinesWidthPercentage: 0.1,
            brokenLinesLengthPercentage: 0.5,
            lightStickWidth: [0.12, 0.5],
            lightStickHeight: [1.3, 1.7],
            movingAwaySpeed: [60, 80],
            movingCloserSpeed: [-120, -160],
            carLightsLength: [400 * 0.03, 400 * 0.2],
            carLightsRadius: [0.05, 0.14],
            carWidthPercentage: [0.3, 0.5],
            carShiftX: [-0.8, 0.8],
            carFloorSeparation: [0, 5],
            colors: {
              roadColor: 0x080808,
              islandColor: 0x0a0a0a,
              background: 0x000000,
              shoulderLines: 0xffffff,
              brokenLines: 0xffffff,
              leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
              rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
              sticks: 0x03b3c3
            }
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 z-[2] bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-30 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-md px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/70">
            <Sparkles className="h-3.5 w-3.5" />
            Showcase Your GitHub Profile
          </span>
        </motion.div>

        {/* Main Heading with SplitText */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
            <SplitText
              text="Create Beautiful"
              tag="span"
              className="block mb-2"
              delay={50}
              duration={0.6}
            />
            <span className="block bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] bg-clip-text text-transparent">
              <SplitText
                text="Developer Cards"
                tag="span"
                className="block"
                delay={50}
                duration={0.6}
              />
            </span>
          </h1>
        </div>

        {/* Description */}
        <motion.p
          className="mx-auto mb-16 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl sm:leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Transform your GitHub profile into a stunning, shareable developer card. 
          Download as an image and showcase your coding journey on social media.
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          className="mb-16 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2.5 rounded-full bg-white/5 backdrop-blur-md px-5 py-2.5 text-sm font-medium text-white/80">
            <Download className="h-4 w-4" />
            <span>Download as Image</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-full bg-white/5 backdrop-blur-md px-5 py-2.5 text-sm font-medium text-white/80">
            <Share2 className="h-4 w-4" />
            <span>Share on Social Media</span>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 rounded-full bg-white/10 backdrop-blur-md px-10 py-5 text-base font-semibold text-white transition-all hover:bg-white/15"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleGetStarted}
              disabled={isAuthenticating}
              className="inline-flex items-center gap-2.5 rounded-full bg-white/10 backdrop-blur-md px-10 py-5 text-base font-semibold text-white transition-all hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isAuthenticating ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Getting Started...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}

