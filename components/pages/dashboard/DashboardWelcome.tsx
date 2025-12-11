"use client";

import { motion } from "framer-motion";
import { getWelcomeMessage } from "@/lib/utils/format";
import type { GitHubProfile, DevCardData } from "./types";

interface DashboardWelcomeProps {
  profile: GitHubProfile | null;
  cardData: DevCardData | null;
  user: any;
}

export function DashboardWelcome({ profile, cardData, user }: DashboardWelcomeProps) {
  const welcome = getWelcomeMessage(
    profile?.name || cardData?.profile?.name,
    user?.name,
    user?.email
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="mb-12 text-center px-4 w-full max-w-4xl mx-auto"
    >
      <h1 className="mb-3 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white">
        <span className="whitespace-nowrap">{welcome.greeting}</span>
        <span className="block mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl break-words px-2">
          {welcome.name}
        </span>
      </h1>
      {welcome.email && (
        <p className="mb-4 text-xs sm:text-sm text-white/50 font-normal max-w-full mx-auto px-2"
           style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', hyphens: 'auto' }}>
          {welcome.email}
        </p>
      )}
      <p className="text-base sm:text-lg text-white/70 font-medium mb-2">
        Your developer card is ready to share
      </p>
      {profile?.login && (
        <p className="mt-1 text-xs sm:text-sm text-white/50 break-words">
          @{profile.login}
        </p>
      )}
    </motion.div>
  );
}

