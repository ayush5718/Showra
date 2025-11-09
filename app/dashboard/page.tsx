"use client";

import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(70,100,255,0.25),transparent_55%)] from-[#0c0c1c] via-[#090918] to-[#050510] pb-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(140%_110%_at_50%_-20%,rgba(45,70,255,0.12),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_120%,rgba(0,180,255,0.18),transparent_70%)] opacity-60" />

      <DashboardClient />
    </div>
  );
}

