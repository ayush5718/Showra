"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Sparkles, TrendingUp, Palette, Share2, Settings, Gift } from "lucide-react";
import SplitText from "@/components/common/SplitText";
import LightRays from "@/components/react-bits/LigthRays/LightRays";

// Dynamically import SpotlightCard to avoid SSR issues
const SpotlightCard = dynamic(
  () => import("@/components/react-bits/SpotlightCard/SpotlightCard").then((mod) => mod.default || mod),
  { ssr: false }
);

const features = [
  {
    title: "Auto-Generated",
    description: "Your developer card is automatically created from your GitHub profile data",
    icon: Sparkles,
    color: "rgba(0, 229, 255, 0.25)",
    gradient: "from-[#00E5FF] to-[#00E5FF]/50",
  },
  {
    title: "Real-Time Stats",
    description: "Always up-to-date with your latest contributions, stars, and repositories",
    icon: TrendingUp,
    color: "rgba(255, 0, 204, 0.25)",
    gradient: "from-[#FF00CC] to-[#FF00CC]/50",
  },
  {
    title: "Beautiful Design",
    description: "Stunning visual design that showcases your coding journey in style",
    icon: Palette,
    color: "rgba(157, 75, 255, 0.25)",
    gradient: "from-[#9D4BFF] to-[#9D4BFF]/50",
  },
  {
    title: "Easy Sharing",
    description: "Download as image or embed directly in your GitHub README",
    icon: Share2,
    color: "rgba(0, 229, 255, 0.25)",
    gradient: "from-[#00E5FF] to-[#00E5FF]/50",
  },
  {
    title: "Customizable",
    description: "Multiple layouts and styles to match your personal brand",
    icon: Settings,
    color: "rgba(255, 0, 204, 0.25)",
    gradient: "from-[#FF00CC] to-[#FF00CC]/50",
  },
  {
    title: "Free Forever",
    description: "Completely free to use with no limits or hidden costs",
    icon: Gift,
    color: "rgba(157, 75, 255, 0.25)",
    gradient: "from-[#9D4BFF] to-[#9D4BFF]/50",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0A] py-20 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-[#FF00CC]/10 before:via-[#9D4BFF]/5 before:to-[#00E5FF]/10 before:rounded-full before:top-0 before:blur-3xl before:-z-10">
      {/* LightRays Background Effect */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-left"
          raysColor="#FF00CC"
          raysSpeed={1.2}
          lightSpread={1.5}
          rayLength={2.0}
          pulsating={true}
          fadeDistance={1.0}
          saturation={1.0}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.05}
          distortion={0.15}
          className="opacity-30"
        />
      </div>

      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute left-[20%] top-[20%] h-96 w-96 rounded-full bg-[#9D4BFF]/8 blur-[120px]" />
        <div className="absolute right-[20%] bottom-[20%] h-96 w-96 rounded-full bg-[#00E5FF]/8 blur-[120px]" />
      </div>

      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-20 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Features Grid with SpotlightCard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <SpotlightCard
                    spotlightColor={feature.color}
                    className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6 transition-all hover:border-white/20"
                  >
                    <div className="flex flex-col h-full">
                      {/* Icon with glass effect */}
                      <div className="relative mb-4">
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20 blur-xl rounded-2xl`} />
                        <div className={`relative rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 p-4 w-fit group`}>
                          <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`} />
                          <IconComponent className={`h-6 w-6 relative z-10`} style={{ 
                            color: feature.gradient.includes('00E5FF') ? '#00E5FF' : feature.gradient.includes('FF00CC') ? '#FF00CC' : '#9D4BFF',
                            filter: `drop-shadow(0 0 8px ${feature.gradient.includes('00E5FF') ? 'rgba(0, 229, 255, 0.6)' : feature.gradient.includes('FF00CC') ? 'rgba(255, 0, 204, 0.6)' : 'rgba(157, 75, 255, 0.6)'})`
                          }} />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-white/60 leading-relaxed">{feature.description}</p>
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
