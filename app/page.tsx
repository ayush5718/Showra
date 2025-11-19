"use client";

import { ModernHero } from "../components/pages/home/ModernHero";
import { FeaturesSection } from "../components/pages/home/FeaturesSection";
import { CardShowcase } from "../components/pages/home/CardShowcase";

export default function HomePage() {
  return (
    <>
      <ModernHero />
      <FeaturesSection />
      <CardShowcase />
    </>
  );
}
