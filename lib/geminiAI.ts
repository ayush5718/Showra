// Gemini AI Integration for DevCard Analysis
// Note: API key is stored server-side in app/api/analyze-profile/route.ts
// This client-side file only calls the API route, never uses the key directly

import { transformGitHubProfile } from "@/lib/utils/transform/githubTransform";
import { loadAIAnalysis, saveAIAnalysis } from "@/lib/utils/storage";
import { getAIAnalysisFromMetadata, saveAIAnalysisToMetadata } from "@/lib/utils/supabase/userMetadata";

interface GitHubProfileData {
  profile: {
    name: string | null;
    login: string;
    bio: string | null;
    location: string | null;
  };
  stats: {
    repos: number;
    stars: number;
    forks: number;
    contributions: number;
  };
  languages: Array<{ name: string; percentage: number }>;
  topRepo: { name: string; stars: number; description?: string | null } | null;
  repositories?: Array<{ name: string; description: string | null; stars: number; language: string | null }>;
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

export async function analyzeDeveloperProfile(
  data: GitHubProfileData,
  forceRefresh: boolean = false
): Promise<AISkillAnalysis> {
  const profileLogin = data.profile.login;
  
  // Check cache first (unless forcing refresh)
  if (!forceRefresh) {
    // Try localStorage first (faster)
    const cachedAnalysis = loadAIAnalysis(profileLogin);
    if (cachedAnalysis) {
      return cachedAnalysis;
    }
    
    // Try Supabase metadata
    try {
      const supabaseAnalysis = await getAIAnalysisFromMetadata(profileLogin);
      if (supabaseAnalysis) {
        // Also save to localStorage for faster access next time
        saveAIAnalysis(profileLogin, supabaseAnalysis);
        return supabaseAnalysis;
      }
    } catch (error) {
      // Silently continue to API call if Supabase check fails
    }
  }
  
  try {
    // Use Next.js API route to avoid CORS issues
    const response = await fetch('/api/analyze-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Don't throw - always return fallback analysis for any error
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error || `API error: ${response.status}`;
      
      // For rate limit (429) and service unavailable (503) errors, silently return fallback (don't log)
      // These are expected errors when the service is busy
      if (response.status === 429 || response.status === 503 || 
          errorMessage.includes('RATE_LIMIT') || errorMessage.includes('SERVICE_UNAVAILABLE') ||
          errorMessage.includes('overloaded') || errorMessage.includes('UNAVAILABLE')) {
        // Silently use custom transformation - these are expected errors
        return useCustomTransformation(data);
      }
      
      // For other errors (500, etc.), still use custom transformation but log for debugging
      console.warn('AI analysis API error (using custom transformation):', errorMessage);
      return useCustomTransformation(data);
    }

    const analysis: AISkillAnalysis = await response.json();
    
    // Validate and fallback
    if (!analysis.expertise || !Array.isArray(analysis.expertise)) {
      return useCustomTransformation(data);
    }
    
    // Save to cache (both localStorage and Supabase)
    saveAIAnalysis(profileLogin, analysis);
    saveAIAnalysisToMetadata(profileLogin, analysis).catch(() => {
      // Silently fail if Supabase save fails
    });
    
    return analysis;
  } catch (error) {
    // Silently return custom transformation - don't log errors for expected failures
    return useCustomTransformation(data);
  }
}

/**
 * Use custom GitHub transformation when AI fails
 * This provides comprehensive analysis without AI
 */
function useCustomTransformation(data: GitHubProfileData): AISkillAnalysis {
  return transformGitHubProfile(
    {
      name: data.profile.name,
      login: data.profile.login,
      bio: data.profile.bio,
      location: data.profile.location,
      avatar_url: '',
      public_repos: data.stats.repos,
      followers: 0,
      following: 0,
    },
    data.stats,
    data.languages,
    (data.repositories || []).map(repo => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stargazers_count: repo.stars,
      forks_count: 0,
      topics: [],
    }))
  );
}

/**
 * @deprecated Use useCustomTransformation instead
 * Kept for backward compatibility
 */
function generateFallbackAnalysis(data: GitHubProfileData): AISkillAnalysis {
  // Fallback analysis based on languages
  const expertise: Array<{ category: string; level: number; technologies: string[]; description: string }> = [];
  
  const languages = data.languages.map(l => l.name.toLowerCase());
  const frontend = ['javascript', 'typescript', 'html', 'css', 'react', 'vue', 'angular', 'svelte'];
  const backend = ['python', 'java', 'go', 'rust', 'c', 'php', 'ruby', 'node', 'c++', 'csharp'];
  const mobile = ['swift', 'kotlin', 'dart', 'flutter', 'react native'];
  const devops = ['docker', 'kubernetes', 'terraform', 'ansible', 'jenkins'];
  
  let frontendScore = 0;
  let backendScore = 0;
  let mobileScore = 0;
  let devopsScore = 0;
  const frontendTechs: string[] = [];
  const backendTechs: string[] = [];
  const mobileTechs: string[] = [];
  const devopsTechs: string[] = [];
  
  data.languages.forEach(lang => {
    const lower = lang.name.toLowerCase();
    if (frontend.some(f => lower.includes(f))) {
      frontendScore += lang.percentage;
      if (frontendTechs.length < 3 && !frontendTechs.includes(lang.name)) {
        frontendTechs.push(lang.name);
      }
    }
    if (backend.some(b => lower.includes(b))) {
      backendScore += lang.percentage;
      if (backendTechs.length < 3 && !backendTechs.includes(lang.name)) {
        backendTechs.push(lang.name);
      }
    }
    if (mobile.some(m => lower.includes(m))) {
      mobileScore += lang.percentage;
      if (mobileTechs.length < 3 && !mobileTechs.includes(lang.name)) {
        mobileTechs.push(lang.name);
      }
    }
    if (devops.some(d => lower.includes(d))) {
      devopsScore += lang.percentage;
      if (devopsTechs.length < 3 && !devopsTechs.includes(lang.name)) {
        devopsTechs.push(lang.name);
      }
    }
  });
  
  if (frontendScore > 0) {
    expertise.push({
      category: 'Frontend',
      level: Math.min(Math.round(frontendScore), 100),
      technologies: frontendTechs.slice(0, 3),
      description: 'Frontend development expertise'
    });
  }
  
  if (backendScore > 0) {
    expertise.push({
      category: 'Backend',
      level: Math.min(Math.round(backendScore), 100),
      technologies: backendTechs.slice(0, 3),
      description: 'Backend development expertise'
    });
  }
  
  if (mobileScore > 0) {
    expertise.push({
      category: 'Mobile',
      level: Math.min(Math.round(mobileScore), 100),
      technologies: mobileTechs.slice(0, 3),
      description: 'Mobile development expertise'
    });
  }
  
  if (devopsScore > 0) {
    expertise.push({
      category: 'DevOps',
      level: Math.min(Math.round(devopsScore), 100),
      technologies: devopsTechs.slice(0, 3),
      description: 'DevOps and infrastructure expertise'
    });
  }
  
  // Generate a better summary
  const topLanguages = data.languages.slice(0, 3).map(l => l.name).join(', ');
  const summary = `${data.profile.name || data.profile.login} - ${data.stats.repos} repositories, proficient in ${topLanguages || 'multiple technologies'}`;
  
  // Extract tech stack from repositories
  const techStack = extractTechStackFromRepos(data.repositories || [], data.languages);
  
  // Generate fallback strength areas based on languages and repositories
  const strengthAreas = generateFallbackStrengthAreas(data.languages, data.repositories || []);
  
  return {
    expertise: expertise.sort((a, b) => b.level - a.level).slice(0, 4),
    summary: summary,
    strengths: [
      `${data.stats.repos} repositories created`,
      `${data.stats.contributions} contributions this year`,
      `Proficient in ${topLanguages || 'multiple technologies'}`
    ],
    tags: data.languages.slice(0, 6).map(l => l.name),
    commitsDescription: "Active developer contributing regularly to projects",
    techStack: techStack,
    strengthAreas: strengthAreas
  };
}

// Generate fallback strength areas based on languages and repositories
function generateFallbackStrengthAreas(
  languages: Array<{ name: string; percentage: number }>,
  repositories: Array<{ name: string; description: string | null; stars: number; language: string | null }>
): Array<{ category: string; rating: number }> {
  const areas: Array<{ category: string; rating: number }> = [];
  
  const langNames = languages.map(l => l.name.toLowerCase());
  const repoText = repositories.map(r => `${r.name} ${r.description || ''}`).join(' ').toLowerCase();
  
  // Frontend detection
  const frontendLangs = ['javascript', 'typescript', 'html', 'css', 'react', 'vue', 'angular'];
  const frontendKeywords = ['react', 'vue', 'angular', 'frontend', 'ui', 'ux', 'component'];
  const hasFrontend = langNames.some(l => frontendLangs.some(f => l.includes(f))) || 
                      frontendKeywords.some(k => repoText.includes(k));
  if (hasFrontend) {
    const frontendPercent = languages.filter(l => 
      frontendLangs.some(f => l.name.toLowerCase().includes(f))
    ).reduce((sum, l) => sum + l.percentage, 0);
    areas.push({ category: 'Frontend', rating: Math.min(Math.round(frontendPercent / 10), 10) });
  }
  
  // Backend detection
  const backendLangs = ['python', 'java', 'go', 'rust', 'php', 'ruby', 'node', 'c++', 'c#'];
  const backendKeywords = ['backend', 'api', 'server', 'express', 'django', 'flask', 'spring'];
  const hasBackend = langNames.some(l => backendLangs.some(b => l.includes(b))) || 
                     backendKeywords.some(k => repoText.includes(k));
  if (hasBackend) {
    const backendPercent = languages.filter(l => 
      backendLangs.some(b => l.name.toLowerCase().includes(b))
    ).reduce((sum, l) => sum + l.percentage, 0);
    areas.push({ category: 'Backend', rating: Math.min(Math.round(backendPercent / 10), 10) });
  }
  
  // Full Stack detection
  if (hasFrontend && hasBackend) {
    areas.push({ category: 'Full Stack', rating: 7 });
  }
  
  // Sort by rating and return top 3
  return areas.sort((a, b) => b.rating - a.rating).slice(0, 3);
}

// Extract technologies from repository names, descriptions, and languages
function extractTechStackFromRepos(
  repositories: Array<{ name: string; description: string | null; stars: number; language: string | null }>,
  languages: Array<{ name: string; percentage: number }>
): Array<{ name: string; percentage: number }> {
  const techMap = new Map<string, number>();
  
  // Common technology patterns to detect
  const techPatterns: Record<string, string[]> = {
    'React': ['react', 'reactjs', 'react.js'],
    'Next.js': ['nextjs', 'next.js', 'next'],
    'Vue.js': ['vue', 'vuejs', 'vue.js'],
    'Angular': ['angular', 'angularjs'],
    'Node.js': ['node', 'nodejs', 'node.js', 'express'],
    'TypeScript': ['typescript', 'ts'],
    'Python': ['python', 'django', 'flask', 'fastapi'],
    'Java': ['java', 'spring', 'springboot'],
    'Go': ['go', 'golang'],
    'Rust': ['rust'],
    'Docker': ['docker', 'dockerfile'],
    'Kubernetes': ['kubernetes', 'k8s'],
    'MongoDB': ['mongodb', 'mongo'],
    'PostgreSQL': ['postgresql', 'postgres'],
    'MySQL': ['mysql'],
    'Redis': ['redis'],
    'GraphQL': ['graphql'],
    'Tailwind CSS': ['tailwind', 'tailwindcss'],
    'Sass': ['sass', 'scss'],
    'Webpack': ['webpack'],
    'Vite': ['vite'],
    'Jest': ['jest'],
    'Cypress': ['cypress'],
    'GitHub Actions': ['github-actions', 'actions'],
    'AWS': ['aws', 'amazon-web-services'],
    'Firebase': ['firebase'],
    'Supabase': ['supabase'],
  };
  
  // Analyze repositories
  repositories.forEach(repo => {
    const text = `${repo.name} ${repo.description || ''}`.toLowerCase();
    
    // Check for technology patterns
    Object.entries(techPatterns).forEach(([tech, patterns]) => {
      if (patterns.some(pattern => text.includes(pattern))) {
        techMap.set(tech, (techMap.get(tech) || 0) + 1);
      }
    });
  });
  
  // Convert to array and calculate percentages based on repository count
  const totalRepos = repositories.length || 1;
  const techStack = Array.from(techMap.entries())
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / totalRepos) * 100)
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);
  
  // Normalize percentages to sum to 100 if we have multiple items
  if (techStack.length > 1) {
    const totalPercent = techStack.reduce((sum, item) => sum + item.percentage, 0);
    if (totalPercent > 0) {
      techStack.forEach(item => {
        item.percentage = Math.round((item.percentage / totalPercent) * 100);
      });
    }
  }
  
  // If no technologies found, use top languages as fallback
  if (techStack.length === 0 && languages.length > 0) {
    return languages.slice(0, 3).map(lang => ({
      name: lang.name,
      percentage: lang.percentage
    }));
  }
  
  return techStack;
}

