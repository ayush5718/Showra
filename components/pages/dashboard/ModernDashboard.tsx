"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Download, RefreshCw, Code, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/auth/store";
import { supabase } from "@/lib/supabaseClient";
import { DevCard } from "@/components/features/card/DevCard";
import { READMEPreview } from "@/components/features/card/READMEPreview";
import { getTopTechnologies } from "@/lib/detectTechnologies";
import LightRays from "@/components/react-bits/LigthRays/LightRays";
import SplitText from "@/components/common/SplitText";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { READMESkeleton } from "@/components/ui/READMESkeleton";
import { saveCardData, loadCardData, clearCardData } from "@/lib/utils/storage";

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
  const [activeTab, setActiveTab] = useState<'card' | 'readme'>('card');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (!user) return;
    
    const stored = loadCardData();
    if (stored) {
      setCardData({
        profile: stored.profile,
        stats: stored.stats,
        languages: stored.languages,
        technologies: stored.technologies,
        topRepo: stored.topRepo,
        heatmap: stored.heatmap,
        timeline: stored.timeline,
      });
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
    if (!forceRefresh && cardData) {
      const stored = loadCardData();
      if (stored) {
        return;
      }
    }

    // Check session - try to refresh if needed
    let currentSession = session;
    if (!currentSession || !currentSession.providerToken) {
      const refreshed = await refreshSession();
      if (refreshed) {
        currentSession = useAuthStore.getState().session;
      } else {
        // If we have cached data, use it instead of showing error
        const stored = loadCardData();
        if (stored) {
          return;
        }
        // Only show error if no cached data and can't authenticate
        setProfileError("Unable to authenticate. Please sign in again.");
        setProfileLoading(false);
        return;
      }
    }

    if (!currentSession || !currentSession.providerToken) {
      // Final check - if still no session, try one more time
      const stored = loadCardData();
      if (stored) {
        return;
      }
      setProfileError("Unable to authenticate. Please sign in again.");
      setProfileLoading(false);
      return;
    }

    let isMounted = true;
    setProfileLoading(true);
    setProfileError(null);
    setIsRefreshing(forceRefresh);

    (async () => {
      try {
        const isValid = await validateSession();
        
        if (!isMounted) return;
        
        if (!isValid) {
          throw new Error("Session expired. Please refresh the page.");
        }

        const providerToken = currentSession?.providerToken;

        if (!providerToken) {
          const refreshed = await refreshSession();
          if (!refreshed) {
            throw new Error("Unable to authenticate. Please sign in again.");
          }
          const refreshedSession = useAuthStore.getState().session;
          if (!refreshedSession?.providerToken) {
            throw new Error("Unable to authenticate. Please sign in again.");
          }
          return;
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
        
        setProfile(profileData);
        setCardData(finalCardData);
        setProfileError(null);
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
  }, [user, session, authLoading, validateSession, refreshSession, cardData]);

  // Fetch data on mount if no cached data
  useEffect(() => {
    if (!cardData && user && !authLoading) {
      fetchGitHubData(false);
    }
  }, [user, authLoading, cardData, fetchGitHubData]);

  const fallbackProfileData = useMemo(() => {
    const safeUser = user ?? {
      username: "your-github",
      name: "Showg Maker",
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

  if (!user) {
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
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="absolute left-[10%] top-[20%] h-96 w-96 rounded-full bg-[#9D4BFF]/10 blur-[120px]" />
        <div className="absolute right-[15%] bottom-[25%] h-96 w-96 rounded-full bg-[#00E5FF]/10 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h1 className="mb-4 leading-tight">
                <SplitText
                  text={`Welcome, ${profile?.name || user.name}!`}
                  tag="span"
                  className="block"
                  delay={50}
                  duration={0.6}
                />
              </h1>
              <p className="text-lg sm:text-xl text-white/70 font-medium">
                Your developer card is ready to share
              </p>
            </motion.div>

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
      <section className="relative flex min-h-screen items-start justify-center py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Tabs */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <button
                onClick={() => setActiveTab('card')}
                className={`px-8 py-4 rounded-2xl text-base font-bold transition-all ${
                  activeTab === 'card'
                    ? 'bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] text-white shadow-lg shadow-[#00E5FF]/30'
                    : 'bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                Your DevCard
              </button>
              <button
                onClick={() => setActiveTab('readme')}
                className={`px-8 py-4 rounded-2xl text-base font-bold transition-all ${
                  activeTab === 'readme'
                    ? 'bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] text-white shadow-lg shadow-[#00E5FF]/30'
                    : 'bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Code className="inline-block h-4 w-4 mr-2" />
                README Code
              </button>
              <button
                onClick={() => fetchGitHubData(true)}
                disabled={isRefreshing || profileLoading}
                className="px-4 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:bg-white/10 transition-all disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'card' ? (
              <div className="space-y-8">
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
                    className="flex justify-center"
                  >
                    <DevCard
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
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {profileLoading && !cardData ? (
                  <READMESkeleton />
                ) : profileError ? (
                  <div className="w-full max-w-4xl mx-auto rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-300 font-semibold mb-2">Error Loading Data</p>
                    <p className="text-sm text-red-300/80 mb-6">{profileError}</p>
                    <button
                      onClick={() => {
                        clearCardData();
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
                  >
                    <READMEPreview />
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
