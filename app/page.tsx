"use client";

import { HeroSection } from "../components/HeroSection";
import { ShowcaseSection } from "../components/ShowcaseSection";
import type { RepoCardProps } from "../components/RepoCard";

const mockRepo: RepoCardProps = {
  name: "awesome-project",
  owner: "showra-labs",
  description:
    "AI-assisted visuals for developers: turn any GitHub repo into a shareable project card in seconds.",
  stars: 1240,
  forks: 86,
  commits: 327,
};

export default function HomePage() {
  const handleGenerate = (value: string) => {
    console.log("Generate", value);
  };

  return (
    <div className="relative isolate">
      <HeroSection onGenerate={handleGenerate} />
      <ShowcaseSection repo={mockRepo} />
    </div>
  );
}
