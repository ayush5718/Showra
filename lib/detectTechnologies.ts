// Technology Detection from GitHub Repository Data
// Detects frameworks and technologies without using AI API

interface Repository {
  name: string;
  description: string | null;
  language: string | null;
  topics?: string[];
}

interface DetectedTechnology {
  name: string;
  confidence: number; // 0-100 based on evidence strength
  evidence: string[]; // What evidence was found
}

// Technology detection patterns
const TECHNOLOGY_PATTERNS: Record<string, { keywords: string[]; repoNamePatterns: RegExp[]; descriptionPatterns: RegExp[] }> = {
  'React': {
    keywords: ['react', 'reactjs', 'react.js'],
    repoNamePatterns: [/react/i, /reactjs/i],
    descriptionPatterns: [/react/i, /jsx/i, /component/i]
  },
  'Next.js': {
    keywords: ['nextjs', 'next.js', 'nextjs13', 'nextjs14', 'nextjs15'],
    repoNamePatterns: [/next/i, /nextjs/i],
    descriptionPatterns: [/next\.?js/i, /nextjs/i, /vercel/i]
  },
  'Node.js': {
    keywords: ['nodejs', 'node.js', 'node'],
    repoNamePatterns: [/node/i, /nodejs/i, /express/i, /server/i],
    descriptionPatterns: [/node\.?js/i, /nodejs/i, /express/i, /backend/i, /api server/i]
  },
  'TypeScript': {
    keywords: ['typescript', 'ts'],
    repoNamePatterns: [/typescript/i, /-ts/i, /\.ts$/i],
    descriptionPatterns: [/typescript/i, /typed/i]
  },
  'Vue.js': {
    keywords: ['vue', 'vuejs', 'vue.js'],
    repoNamePatterns: [/vue/i, /vuejs/i],
    descriptionPatterns: [/vue\.?js/i, /vuejs/i]
  },
  'Angular': {
    keywords: ['angular', 'angularjs'],
    repoNamePatterns: [/angular/i],
    descriptionPatterns: [/angular/i]
  },
  'Express': {
    keywords: ['express', 'expressjs'],
    repoNamePatterns: [/express/i],
    descriptionPatterns: [/express/i, /express\.?js/i]
  },
  'Tailwind CSS': {
    keywords: ['tailwind', 'tailwindcss'],
    repoNamePatterns: [/tailwind/i],
    descriptionPatterns: [/tailwind/i, /tailwindcss/i]
  },
  'Python': {
    keywords: ['python', 'django', 'flask', 'fastapi'],
    repoNamePatterns: [/python/i, /django/i, /flask/i, /fastapi/i],
    descriptionPatterns: [/python/i, /django/i, /flask/i, /fastapi/i]
  },
  'MongoDB': {
    keywords: ['mongodb', 'mongoose'],
    repoNamePatterns: [/mongo/i],
    descriptionPatterns: [/mongodb/i, /mongoose/i, /nosql/i]
  },
  'PostgreSQL': {
    keywords: ['postgresql', 'postgres', 'prisma'],
    repoNamePatterns: [/postgres/i, /prisma/i],
    descriptionPatterns: [/postgres/i, /prisma/i, /sql/i]
  },
  'Docker': {
    keywords: ['docker', 'container'],
    repoNamePatterns: [/docker/i],
    descriptionPatterns: [/docker/i, /container/i, /dockerfile/i]
  },
  'GraphQL': {
    keywords: ['graphql', 'apollo'],
    repoNamePatterns: [/graphql/i, /apollo/i],
    descriptionPatterns: [/graphql/i, /apollo/i]
  },
  'Firebase': {
    keywords: ['firebase'],
    repoNamePatterns: [/firebase/i],
    descriptionPatterns: [/firebase/i]
  },
  'AWS': {
    keywords: ['aws', 'amazon web services', 'lambda', 's3'],
    repoNamePatterns: [/aws/i, /lambda/i],
    descriptionPatterns: [/aws/i, /amazon/i, /lambda/i, /s3/i]
  },
  'Redis': {
    keywords: ['redis'],
    repoNamePatterns: [/redis/i],
    descriptionPatterns: [/redis/i]
  },
  'Jest': {
    keywords: ['jest', 'testing'],
    repoNamePatterns: [/jest/i, /test/i],
    descriptionPatterns: [/jest/i, /testing/i, /unit test/i]
  },
  'Webpack': {
    keywords: ['webpack', 'vite'],
    repoNamePatterns: [/webpack/i, /vite/i],
    descriptionPatterns: [/webpack/i, /vite/i, /bundler/i]
  }
};

/**
 * Detects technologies from repository data
 */
export function detectTechnologies(repositories: Repository[]): DetectedTechnology[] {
  const technologyScores: Record<string, { confidence: number; evidence: string[] }> = {};

  repositories.forEach((repo) => {
    const repoName = repo.name.toLowerCase();
    const description = (repo.description || '').toLowerCase();
    const language = (repo.language || '').toLowerCase();
    const topics = (repo.topics || []).map(t => t.toLowerCase());

    // Check each technology pattern
    Object.entries(TECHNOLOGY_PATTERNS).forEach(([techName, patterns]) => {
      let found = false;
      const evidence: string[] = [];

      // Check repository name
      if (patterns.repoNamePatterns.some(pattern => pattern.test(repoName))) {
        found = true;
        evidence.push(`Repository name: ${repo.name}`);
      }

      // Check description
      if (patterns.descriptionPatterns.some(pattern => pattern.test(description))) {
        found = true;
        evidence.push(`Description: ${repo.description}`);
      }

      // Check topics
      if (topics.some(topic => patterns.keywords.some(keyword => topic.includes(keyword)))) {
        found = true;
        evidence.push(`Topics: ${repo.topics?.join(', ')}`);
      }

      // Check language (for some technologies)
      if (patterns.keywords.some(keyword => language.includes(keyword))) {
        found = true;
        evidence.push(`Language: ${repo.language}`);
      }

      if (found) {
        if (!technologyScores[techName]) {
          technologyScores[techName] = { confidence: 0, evidence: [] };
        }
        
        // Increase confidence based on evidence
        // Multiple evidence sources = higher confidence
        technologyScores[techName].confidence += 20;
        technologyScores[techName].evidence.push(...evidence);
      }
    });
  });

  // Convert to array and sort by confidence
  const detected: DetectedTechnology[] = Object.entries(technologyScores)
    .map(([name, data]) => ({
      name,
      confidence: Math.min(data.confidence, 100), // Cap at 100
      evidence: [...new Set(data.evidence)] // Remove duplicates
    }))
    .filter(tech => tech.confidence >= 20) // Only include if confidence >= 20%
    .sort((a, b) => b.confidence - a.confidence);

  return detected;
}

/**
 * Get top technologies (frameworks/tools) detected from repositories
 */
export function getTopTechnologies(repositories: Repository[], limit: number = 8): string[] {
  const detected = detectTechnologies(repositories);
  return detected.slice(0, limit).map(tech => tech.name);
}

/**
 * Check if user has specific technology
 */
export function hasTechnology(repositories: Repository[], technology: string): boolean {
  const detected = detectTechnologies(repositories);
  return detected.some(tech => 
    tech.name.toLowerCase() === technology.toLowerCase()
  );
}







