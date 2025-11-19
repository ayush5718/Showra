"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { Github } from "lucide-react";
import { motion } from "framer-motion";
import { analyzeDeveloperProfile } from "@/lib/geminiAI";
import { CardLoadingAnimation } from "../CardLoadingAnimation";
import styles from "./DevCard2.module.css";

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

interface DevCard2Props {
  profile: DevCardProfile;
  stats: DevCardStats;
  topRepo: DevCardTopRepo | null;
  topLanguages: Array<{ name: string; percentage: number }>;
  technologies?: string[];
  heatmap: Array<{ date: string; count: number }>;
  repositories?: Array<{ name: string; description: string | null; stars: number; language: string | null }>;
  skipAI?: boolean;
  aiAnalysis?: AISkillAnalysis | null; // Pre-fetched analysis from CardWrapper
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function calculateYearsOnGitHub(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365));
}

function buildMonthlyContributions(heatmap: Array<{ date: string; count: number }>) {
  if (heatmap.length === 0) return [];
  const monthMap = new Map<string, number>();
  const currentYear = new Date().getFullYear();
  
  heatmap.forEach(({ date, count }) => {
    const d = new Date(date);
    if (d.getFullYear() === currentYear) {
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      monthMap.set(month, (monthMap.get(month) || 0) + count);
    }
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = months.map(month => ({
    month: month.charAt(0),
    count: monthMap.get(month) || 0
  }));

  const maxCount = Math.max(...data.map(d => d.count), 1);
  return data.map(d => ({
    ...d,
    percentage: (d.count / maxCount) * 100
  }));
}

function getLanguageColor(lang: string): string {
  const colors: Record<string, string> = {
    'JavaScript': '#F7DF1E',
    'TypeScript': '#3178C6',
    'Python': '#3776AB',
    'Java': '#ED8B00',
    'Go': '#00ADD8',
    'Rust': '#000000',
    'C++': '#00599C',
    'C': '#A8B9CC',
    'C#': '#239120',
    'PHP': '#777BB4',
    'Ruby': '#CC342D',
    'Swift': '#FA7343',
    'Kotlin': '#7F52FF',
    'HTML': '#E34F26',
    'CSS': '#1572B6',
    'React': '#61DAFB',
    'Vue': '#4FC08D',
    'Angular': '#DD0031',
  };
  return colors[lang] || '#00E5FF';
}

function calculateDevelopmentScore(
  stats: DevCardStats,
  topLanguages: Array<{ name: string; percentage: number }>,
  repositories?: Array<{ name: string; description: string | null; stars: number; language: string | null }>
): {
  overall: number; // 0-100
  codeQuality: number; // 0-50
  activity: number; // 0-50
} {
  // Calculate Activity Score (0-50)
  // Based on contributions, repos, and stars
  const contributionScore = Math.min((stats.contributions / 1000) * 25, 25); // Max 25 points for contributions
  const repoScore = Math.min((stats.repos / 50) * 15, 15); // Max 15 points for repos
  const starScore = Math.min((stats.stars / 100) * 10, 10); // Max 10 points for stars
  const activity = Math.round(contributionScore + repoScore + starScore);

  // Calculate Code Quality Score (0-50)
  // Based on language diversity, repo count, and activity
  const languageDiversity = Math.min(topLanguages.length * 5, 20); // Max 20 points for diversity
  const repoQuality = Math.min((stats.repos / 30) * 15, 15); // Max 15 points
  const codeQuality = Math.round(languageDiversity + repoQuality);

  // Overall Score (0-100) = Activity + Code Quality
  const overall = Math.min(activity + codeQuality, 100);

  return {
    overall: Math.max(0, overall),
    codeQuality: Math.max(0, Math.min(codeQuality, 50)),
    activity: Math.max(0, Math.min(activity, 50))
  };
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function DevCard2({
  profile,
  stats,
  topRepo,
  topLanguages,
  technologies,
  heatmap,
  repositories,
  skipAI = false,
  aiAnalysis: propAiAnalysis
}: DevCard2Props) {

  const monthlyContributions = useMemo(() => buildMonthlyContributions(heatmap), [heatmap]);
  
  const [aiAnalysis, setAiAnalysis] = useState<AISkillAnalysis | null>(propAiAnalysis || null);
  const [analyzing, setAnalyzing] = useState(false);
  const analyzedProfileRef = useRef<string | null>(null);
  const analysisInProgressRef = useRef<boolean>(false);

  // Use prop analysis if provided, otherwise fetch
  useEffect(() => {
    if (propAiAnalysis) {
      setAiAnalysis(propAiAnalysis);
      return;
    }
  }, [propAiAnalysis]);

  useEffect(() => {
    // Skip if analysis is provided via props
    if (propAiAnalysis) {
      return;
    }

    const profileKey = profile.login;
    
    // Skip if already analyzed for this profile or analysis is in progress
    if (skipAI || topLanguages.length === 0 || analyzedProfileRef.current === profileKey || analysisInProgressRef.current) return;
    
    // Mark as analyzed and in progress before starting
    analyzedProfileRef.current = profileKey;
    analysisInProgressRef.current = true;

    const fetchAIAnalysis = async () => {
      setAnalyzing(true);
      try {
        // analyzeDeveloperProfile now checks cache automatically
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
        }, false); // false = use cache if available
        setAiAnalysis(analysis);
      } catch (error) {
        setAiAnalysis({
          expertise: [],
          summary: `${profile.name || profile.login} - ${stats.repos} repositories`,
          strengths: [`${stats.repos} repositories`, `${stats.contributions} contributions`],
          tags: topLanguages.slice(0, 6).map(l => l.name)
        });
      } finally {
        setAnalyzing(false);
        analysisInProgressRef.current = false;
      }
    };

    fetchAIAnalysis();
  }, [profile.login, skipAI, propAiAnalysis, topLanguages, stats, topRepo, repositories]);

  if (analyzing && !skipAI) {
    return (
      <div className={styles.cardWrapper}>
        <CardLoadingAnimation />
      </div>
    );
  }

  return (
    <div className={styles.cardWrapper}>
      <div className={styles.captureContainer}>
        <div className={styles.card}>
          <div className={styles.gradientBorder}></div>
          
          <div className={styles.content}>
            {/* Header - Horizontal Layout */}
            <div className={styles.header}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatarGlow}></div>
                <img src={profile.avatarUrl} className={styles.avatar} alt={profile.login} crossOrigin="anonymous" />
              </div>
              <div className={styles.profileInfo}>
                <h1 className={styles.name}>{profile.name || profile.login}</h1>
                <div className={styles.handle}>
                  <Github size={14} />
                  <span>@{profile.login}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className={styles.bio}>
              {aiAnalysis?.summary ? (
                <p>{aiAnalysis.summary}</p>
              ) : profile.bio ? (
                <p>{profile.bio}</p>
              ) : (
                <p>Building the future, one commit at a time 🚀</p>
              )}
            </div>

            {/* Stats - Horizontal Grid Layout (same as card1) */}
            <div className={styles.statsVertical}>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{formatNumber(stats.contributions)}</div>
                <div className={styles.statLabel}>CONTRIBUTIONS</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{formatNumber(stats.repos)}</div>
                <div className={styles.statLabel}>REPO</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{formatNumber(stats.followers || 0)}</div>
                <div className={styles.statLabel}>FOLLOWS</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{calculateYearsOnGitHub(profile.createdAt)}</div>
                <div className={styles.statLabel}>YEARS</div>
              </div>
            </div>

            {/* Activity and Languages Grid - Same as card1 */}
            <div className={styles.activityLanguagesGrid}>
              {/* Activity Section */}
              <div className={styles.activitySection}>
                <h3 className={styles.sectionTitle}>ACTIVITY</h3>
                <div className={styles.chart}>
                  {monthlyContributions.map((data, idx) => (
                    <div key={idx} className={styles.barContainer}>
                      <div 
                        className={styles.bar}
                        style={{ height: `${Math.max(data.percentage, 8)}%` }}
                      >
                        <div className={styles.barFill}></div>
                      </div>
                      <span className={styles.barLabel}>{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack Section */}
              <div className={styles.techSection}>
                <h3 className={styles.sectionTitle}>TECH STACK</h3>
                <div className={styles.techList}>
                  {(aiAnalysis?.techStack && aiAnalysis.techStack.length > 0 
                    ? aiAnalysis.techStack 
                    : topLanguages.slice(0, 3)
                  ).slice(0, 3).map((tech, idx) => (
                    <div key={idx} className={styles.techItem}>
                      <div 
                        className={styles.techDot} 
                        style={{ backgroundColor: getLanguageColor(tech.name) }}
                      ></div>
                      <span className={styles.techName}>{tech.name}</span>
                      <span className={styles.techPercent}>{tech.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strength Areas and Most Starred Grid - Bottom Row */}
            <div className={styles.commitsStarsGrid}>
              {/* Strength Areas Section */}
              <div className={styles.commitsCard}>
                <h3 className={styles.sectionTitle}>STRENGTH AREAS</h3>
                <div className={styles.strengthAreasList}>
                  {(() => {
                    const strengthAreas = aiAnalysis?.strengthAreas && aiAnalysis.strengthAreas.length > 0
                      ? aiAnalysis.strengthAreas
                      : (() => {
                          // Simple fallback
                          const areas: Array<{ category: string; rating: number }> = [];
                          if (topLanguages.some(l => ['javascript', 'typescript', 'react'].some(t => l.name.toLowerCase().includes(t)))) {
                            areas.push({ category: 'Frontend', rating: 8 });
                          }
                          if (topLanguages.some(l => ['python', 'java', 'go'].some(t => l.name.toLowerCase().includes(t)))) {
                            areas.push({ category: 'Backend', rating: 7 });
                          }
                          if (stats.contributions > 500) {
                            areas.push({ category: 'Open Source', rating: 6 });
                          }
                          return areas.slice(0, 3);
                        })();
                    
                    return strengthAreas.slice(0, 3).map((area, idx) => (
                      <div key={idx} className={styles.strengthAreaItem}>
                        <span className={styles.strengthAreaName}>{area.category}</span>
                        <span className={styles.strengthAreaRating}>{area.rating}/10</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Development Score Section */}
              <div className={styles.starsCard}>
                <h3 className={styles.sectionTitle}>DEVELOPMENT SCORE</h3>
                {(() => {
                  const scores = calculateDevelopmentScore(stats, topLanguages, repositories);
                  const overallPercentage = scores.overall;
                  const codeQualityPercentage = (scores.codeQuality / 50) * 100;
                  const activityPercentage = (scores.activity / 50) * 100;
                  
                  // Calculate circular progress (SVG)
                  const radius = 35;
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference - (overallPercentage / 100) * circumference;
                  
                  return (
                    <div className={styles.developmentScoreContent}>
                      <div className={styles.scoreLeft}>
                        <svg className={styles.circularProgress} width="80" height="80">
                          <circle
                            className={styles.circularProgressBg}
                            cx="40"
                            cy="40"
                            r={radius}
                            fill="none"
                            stroke="#1A1A1A"
                            strokeWidth="6"
                          />
                          <circle
                            className={styles.circularProgressFill}
                            cx="40"
                            cy="40"
                            r={radius}
                            fill="none"
                            stroke="#00E5FF"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            transform="rotate(-90 40 40)"
                          />
                        </svg>
                        <div className={styles.scoreValue}>
                          <span className={styles.scoreNumber}>{scores.overall}</span>
                          <span className={styles.scoreMax}>/100</span>
                        </div>
                      </div>
                      <div className={styles.scoreRight}>
                        <div className={styles.scoreMetric}>
                          <div className={styles.scoreMetricHeader}>
                            <span className={styles.scoreMetricLabel}>Code Quality</span>
                            <span className={styles.scoreMetricValue}>{scores.codeQuality}/50</span>
                          </div>
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progressBarFill}
                              style={{ width: `${codeQualityPercentage}%`, backgroundColor: '#10B981' }}
                            />
                          </div>
                        </div>
                        <div className={styles.scoreMetric}>
                          <div className={styles.scoreMetricHeader}>
                            <span className={styles.scoreMetricLabel}>Activity</span>
                            <span className={styles.scoreMetricValue}>{scores.activity}/50</span>
                          </div>
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progressBarFill}
                              style={{ width: `${activityPercentage}%`, backgroundColor: '#F59E0B' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <div className={styles.footerDot}></div>
              <span>GitHub Developer Card</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

