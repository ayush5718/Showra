"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Download, RefreshCw, Code, AlertCircle, Share2 } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { useAuthStore } from "@/lib/auth/store";
import { supabase } from "@/lib/supabaseClient";
import { CardWrapper } from "@/components/features/card/variants/CardWrapper";
import { READMEPreview } from "@/components/features/card/READMEPreview";
import { ReadmeLoader } from "@/components/ui/ReadmeLoader";
import { getTopTechnologies } from "@/lib/utils/transform/detectTechnologies";
import LightRays from "@/components/react-bits/LigthRays/LightRays";
import SplitText from "@/components/common/SplitText";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { READMESkeleton } from "@/components/ui/READMESkeleton";
import { saveCardData, loadCardData, clearCardData, clearAIAnalysis } from "@/lib/utils/storage";
import { CardSelector, CardVariant } from "@/components/features/card/variants/CardSelector";
import { saveUserPreferences, getUserPreferences, saveGitHubDataToMetadata } from "@/lib/utils/supabase/userMetadata";
import { generateMarkdown, convertCardDataToFormData } from "@/lib/utils/generateReadme";
import { generateReadmeWithAI } from "@/lib/utils/generateReadmeAI";
import { getWelcomeMessage } from "@/lib/utils/format";

interface GitHubProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  created_at: string;
}

interface GitHubRepo {
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  name: string;
  html_url: string;
  description: string | null;
  topics?: string[];
}

interface DevCardData {
  profile: {
    login: string;
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    company: string | null;
    location: string | null;
    blog: string | null;
    twitterUsername: string | null;
    createdAt: string;
  };
  stats: {
    repos: number;
    stars: number;
    forks: number;
    pullRequests: number;
    issues: number;
    contributions: number;
    followers?: number;
  };
  languages: Array<{ name: string; percentage: number }>;
  technologies?: string[];
  topRepo: {
    name: string;
    description: string | null;
    stars: number;
    url: string;
  } | null;
  heatmap: Array<{ date: string; count: number }>;
  timeline: Array<{ label: string; total: number }>;
}

export function ModernDashboard() {
  const { 
    user, 
    session, 
    isLoading: authLoading,
    refreshSession, 
    validateSession
  } = useAuthStore((state) => ({
    user: state.user,
    session: state.session,
    isLoading: state.isLoading,
    refreshSession: state.refreshSession,
    validateSession: state.validateSession,
  }));

  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [cardData, setCardData] = useState<DevCardData | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [activeTab, setActiveTab] = useState<'card' | 'readme'>('card'); // README tab disabled but keeping state for future
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardVariant>('card1');
  const [generatedREADME, setGeneratedREADME] = useState<string>('');
  const [isGeneratingREADME, setIsGeneratingREADME] = useState(false);
  const hasLoadedPreferencesRef = useRef(false);

  // Load preferences and card data on mount
  useEffect(() => {
    if (!user || hasLoadedPreferencesRef.current) return;
    
    hasLoadedPreferencesRef.current = true;
    
    // Load user preferences from Supabase
    getUserPreferences().then(prefs => {
      if (prefs?.selectedCardDesign) {
        setSelectedCard(prefs.selectedCardDesign);
      }
    }).catch(() => {
      hasLoadedPreferencesRef.current = false; // Reset on error
    });
    
    const stored = loadCardData();
    if (stored) {
      const loadedCardData = {
        profile: stored.profile,
        stats: stored.stats,
        languages: stored.languages,
        technologies: stored.technologies,
        topRepo: stored.topRepo,
        heatmap: stored.heatmap,
        timeline: stored.timeline,
      };
      setCardData(loadedCardData);
      setRepositories(stored.repositories || []);
      setProfile({
        login: stored.profile.login,
        name: stored.profile.name,
        avatar_url: stored.profile.avatarUrl,
        html_url: `https://github.com/${stored.profile.login}`,
        bio: stored.profile.bio,
        followers: stored.stats.followers || 0,
        following: 0,
        public_repos: stored.stats.repos,
        public_gists: 0,
        company: stored.profile.company,
        location: stored.profile.location,
        blog: stored.profile.blog,
        twitter_username: stored.profile.twitterUsername,
        created_at: stored.profile.createdAt,
      });
      // Generate README using AI from loaded card data
      (async () => {
        setIsGeneratingREADME(true);
        try {
          // Generate devcard share URL
          const devcardShareUrl = typeof window !== 'undefined' 
            ? `${window.location.origin}/card/${stored.profile.login}?variant=${selectedCard}`
            : '';
          
          const aiReadme = await generateReadmeWithAI({
            profile: {
              login: stored.profile.login,
              name: stored.profile.name,
              bio: stored.profile.bio,
              location: stored.profile.location,
              company: stored.profile.company,
              blog: stored.profile.blog,
              twitterUsername: stored.profile.twitterUsername,
            },
            stats: {
              repos: stored.stats.repos,
              stars: stored.stats.stars,
              forks: stored.stats.forks,
              contributions: stored.stats.contributions,
              followers: stored.stats.followers,
            },
            languages: stored.languages,
            topRepo: stored.topRepo,
            repositories: stored.repositories?.map((repo: any) => ({
              name: repo.name,
              description: repo.description,
              stars: repo.stars || repo.stargazers_count || 0,
              language: repo.language,
            })),
            devcardUrl: devcardShareUrl,
          });
          setGeneratedREADME(aiReadme);
        } catch (error) {
          console.error("Failed to generate README with AI, using fallback:", error);
          // Fallback to template-based generation
          const formData = convertCardDataToFormData(loadedCardData, {
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
      })();
      // Clear any existing errors if we have cached data
      setProfileError(null);
    }
  }, [user]);

  // Initialize and validate session on mount
  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        const isValid = await validateSession();
        
        if (!isMounted) return;
        
        if (!isValid) {
          console.warn('Session validation failed');
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    };

    initSession();

    return () => {
      isMounted = false;
    };
  }, [validateSession]);

  const fetchGitHubData = useCallback(async (forceRefresh = false) => {
    if (authLoading) return;
    if (!user) return;

    // Use cached data if available and not forcing refresh
    if (!forceRefresh) {
      const stored = loadCardData();
      if (stored) {
        // We already have cached data, don't fetch again
        return;
      }
    }

    // Check session - try to refresh if needed
    let currentSession = session;
    let providerToken = currentSession?.providerToken;

    // If no token, try to refresh session
    if (!providerToken) {
      try {
        const refreshed = await refreshSession();
        if (refreshed) {
          currentSession = useAuthStore.getState().session;
          providerToken = currentSession?.providerToken;
        }
      } catch (error) {
        console.error('Session refresh failed:', error);
      }
    }

    // If still no token after refresh, check for cached data
    if (!providerToken) {
      const stored = loadCardData();
      if (stored && !forceRefresh) {
        // Use cached data, don't show error
        return;
      }
      // Only show error if forcing refresh or no cached data
      if (forceRefresh) {
        setProfileError("Unable to authenticate. Please sign in again.");
        setProfileLoading(false);
        return;
      }
      // For non-forced refresh, silently fail and use cached data if available
      return;
    }

    let isMounted = true;
    setProfileLoading(true);
    setProfileError(null);
    setIsRefreshing(forceRefresh);

    (async () => {
      try {
        // Validate session
        const isValid = await validateSession();
        
        if (!isMounted) return;
        
        if (!isValid) {
          // Try to refresh one more time
          const refreshed = await refreshSession();
          if (!refreshed) {
            // Check for cached data before throwing error
            const stored = loadCardData();
            if (stored && !forceRefresh) {
              // Use cached data instead of error
              if (isMounted) {
                setProfileLoading(false);
                setIsRefreshing(false);
              }
              return;
            }
            throw new Error("Session expired. Please refresh the page.");
          }
          // Update session after refresh
          currentSession = useAuthStore.getState().session;
          providerToken = currentSession?.providerToken;
        }

        // Final check for provider token
        if (!providerToken) {
          const stored = loadCardData();
          if (stored && !forceRefresh) {
            if (isMounted) {
              setProfileLoading(false);
              setIsRefreshing(false);
            }
            return;
          }
          throw new Error("Unable to authenticate. Please sign in again.");
        }

        const headers = {
          Authorization: `Bearer ${providerToken}`,
          Accept: "application/vnd.github+json",
        };

        const year = new Date().getFullYear();
        const now = new Date();
        const from = `${year}-01-01T00:00:00Z`;
        const to = now.toISOString();

        const graphBody = JSON.stringify({
          query: `query ($from: DateTime!, $to: DateTime!) {
            viewer {
              pullRequests(states: [OPEN, MERGED, CLOSED], first: 1) {
                totalCount
              }
              issues(states: [OPEN, CLOSED], first: 1) {
                totalCount
              }
              contributionsCollection(from: $from, to: $to) {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      date
                      contributionCount
                    }
                  }
                }
              }
            }
          }`,
          variables: { from, to },
        });

        const [profileResponse, reposResponse, graphResponse] = await Promise.all([
          fetch("https://api.github.com/user", {
            headers,
            cache: "no-store",
          }),
          fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
            headers,
            cache: "no-store",
          }),
          fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${providerToken}`,
              "Content-Type": "application/json",
            },
            body: graphBody,
          }),
        ]);

        if (!profileResponse.ok) {
          if (profileResponse.status === 401) {
            throw new Error("GitHub session expired. Please sign in again.");
          }
          throw new Error("Unable to fetch your GitHub profile at the moment.");
        }

        if (!reposResponse.ok) {
          throw new Error("Unable to inspect your repositories for language data.");
        }

        const profileData = (await profileResponse.json()) as GitHubProfile;
        const reposData = (await reposResponse.json()) as GitHubRepo[];

        if (!isMounted) return;
        setRepositories(reposData);

        const graphJson = await graphResponse.json();
        if (!graphResponse.ok || graphJson.errors) {
          throw new Error("Unable to fetch contribution insights.");
        }

        const viewer = graphJson.data.viewer;
        const calendar = viewer.contributionsCollection.contributionCalendar;

        const heatmap: Array<{ date: string; count: number }> = calendar.weeks.flatMap(
          (week: { contributionDays: Array<{ date: string; contributionCount: number }> }) =>
            week.contributionDays.map((day: { date: string; contributionCount: number }) => ({
              date: day.date,
              count: day.contributionCount,
            }))
        );

        const currentYear = new Date().getFullYear();
        const yearStartStr = `${currentYear}-01-01`;
        const todayStr = new Date().toISOString().split("T")[0];

        const currentYearContributions = heatmap
          .filter(({ date }) => {
            return date >= yearStartStr && date <= todayStr;
          })
          .reduce((sum, { count }) => sum + count, 0);

        const monthTotals = new Map<string, number>();
        heatmap.forEach(({ date, count }) => {
          const key = date.slice(0, 7);
          monthTotals.set(key, (monthTotals.get(key) ?? 0) + count);
        });
        const timeline = Array.from(monthTotals.entries())
          .sort()
          .slice(-12)
          .map(([month, total]) => {
            const label = new Date(`${month}-01T00:00:00Z`).toLocaleDateString(undefined, {
              month: "short",
            });
            return { label, total };
          });

        const languageCount = new Map<string, number>();
        let starTotal = 0;
        let forkTotal = 0;

        const topRepo = reposData.reduce<GitHubRepo | null>((best, repo) => {
          starTotal += repo.stargazers_count;
          forkTotal += repo.forks_count;
          if (repo.language) {
            const key = repo.language.toLowerCase();
            languageCount.set(key, (languageCount.get(key) ?? 0) + 1);
          }
          if (!best || repo.stargazers_count > best.stargazers_count) {
            return repo;
          }
          return best;
        }, null);

        const languageEntries = Array.from(languageCount.entries());
        const languageTotal = languageEntries.reduce((acc, [, count]) => acc + count, 0);
        const languages = languageEntries
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, count]) => ({
            name,
            percentage: languageTotal ? Math.round((count / languageTotal) * 100) : 0,
          }));

        if (!languages.length && reposData.length) {
          const fallback = reposData[0].language?.toLowerCase();
          if (fallback) {
            languages.push({ name: fallback, percentage: 100 });
          }
        }

        if (!isMounted) return;

        const processedStats = {
          repos: profileData.public_repos,
          stars: starTotal,
          forks: forkTotal,
          pullRequests: viewer.pullRequests.totalCount,
          issues: viewer.issues.totalCount,
          contributions: currentYearContributions,
          followers: profileData.followers,
        };

        const detectedTechnologies = getTopTechnologies(
          reposData.map(repo => ({
            name: repo.name,
            description: repo.description,
            language: repo.language,
            topics: repo.topics
          })),
          8
        );

        const finalCardData = {
          profile: {
            login: profileData.login,
            name: profileData.name,
            avatarUrl: profileData.avatar_url,
            bio: profileData.bio,
            company: profileData.company,
            location: profileData.location,
            blog: profileData.blog,
            twitterUsername: profileData.twitter_username,
            createdAt: profileData.created_at,
          },
          stats: processedStats,
          languages,
          technologies: detectedTechnologies,
          topRepo: topRepo
            ? {
                name: topRepo.name,
                description: topRepo.description,
                stars: topRepo.stargazers_count,
                url: topRepo.html_url,
              }
            : null,
          heatmap,
          timeline,
        };

        if (!isMounted) return;
        
        // Save to localStorage
        saveCardData({
          ...finalCardData,
          repositories: reposData.map((repo) => ({
            name: repo.name,
            description: repo.description,
            stars: repo.stargazers_count,
            language: repo.language,
          })),
        });
        
        // Save to Supabase metadata
        saveGitHubDataToMetadata({
          lastFetched: new Date().toISOString(),
          profile: finalCardData.profile,
          stats: finalCardData.stats,
          languages: finalCardData.languages,
          repositories: reposData.map((repo) => ({
            name: repo.name,
            description: repo.description,
            stars: repo.stargazers_count,
            language: repo.language,
          })),
          technologies: detectedTechnologies,
          topRepo: finalCardData.topRepo,
          heatmap: finalCardData.heatmap,
          timeline: finalCardData.timeline,
        });
        
        setProfile(profileData);
        setCardData(finalCardData);
        setProfileError(null);
        
        // Generate README using AI from GitHub profile data
        setIsGeneratingREADME(true);
        try {
          // Generate devcard share URL
          const devcardShareUrl = typeof window !== 'undefined' 
            ? `${window.location.origin}/card/${profileData.login}?variant=${selectedCard}`
            : '';
          
          const aiReadme = await generateReadmeWithAI({
            profile: {
              login: profileData.login,
              name: profileData.name,
              bio: profileData.bio,
              location: profileData.location,
              company: profileData.company,
              blog: profileData.blog,
              twitterUsername: profileData.twitter_username,
            },
            stats: {
              repos: finalCardData.stats.repos,
              stars: finalCardData.stats.stars,
              forks: finalCardData.stats.forks,
              contributions: finalCardData.stats.contributions,
              followers: profileData.followers,
            },
            languages: finalCardData.languages,
            topRepo: finalCardData.topRepo,
            repositories: repositories?.map((repo) => ({
              name: repo.name,
              description: repo.description,
              stars: repo.stargazers_count,
              language: repo.language,
            })),
            devcardUrl: devcardShareUrl,
          });
          setGeneratedREADME(aiReadme);
        } catch (error) {
          console.error("Failed to generate README with AI, using fallback:", error);
          // Fallback to template-based generation
          const formData = convertCardDataToFormData(finalCardData, {
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
      } catch (error) {
        if (!isMounted) return;
        setProfileError(error instanceof Error ? error.message : "Failed to load your dev card.");
      } finally {
        if (isMounted) {
          setProfileLoading(false);
          setIsRefreshing(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user, session, authLoading, validateSession, refreshSession]);

  // Fetch data on mount if no cached data
  useEffect(() => {
    if (!user || authLoading || profileLoading) return;
    
    // Check if we have cached data
    const stored = loadCardData();
    if (stored) {
      // We have cached data, don't fetch
      return;
    }
    
    // Small delay to ensure session is ready
    const timer = setTimeout(() => {
      fetchGitHubData(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [user, authLoading, profileLoading, fetchGitHubData]);

  const fallbackProfileData = useMemo(() => {
    const safeUser = user ?? {
      username: "your-github",
      name: "Showra Maker",
      avatarUrl: "/logo.png",
    };
    return {
      login: safeUser.username,
      name: safeUser.name,
      avatarUrl: safeUser.avatarUrl,
      bio: null,
      company: null,
      location: null,
      blog: null,
      twitterUsername: null,
      createdAt: new Date().toISOString(),
    };
  }, [user]);

  const fallbackStats = useMemo(
    () => ({
      repos: 0,
      stars: 0,
      forks: 0,
      pullRequests: 0,
      issues: 0,
      contributions: 0,
      followers: 0,
    }),
    []
  );

  // Wait for auth to finish loading before checking for user
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

  // Only show "no user" message after auth has finished loading
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
      {/* LightRays Background */}
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

      {/* Grid Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-[#9D4BFF]/10 before:via-[#00E5FF]/5 before:to-[#FF00CC]/10 before:rounded-full before:top-0 before:blur-3xl before:-z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="absolute left-[10%] top-[20%] h-96 w-96 rounded-full bg-[#9D4BFF]/8 blur-[120px]" />
        <div className="absolute right-[15%] bottom-[25%] h-96 w-96 rounded-full bg-[#00E5FF]/8 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center py-20 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-[#00E5FF]/10 before:via-[#FF00CC]/5 before:to-[#9D4BFF]/10 before:rounded-full before:top-0 before:blur-3xl before:-z-10">
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
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] opacity-40 blur-2xl animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] opacity-20 blur-xl" />
                  
                  {/* Rotating border */}
                  <div className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] animate-spin" style={{ animationDuration: '3s' }}>
                    <div className="absolute inset-[2px] rounded-full bg-[#0A0A0A]" />
                  </div>
                  
                  {/* Avatar image */}
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

            {/* Heading */}
            {(() => {
              const welcome = getWelcomeMessage(profile?.name, user?.name, user?.email);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="mb-12 text-center px-4 w-full max-w-4xl mx-auto"
                >
                  <h1 className="mb-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white">
                    <span className="whitespace-nowrap">{welcome.greeting}</span>
                    <span className="block mt-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl break-words px-2">
                      {welcome.name}
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg text-white/70 font-medium mb-2">
                    Your developer card is ready to share
                  </p>
                  {profile?.login && (
                    <p className="mt-1 text-xs sm:text-sm text-white/50 break-words">
                      @{profile.login}
                    </p>
                  )}
                </motion.div>
              );
            })()}

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

      {/* Main Content Section with Tabs */}
      <section className="relative flex min-h-screen items-start justify-center py-12 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-[#9D4BFF]/10 before:via-[#00E5FF]/5 before:to-[#FF00CC]/10 before:rounded-full before:top-0 before:blur-3xl before:-z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Tabs */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <button
                onClick={() => setActiveTab('card')}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'card'
                    ? 'bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] text-white shadow-lg shadow-[#00E5FF]/30'
                    : 'bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                Your DevCard
              </button>
              {/* README Tab - Commented out temporarily */}
              {/* <button
                onClick={() => setActiveTab('readme')}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'readme'
                    ? 'bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] text-white shadow-lg shadow-[#00E5FF]/30'
                    : 'bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Code className="inline-block h-4 w-4 mr-2" />
                README Code
              </button> */}
              <button
                onClick={() => {
                  clearAIAnalysis(); // Clear AI analysis cache on refresh
                  fetchGitHubData(true);
                }}
                disabled={isRefreshing || profileLoading}
                className="px-3 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:bg-white/10 transition-all disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'card' ? (
              <div className="space-y-6">
                {/* Card Selector - Always visible when card data exists */}
                {cardData && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full mb-6"
                  >
                    <div className="mb-3 text-center">
                      <h3 className="text-sm font-semibold text-white/70 mb-2">Choose Your Card Design</h3>
                    </div>
                    <div className="flex justify-center">
                      <CardSelector
                        selectedCard={selectedCard}
                        onSelectCard={async (variant) => {
                          setSelectedCard(variant);
                          await saveUserPreferences({ selectedCardDesign: variant });
                        }}
                      />
                    </div>
                  </motion.div>
                )}
                
                {profileLoading && !cardData ? (
                  <CardSkeleton />
                ) : profileError ? (
                  <div className="w-full max-w-[420px] mx-auto rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-300 font-semibold mb-2">Error Loading Data</p>
                    <p className="text-sm text-red-300/80 mb-6">{profileError}</p>
                    <button
                      onClick={() => {
                        clearCardData();
                        clearAIAnalysis();
                        fetchGitHubData(true);
                      }}
                      className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-semibold hover:bg-red-500/30 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div data-card-wrapper className="w-full flex justify-center">
                      <CardWrapper
                        key={cardData?.profile?.login || 'default'} // Stable key based on profile to prevent remounting on variant change
                        variant={selectedCard}
                        profile={cardData?.profile ?? fallbackProfileData}
                        stats={cardData?.stats ?? fallbackStats}
                        topRepo={cardData?.topRepo ?? null}
                        topLanguages={cardData?.languages ?? []}
                        technologies={cardData?.technologies}
                        heatmap={cardData?.heatmap ?? []}
                        repositories={repositories?.map((repo) => ({
                          name: repo.name,
                          description: repo.description,
                          stars: repo.stargazers_count,
                          language: repo.language,
                        }))}
                      />
                    </div>
                    
                    {/* Download and Share Buttons */}
                    <div className="flex items-center justify-center gap-4 w-full max-w-md">
                      <button
                        onClick={async () => {
                          try {
                            // Find the card wrapper
                            const wrapper = document.querySelector('[data-card-wrapper]') as HTMLElement;
                            if (!wrapper) {
                              alert('Card not found. Please try again.');
                              return;
                            }
                            
                            // Find the variant wrapper to get variant name
                            const variantWrapper = wrapper.querySelector('[data-card-variant]') as HTMLElement;
                            const variant = variantWrapper?.getAttribute('data-card-variant') || selectedCard;
                            
                            // Find the capture container - this is consistent across all card variants
                            const captureContainer = wrapper.querySelector('[class*="captureContainer"]') as HTMLElement;
                            
                            // The card element is the first child of captureContainer (or captureContainer itself)
                            let cardElement: HTMLElement | null = null;
                            
                            if (captureContainer) {
                              // Try to find the actual card element inside captureContainer
                              // DevCard uses 'neonDevcard', DevCard2 uses 'card', DevCard3/4 use 'neonDevcard'
                              cardElement = captureContainer.querySelector('[class*="neonDevcard"]') as HTMLElement;
                              
                              // If not found, try finding 'card' class (DevCard2)
                              if (!cardElement) {
                                const cardElements = captureContainer.querySelectorAll('[class*="card"]');
                                for (const el of Array.from(cardElements)) {
                                  const className = (el as HTMLElement).className?.toString() || '';
                                  if (className.includes('card') && 
                                      !className.includes('cardWrapper') && 
                                      !className.includes('cardContent') &&
                                      !className.includes('captureContainer')) {
                                    cardElement = el as HTMLElement;
                                    break;
                                  }
                                }
                              }
                              
                              // If still not found, use the first child of captureContainer
                              if (!cardElement && captureContainer.firstElementChild) {
                                cardElement = captureContainer.firstElementChild as HTMLElement;
                              }
                              
                              // Last resort: use captureContainer itself
                              if (!cardElement) {
                                cardElement = captureContainer;
                              }
                            } else {
                              // Fallback: search for card element directly
                              const allElements = wrapper.querySelectorAll('*');
                              for (const el of Array.from(allElements)) {
                                const className = (el as HTMLElement).className?.toString() || '';
                                // Look for the actual card element (not wrapper or content)
                                if ((className.includes('neonDevcard') || 
                                    (className.includes('card') && 
                                     !className.includes('cardWrapper') && 
                                     !className.includes('cardContent') &&
                                     !className.includes('captureContainer'))) &&
                                    el.parentElement?.className?.toString().includes('captureContainer')) {
                                  cardElement = el as HTMLElement;
                                  break;
                                }
                              }
                              
                              // Last resort: find any element with card classes
                              if (!cardElement) {
                                for (const el of Array.from(allElements)) {
                                  const className = (el as HTMLElement).className?.toString() || '';
                                  if (className.includes('neonDevcard') || 
                                      (className.includes('card') && 
                                       !className.includes('cardWrapper') && 
                                       !className.includes('cardContent') &&
                                       !className.includes('captureContainer'))) {
                                    cardElement = el as HTMLElement;
                                    break;
                                  }
                                }
                              }
                            }
                            
                            if (!cardElement) {
                              alert('Could not find card element. Please try again.');
                              return;
                            }
                            
                            // Wait for images to load first
                            const imgs = cardElement.querySelectorAll("img");
                            await Promise.all(Array.from(imgs).map(img => {
                              if ((img as HTMLImageElement).complete) return Promise.resolve();
                              return new Promise(res => {
                                (img as HTMLImageElement).onload = res;
                                (img as HTMLImageElement).onerror = res;
                                setTimeout(res, 3000);
                              });
                            }));
                            
                            // Get variant name for filename
                            const variantNames: Record<CardVariant, string> = {
                              'card1': 'classic-neon',
                              'card2': 'vertical-flow',
                              'card3': 'compact-modern',
                              'card4': 'minimalist'
                            };
                            const variantName = variantNames[variant as CardVariant] || variant;
                            
                            const dataUrl = await htmlToImage.toPng(cardElement, {
                              pixelRatio: 3,
                              backgroundColor: '#0A0A0A',
                              cacheBust: true,
                              quality: 1,
                              skipFonts: false,
                            });
                            
                            const link = document.createElement('a');
                            link.download = `devcard-${cardData?.profile?.login || 'card'}-${variantName}.png`;
                            link.href = dataUrl;
                            link.click();
                          } catch (error) {
                            console.error('Download failed:', error);
                            alert('Failed to download card. Please try again.');
                          }
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00E5FF]/20 to-[#00E5FF]/10 backdrop-blur-xl border-2 border-[#00E5FF]/30 text-sm font-bold text-white shadow-lg shadow-[#00E5FF]/20 transition-all hover:from-[#00E5FF]/30 hover:to-[#00E5FF]/20 hover:scale-105"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(window.location.href);
                            alert('Link copied to clipboard!');
                          } catch (err) {
                            console.error('Failed to copy:', err);
                          }
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF00CC]/20 to-[#FF00CC]/10 backdrop-blur-xl border-2 border-[#FF00CC]/30 text-sm font-bold text-white shadow-lg shadow-[#FF00CC]/20 transition-all hover:from-[#FF00CC]/30 hover:to-[#FF00CC]/20 hover:scale-105"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              /* README Tab Content - Commented out temporarily, showing "Coming Soon" instead
                 All README generation logic is preserved above in the component, just the UI is hidden */
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">README Generator</h3>
                  <p className="text-white/60">Coming soon!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
