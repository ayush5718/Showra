"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { Download, Github, Share2, X, Copy, Check, Twitter, Facebook, Linkedin, Mail } from "lucide-react";
import { Image as ImageIcon } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import * as htmlToImage from "html-to-image";
import { analyzeDeveloperProfile } from "@/lib/geminiAI";
import { CardLoadingAnimation } from "../CardLoadingAnimation";
import styles from "./DevCard4.module.css";


/* ---------- Types ---------- */
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

interface HeatmapDay {
  date: string;
  count: number;
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

interface DevCard4Props {
  profile: DevCardProfile;
  stats: DevCardStats;
  topRepo: DevCardTopRepo | null;
  topLanguages: Array<{ name: string; percentage: number }>;
  technologies?: string[];
  heatmap: HeatmapDay[];
  repositories?: Array<{ name: string; description: string | null; stars: number; language: string | null }>;
  skipAI?: boolean;
  aiAnalysis?: AISkillAnalysis | null; // Pre-fetched analysis from CardWrapper
}

/* ---------- Helpers ---------- */
function buildMonthlyContributions(heatmap: HeatmapDay[]) {
  if (heatmap.length === 0) {
    return [];
  }

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

function getLanguageColor(langName: string): string {
  const colors: Record<string, string> = {
    'typescript': '#3178C6',
    'javascript': '#F1C40F',
    'python': '#4B8BBE',
    'go': '#00ADD8',
    'html': '#E34F26',
    'css': '#1572B6',
    'java': '#ED8B00',
    'c++': '#00599C',
    'c': '#A8B9CC',
    'rust': '#000000',
    'ruby': '#CC342D',
    'php': '#777BB4',
    'swift': '#FA7343',
    'kotlin': '#7F52FF',
    'react': '#61DAFB',
    'vue': '#4FC08D',
    'angular': '#DD0031',
    'node': '#339933',
    'node.js': '#339933',
    'nodejs': '#339933',
    'next.js': '#000000',
    'nextjs': '#000000',
    'next': '#000000',
    'dart': '#0175C2',
    'scala': '#DC322F',
    'shell': '#89E051',
    'powershell': '#012456',
    'dockerfile': '#384D54',
    'markdown': '#083FA1',
    'express': '#339933',
    'mongodb': '#47A248',
    'postgresql': '#336791',
    'postgres': '#336791',
    'mysql': '#4479A1',
    'redis': '#DC382D',
    'graphql': '#E10098',
    'tailwind css': '#06B6D4',
    'tailwindcss': '#06B6D4',
    'tailwind': '#06B6D4',
    'sass': '#CC6699',
    'scss': '#CC6699',
    'webpack': '#8DD6F9',
    'vite': '#646CFF',
    'jest': '#C21325',
    'cypress': '#17202C',
    'github actions': '#2088FF',
    'aws': '#FF9900',
    'firebase': '#FFCA28',
    'supabase': '#3ECF8E',
  };
  
  const lowerName = langName.toLowerCase().trim();
  return colors[lowerName] || '#8A8A8A';
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace('.0', '') + "k";
  }
  return num.toString();
}

function calculateYearsOnGitHub(createdAt: string): number {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const years = now.getFullYear() - createdDate.getFullYear();
  const monthDiff = now.getMonth() - createdDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < createdDate.getDate())) {
    return Math.max(0, years - 1);
  }
  
  return Math.max(0, years);
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

function getMostStarredOrActiveRepo(
  repositories?: Array<{ name: string; description: string | null; stars: number; language: string | null }>
): { name: string; description: string | null; stars: number } | null {
  if (!repositories || repositories.length === 0) return null;
  
  const mostStarred = repositories.reduce((best, repo) => {
    if (!best || repo.stars > best.stars) return repo;
    return best;
  }, null as { name: string; description: string | null; stars: number; language: string | null } | null);
  
  if (mostStarred && mostStarred.stars > 0) {
    return {
      name: mostStarred.name,
      description: mostStarred.description,
      stars: mostStarred.stars
    };
  }
  
  if (repositories.length > 0) {
    return {
      name: repositories[0].name,
      description: repositories[0].description,
      stars: repositories[0].stars
    };
  }
  
  return null;
}

function generateStrengthAreasFallback(
  topLanguages: Array<{ name: string; percentage: number }>,
  repositories?: Array<{ name: string; description: string | null; stars: number; language: string | null }>
): Array<{ category: string; rating: number }> {
  const areas: Array<{ category: string; rating: number }> = [];
  
  if (topLanguages.length === 0) return areas;
  
  const langNames = topLanguages.map(l => l.name.toLowerCase());
  const repoText = (repositories || []).map(r => `${r.name} ${r.description || ''}`).join(' ').toLowerCase();
  
  const frontendLangs = ['javascript', 'typescript', 'html', 'css', 'react', 'vue', 'angular'];
  const frontendKeywords = ['react', 'vue', 'angular', 'frontend', 'ui', 'ux', 'component'];
  const hasFrontend = langNames.some(l => frontendLangs.some(f => l.includes(f))) || 
                      frontendKeywords.some(k => repoText.includes(k));
  if (hasFrontend) {
    const frontendPercent = topLanguages.filter(l => 
      frontendLangs.some(f => l.name.toLowerCase().includes(f))
    ).reduce((sum, l) => sum + l.percentage, 0);
    const rating = Math.max(1, Math.min(Math.round(frontendPercent / 10), 10));
    areas.push({ category: 'Frontend', rating });
  }
  
  const backendLangs = ['python', 'java', 'go', 'rust', 'php', 'ruby', 'node', 'c++', 'c#'];
  const backendKeywords = ['backend', 'api', 'server', 'express', 'django', 'flask', 'spring'];
  const hasBackend = langNames.some(l => backendLangs.some(b => l.includes(b))) || 
                     backendKeywords.some(k => repoText.includes(k));
  if (hasBackend) {
    const backendPercent = topLanguages.filter(l => 
      backendLangs.some(b => l.name.toLowerCase().includes(b))
    ).reduce((sum, l) => sum + l.percentage, 0);
    const rating = Math.max(1, Math.min(Math.round(backendPercent / 10), 10));
    areas.push({ category: 'Backend', rating });
  }
  
  if (hasFrontend && hasBackend) {
    areas.push({ category: 'Full Stack', rating: 7 });
  }
  
  if (areas.length === 0 && topLanguages.length > 0) {
    const topLang = topLanguages[0].name;
    areas.push({ category: topLang, rating: 6 });
  }
  
  return areas.sort((a, b) => b.rating - a.rating).slice(0, 3);
}

/* ---------- Component ---------- */
export function DevCard4({
  profile,
  stats,
  topRepo,
  topLanguages,
  technologies,
  heatmap,
  repositories,
  skipAI = false,
  aiAnalysis: propAiAnalysis
}: DevCard4Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardElementRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [sharingImage, setSharingImage] = useState(false);

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
    if (skipAI || topLanguages.length === 0 || analyzedProfileRef.current === profileKey || analysisInProgressRef.current) {
      return;
    }

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
          summary: `${profile.name || profile.login} - ${stats.repos} repositories, proficient in ${topLanguages.slice(0, 3).map(l => l.name).join(', ') || 'multiple technologies'}`,
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
      const scale = 3;
      
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: scale,
        backgroundColor: '#0A0A0A',
        cacheBust: true,
        skipFonts: false,
        includeQueryParams: true,
        filter: (node) => {
          if (node instanceof HTMLElement) {
            const classList = Array.from(node.classList || []);
            if (classList.some(cls => 
              cls.includes('floatingActions') || 
              cls.includes('floatingBtn') ||
              cls.includes(styles.floatingActions) ||
              cls.includes(styles.floatingBtn)
            )) {
              return false;
            }
          }
          return true;
        },
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });
  
      const img = new window.Image();
      img.src = dataUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
  
      const padding = 60;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      
      canvas.width = img.width + (padding * 2);
      canvas.height = img.height + (padding * 2);
  
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding, padding);
  
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `devcard-${profile.login}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png", 1.0);
  
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to download image. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const generateCardImage = async (): Promise<string | null> => {
    if (!cardElementRef.current) return null;
    
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
  
      const scale = 3;
      
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: scale,
        backgroundColor: '#0A0A0A',
        cacheBust: true,
        skipFonts: false,
        filter: (node) => {
          if (node instanceof HTMLElement) {
            const classList = Array.from(node.classList || []);
            if (classList.some(cls => 
              cls.includes('floatingActions') || 
              cls.includes('floatingBtn') ||
              cls.includes(styles.floatingActions) ||
              cls.includes(styles.floatingBtn)
            )) {
              return false;
            }
          }
          return true;
        },
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });
  
      const img = new window.Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
  
      const padding = 60;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return dataUrl;
  
      canvas.width = img.width + (padding * 2);
      canvas.height = img.height + (padding * 2);
  
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding, padding);
  
      return canvas.toDataURL("image/png", 1.0);
    } catch (error) {
      console.error("Image generation failed:", error);
      return null;
    }
  };

  const copyImageToClipboard = async () => {
    if (!cardElementRef.current) return;
    setImageCopied(false);
    
    try {
      const imageUrl = await generateCardImage();
      if (!imageUrl) return;

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      setImageCopied(true);
      setTimeout(() => setImageCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy image:', error);
      try {
        const imageUrl = await generateCardImage();
        if (imageUrl) {
          const a = document.createElement("a");
          a.href = imageUrl;
          a.download = `devcard-${profile.login}.png`;
          a.click();
        }
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
    }
  };

  const shareWithImage = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'email') => {
    setSharingImage(true);
    
    try {
      const imageUrl = await generateCardImage();
      if (!imageUrl) {
        const url = window.location.href;
        if (platform === 'twitter') {
          window.open(`https://twitter.com/intent/tweet?text=Check out my developer card!&url=${encodeURIComponent(url)}`, '_blank');
        } else if (platform === 'facebook') {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        } else if (platform === 'linkedin') {
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        } else if (platform === 'email') {
          window.location.href = `mailto:?subject=Check out my developer card&body=${encodeURIComponent(`Check out my developer card: ${url}`)}`;
        }
        return;
      }

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `devcard-${profile.login}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `My Developer Card - ${profile.name || profile.login}`,
            text: 'Check out my developer card!',
            url: window.location.href,
            files: [file]
          });
          return;
        } catch (shareError) {
          console.log('Web Share API failed, using platform-specific sharing');
        }
      }

      const url = window.location.href;
      const text = `Check out my developer card! ${url}`;
      
      if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
      } else if (platform === 'email') {
        const emailBody = `Check out my developer card!\n\n${url}\n\n[Image attached]`;
        window.location.href = `mailto:?subject=Check out my developer card&body=${encodeURIComponent(emailBody)}`;
      }
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setSharingImage(false);
    }
  };

  if (analyzing && !skipAI) {
    return (
      <div className={styles.neonCardWrapper}>
        <CardLoadingAnimation />
      </div>
    );
  }

  return (
    <div className={styles.neonCardWrapper}>
      <div className={styles.captureContainer}>
        <div ref={cardElementRef} className={styles.neonDevcard}>
          
          <div className={styles.neonBorderLayer}></div>
          
          <div className={styles.cardContent}>
            
            <div className={styles.profileHeader}>
              <div className={styles.avatarWrapper}>
                <div className={styles.avatarRing}></div>
                <img src={profile.avatarUrl} className={styles.avatarImg} alt={profile.login} crossOrigin="anonymous" />
              </div>

              <div className={styles.profileInfo}>
                <h1 className={styles.profileName}>{profile.name || profile.login}</h1>
                <div className={styles.profileMeta}>
                  <div className={styles.githubHandle}>
                    <Github size={16} className={styles.githubIcon} />
                    <span>@{profile.login}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.bioCard}>
              <div className={styles.bioIcon}>✨</div>
              {aiAnalysis?.summary ? (
                <p className={styles.bioText}>{aiAnalysis.summary}</p>
              ) : profile.bio ? (
                <p className={styles.bioText}>{profile.bio}</p>
              ) : (
                <p className={styles.bioText}>Building the future, one commit at a time 🚀</p>
              )}
            </div>

            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{formatNumber(stats.contributions)}</div>
                <div className={styles.statLabel}>CONTRIBUTIONS</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{formatNumber(stats.repos)}</div>
                <div className={styles.statLabel}>REPO</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{formatNumber(stats.followers || 0)}</div>
                <div className={styles.statLabel}>FOLLOWS</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statYearsContainer}>
                  <span className={styles.statNumber}>{calculateYearsOnGitHub(profile.createdAt)}</span>
                  <span className={styles.statYearsLabel}>YEARS</span>
                </div>
                <div className={styles.statSubLabel}>ON GITHUB</div>
              </div>
            </div>

            <div className={styles.activityLanguagesGrid}>
              <div className={styles.activityCard}>
                <h3 className={styles.cardTitle}>ACTIVITY</h3>
                <div className={styles.chartWrapper}>
                {monthlyContributions.map((data, idx) => (
                    <div key={idx} className={styles.barColumn}>
                    <div 
                        className={styles.chartBar}
                      style={{ 
                        height: `${Math.max(data.percentage, 8)}%`,
                      }}
                    >
                        <div className={styles.barGlow}></div>
                    </div>
                      <span className={styles.barLabel}>{data.month}</span>
                  </div>
                ))}
              </div>
            </div>

              <div className={styles.languagesCard}>
                <h3 className={styles.cardTitle}>TECH STACK</h3>
                <div className={styles.languagesList}>
                  {(aiAnalysis?.techStack && aiAnalysis.techStack.length > 0 
                    ? aiAnalysis.techStack 
                    : topLanguages.slice(0, 3)
                  ).slice(0, 3).map((tech, idx) => (
                    <div key={idx} className={styles.languageItem}>
                      <div 
                        className={styles.languageDot} 
                        style={{ backgroundColor: getLanguageColor(tech.name) }}
                  ></div>
                      <span className={styles.languageName}>{tech.name}</span>
                      <span className={styles.languagePercent}>{tech.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
                    </div>
                </div>

            <div className={styles.commitsStarsGrid}>
              <div className={styles.commitsCard}>
                <h3 className={styles.cardTitle}>STRENGTH AREAS</h3>
                <div className={styles.strengthAreasList}>
                  {(() => {
                    const strengthAreas = aiAnalysis?.strengthAreas && aiAnalysis.strengthAreas.length > 0
                      ? aiAnalysis.strengthAreas
                      : generateStrengthAreasFallback(topLanguages, repositories);
                    
                    return strengthAreas.slice(0, 3).map((area, idx) => (
                      <div key={idx} className={styles.strengthAreaItem}>
                        <span className={styles.strengthAreaName}>{area.category}</span>
                        <span className={styles.strengthAreaRating}>{area.rating}/10</span>
          </div>
                    ));
                  })()}
        </div>
      </div>

              <div className={styles.starsCard}>
                <h3 className={styles.cardTitle}>MOST STARRED</h3>
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

            <div className={styles.footerBadge}>
              <div className={styles.badgeDot}></div>
              <span>GitHub Developer Card</span>
            </div>

          </div>
        </div>
      </div>

      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className={styles.shareModalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className={styles.shareModal}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
            <div className={styles.shareModalHeader}>
              <h3 className={styles.shareModalTitle}>Share Your Dev Card</h3>
              <button
                className={styles.shareModalClose}
                onClick={() => setShowShareModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.shareModalContent}>
              <motion.button
                className={`${styles.copyLinkOption}`}
                onClick={async () => {
                  try {
                    const url = window.location.href;
                    await navigator.clipboard.writeText(url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch (err) {
                    console.error('Failed to copy URL:', err);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={styles.copyIcon}>
                  {copied ? <Check size={24} /> : <Copy size={24} />}
                </div>
                <div className={styles.shareOptionText}>
                  <span className={styles.shareOptionTitle}>{copied ? "Copied!" : "Copy Link"}</span>
                  <span className={styles.shareOptionDesc}>Copy URL to clipboard</span>
                </div>
              </motion.button>

              <motion.button
                className={`${styles.copyLinkOption}`}
                onClick={copyImageToClipboard}
                disabled={sharingImage}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={styles.copyIcon}>
                  {imageCopied ? <Check size={24} /> : <ImageIcon size={24} />}
                </div>
                <div className={styles.shareOptionText}>
                  <span className={styles.shareOptionTitle}>{imageCopied ? "Image Copied!" : "Copy Image"}</span>
                  <span className={styles.shareOptionDesc}>Copy card image to clipboard</span>
                </div>
              </motion.button>

              <div className={styles.shareSocialGrid}>
                <motion.button
                  onClick={() => shareWithImage('twitter')}
                  disabled={sharingImage}
                  className={`${styles.shareSocialBtn} ${styles.twitterBtn}`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Twitter size={20} />
                  <span>{sharingImage ? "Sharing..." : "Twitter"}</span>
                </motion.button>

                <motion.button
                  onClick={() => shareWithImage('facebook')}
                  disabled={sharingImage}
                  className={`${styles.shareSocialBtn} ${styles.facebookBtn}`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Facebook size={20} />
                  <span>{sharingImage ? "Sharing..." : "Facebook"}</span>
                </motion.button>

                <motion.button
                  onClick={() => shareWithImage('linkedin')}
                  disabled={sharingImage}
                  className={`${styles.shareSocialBtn} ${styles.linkedinBtn}`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Linkedin size={20} />
                  <span>{sharingImage ? "Sharing..." : "LinkedIn"}</span>
                </motion.button>

                <motion.button
                  onClick={() => shareWithImage('email')}
                  disabled={sharingImage}
                  className={`${styles.shareSocialBtn} ${styles.emailBtn}`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail size={20} />
                  <span>{sharingImage ? "Sharing..." : "Email"}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
