"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Copy, Sparkles } from "lucide-react";

import { useAuthStore } from "@/lib/auth/store";
import { supabase } from "@/lib/supabaseClient";
import { DevCard } from "./DevCard";

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
  };
  languages: Array<{ name: string; percentage: number }>;
  topRepo: {
    name: string;
    description: string | null;
    stars: number;
    url: string;
  } | null;
  heatmap: Array<{ date: string; count: number }>;
  timeline: Array<{ label: string; total: number }>;
}

export function DashboardClient() {
  const { user, setUser } = useAuthStore((state) => ({
    user: state.user,
    setUser: state.setUser,
  }));

  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [cardData, setCardData] = useState<DevCardData | null>(null);
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) return;

    let isMounted = true;

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!isMounted || !authUser) return;

      const metadata = (authUser.user_metadata ?? {}) as Record<string, any>;
      setUser({
        id: authUser.id,
        name: metadata?.name ?? authUser.email ?? "Showra Maker",
        username: metadata?.user_name ?? metadata?.nickname ?? authUser.email ?? "maker",
        avatarUrl:
          metadata?.avatar_url ??
          `https://api.dicebear.com/7.x/initials/svg?seed=${metadata?.user_name ?? "showra"}`,
        email: authUser.email ?? undefined,
      });
    });

    return () => {
      isMounted = false;
    };
  }, [setUser, user]);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    setProfileLoading(true);
    setProfileError(null);

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const providerToken = data.session?.provider_token;

        if (!providerToken) {
          throw new Error("Missing GitHub token. Please sign out and sign back in with GitHub.");
        }

        const headers = {
          Authorization: `Bearer ${providerToken}`,
          Accept: "application/vnd.github+json",
        };

        const now = new Date();
        const from = new Date(now.getFullYear(), 0, 1).toISOString();
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
        const repositories = (await reposResponse.json()) as GitHubRepo[];

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

        const topRepo = repositories.reduce<GitHubRepo | null>((best, repo) => {
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

        if (!languages.length && repositories.length) {
          const fallback = repositories[0].language?.toLowerCase();
          if (fallback) {
            languages.push({ name: fallback, percentage: 100 });
          }
        }

        if (!isMounted) return;

        setProfile(profileData);
        setCardData({
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
          stats: {
            repos: profileData.public_repos,
            stars: starTotal,
            forks: forkTotal,
            pullRequests: viewer.pullRequests.totalCount,
            issues: viewer.issues.totalCount,
            contributions: calendar.totalContributions,
          },
          languages,
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
        });
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
  }, [user]);

  const embedCode = useMemo(() => {
    const username = cardData?.profile.login ?? profile?.login ?? user?.username ?? "your-github";
    const baseUrl = "https://showra.app";
    const size =
      orientation === "vertical"
        ? { width: 356, height: 560 }
        : { width: 720, height: 360 };

    return `<iframe src="${baseUrl}/embed/devcard/${username}?layout=${orientation}" width="${size.width}" height="${size.height}" style="border:0;border-radius:28px;" loading="lazy"></iframe>`;
  }, [cardData?.profile.login, orientation, profile?.login, user?.username]);

  const handleCopy = useCallback(() => {
    if (typeof navigator === "undefined") return;
    navigator.clipboard
      .writeText(embedCode)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => setCopied(false));
  }, [embedCode]);

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
    }),
    []
  );

  const coverUrl = useMemo(() => {
    if (!cardData) return null;
    return `https://showra.app/api/devcard/${cardData.profile.login}?variant=${orientation}`;
  }, [cardData, orientation]);

  if (!user) {
    return (
      <main className="relative mx-auto flex w-full max-w-5xl flex-col px-5 pt-32 sm:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-white/70 backdrop-blur">
          <p className="text-sm sm:text-base">Loading your dashboard…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 pt-28 sm:px-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left"
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#5a59ff] via-[#4ecbff] to-transparent opacity-75 blur-xl" />
            <div className="relative flex h-[4.6rem] w-[4.6rem] items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/5 shadow-[0_12px_40px_-18px_rgba(80,120,255,0.75)]">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-white/70">
                  {user.name.slice(0, 1)}
                </span>
              )}
            </div>
          </motion.div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/50">
              Your Showra DevCard
            </p>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              {`Hey, @${user.username} 👋`}
            </h1>
            <p className="max-w-xl text-sm text-white/60 sm:text-base">
              We pulled your GitHub profile and turned it into a shareable card. Copy the embed code,
              download the artwork, or tweak the layout below.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.section
        className="grid gap-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        >
          <DevCard
            profile={cardData?.profile ?? fallbackProfileData}
            stats={cardData?.stats ?? fallbackStats}
            topRepo={cardData?.topRepo ?? null}
            topLanguages={cardData?.languages ?? []}
            heatmap={cardData?.heatmap ?? []}
            timeline={cardData?.timeline ?? []}
            isLoading={profileLoading && !cardData}
            error={profileError}
          />
        </motion.div>

        <motion.aside
          className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#080818]/85 p-7 shadow-[0_38px_120px_-46px_rgba(62,92,255,0.75)] backdrop-blur-3xl sm:p-10"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(110,120,255,0.32),transparent_68%)] opacity-80" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_120%,rgba(58,210,255,0.18),transparent_70%)] opacity-70" />

          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-[0.68rem] uppercase tracking-[0.36em] text-white/45">Share it</p>
              <h3 className="text-xl font-semibold text-white sm:text-2xl">
                Embed your Showra Dev Card
              </h3>
              <p className="text-sm text-white/60">
                Copy the HTML snippet below to drop your card into a GitHub README, a personal
                website, or a Notion doc. The card stays in sync with your GitHub profile.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-white/45">
              <button
                type="button"
                onClick={() => setOrientation("vertical")}
                className={`rounded-full px-4 py-2 transition ${
                  orientation === "vertical"
                    ? "border border-white/40 bg-white/15 text-white"
                    : "border border-white/10 bg-white/5 text-white/45 hover:border-white/15 hover:text-white/80"
                }`}
              >
                Vertical
              </button>
              <button
                type="button"
                onClick={() => setOrientation("horizontal")}
                className={`rounded-full px-4 py-2 transition ${
                  orientation === "horizontal"
                    ? "border border-white/40 bg-white/15 text-white"
                    : "border border-white/10 bg-white/5 text-white/45 hover:border-white/15 hover:text-white/80"
                }`}
              >
                Horizontal
              </button>
            </div>

            <div className="rounded-[22px] border border-white/12 bg-[#0d1030]/80 p-5 shadow-inner shadow-black/30">
              <pre className="overflow-x-auto text-[0.8rem] leading-relaxed text-white/80">
                <code>{embedCode}</code>
              </pre>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/30 hover:bg-white/20"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy code"}
                </button>
                {coverUrl ? (
                  <a
                    href={coverUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/30 hover:bg-white/20"
                  >
                    Download cover image
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/50 opacity-60"
                  >
                    Download cover image
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/5 px-5 py-4 text-xs text-white/60">
              <p>
                Pro tip: Drop the card into your GitHub README to auto-refresh. Use it as a header on
                X, drop it into your portfolio, or share it anywhere HTML is welcome.
              </p>
            </div>
          </div>
        </motion.aside>
      </motion.section>

      {profileError ? (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-100">
          {profileError}
        </div>
      ) : null}
    </main>
  );
}

export default DashboardClient;

