"use client";

import { motion } from "framer-motion";
import { DevCard } from "./dashboard/DevCard";
import { Download, Share2, Image } from "lucide-react";

// Demo data for John Doe
const demoProfile = {
  login: "johndoe",
  name: "John Doe",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe",
  bio: "Full-stack developer passionate about building beautiful and functional applications. Open source enthusiast and tech blogger.",
  location: "San Francisco, CA",
  createdAt: "2018-03-15T10:00:00Z",
};

const demoStats = {
  repos: 42,
  stars: 1240,
  forks: 342,
  contributions: 1567,
  followers: 289,
};

const demoTopRepo = {
  name: "awesome-project",
  stars: 856,
  description: "A modern web application built with React and TypeScript",
  languages: ["TypeScript", "React", "Node.js"],
};

const demoLanguages = [
  { name: "TypeScript", percentage: 45 },
  { name: "JavaScript", percentage: 30 },
  { name: "Python", percentage: 15 },
  { name: "Go", percentage: 10 },
];

// Seeded random function for consistent values
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate demo heatmap data (last 365 days) with seeded random for consistency
const generateDemoHeatmap = (): Array<{ date: string; count: number }> => {
  const heatmap: Array<{ date: string; count: number }> = [];
  const today = new Date();
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Use seeded random based on day index for consistency
    const seed = i * 0.01;
    const random = seededRandom(seed);
    let count = 0;
    
    if (random > 0.7) {
      count = Math.floor(seededRandom(seed + 1) * 8) + 1;
    } else if (random > 0.4) {
      count = Math.floor(seededRandom(seed + 2) * 4) + 1;
    }
    
    heatmap.push({
      date: date.toISOString().split("T")[0],
      count,
    });
  }
  
  return heatmap;
};

const demoHeatmap = generateDemoHeatmap();

const demoRepositories = [
  {
    name: "awesome-project",
    description: "A modern web application built with React and TypeScript",
    stars: 856,
    language: "TypeScript",
  },
  {
    name: "cool-library",
    description: "A utility library for common JavaScript operations",
    stars: 234,
    language: "JavaScript",
  },
  {
    name: "api-server",
    description: "RESTful API server built with Node.js and Express",
    stars: 156,
    language: "JavaScript",
  },
];

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

      <div className="relative z-10 mx-auto w-full max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">
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

          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Your Developer Card
            <br />
            <span className="bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] bg-clip-text text-transparent">
              In Action
            </span>
          </motion.h2>

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
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {[
              { icon: Download, text: "Download as Image", description: "Save your card" },
              { icon: Share2, text: "Share on Social Media", description: "Show off your work" },
              { icon: Image, text: "Embed Anywhere", description: "Add to your site" },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 sm:gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 sm:px-4 md:px-5 py-2.5 sm:py-3 backdrop-blur-sm w-full sm:flex-1 sm:max-w-[220px] md:max-w-[240px] lg:max-w-[260px] transition-all hover:border-white/20 hover:bg-white/10"
              >
                <div className="rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#FF00CC]/20 p-1.5 sm:p-2 flex-shrink-0">
                  <feature.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#00E5FF]" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-white truncate leading-tight">{feature.text}</p>
                  <p className="text-[10px] sm:text-xs text-white/50 leading-tight mt-0.5">{feature.description}</p>
                </div>
              </div>
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
            <DevCard
              profile={demoProfile}
              stats={demoStats}
              topRepo={demoTopRepo}
              topLanguages={demoLanguages}
              heatmap={demoHeatmap}
              repositories={demoRepositories}
              skipAI={true}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
