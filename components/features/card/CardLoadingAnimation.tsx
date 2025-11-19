"use client";

import { motion } from "framer-motion";

export function CardLoadingAnimation() {
  return (
    <div className="relative w-full max-w-[420px] mx-auto flex flex-col items-center justify-center min-h-[475px]">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#00E5FF]/10 via-[#FF00CC]/10 to-[#9D4BFF]/10 blur-2xl" />
      
      {/* Pulsing Card Outline */}
      <motion.div
        className="relative w-full max-w-[380px] rounded-[28px] border-2 border-[#00E5FF]/30"
        animate={{
          boxShadow: [
            "0 0 30px rgba(0, 229, 255, 0.3), 0 0 50px rgba(255, 0, 204, 0.2)",
            "0 0 50px rgba(0, 229, 255, 0.5), 0 0 80px rgba(255, 0, 204, 0.4)",
            "0 0 30px rgba(0, 229, 255, 0.3), 0 0 50px rgba(255, 0, 204, 0.2)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative bg-[#0A0A0A]/80 backdrop-blur-sm rounded-[26px] p-12 flex flex-col items-center justify-center gap-6 min-h-[475px]">
          {/* Animated Spinner */}
          <motion.div
            className="relative w-20 h-20"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00E5FF] border-r-[#FF00CC]" />
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-[#9D4BFF] border-l-[#00E5FF]" />
          </motion.div>

          {/* Animated Text */}
          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h3
              className="text-xl font-bold bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Generating Your Card
            </motion.h3>
            <motion.p
              className="text-sm text-white/60"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Analyzing your GitHub profile...
            </motion.p>
          </motion.div>

          {/* Animated Dots */}
          <div className="flex gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#00E5FF]"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

