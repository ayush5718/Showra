"use client";

import { ModernHero } from "../components/sections/ModernHero";
import { FeaturesSection } from "../components/sections/FeaturesSection";
import { CardShowcase } from "../components/sections/CardShowcase";

export default function HomePage() {
  return (
    <>
      <ModernHero />
      <FeaturesSection />
      <CardShowcase />
    </>
  );
}
