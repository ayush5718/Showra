"use client";

import { useEffect, useRef, useState } from "react";
import { DevCard } from "../DevCard";
import { DevCard2 } from "./DevCard2";
import { DevCard3 } from "./DevCard3";
import { DevCard4 } from "./DevCard4";
import { CardVariant } from "./CardSelector";
import { analyzeDeveloperProfile } from "@/lib/geminiAI";

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

interface AISkillAnalysis {
  expertise: Array<{ category: string; level: number; technologies: string[]; description: string }>;
  summary: string;
  strengths: string[];
  tags: string[];
  commitsDescription?: string;
  techStack?: Array<{ name: string; percentage: number }>;
  strengthAreas?: Array<{ category: string; rating: number }>;
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
  const { variant, profile, stats, topRepo, topLanguages, repositories, skipAI, ...restProps } = props;
  
  const [aiAnalysis, setAiAnalysis] = useState<AISkillAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const analyzedProfileRef = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const hasAnalysisRef = useRef<boolean>(false);

  // Update ref when analysis is set
  useEffect(() => {
    if (aiAnalysis !== null) {
      hasAnalysisRef.current = true;
    }
  }, [aiAnalysis]);

  // Fetch AI analysis once per profile at CardWrapper level
  useEffect(() => {
    const profileKey = profile.login;
    
    // Skip if:
    // 1. skipAI is true
    // 2. topLanguages is empty
    // 3. Already analyzed for this profile
    // 4. Currently fetching
    // 5. Already have analysis data (check ref to avoid dependency issues)
    if (skipAI || 
        topLanguages.length === 0 || 
        analyzedProfileRef.current === profileKey ||
        isFetchingRef.current ||
        hasAnalysisRef.current) {
      return;
    }

    // Mark as analyzed and fetching BEFORE starting to prevent race conditions
    analyzedProfileRef.current = profileKey;
    isFetchingRef.current = true;

    const fetchAIAnalysis = async () => {
      setAnalyzing(true);
      try {
        const analysis = await analyzeDeveloperProfile({
          profile,
          stats,
          languages: topLanguages,
          topRepo: topRepo ? {
            name: topRepo.name,
            stars: topRepo.stars,
            description: topRepo.description
          } : null,
          repositories: repositories?.map(repo => ({
            name: repo.name,
            description: repo.description,
            stars: repo.stars,
            language: repo.language
          }))
        });
        setAiAnalysis(analysis);
        hasAnalysisRef.current = true;
      } catch (error) {
        const fallbackAnalysis = {
          expertise: [],
          summary: `${profile.name || profile.login} - ${stats.repos} repositories, proficient in ${topLanguages.slice(0, 3).map(l => l.name).join(', ') || 'multiple technologies'}`,
          strengths: [`${stats.repos} repositories`, `${stats.contributions} contributions`],
          tags: topLanguages.slice(0, 6).map(l => l.name)
        };
        setAiAnalysis(fallbackAnalysis);
        hasAnalysisRef.current = true;
      } finally {
        setAnalyzing(false);
        isFetchingRef.current = false;
      }
    };

    fetchAIAnalysis();
  }, [profile.login, skipAI]); // Only depend on profile.login and skipAI - DO NOT include aiAnalysis

  // Pass analysis to all card components
  // If CardWrapper is analyzing, pass skipAI=true to prevent cards from fetching
  // Cards will use the aiAnalysis prop once it's available
  const cardProps = {
    ...restProps,
    profile,
    stats,
    topRepo,
    topLanguages,
    repositories,
    skipAI: skipAI || (analyzing && !aiAnalysis), // Prevent duplicate fetches while CardWrapper is analyzing
    aiAnalysis, // Pass pre-fetched analysis (null while analyzing, then set when done)
  };

  switch (variant) {
    case 'card1':
      return <div data-card-variant={variant}><DevCard {...cardProps} /></div>;
    case 'card2':
      return <div data-card-variant={variant}><DevCard2 {...cardProps} /></div>;
    case 'card3':
      return <div data-card-variant={variant}><DevCard3 {...cardProps} /></div>;
    case 'card4':
      return <div data-card-variant={variant}><DevCard4 {...cardProps} /></div>;
    default:
      return <div data-card-variant={variant}><DevCard {...cardProps} /></div>;
  }
}

