"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { useAuthStore } from "@/lib/auth/store";
import { useGitHubData } from "@/hooks/useGitHubData";
import { saveCardData, loadCardData, clearCardData, clearAIAnalysis } from "@/lib/utils/storage";
import { saveUserPreferences, getUserPreferences } from "@/lib/utils/supabase/userMetadata";
import { generateReadmeWithAI } from "@/lib/utils/generateReadmeAI";
import { generateMarkdown, convertCardDataToFormData } from "@/lib/utils/generateReadme";
import { CardVariant } from "@/components/features/card/variants/CardSelector";
import LightRays from "@/components/react-bits/LigthRays/LightRays";
import { DashboardWelcome } from "./DashboardWelcome";
import { DashboardTabs } from "./DashboardTabs";
import { DashboardCardSection } from "./DashboardCardSection";
import { DashboardReadmeSection } from "./DashboardReadmeSection";
import type { DevCardData } from "./types";

export function ModernDashboard() {
  const { user, isLoading: authLoading } = useAuthStore((state) => ({
    user: state.user,
    isLoading: state.isLoading,
  }));

  const {
    profile,
    cardData,
    repositories,
    profileLoading,
    profileError,
    isRefreshing,
    fetchGitHubData,
  } = useGitHubData();

  const [activeTab, setActiveTab] = useState<'card' | 'readme'>('card');
  const [selectedCard, setSelectedCard] = useState<CardVariant>('card1');
  const [generatedREADME, setGeneratedREADME] = useState<string>('');
  const [isGeneratingREADME, setIsGeneratingREADME] = useState(false);
  const hasLoadedPreferencesRef = useRef(false);

  // Load preferences on mount
  useEffect(() => {
    if (!user || hasLoadedPreferencesRef.current) return;
    
    hasLoadedPreferencesRef.current = true;
    
      (async () => {
      try {
        const preferences = await getUserPreferences();
        if (preferences?.selectedCardDesign) {
          setSelectedCard(preferences.selectedCardDesign);
        }
        
      } catch (error) {
        console.error("Failed to load preferences:", error);
        hasLoadedPreferencesRef.current = false;
      }
    })();
  }, [user]);

  // Generate README when card data changes
  useEffect(() => {
    if (!cardData || !profile) return;

    // Don't regenerate if we already have README (unless card variant changed)
    const generateReadme = async () => {
      setIsGeneratingREADME(true);
      try {
        const devcardShareUrl = typeof window !== 'undefined' 
          ? `${window.location.origin}/card/${profile.login}?variant=${selectedCard}`
          : '';
        
        let devcardImageUrl = '';
        try {
          const imageResponse = await fetch(`/api/devcard-image/${profile.login}?variant=${selectedCard}`);
          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            if (imageData.imageUrl && 
                (imageData.imageUrl.endsWith('.png') || 
                 imageData.imageUrl.endsWith('.jpg') || 
                 imageData.imageUrl.endsWith('.jpeg') ||
                 imageData.imageUrl.includes('/storage/v1/object/public/'))) {
              devcardImageUrl = imageData.imageUrl;
            }
          }
        } catch (err) {
          // Ignore
        }
        
        const aiReadme = await generateReadmeWithAI({
          profile: {
            login: profile.login,
            name: profile.name,
            bio: profile.bio,
            location: profile.location,
            company: profile.company,
            blog: profile.blog,
            twitterUsername: profile.twitter_username,
          },
          stats: {
            repos: cardData.stats.repos,
            stars: cardData.stats.stars,
            forks: cardData.stats.forks,
            contributions: cardData.stats.contributions,
            followers: profile.followers,
          },
          languages: cardData.languages,
          topRepo: cardData.topRepo,
          repositories: repositories?.map((repo) => ({
            name: repo.name,
            description: repo.description,
            stars: repo.stargazers_count,
            language: repo.language,
          })),
          devcardUrl: devcardImageUrl || devcardShareUrl,
          });
          setGeneratedREADME(aiReadme);
        } catch (error) {
          console.error("Failed to generate README with AI, using fallback:", error);
        const formData = convertCardDataToFormData(cardData as any, {
            templateStyle: 'modern',
            showVisitors: true,
            showTrophies: true,
            showStats: true,
            showStreak: true,
          });
          const readme = generateMarkdown(formData);
          setGeneratedREADME(readme);
        } finally {
          setIsGeneratingREADME(false);
        }

      // Auto-generate card image for README (only once when data is first loaded)
      setTimeout(() => {
        if (profile.login) {
          generateAndSaveCardImageForReadme(profile.login, selectedCard);
        }
      }, 3000);
    };

    generateReadme();
  }, [cardData, profile, selectedCard, repositories]);

  // Function to generate and save card image for README embedding
  const generateAndSaveCardImageForReadme = async (username: string, variant: CardVariant) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const cardSelector = `[data-card-variant="${variant}"]`;
      let cardElement = document.querySelector(cardSelector) as HTMLElement;
      
      if (!cardElement) {
        const allCards = document.querySelectorAll('[data-card-variant]');
        cardElement = allCards[0] as HTMLElement;
      }
      
      if (!cardElement) {
        console.warn('Could not find card element for image generation');
        return;
      }
      
      const imgs = cardElement.querySelectorAll("img");
      await Promise.all(Array.from(imgs).map(img => {
        if ((img as HTMLImageElement).complete) return Promise.resolve();
        return new Promise(res => {
          (img as HTMLImageElement).onload = res;
          (img as HTMLImageElement).onerror = res;
          setTimeout(res, 2000);
        });
      }));
      
      const dataUrl = await htmlToImage.toPng(cardElement, {
        pixelRatio: 2,
        backgroundColor: '#0A0A0A',
        cacheBust: true,
        quality: 1,
        skipFonts: false,
      });
      
      await fetch(`/api/generate-card-image/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      });
    } catch (error) {
      console.warn('Failed to generate card image for README:', error);
    }
  };

  const handleCardChange = async (variant: CardVariant) => {
    setSelectedCard(variant);
    await saveUserPreferences({ selectedCardDesign: variant });
  };

  const handleRefresh = () => {
    clearAIAnalysis();
    fetchGitHubData(true);
  };

  // Fetch data on mount if no cached data
  useEffect(() => {
    if (!user || authLoading || profileLoading) return;
    
    const stored = loadCardData();
    if (stored) {
      return;
    }
    
    const timer = setTimeout(() => {
      fetchGitHubData(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [user, authLoading, profileLoading, fetchGitHubData]);

  if (authLoading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70">
            <p className="text-sm sm:text-base">Loading your dashboard…</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70">
            <p className="text-sm sm:text-base mb-4">Please sign in to access your dashboard</p>
            <a 
              href="/" 
              className="inline-block rounded-xl bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] px-6 py-3 text-sm font-bold text-white"
            >
              Go to Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#0A0A0A]">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <LightRays
          raysOrigin="top-right"
          raysColor="#9D4BFF"
          raysSpeed={1.0}
          lightSpread={1.3}
          rayLength={2.0}
          pulsating={true}
          fadeDistance={1.0}
          saturation={1.0}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.05}
          distortion={0.1}
          className="opacity-25"
        />
      </div>

      <div className="pointer-events-none fixed inset-0 -z-10 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-[#9D4BFF]/10 before:via-[#00E5FF]/5 before:to-[#FF00CC]/10 before:rounded-full before:top-0 before:blur-3xl">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="absolute left-[10%] top-[20%] h-96 w-96 rounded-full bg-[#9D4BFF]/8 blur-[120px]" />
        <div className="absolute right-[15%] bottom-[25%] h-96 w-96 rounded-full bg-[#00E5FF]/8 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Profile Avatar */}
            {(profile?.avatar_url || user.avatarUrl) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.6, type: "spring" }}
                className="mb-8 flex justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] opacity-40 blur-2xl animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] opacity-20 blur-xl" />
                  <div className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] animate-spin" style={{ animationDuration: '3s' }}>
                    <div className="absolute inset-[2px] rounded-full bg-[#0A0A0A]" />
                  </div>
                  <div className="relative z-10">
                    <Image
                      src={profile?.avatar_url || user.avatarUrl || '/logo.png'}
                      alt={profile?.name || user.name || 'Profile'}
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-[#0A0A0A] object-cover shadow-2xl"
                      priority
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Welcome Section */}
            <DashboardWelcome profile={profile} cardData={cardData} user={user} />

            {/* Quick Stats */}
            {cardData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-12"
              >
                {[
                  { label: "Repos", value: cardData.stats.repos, color: "from-[#00E5FF]" },
                  { label: "Stars", value: cardData.stats.stars.toLocaleString(), color: "from-[#FF00CC]" },
                  { label: "Contribs", value: cardData.stats.contributions.toLocaleString(), color: "from-[#9D4BFF]" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 px-4 py-4 text-center"
                  >
                    <div className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${stat.color} to-white bg-clip-text text-transparent mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-white/60 uppercase tracking-wider font-semibold">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="relative flex min-h-screen items-start justify-center py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Tabs */}
            <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
              <div className="flex items-center gap-3">
                <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || profileLoading}
                className="px-3 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:bg-white/10 transition-all disabled:opacity-50 flex-shrink-0"
                title="Refresh Data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'card' ? (
              <DashboardCardSection
                cardData={cardData}
                        selectedCard={selectedCard}
                onCardChange={handleCardChange}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            ) : (
              <DashboardReadmeSection
                readme={generatedREADME}
                isLoading={isGeneratingREADME}
                error={profileError}
                onReadmeChange={setGeneratedREADME}
                onRetry={() => {
                        clearCardData();
                        clearAIAnalysis();
                        fetchGitHubData(true);
                      }}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
