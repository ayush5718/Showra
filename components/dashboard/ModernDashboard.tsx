"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useAuthStore } from "@/lib/auth/store";
import { supabase } from "@/lib/supabaseClient";
import { DevCard } from "./DevCard";
import { READMEPreview } from "./READMEPreview";
import { getTopTechnologies } from "@/lib/detectTechnologies";

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
  const [currentSection, setCurrentSection] = useState<'hero' | 'devcard' | 'readme'>('hero');
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

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

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    if (!session || !session.providerToken) {
      const refreshAndRetry = async () => {
        const refreshed = await refreshSession();
        if (!refreshed) {
          setProfileError("Unable to authenticate. Please sign in again.");
          setProfileLoading(false);
        }
      };
      refreshAndRetry();
      return;
    }

    let isMounted = true;
    setProfileLoading(true);
    setProfileError(null);

    (async () => {
      try {
        console.log('🔄 Starting data fetch...');
        console.log('📊 Current state:', { user: !!user, session: !!session, authLoading });
        
        const isValid = await validateSession();
        
        if (!isMounted) return;
        
        console.log('🔐 Session validation result:', isValid);
        
        if (!isValid) {
          throw new Error("Session expired. Please refresh the page.");
        }

        const currentSession = useAuthStore.getState().session;
        const providerToken = currentSession?.providerToken || session.providerToken;

        console.log('🎫 Provider token available:', !!providerToken);

        if (!providerToken) {
          console.log('⚠️ No provider token, attempting refresh...');
          const refreshed = await refreshSession();
          if (!refreshed) {
            throw new Error("Unable to authenticate. Please sign in again.");
          }
          const refreshedSession = useAuthStore.getState().session;
          if (!refreshedSession?.providerToken) {
            throw new Error("Unable to authenticate. Please sign in again.");
          }
          console.log('✅ Session refreshed, token available');
          return;
        }
        
        console.log('🚀 Making GitHub API calls...');

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

        console.log('🔵 ===== GITHUB API RAW DATA =====');
        console.log('📊 Profile Data:', profileData);
        console.log('📦 Repositories Count:', reposData.length);
        console.log('👥 Followers:', profileData.followers);
        console.log('⭐ Following:', profileData.following);
        console.log('📁 Public Repos:', profileData.public_repos);
        console.log('🔗 Profile URL:', profileData.html_url);
        console.log('📍 Location:', profileData.location);
        console.log('💼 Company:', profileData.company);
        console.log('📝 Bio:', profileData.bio);

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

        console.log('🟢 ===== PROCESSED CARD DATA =====');
        console.log('📈 Stats Object:', processedStats);
        console.log('💻 Top Languages:', languages);
        console.log('🛠️ Detected Technologies:', detectedTechnologies);
        console.log('⭐ Total Stars:', starTotal);
        console.log('🍴 Total Forks:', forkTotal);
        console.log('📊 Contributions (This Year):', currentYearContributions);
        console.log('🔝 Top Repository:', topRepo);
        console.log('📋 Full Card Data:', finalCardData);

        if (!isMounted) return;
        
        console.log('✅ Setting profile and card data...');
        setProfile(profileData);
        setCardData(finalCardData);
        setProfileError(null);
        console.log('✅ Data set successfully!');
      } catch (error) {
        if (!isMounted) return;
        setCardData(null);
        setProfileError(error instanceof Error ? error.message : "Failed to load your dev card.");
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user, session, authLoading, validateSession, refreshSession]);

  // Track current section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero-section');
      const devCardSection = document.getElementById('dev-card-section');
      const readmeSection = document.getElementById('readme-section');

      if (!heroSection || !devCardSection || !readmeSection) return;

      const scrollPosition = window.scrollY + window.innerHeight / 2; // Use middle of viewport
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      const devCardBottom = devCardSection.offsetTop + devCardSection.offsetHeight;

      if (scrollPosition < heroBottom) {
        setCurrentSection('hero');
      } else if (scrollPosition < devCardBottom) {
        setCurrentSection('devcard');
      } else {
        setCurrentSection('readme');
      }
    };

    handleScroll(); // Check on mount
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  if (!user) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70">
          <p className="text-sm sm:text-base">Loading your dashboard…</p>
        </div>

      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#0A0A0A]">
      {/* Grid Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="absolute left-[10%] top-[20%] h-96 w-96 rounded-full bg-[#9D4BFF]/10 blur-[120px]" />
        <div className="absolute right-[15%] bottom-[25%] h-96 w-96 rounded-full bg-[#00E5FF]/10 blur-[120px]" />
      </div>

      {/* Hero Section - First View */}
      <motion.section
        id="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex min-h-screen flex-col items-center justify-center gap-8 py-16 pb-8 text-center"
      >
        {/* Content Container - Centered with Max Width */}
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* User Avatar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mb-8"
          >
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-white/5 sm:h-40 sm:w-40">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={160}
                  height={160}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl font-semibold text-white/70">
                  {user.name.slice(0, 1)}
                </span>
              )}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00E5FF]/20 via-[#FF00CC]/20 to-[#9D4BFF]/20 blur-xl" />
            </div>
          </motion.div>

          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative z-10 space-y-4 mb-8"
          >
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              Hi, {profile?.name || user.name}! 👋
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/70 sm:text-xl">
              Welcome to your personalized developer dashboard
            </p>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative z-10 mx-auto max-w-3xl space-y-4"
          >
            <p className="text-base leading-relaxed text-white/60 sm:text-lg">
              Showra creates beautiful, interactive developer cards that showcase your GitHub activity, 
              contributions, and coding journey. Your personalized dev card is automatically generated 
              from your GitHub profile and ready to share with the world.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <div className="flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-md px-5 py-2.5">
                <span className="text-sm font-medium text-white/70">✨ Auto-generated</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-md px-5 py-2.5">
                <span className="text-sm font-medium text-white/70">📊 Real-time stats</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-md px-5 py-2.5">
                <span className="text-sm font-medium text-white/70">🎨 Beautiful design</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* DevCard Section - Second View */}
      <motion.section
        id="dev-card-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative flex min-h-screen flex-col items-center justify-center gap-6 pt-8 pb-16 scroll-mt-24"
      >
        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 w-full mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">STEP 1</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl mb-4">
              {profileLoading ? "Loading your DevCard..." : cardData ? "Your DevCard is Ready! 🎉" : "Preparing your DevCard..."}
            </h2>
            <p className="text-lg leading-relaxed text-white/60 max-w-2xl mx-auto sm:text-xl">
              {profileLoading 
                ? "Fetching your GitHub data..." 
                : cardData 
                  ? "Download your card or add it to your GitHub README below"
                  : "Please wait while we load your data..."}
            </p>
          </div>
          
          {profileLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border border-white/10 bg-black/50 min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-500"></div>
              <p className="text-sm text-white/60">Loading your GitHub profile...</p>
            </div>
          ) : profileError ? (
            <div className="w-full max-w-md mx-auto rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center min-h-[400px] flex flex-col items-center justify-center">
              <p className="text-red-400 font-medium mb-2">⚠️ Error Loading Data</p>
              <p className="text-sm text-red-300/80 mb-4">{profileError}</p>
              <button
                onClick={() => {
                  setProfileError(null);
                  const currentSession = useAuthStore.getState().session;
                  if (currentSession?.providerToken) {
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[500px]">
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
            </div>
          )}
        </div>
      </motion.section>

      {/* README Section - Third View */}
      <motion.section
        id="readme-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative flex min-h-screen flex-col items-center justify-center gap-6 py-16 scroll-mt-24"
      >
        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">STEP 2</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl mb-4">
              Generate Your GitHub README
            </h2>
            <p className="text-lg leading-relaxed text-white/60 max-w-2xl mx-auto sm:text-xl">
              Copy the markdown code below and add it to your GitHub profile README.md file
            </p>
          </div>

          {profileLoading || profileError ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-100 min-h-[400px] flex items-center justify-center"
            >
              {profileError || "Loading..."}
            </motion.div>
          ) : (
            <div className="flex justify-center items-center min-h-[500px]">
              <READMEPreview />
            </div>
          )}
        </div>
      </motion.section>

      {/* Dynamic Sticky Navigation Button - Right Side */}
      <motion.div
        className="fixed right-6 bottom-6 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <button
          onClick={() => {
            if (currentSection === 'hero') {
              const devCardSection = document.getElementById('dev-card-section');
              if (devCardSection) {
                devCardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            } else if (currentSection === 'devcard') {
              const readmeSection = document.getElementById('readme-section');
              if (readmeSection) {
                readmeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            } else {
              const devCardSection = document.getElementById('dev-card-section');
              if (devCardSection) {
                devCardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          }}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/20"
        >
          <ArrowDown className="h-5 w-5" />
          <span>
            {currentSection === 'hero' 
              ? 'View Dev Card' 
              : currentSection === 'devcard' 
              ? 'Go to README' 
              : 'Back to Card'}
          </span>
        </button>
      </motion.div>
    </main>
  );
}
