"use client";

import { DevCard } from "../DevCard";
import { DevCard2 } from "./DevCard2";
import { DevCard3 } from "./DevCard3";
import { DevCard4 } from "./DevCard4";
import { CardVariant } from "./CardSelector";

interface DevCardProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  location: string | null;
  createdAt: string;
}

interface DevCardStats {
  repos: number;
  stars: number;
  forks: number;
  contributions: number;
  followers?: number;
}

interface DevCardTopRepo {
  name: string;
  stars: number;
  description?: string | null;
  languages?: string[];
}

interface CardWrapperProps {
  variant: CardVariant;
  profile: DevCardProfile;
  stats: DevCardStats;
  topRepo: DevCardTopRepo | null;
  topLanguages: Array<{ name: string; percentage: number }>;
  technologies?: string[];
  heatmap: Array<{ date: string; count: number }>;
  repositories?: Array<{ name: string; description: string | null; stars: number; language: string | null }>;
  skipAI?: boolean;
}

export function CardWrapper(props: CardWrapperProps) {
  switch (props.variant) {
    case 'card1':
      return <DevCard {...props} />;
    case 'card2':
      return <DevCard2 {...props} />;
    case 'card3':
      return <DevCard3 {...props} />;
    case 'card4':
      return <DevCard4 {...props} />;
    default:
      return <DevCard {...props} />;
  }
}

