/**
 * Comprehensive language and technology mapping to skill icon API formats
 * Maps GitHub languages and detected technologies to icon API compatible names
 */

export interface LanguageMapping {
  githubName: string;
  iconName: string;
  category: 'language' | 'frontend' | 'backend' | 'database' | 'devops' | 'tool';
  aliases?: string[];
}

export const LANGUAGE_MAPPINGS: LanguageMapping[] = [
  // Programming Languages
  { githubName: 'JavaScript', iconName: 'js', category: 'language', aliases: ['javascript', 'js', 'nodejs'] },
  { githubName: 'TypeScript', iconName: 'ts', category: 'language', aliases: ['typescript', 'ts'] },
  { githubName: 'Python', iconName: 'python', category: 'language', aliases: ['python', 'py'] },
  { githubName: 'Java', iconName: 'java', category: 'language', aliases: ['java'] },
  { githubName: 'C++', iconName: 'cpp', category: 'language', aliases: ['c++', 'cpp', 'cplusplus'] },
  { githubName: 'C', iconName: 'c', category: 'language', aliases: ['c'] },
  { githubName: 'C#', iconName: 'csharp', category: 'language', aliases: ['c#', 'csharp', 'cs'] },
  { githubName: 'Go', iconName: 'go', category: 'language', aliases: ['go', 'golang'] },
  { githubName: 'Rust', iconName: 'rust', category: 'language', aliases: ['rust'] },
  { githubName: 'PHP', iconName: 'php', category: 'language', aliases: ['php'] },
  { githubName: 'Ruby', iconName: 'ruby', category: 'language', aliases: ['ruby'] },
  { githubName: 'Swift', iconName: 'swift', category: 'language', aliases: ['swift'] },
  { githubName: 'Kotlin', iconName: 'kotlin', category: 'language', aliases: ['kotlin'] },
  { githubName: 'Scala', iconName: 'scala', category: 'language', aliases: ['scala'] },
  { githubName: 'R', iconName: 'r', category: 'language', aliases: ['r'] },
  { githubName: 'Dart', iconName: 'dart', category: 'language', aliases: ['dart'] },
  
  // Frontend Frameworks
  { githubName: 'React', iconName: 'react', category: 'frontend', aliases: ['react', 'reactjs'] },
  { githubName: 'Next.js', iconName: 'nextjs', category: 'frontend', aliases: ['nextjs', 'next.js', 'next'] },
  { githubName: 'Vue.js', iconName: 'vue', category: 'frontend', aliases: ['vue', 'vuejs', 'vue.js'] },
  { githubName: 'Angular', iconName: 'angular', category: 'frontend', aliases: ['angular', 'angularjs'] },
  { githubName: 'Svelte', iconName: 'svelte', category: 'frontend', aliases: ['svelte'] },
  { githubName: 'HTML', iconName: 'html', category: 'frontend', aliases: ['html', 'html5'] },
  { githubName: 'CSS', iconName: 'css', category: 'frontend', aliases: ['css', 'css3'] },
  { githubName: 'Tailwind CSS', iconName: 'tailwind', category: 'frontend', aliases: ['tailwind', 'tailwindcss'] },
  { githubName: 'Sass', iconName: 'sass', category: 'frontend', aliases: ['sass', 'scss'] },
  { githubName: 'Less', iconName: 'less', category: 'frontend', aliases: ['less'] },
  
  // Backend Frameworks
  { githubName: 'Node.js', iconName: 'nodejs', category: 'backend', aliases: ['nodejs', 'node.js', 'node'] },
  { githubName: 'Express', iconName: 'express', category: 'backend', aliases: ['express', 'expressjs'] },
  { githubName: 'Django', iconName: 'django', category: 'backend', aliases: ['django'] },
  { githubName: 'Flask', iconName: 'flask', category: 'backend', aliases: ['flask'] },
  { githubName: 'FastAPI', iconName: 'fastapi', category: 'backend', aliases: ['fastapi'] },
  { githubName: 'Spring', iconName: 'spring', category: 'backend', aliases: ['spring', 'springboot'] },
  { githubName: 'Laravel', iconName: 'laravel', category: 'backend', aliases: ['laravel'] },
  { githubName: 'Rails', iconName: 'rails', category: 'backend', aliases: ['rails', 'rubyonrails'] },
  
  // Databases
  { githubName: 'PostgreSQL', iconName: 'postgresql', category: 'database', aliases: ['postgresql', 'postgres'] },
  { githubName: 'MySQL', iconName: 'mysql', category: 'database', aliases: ['mysql'] },
  { githubName: 'MongoDB', iconName: 'mongodb', category: 'database', aliases: ['mongodb', 'mongo'] },
  { githubName: 'Redis', iconName: 'redis', category: 'database', aliases: ['redis'] },
  { githubName: 'SQLite', iconName: 'sqlite', category: 'database', aliases: ['sqlite'] },
  { githubName: 'Firebase', iconName: 'firebase', category: 'database', aliases: ['firebase'] },
  { githubName: 'Supabase', iconName: 'supabase', category: 'database', aliases: ['supabase'] },
  
  // DevOps & Cloud
  { githubName: 'Docker', iconName: 'docker', category: 'devops', aliases: ['docker'] },
  { githubName: 'Kubernetes', iconName: 'kubernetes', category: 'devops', aliases: ['kubernetes', 'k8s'] },
  { githubName: 'AWS', iconName: 'aws', category: 'devops', aliases: ['aws', 'amazon'] },
  { githubName: 'Azure', iconName: 'azure', category: 'devops', aliases: ['azure'] },
  { githubName: 'GCP', iconName: 'googlecloud', category: 'devops', aliases: ['gcp', 'google cloud', 'googlecloud'] },
  { githubName: 'Terraform', iconName: 'terraform', category: 'devops', aliases: ['terraform'] },
  { githubName: 'Jenkins', iconName: 'jenkins', category: 'devops', aliases: ['jenkins'] },
  { githubName: 'GitHub Actions', iconName: 'githubactions', category: 'devops', aliases: ['github actions', 'actions'] },
  { githubName: 'GitLab CI', iconName: 'gitlab', category: 'devops', aliases: ['gitlab', 'gitlab ci'] },
  
  // Tools
  { githubName: 'Git', iconName: 'git', category: 'tool', aliases: ['git'] },
  { githubName: 'Linux', iconName: 'linux', category: 'tool', aliases: ['linux'] },
  { githubName: 'Nginx', iconName: 'nginx', category: 'tool', aliases: ['nginx'] },
  { githubName: 'Vite', iconName: 'vite', category: 'tool', aliases: ['vite'] },
  { githubName: 'Webpack', iconName: 'webpack', category: 'tool', aliases: ['webpack'] },
  { githubName: 'Jest', iconName: 'jest', category: 'tool', aliases: ['jest'] },
  { githubName: 'GraphQL', iconName: 'graphql', category: 'tool', aliases: ['graphql'] },
];

/**
 * Map a language/technology name to icon API format
 */
export function mapLanguageToIcon(languageName: string): string {
  const normalized = languageName.trim();
  
  // Direct match
  const directMatch = LANGUAGE_MAPPINGS.find(
    mapping => mapping.githubName.toLowerCase() === normalized.toLowerCase()
  );
  if (directMatch) return directMatch.iconName;
  
  // Alias match
  const aliasMatch = LANGUAGE_MAPPINGS.find(
    mapping => mapping.aliases?.some(alias => alias.toLowerCase() === normalized.toLowerCase())
  );
  if (aliasMatch) return aliasMatch.iconName;
  
  // Partial match
  const partialMatch = LANGUAGE_MAPPINGS.find(
    mapping => normalized.toLowerCase().includes(mapping.githubName.toLowerCase()) ||
               mapping.aliases?.some(alias => normalized.toLowerCase().includes(alias.toLowerCase()))
  );
  if (partialMatch) return partialMatch.iconName;
  
  // Fallback: return lowercase version
  return normalized.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
}

/**
 * Group languages by category
 */
export function groupLanguagesByCategory(
  languages: Array<{ name: string; percentage: number }>
): {
  languages: Array<{ name: string; percentage: number; iconName: string }>;
  frontend: Array<{ name: string; percentage: number; iconName: string }>;
  backend: Array<{ name: string; percentage: number; iconName: string }>;
  database: Array<{ name: string; percentage: number; iconName: string }>;
  devops: Array<{ name: string; percentage: number; iconName: string }>;
  tools: Array<{ name: string; percentage: number; iconName: string }>;
} {
  const result = {
    languages: [] as Array<{ name: string; percentage: number; iconName: string }>,
    frontend: [] as Array<{ name: string; percentage: number; iconName: string }>,
    backend: [] as Array<{ name: string; percentage: number; iconName: string }>,
    database: [] as Array<{ name: string; percentage: number; iconName: string }>,
    devops: [] as Array<{ name: string; percentage: number; iconName: string }>,
    tools: [] as Array<{ name: string; percentage: number; iconName: string }>,
  };
  
  languages.forEach(lang => {
    const mapping = LANGUAGE_MAPPINGS.find(
      m => m.githubName.toLowerCase() === lang.name.toLowerCase() ||
           m.aliases?.some(a => a.toLowerCase() === lang.name.toLowerCase())
    ) || { iconName: mapLanguageToIcon(lang.name), category: 'language' as const };
    
    const item = {
      name: lang.name,
      percentage: lang.percentage,
      iconName: mapping.iconName,
    };
    
    switch (mapping.category) {
      case 'frontend':
        result.frontend.push(item);
        break;
      case 'backend':
        result.backend.push(item);
        break;
      case 'database':
        result.database.push(item);
        break;
      case 'devops':
        result.devops.push(item);
        break;
      case 'tool':
        result.tools.push(item);
        break;
      default:
        result.languages.push(item);
    }
  });
  
  return result;
}

/**
 * Get icon names string for skill icon API
 */
export function getIconNamesString(
  items: Array<{ iconName: string }>,
  limit: number = 10
): string {
  return items
    .slice(0, limit)
    .map(item => item.iconName)
    .join(',');
}

