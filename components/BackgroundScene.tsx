"use client";

import { GridBackdrop } from "./ui/GridBackdrop";
import { Spotlight } from "./ui/Spotlight";

export function BackgroundScene() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-[#080b17]">
      <div className="absolute inset-0 bg-[radial-gradient(160%_140%_at_50%_-20%,rgba(70,58,180,0.45),rgba(12,16,38,0.95)_55%,rgba(8,11,24,1)_90%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_60%,rgba(0,216,255,0.16),transparent_70%)]" />

      <Spotlight
        className="left-[12%] top-[14%]"
        size={640}
        blur={220}
        color="rgba(111, 94, 255, 0.32)"
        speed={34}
      />
      <Spotlight
        className="right-[5%] top-[28%]"
        size={520}
        blur={200}
        color="rgba(64, 214, 255, 0.24)"
        speed={28}
      />
      <Spotlight
        className="left-1/2 bottom-[-10%] -translate-x-1/2"
        size={720}
        blur={240}
        color="rgba(111, 94, 255, 0.28)"
        speed={40}
      />

      <GridBackdrop variant="muted" cellSize={160} intensity={0.07} />
    </div>
  );
}

