"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { Download, Github, Share2, X, Copy, Check, Twitter, Facebook, Linkedin, Mail, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as htmlToImage from "html-to-image";
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

function getMostStarredOrActiveRepo(repositories?: Array<{ name: string; description: string | null; stars: number; language: string | null }>) {
  if (!repositories || repositories.length === 0) return null;
  return repositories.reduce((max, repo) => repo.stars > max.stars ? repo : max, repositories[0]);
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
  skipAI = false
}: DevCard2Props) {
  const cardElementRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [sharingImage, setSharingImage] = useState(false);

  const monthlyContributions = useMemo(() => buildMonthlyContributions(heatmap), [heatmap]);
  
  const [aiAnalysis, setAiAnalysis] = useState<AISkillAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const analysisRequestedRef = useRef(false);

  useEffect(() => {
    if (skipAI || topLanguages.length === 0 || analysisRequestedRef.current) return;
    analysisRequestedRef.current = true;

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
      } catch (error) {
        setAiAnalysis({
          expertise: [],
          summary: `${profile.name || profile.login} - ${stats.repos} repositories`,
          strengths: [`${stats.repos} repositories`, `${stats.contributions} contributions`],
          tags: topLanguages.slice(0, 6).map(l => l.name)
        });
      } finally {
        setAnalyzing(false);
      }
    };

    fetchAIAnalysis();
  }, [profile, stats, topLanguages, topRepo, repositories, skipAI]);

  const exportCard = async () => {
    if (!cardElementRef.current) return;
    setDownloading(true);
    
    try {
      const element = cardElementRef.current;
      const imgs = element.querySelectorAll("img");
      await Promise.all(Array.from(imgs).map(img => {
        if ((img as HTMLImageElement).complete) return Promise.resolve();
        return new Promise(res => {
          (img as HTMLImageElement).onload = res;
          (img as HTMLImageElement).onerror = res;
          setTimeout(res, 3000);
        });
      }));
  
      const rect = element.getBoundingClientRect();
      const dataUrl = await htmlToImage.toPng(element, {
        width: rect.width,
        height: rect.height,
        style: {
          transform: 'scale(1)',
        },
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `devcard-${profile.login}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setDownloading(false);
    }
  };

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
        <div ref={cardElementRef} className={styles.card}>
          <div className={styles.gradientBorder}></div>
          
          <div className={styles.content}>
            {/* Header - Centered */}
            <div className={styles.header}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatarGlow}></div>
                <img src={profile.avatarUrl} className={styles.avatar} alt={profile.login} crossOrigin="anonymous" />
              </div>
              <h1 className={styles.name}>{profile.name || profile.login}</h1>
              <div className={styles.handle}>
                <Github size={14} />
                <span>@{profile.login}</span>
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

              {/* Most Starred Section */}
              <div className={styles.starsCard}>
                <h3 className={styles.sectionTitle}>MOST STARRED</h3>
                {(() => {
                  const repo = getMostStarredOrActiveRepo(repositories);
                  if (!repo) {
                    return (
                      <div className={styles.mostStarredContent}>
                        <div className={styles.mostStarredName}>No repositories</div>
                      </div>
                    );
                  }
                  return (
                    <div className={styles.mostStarredContent}>
                      <div className={styles.mostStarredName}>
                        <span className={styles.starIcon}>⭐</span>
                        {repo.name}
                      </div>
                      {repo.description && (
                        <div className={styles.mostStarredDescription}>
                          {truncateText(repo.description, 60)}
                        </div>
                      )}
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

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button onClick={exportCard} disabled={downloading} className={styles.actionBtn}>
          <Download size={18} />
          {downloading ? 'Exporting...' : 'Download'}
        </button>
        <button onClick={() => setShowShareModal(true)} className={styles.actionBtn}>
          <Share2 size={18} />
          Share
        </button>
      </div>

      {/* Share Modal - Same as DevCard */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>Share Your Dev Card</h3>
                <button onClick={() => setShowShareModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className={styles.modalContent}>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    } catch (err) {
                      console.error('Failed to copy:', err);
                    }
                  }}
                  className={styles.modalOption}
                >
                  {copied ? <Check size={24} /> : <Copy size={24} />}
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

