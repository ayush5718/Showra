"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Download, Copy, Check } from "lucide-react";
import { useAuthStore } from "@/lib/auth/store";
import { supabase } from "@/lib/supabaseClient";
import { DevCard } from "@/components/features/card/DevCard";
import { READMEPreview } from "@/components/features/card/READMEPreview";
import { getTopTechnologies } from "@/lib/detectTechnologies";
import LightRays from "@/components/react-bits/LigthRays/LightRays";
import SplitText from "@/components/common/SplitText";

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
        const isValid = await validateSession();
        
        if (!isMounted) return;
        
        if (!isValid) {
          throw new Error("Session expired. Please refresh the page.");
        }

        const currentSession = useAuthStore.getState().session;
        const providerToken = currentSession?.providerToken || session.providerToken;

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
        
        setProfile(profileData);
        setCardData(finalCardData);
        setProfileError(null);
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

      const scrollPosition = window.scrollY + window.innerHeight / 2;
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

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

      {/* Hero Section - COMPLETELY REDESIGNED */}
      <section
        id="hero-section"
        className="relative flex min-h-screen items-center justify-center py-32"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Avatar - BIGGER */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="mb-12 flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00E5FF] via-[#FF00CC] to-[#9D4BFF] blur-2xl opacity-50 animate-pulse" />
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-white/30 bg-gradient-to-br from-[#00E5FF]/20 via-[#FF00CC]/20 to-[#9D4BFF]/20 overflow-hidden shadow-2xl">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.name}
                      width={224}
                      height={224}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl font-black text-white flex items-center justify-center h-full">
                      {user.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Heading - MUCH BIGGER */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-8 text-center"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-4 leading-tight">
                <SplitText
                  text={`Welcome, ${profile?.name || user.name}!`}
                  tag="span"
                  className="block"
                  delay={50}
                  duration={0.6}
                />
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-white/70 font-semibold">
                Your developer card is ready to share
              </p>
            </motion.div>

            {/* Quick Stats - REDESIGNED */}
            {cardData && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="grid grid-cols-3 gap-6 max-w-2xl mx-auto"
              >
                {[
                  { label: "Repos", value: cardData.stats.repos, color: "from-[#00E5FF]" },
                  { label: "Stars", value: cardData.stats.stars.toLocaleString(), color: "from-[#FF00CC]" },
                  { label: "Contribs", value: cardData.stats.contributions.toLocaleString(), color: "from-[#9D4BFF]" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20 px-6 py-6 text-center shadow-xl transition-all"
                  >
                    <div className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${stat.color} to-white bg-clip-text text-transparent mb-2`}>
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-white/60 uppercase tracking-widest font-bold">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* DevCard Section */}
      <section
        id="dev-card-section"
        className="relative flex min-h-screen items-center justify-center py-20 scroll-mt-24"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header - REDESIGNED */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00E5FF]/20 via-[#FF00CC]/20 to-[#9D4BFF]/20 backdrop-blur-xl border-2 border-white/20 mb-6 shadow-lg">
                <span className="text-sm font-black uppercase tracking-[0.2em] text-white">Your DevCard</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
                <SplitText
                  text={profileLoading ? "Loading..." : cardData ? "Your Card is Ready! 🎉" : "Preparing..."}
                  tag="span"
                  className="block"
                  delay={50}
                  duration={0.6}
                />
              </h2>
              <p className="text-xl sm:text-2xl text-white/70 max-w-3xl mx-auto font-semibold">
                {profileLoading 
                  ? "Fetching your GitHub data..." 
                  : cardData 
                    ? "Download or add to your GitHub README"
                    : "Please wait..."}
              </p>
            </motion.div>

            {/* DevCard */}
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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
        </div>
      </section>

      {/* README Section */}
      <section
        id="readme-section"
        className="relative flex min-h-screen items-center justify-center py-20 scroll-mt-24"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md mb-4">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">GitHub README</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                <SplitText
                  text="Add to Your Profile"
                  tag="span"
                  className="block"
                  delay={50}
                  duration={0.6}
                />
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Copy the markdown code and add it to your GitHub profile README.md
              </p>
            </motion.div>

            {/* README Preview */}
            {profileLoading || profileError ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-100 min-h-[400px] flex items-center justify-center"
              >
                {profileError || "Loading..."}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <READMEPreview />
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Navigation Button */}
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
          className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-white/15 hover:border-white/30"
        >
          <ArrowDown className="h-5 w-5" />
          <span>
            {currentSection === 'hero' 
              ? 'View Card' 
              : currentSection === 'devcard' 
              ? 'View README' 
              : 'Back to Card'}
          </span>
        </button>
      </motion.div>
    </main>
  );
}
