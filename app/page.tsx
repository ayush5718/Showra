"use client";

import { ModernHero } from "../components/ModernHero";
import { CardShowcase } from "../components/CardShowcase";

export default function HomePage() {
  return (
    <div className="relative bg-transparent">
      <ModernHero />
      <CardShowcase />
    </div>
  );
}
