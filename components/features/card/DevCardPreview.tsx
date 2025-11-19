"use client";

import { DevCard } from "@/components/features/card/DevCard";

// Demo data for preview
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

interface DevCardPreviewProps {
  scale?: number;
  className?: string;
}

export function DevCardPreview({ scale = 1, className = "" }: DevCardPreviewProps) {
  return (
    <div className={`relative ${className}`} style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
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
  );
}

