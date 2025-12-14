import { useCallback, useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/lib/auth/store";
import { saveCardData, loadCardData } from "@/lib/utils/storage";
import { saveGitHubDataToMetadata } from "@/lib/utils/supabase/userMetadata";
import { savePublicCardData } from "@/lib/utils/supabase/cardStorage";
import { getTopTechnologies } from "@/lib/utils/transform/detectTechnologies";
import type { GitHubProfile, GitHubRepo, DevCardData } from "@/components/pages/dashboard/types";

export function useGitHubData() {
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load cached data on mount
  useEffect(() => {
    const stored = loadCardData();
    if (stored) {
      // Set profile from cached data
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
      
      // Set card data
      setCardData({
        profile: stored.profile,
        stats: stored.stats,
        languages: stored.languages,
        technologies: stored.technologies,
        topRepo: stored.topRepo,
        heatmap: stored.heatmap || [],
        timeline: stored.timeline || [],
        repositories: stored.repositories || [],
      });
      
      // Set repositories
      setRepositories(stored.repositories?.map((repo: any) => ({
        language: repo.language,
        stargazers_count: repo.stars || 0,
        forks_count: 0,
        name: repo.name,
        html_url: `https://github.com/${stored.profile.login}/${repo.name}`,
        description: repo.description,
        topics: repo.topics,
      })) || []);
    }
  }, []);

  const fetchGitHubData = useCallback(async (forceRefresh = false) => {
    if (authLoading) return;
    if (!user) return;

    // Use cached data if available and not forcing refresh
    // Note: Cached data is already loaded in useEffect above, so we can skip here
    if (!forceRefresh) {
      const stored = loadCardData();
      if (stored && cardData) {
        // Already have data loaded, don't fetch again
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
        return;
      }
      if (forceRefresh) {
        setProfileError("Unable to authenticate. Please sign in again.");
        setProfileLoading(false);
        return;
      }
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
          const refreshed = await refreshSession();
          if (!refreshed) {
            const stored = loadCardData();
            if (stored && !forceRefresh) {
              if (isMounted) {
                setProfileLoading(false);
                setIsRefreshing(false);
              }
              return;
            }
            throw new Error("Session expired. Please refresh the page.");
          }
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

        // Fetch profile data
        const profileRes = await fetch("https://api.github.com/user", { headers });
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData: GitHubProfile = await profileRes.json();

        // Fetch repositories
        const reposRes = await fetch(
          `https://api.github.com/user/repos?sort=updated&per_page=100`,
          { headers }
        );
        if (!reposRes.ok) throw new Error("Failed to fetch repositories");
        const reposData: GitHubRepo[] = await reposRes.json();

        // Fetch contribution calendar
        const calendarRes = await fetch(
          `https://api.github.com/users/${profileData.login}/events?per_page=100`,
          { headers }
        );
        const calendarData = calendarRes.ok ? await calendarRes.json() : [];

        // Process repositories data
        const processedStats = {
          repos: profileData.public_repos,
          stars: reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0),
          forks: reposData.reduce((sum, repo) => sum + repo.forks_count, 0),
          contributions: calendarData.length,
          pullRequests: 0,
          issues: 0,
        };

        // Process languages
        const langMap = new Map<string, number>();
        reposData.forEach((repo) => {
          if (repo.language) {
            langMap.set(repo.language, (langMap.get(repo.language) || 0) + 1);
          }
        });
        const total = langMap.size;
        const languages = Array.from(langMap.entries())
          .map(([name, count]) => ({ name, percentage: Math.round((count / total) * 100) }))
          .sort((a, b) => b.percentage - a.percentage);

        // Find top repo
        const topRepo = reposData
          .sort((a, b) => b.stargazers_count - a.stargazers_count)[0] || null;

        // Process contribution calendar
        const calendar = { weeks: [] as any[] };
        const heatmap: Array<{ date: string; count: number }> = calendar.weeks.flatMap(
          (week) =>
            week.contributionDays?.map((day: any) => ({
              date: day.date,
              count: day.contributionCount || 0,
            })) || []
        );

        const monthTotals = new Map<string, number>();
        heatmap.forEach((item) => {
          const month = item.date.substring(0, 7);
          monthTotals.set(month, (monthTotals.get(month) || 0) + item.count);
        });

        const timeline = Array.from(monthTotals.entries())
          .map(([label, total]) => ({ label, total }))
          .sort((a, b) => a.label.localeCompare(b.label));

        const detectedTechnologies = getTopTechnologies(
          reposData.map((repo) => ({
            name: repo.name,
            description: repo.description || "",
            language: repo.language,
            topics: repo.topics
          })),
          8
        );

        const finalCardData: DevCardData = {
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
            topics: repo.topics,
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
            topics: repo.topics,
          })),
          technologies: detectedTechnologies,
          topRepo: finalCardData.topRepo,
          heatmap: finalCardData.heatmap,
          timeline: finalCardData.timeline,
        });

        // Save to public storage
        if (user?.id) {
          fetch('/api/save-card/' + profileData.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cardData: {
                username: profileData.login,
                profile: finalCardData.profile,
                stats: finalCardData.stats,
                languages: finalCardData.languages,
                repositories: reposData.map((repo) => ({
                  name: repo.name,
                  description: repo.description,
                  stars: repo.stargazers_count,
                  language: repo.language,
                  topics: repo.topics,
                })),
                technologies: detectedTechnologies,
                topRepo: finalCardData.topRepo,
                heatmap: finalCardData.heatmap,
                timeline: finalCardData.timeline,
              },
              userId: user.id,
            }),
          }).catch(err => {
            console.warn('Failed to save public card data:', err);
          });
        }
        
        setProfile(profileData);
        setCardData(finalCardData);
        setRepositories(reposData);
        setProfileError(null);
        
      } catch (error) {
        console.error("Error fetching GitHub data:", error);
        if (isMounted) {
          setProfileError(
            error instanceof Error ? error.message : "Failed to load profile data"
          );
        }
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
  }, [user, session, authLoading, refreshSession, validateSession]);

  return {
    profile,
    cardData,
    repositories,
    profileLoading,
    profileError,
    isRefreshing,
    fetchGitHubData,
  };
}

