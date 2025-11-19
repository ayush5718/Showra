/**
 * Custom GitHub Profile Transformation Utility
 * This provides comprehensive GitHub data transformation without relying on AI
 * Used as a fallback when AI analysis fails or is unavailable
 */

import { detectTechnologies, getTopTechnologies } from "./detectTechnologies";

export interface GitHubProfile {
  name: string | null;
  login: string;
  bio: string | null;
  location: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
}

export interface GitHubLanguage {
  name: string;
  percentage: number;
}

export interface TransformedProfile {
  expertise: Array<{
    category: string;
    level: number;
    technologies: string[];
    description: string;
  }>;
  summary: string;
  strengths: string[];
  tags: string[];
  commitsDescription?: string;
  techStack: Array<{ name: string; percentage: number }>;
  strengthAreas: Array<{ category: string; rating: number }>;
}

/**
 * Categorize languages into expertise areas
 */
function categorizeLanguages(
  languages: GitHubLanguage[],
  repositories: GitHubRepo[]
): Array<{ category: string; level: number; technologies: string[]; description: string }> {
  const expertise: Array<{ category: string; level: number; technologies: string[]; description: string }> = [];
  
  const langMap = new Map<string, number>();
  languages.forEach(lang => {
    langMap.set(lang.name.toLowerCase(), lang.percentage);
  });

  // Frontend technologies
  const frontendLangs = ['javascript', 'typescript', 'html', 'css', 'react', 'vue', 'angular', 'svelte', 'jsx', 'tsx'];
  const frontendScore = languages
    .filter(l => frontendLangs.some(fl => l.name.toLowerCase().includes(fl)))
    .reduce((sum, l) => sum + l.percentage, 0);
  
  if (frontendScore > 0) {
    const frontendTechs = languages
      .filter(l => frontendLangs.some(fl => l.name.toLowerCase().includes(fl)))
      .slice(0, 3)
      .map(l => l.name);
    
    expertise.push({
      category: 'Frontend',
      level: Math.min(Math.round(frontendScore), 100),
      technologies: frontendTechs,
      description: 'Frontend development with modern frameworks and libraries'
    });
  }

  // Backend technologies
  const backendLangs = ['python', 'java', 'go', 'rust', 'php', 'ruby', 'node', 'c++', 'c#', 'csharp', 'kotlin', 'scala'];
  const backendScore = languages
    .filter(l => backendLangs.some(bl => l.name.toLowerCase().includes(bl)))
    .reduce((sum, l) => sum + l.percentage, 0);
  
  if (backendScore > 0) {
    const backendTechs = languages
      .filter(l => backendLangs.some(bl => l.name.toLowerCase().includes(bl)))
      .slice(0, 3)
      .map(l => l.name);
    
    expertise.push({
      category: 'Backend',
      level: Math.min(Math.round(backendScore), 100),
      technologies: backendTechs,
      description: 'Backend development and server-side programming'
    });
  }

  // Mobile technologies
  const mobileLangs = ['swift', 'kotlin', 'dart', 'flutter', 'react native', 'objective-c'];
  const mobileScore = languages
    .filter(l => mobileLangs.some(ml => l.name.toLowerCase().includes(ml)))
    .reduce((sum, l) => sum + l.percentage, 0);
  
  if (mobileScore > 0) {
    const mobileTechs = languages
      .filter(l => mobileLangs.some(ml => l.name.toLowerCase().includes(ml)))
      .slice(0, 3)
      .map(l => l.name);
    
    expertise.push({
      category: 'Mobile',
      level: Math.min(Math.round(mobileScore), 100),
      technologies: mobileTechs,
      description: 'Mobile app development for iOS and Android'
    });
  }

  // DevOps technologies
  const devopsLangs = ['docker', 'kubernetes', 'terraform', 'yaml', 'shell', 'bash'];
  const devopsScore = languages
    .filter(l => devopsLangs.some(dl => l.name.toLowerCase().includes(dl)))
    .reduce((sum, l) => sum + l.percentage, 0);
  
  // Also check repository names and descriptions for DevOps tools
  const devopsKeywords = ['docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'github actions'];
  const hasDevOpsRepos = repositories.some(repo => {
    const text = `${repo.name} ${repo.description || ''}`.toLowerCase();
    return devopsKeywords.some(keyword => text.includes(keyword));
  });
  
  if (devopsScore > 0 || hasDevOpsRepos) {
    const devopsTechs = languages
      .filter(l => devopsLangs.some(dl => l.name.toLowerCase().includes(dl)))
      .slice(0, 3)
      .map(l => l.name);
    
    if (devopsTechs.length === 0 && hasDevOpsRepos) {
      devopsTechs.push('Docker', 'CI/CD', 'Infrastructure');
    }
    
    expertise.push({
      category: 'DevOps',
      level: Math.min(Math.round(devopsScore + (hasDevOpsRepos ? 30 : 0)), 100),
      technologies: devopsTechs.slice(0, 3),
      description: 'DevOps, infrastructure, and automation expertise'
    });
  }

  // Data Science / ML
  const dataLangs = ['python', 'r', 'jupyter', 'matlab'];
  const dataScore = languages
    .filter(l => dataLangs.some(dl => l.name.toLowerCase().includes(dl)))
    .reduce((sum, l) => sum + l.percentage, 0);
  
  const hasMLRepos = repositories.some(repo => {
    const text = `${repo.name} ${repo.description || ''}`.toLowerCase();
    return ['machine learning', 'ml', 'ai', 'neural', 'tensorflow', 'pytorch', 'scikit'].some(k => text.includes(k));
  });
  
  if ((dataScore > 20 && hasMLRepos) || dataScore > 40) {
    expertise.push({
      category: 'Data Science',
      level: Math.min(Math.round(dataScore), 100),
      technologies: ['Python', 'Jupyter', 'ML'],
      description: 'Data science and machine learning expertise'
    });
  }

  return expertise.sort((a, b) => b.level - a.level).slice(0, 4);
}

/**
 * Generate professional summary
 */
function generateSummary(
  profile: GitHubProfile,
  stats: { repos: number; stars: number; forks: number; contributions: number },
  languages: GitHubLanguage[]
): string {
  const topLangs = languages.slice(0, 3).map(l => l.name).join(', ');
  const name = profile.name || profile.login;
  
  // More sophisticated summary generation
  if (stats.contributions > 1000) {
    return `${name} - Highly active developer with ${stats.repos} repositories, expert in ${topLangs || 'multiple technologies'}`;
  } else if (stats.contributions > 500) {
    return `${name} - Active developer with ${stats.repos} repositories, proficient in ${topLangs || 'various technologies'}`;
  } else if (stats.repos > 20) {
    return `${name} - Developer with ${stats.repos} repositories, skilled in ${topLangs || 'multiple technologies'}`;
  } else if (topLangs) {
    return `${name} - Developer specializing in ${topLangs}`;
  }
  
  return `${name} - Developer building and maintaining ${stats.repos} repositories`;
}

/**
 * Generate strengths based on profile data
 */
function generateStrengths(
  profile: GitHubProfile,
  stats: { repos: number; stars: number; forks: number; contributions: number },
  languages: GitHubLanguage[]
): string[] {
  const strengths: string[] = [];
  
  if (stats.repos > 0) {
    strengths.push(`${stats.repos} ${stats.repos === 1 ? 'repository' : 'repositories'} created`);
  }
  
  if (stats.contributions > 0) {
    strengths.push(`${stats.contributions} contributions this year`);
  }
  
  if (stats.stars > 0) {
    strengths.push(`${stats.stars} ${stats.stars === 1 ? 'star' : 'stars'} received`);
  }
  
  const topLangs = languages.slice(0, 3).map(l => l.name).join(', ');
  if (topLangs) {
    strengths.push(`Proficient in ${topLangs}`);
  }
  
  return strengths.slice(0, 3);
}

/**
 * Generate tech stack from repositories
 */
function generateTechStack(
  repositories: GitHubRepo[],
  languages: GitHubLanguage[]
): Array<{ name: string; percentage: number }> {
  // Use the detectTechnologies utility
  const detected = detectTechnologies(repositories);
  
  if (detected.length > 0) {
    // Convert to percentage format
    const totalConfidence = detected.reduce((sum, tech) => sum + tech.confidence, 0);
    return detected.slice(0, 5).map(tech => ({
      name: tech.name,
      percentage: totalConfidence > 0 
        ? Math.round((tech.confidence / totalConfidence) * 100)
        : Math.round(tech.confidence)
    }));
  }
  
  // Fallback to top languages
  return languages.slice(0, 3).map(lang => ({
    name: lang.name,
    percentage: lang.percentage
  }));
}

/**
 * Generate strength areas with ratings
 */
function generateStrengthAreas(
  languages: GitHubLanguage[],
  repositories: GitHubRepo[],
  stats: { repos: number; stars: number; forks: number; contributions: number }
): Array<{ category: string; rating: number }> {
  const areas: Array<{ category: string; rating: number }> = [];
  
  const langNames = languages.map(l => l.name.toLowerCase());
  const repoText = repositories.map(r => `${r.name} ${r.description || ''}`).join(' ').toLowerCase();
  
  // Frontend
  const frontendLangs = ['javascript', 'typescript', 'html', 'css', 'react', 'vue', 'angular'];
  const frontendKeywords = ['react', 'vue', 'angular', 'frontend', 'ui', 'ux', 'component'];
  const hasFrontend = langNames.some(l => frontendLangs.some(f => l.includes(f))) || 
                      frontendKeywords.some(k => repoText.includes(k));
  if (hasFrontend) {
    const frontendPercent = languages.filter(l => 
      frontendLangs.some(f => l.name.toLowerCase().includes(f))
    ).reduce((sum, l) => sum + l.percentage, 0);
    areas.push({ 
      category: 'Frontend', 
      rating: Math.min(Math.max(Math.round(frontendPercent / 10), 1), 10) 
    });
  }
  
  // Backend
  const backendLangs = ['python', 'java', 'go', 'rust', 'php', 'ruby', 'node', 'c++', 'c#'];
  const backendKeywords = ['backend', 'api', 'server', 'express', 'django', 'flask', 'spring'];
  const hasBackend = langNames.some(l => backendLangs.some(b => l.includes(b))) || 
                     backendKeywords.some(k => repoText.includes(k));
  if (hasBackend) {
    const backendPercent = languages.filter(l => 
      backendLangs.some(b => l.name.toLowerCase().includes(b))
    ).reduce((sum, l) => sum + l.percentage, 0);
    areas.push({ 
      category: 'Backend', 
      rating: Math.min(Math.max(Math.round(backendPercent / 10), 1), 10) 
    });
  }
  
  // Full Stack
  if (hasFrontend && hasBackend) {
    areas.push({ category: 'Full Stack', rating: 7 });
  }
  
  // Open Source (based on stars and forks)
  if (stats.stars > 10 || stats.forks > 5) {
    areas.push({ category: 'Open Source', rating: Math.min(Math.round(stats.stars / 10), 10) });
  }
  
  return areas.sort((a, b) => b.rating - a.rating).slice(0, 3);
}

/**
 * Generate commits description
 */
function generateCommitsDescription(
  stats: { repos: number; stars: number; forks: number; contributions: number }
): string {
  if (stats.contributions > 1000) {
    return "Highly active developer with consistent contributions";
  } else if (stats.contributions > 500) {
    return "Active developer contributing regularly to projects";
  } else if (stats.contributions > 100) {
    return "Regular contributor to open source projects";
  } else {
    return "Developer building and maintaining projects";
  }
}

/**
 * Transform GitHub profile data into analysis format
 * This is a comprehensive custom transformation that doesn't require AI
 */
export function transformGitHubProfile(
  profile: GitHubProfile,
  stats: { repos: number; stars: number; forks: number; contributions: number },
  languages: GitHubLanguage[],
  repositories: GitHubRepo[]
): TransformedProfile {
  const expertise = categorizeLanguages(languages, repositories);
  const summary = generateSummary(profile, stats, languages);
  const strengths = generateStrengths(profile, stats, languages);
  const techStack = generateTechStack(repositories, languages);
  const strengthAreas = generateStrengthAreas(languages, repositories, stats);
  const commitsDescription = generateCommitsDescription(stats);
  
  // Generate tags from top languages and technologies with better deduplication
  const topTechs = getTopTechnologies(repositories, 8);
  const langTags = languages.slice(0, 8).map(l => l.name);
  
  // Smart tag merging - prefer technologies over base languages
  const allTags = [...topTechs, ...langTags];
  const uniqueTags = Array.from(new Set(allTags.map(tag => tag.toLowerCase())))
    .map(lowerTag => {
      // Find original case from either techs or langs
      return topTechs.find(t => t.toLowerCase() === lowerTag) || 
             langTags.find(l => l.toLowerCase() === lowerTag) || 
             lowerTag;
    })
    .slice(0, 6);
  
  return {
    expertise: expertise.length > 0 ? expertise : [{
      category: 'Development',
      level: 50,
      technologies: languages.slice(0, 3).map(l => l.name),
      description: 'Software development expertise'
    }],
    summary,
    strengths: strengths.length > 0 ? strengths : [`${stats.repos} repositories`, 'Active on GitHub'],
    tags: uniqueTags.length > 0 ? uniqueTags : languages.slice(0, 3).map(l => l.name),
    commitsDescription,
    techStack: techStack.length > 0 ? techStack : languages.slice(0, 3).map(l => ({
      name: l.name,
      percentage: l.percentage
    })),
    strengthAreas: strengthAreas.length > 0 ? strengthAreas : [{
      category: 'Development',
      rating: Math.min(Math.max(Math.round(stats.contributions / 100), 1), 10)
    }]
  };
}

