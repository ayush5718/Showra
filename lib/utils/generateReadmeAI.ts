/**
 * AI-Powered README Generator using Gemini
 * Generates professional GitHub profile README from GitHub data
 */

interface GitHubProfileData {
  profile: {
    login: string;
    name: string | null;
    bio: string | null;
    location: string | null;
    company: string | null;
    blog: string | null;
    twitterUsername: string | null;
  };
  stats: {
    repos: number;
    stars: number;
    forks: number;
    contributions: number;
    followers?: number;
  };
  languages: Array<{ name: string; percentage: number }>;
  topRepo: {
    name: string;
    stars: number;
    description?: string | null;
  } | null;
  repositories?: Array<{
    name: string;
    description: string | null;
    stars: number;
    language: string | null;
  }>;
  devcardUrl?: string;
}

/**
 * Generate README using Gemini AI
 */
export async function generateReadmeWithAI(
  data: GitHubProfileData
): Promise<string> {
  try {
    const response = await fetch("/api/generate-readme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile: data.profile,
        stats: data.stats,
        languages: data.languages,
        repositories: data.repositories,
        topRepo: data.topRepo,
        bio: data.profile.bio,
        location: data.profile.location,
        company: data.profile.company,
        blog: data.profile.blog,
        twitterUsername: data.profile.twitterUsername,
        devcardUrl: data.devcardUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const result = await response.json();
    return result.readme || "";
  } catch (error) {
    console.error("Error generating README with AI:", error);
    // Return fallback README
    return generateFallbackReadme(data);
  }
}

/**
 * Generate a fallback README if AI generation fails
 */
function generateFallbackReadme(data: GitHubProfileData): string {
  const { profile, stats, languages, topRepo, devcardUrl, repositories } = data;
  const name = profile.name || profile.login;
  const username = profile.login;
  
  // Determine tagline based on languages
  const topLang = languages && languages.length > 0 ? languages[0].name : 'Development';
  const tagline = profile.bio || `${topLang} Developer | Building innovative solutions`;

  let readme = '';

  // Social Media Badges Section (Top)
  readme += `# Hey Everyone! I'm [${name} a.k.a ${username}!](https://github.com/${username})\n\n`;
  readme += `<br><br>\n\n`;
  
  readme += `<p align="left">\n`;
  readme += `  <a href="https://github.com/${username}">\n`;
  readme += `    <img align="left" alt="${username}'s Github" width="100px" src="https://img.shields.io/badge/Github-181717?style=for-the-badge&logo=Github&logoColor=white" />\n`;
  readme += `  </a>\n`;
  
  if (profile.blog) {
    const blogUrl = profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`;
    readme += `  <a href="${blogUrl}">\n`;
    readme += `    <img align="left" alt="${username}'s Portfolio" width="100px" src="https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=About.me&logoColor=white" />\n`;
    readme += `  </a>\n`;
  }
  
  if (profile.twitterUsername) {
    readme += `  <a href="https://twitter.com/${profile.twitterUsername}">\n`;
    readme += `    <img align="left" alt="${username}'s Twitter" width="100px" src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" />\n`;
    readme += `  </a>\n`;
  }
  
  readme += `</p>\n\n`;
  readme += `<br><br>\n\n`;

  // Hero Section with Two-Column Layout
  readme += `<div>\n\n`;
  readme += `<img align="right" src="https://i.imgur.com/mChG9re.gif" width="40%"/>\n\n`;
  readme += `<br>\n\n`;
  
  // Profile views badge
  readme += `![](https://komarev.com/ghpvc/?username=${username}&color=00a0a0&style=plastic)\n\n`;
  
  // Tagline
  readme += `<h4 align="center"><samp>${tagline}</samp></h4>\n\n`;
  
  // Key information bullets
  if (profile.company) {
    readme += `- 👷 <samp><b>${profile.company}</b></samp>\n\n`;
  }
  if (profile.location) {
    readme += `- 📍 <samp><b>${profile.location}</b></samp>\n\n`;
  }
  if (stats.contributions > 0) {
    readme += `- 💻 <samp>I've made **${stats.contributions} contributions** this year</samp>\n\n`;
  }
  if (stats.repos > 0) {
    readme += `- 📦 <samp>Maintaining **${stats.repos} repositories**</samp>\n\n`;
  }
  
  readme += `</div>\n\n`;
  readme += `##\n\n`;

  readme += `---\n\n`;

  // About Me Section with badges
  readme += `## 🚀 About Me\n\n`;
  readme += `I'm a passionate developer who loves building innovative solutions and exploring new technologies. `;
  
  if (profile.company) {
    readme += `Currently working at **${profile.company}**. `;
  }
  
  if (stats.contributions > 0) {
    readme += `I've made **${stats.contributions} contributions** this year and maintain **${stats.repos} repositories**. `;
  }
  
  readme += `I'm always learning and improving my skills to create better software.\n\n`;
  
  // Badges for key info
  readme += `<p align="left">\n`;
  if (profile.location) {
    readme += `  <img src="https://img.shields.io/badge/Location-${encodeURIComponent(profile.location)}-00E5FF?style=flat-square&logo=map-marker-alt" alt="Location" />\n`;
  }
  if (profile.company) {
    readme += `  <img src="https://img.shields.io/badge/Company-${encodeURIComponent(profile.company)}-FF00CC?style=flat-square&logo=briefcase" alt="Company" />\n`;
  }
  if (stats.repos > 0) {
    readme += `  <img src="https://img.shields.io/badge/Repositories-${stats.repos}-9D4BFF?style=flat-square&logo=github" alt="Repositories" />\n`;
  }
  if (stats.contributions > 0) {
    readme += `  <img src="https://img.shields.io/badge/Contributions-${stats.contributions}-00E5FF?style=flat-square&logo=git" alt="Contributions" />\n`;
  }
  readme += `</p>\n\n`;

  // Tech Stack Section with Icon APIs
  readme += `<h3><b><samp>Skills</samp></b></h3>\n\n`;
  
  if (languages && languages.length > 0) {
    // Map languages to skill icon API format
    const langMap: Record<string, string> = {
      'JavaScript': 'js',
      'TypeScript': 'ts',
      'Python': 'python',
      'Java': 'java',
      'C++': 'cpp',
      'C': 'c',
      'HTML': 'html',
      'CSS': 'css',
      'React': 'react',
      'Vue': 'vue',
      'Angular': 'angular',
      'Node.js': 'nodejs',
      'Go': 'go',
      'Rust': 'rust',
      'PHP': 'php',
      'Ruby': 'ruby',
      'Docker': 'docker',
      'Kubernetes': 'kubernetes',
      'Git': 'git',
      'Linux': 'linux',
      'AWS': 'aws',
      'Azure': 'azure',
      'GCP': 'googlecloud',
      'PostgreSQL': 'postgresql',
      'MySQL': 'mysql',
      'MongoDB': 'mongodb',
      'Redis': 'redis',
    };
    
    // Group languages by category
    const frontendLangs = ['javascript', 'typescript', 'html', 'css', 'react', 'vue', 'angular', 'svelte', 'tailwind'];
    const backendLangs = ['python', 'java', 'go', 'rust', 'php', 'ruby', 'node', 'c++', 'c#', 'django', 'flask', 'express'];
    const toolsLangs = ['docker', 'kubernetes', 'git', 'linux', 'aws', 'azure', 'gcp', 'terraform', 'jenkins'];
    const dbLangs = ['postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'firebase'];
    
    const frontend = languages.filter(l => frontendLangs.some(fl => l.name.toLowerCase().includes(fl)));
    const backend = languages.filter(l => backendLangs.some(bl => l.name.toLowerCase().includes(bl)));
    const tools = languages.filter(l => toolsLangs.some(tl => l.name.toLowerCase().includes(tl)));
    const databases = languages.filter(l => dbLangs.some(dl => l.name.toLowerCase().includes(dl)));
    const others = languages.filter(l => !frontendLangs.some(fl => l.name.toLowerCase().includes(fl)) && 
                                         !backendLangs.some(bl => l.name.toLowerCase().includes(bl)) &&
                                         !toolsLangs.some(tl => l.name.toLowerCase().includes(tl)) &&
                                         !dbLangs.some(dl => l.name.toLowerCase().includes(dl)));

    // Languages section
    if (languages.length > 0) {
      const langIcons = languages.slice(0, 8).map(l => {
        const mapped = langMap[l.name] || l.name.toLowerCase();
        return mapped;
      }).join(',');
      if (langIcons) {
        readme += `<h4><b><samp>Languages</samp></b></h4>\n\n`;
        readme += `![](https://skills.syvixor.com/api/icons?i=${langIcons}&perline=18)\n\n`;
      }
    }

    // Frontend section
    if (frontend.length > 0) {
      const frontendIcons = frontend.slice(0, 8).map(l => {
        const mapped = langMap[l.name] || l.name.toLowerCase();
        return mapped;
      }).join(',');
      if (frontendIcons) {
        readme += `<h4><b><samp>Frontend</samp></b></h4>\n\n`;
        readme += `![](https://skills.syvixor.com/api/icons?i=${frontendIcons}&perline=18)\n\n`;
      }
    }

    // Backend section
    if (backend.length > 0) {
      const backendIcons = backend.slice(0, 8).map(l => {
        const mapped = langMap[l.name] || l.name.toLowerCase();
        return mapped;
      }).join(',');
      if (backendIcons) {
        readme += `<h4><b><samp>Backend</samp></b></h4>\n\n`;
        readme += `![](https://skillicons.dev/icons?i=${backendIcons}&perline=18)\n\n`;
      }
    }

    // DevOps section
    if (tools.length > 0) {
      const toolsIcons = tools.slice(0, 8).map(l => {
        const mapped = langMap[l.name] || l.name.toLowerCase();
        return mapped;
      }).join(',');
      if (toolsIcons) {
        readme += `<h4><b><samp>DevOps</samp></b></h4>\n\n`;
        readme += `![](https://skills.syvixor.com/api/icons?i=${toolsIcons}&perline=18)\n\n`;
      }
    }

    // Database section
    if (databases.length > 0) {
      const dbIcons = databases.slice(0, 8).map(l => {
        const mapped = langMap[l.name] || l.name.toLowerCase();
        return mapped;
      }).join(',');
      if (dbIcons) {
        readme += `<h4><b><samp>Database</samp></b></h4>\n\n`;
        readme += `![](https://skills.syvixor.com/api/icons?i=${dbIcons}&perline=18)\n\n`;
      }
    }
  }

  readme += `---\n\n`;

  // Currently Working On / Learning - Creative Card Layout
  readme += `## 🔨 Currently Working On / Learning\n\n`;
  readme += `<table>\n`;
  readme += `<tr>\n`;
  
  if (topRepo) {
    readme += `<td width="50%" style="background-color: rgba(0, 0, 0, 0.4); border: 1px solid rgba(0, 229, 255, 0.3); border-radius: 8px; padding: 16px; vertical-align: top;">\n`;
    readme += `  <h3 style="margin-top: 0; color: #58A6FF; font-size: 1.1em;">🚧 ${topRepo.name.length > 25 ? topRepo.name.substring(0, 25) + '...' : topRepo.name}</h3>\n`;
    readme += `  <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0;">${topRepo.description || "A project I'm passionate about"}</p>\n`;
    readme += `  <p style="margin: 8px 0;">\n`;
    readme += `    <img src="https://img.shields.io/badge/Status-In%20Progress-00E5FF?style=flat-square&logoColor=white&labelColor=0D1117" alt="Status" />\n`;
    readme += `    <img src="https://img.shields.io/github/stars/${username}/${topRepo.name}?style=flat-square&logo=github&logoColor=white&labelColor=0D1117&color=58A6FF" alt="Stars" />\n`;
    readme += `  </p>\n`;
    readme += `</td>\n`;
  }
  
  if (languages && languages.length > 0) {
    const learningLang = languages.length > 1 ? languages[1].name : languages[0].name;
    readme += `<td width="50%" style="background-color: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 0, 204, 0.3); border-radius: 8px; padding: 16px; vertical-align: top;">\n`;
    readme += `  <h3 style="margin-top: 0; color: #58A6FF; font-size: 1.1em;">📚 Learning ${learningLang}</h3>\n`;
    readme += `  <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0;">Exploring ${learningLang} and its ecosystem, building projects to master the language.</p>\n`;
    readme += `  <p style="margin: 8px 0;">\n`;
    readme += `    <img src="https://img.shields.io/badge/Learning-${encodeURIComponent(learningLang)}-FF00CC?style=flat-square&logoColor=white&labelColor=0D1117" alt="Learning" />\n`;
    readme += `  </p>\n`;
    readme += `</td>\n`;
  }
  
  readme += `</tr>\n`;
  readme += `<tr>\n`;
  readme += `<td width="50%" style="background-color: rgba(0, 0, 0, 0.4); border: 1px solid rgba(157, 75, 255, 0.3); border-radius: 8px; padding: 16px; vertical-align: top;">\n`;
  readme += `  <h3 style="margin-top: 0; color: #58A6FF; font-size: 1.1em;">🌱 Open Source</h3>\n`;
  readme += `  <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0;">Contributing to open source projects and building tools for the community.</p>\n`;
  readme += `  <p style="margin: 8px 0;">\n`;
  readme += `    <img src="https://img.shields.io/badge/Contributions-Open%20Source-9D4BFF?style=flat-square&logoColor=white&labelColor=0D1117" alt="Open Source" />\n`;
  readme += `  </p>\n`;
  readme += `</td>\n`;
  readme += `<td width="50%" style="background-color: rgba(0, 0, 0, 0.4); border: 1px solid rgba(0, 229, 255, 0.3); border-radius: 8px; padding: 16px; vertical-align: top;">\n`;
  readme += `  <h3 style="margin-top: 0; color: #58A6FF; font-size: 1.1em;">🏗️ Architecture</h3>\n`;
  readme += `  <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0;">Improving software architecture and design patterns knowledge.</p>\n`;
  readme += `  <p style="margin: 8px 0;">\n`;
  readme += `    <img src="https://img.shields.io/badge/Focus-Architecture-00E5FF?style=flat-square&logoColor=white&labelColor=0D1117" alt="Architecture" />\n`;
  readme += `  </p>\n`;
  readme += `</td>\n`;
  readme += `</tr>\n`;
  readme += `</table>\n\n`;

  readme += `---\n\n`;

  // Featured Repositories using GitHub Stats API
  readme += `<h3><b><samp>Check out my Repositories</samp></b></h3>\n\n`;
  readme += `<span>\n\n`;
  
  if (repositories && repositories.length > 0) {
    const featuredRepos = repositories.slice(0, 4);
    
    // Use GitHub Stats API for repository pins
    featuredRepos.forEach((repo, index) => {
      const align = index % 2 === 0 ? 'right' : 'center';
      readme += `<a href="https://github.com/${username}/${repo.name}">\n`;
      readme += `  <img align="${align}" src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name}" />\n`;
      readme += `</a>\n\n`;
    });
  }
  readme += `</span>\n\n`;
  readme += `<hr>\n\n`;

  // GitHub Trophy
  readme += `### 🏆 GitHub Profile Trophy:\n\n`;
  readme += `<p align="center">\n`;
  readme += `  <a href="https://github.com/ryo-ma/github-profile-trophy">\n`;
  readme += `    <img width=800 src="https://github-profile-trophy.vercel.app/?username=${username}&column=8&theme=onedark&no-frame=true&no-bg=true"/>\n`;
  readme += `  </a>\n`;
  readme += `</p>\n\n`;

  readme += `<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">\n\n`;

  // GitHub Stats
  readme += `## 📊 GitHub Stats\n\n`;
  readme += `<p align="center">\n`;
  readme += `  <img src="https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=radical&hide_border=true&bg_color=0D1117&title_color=58A6FF&icon_color=58A6FF&include_all_commits=true&count_private=true" alt="${username}" />\n`;
  readme += `</p>\n\n`;
  
  readme += `<p align="center">\n`;
  readme += `  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=radical&hide_border=true&bg_color=0D1117&title_color=58A6FF&langs_count=8" alt="${username}" />\n`;
  readme += `</p>\n\n`;
  
  readme += `<p align="center">\n`;
  readme += `  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=radical&hide_border=true&background=0D1117&ring=58A6FF&fire=58A6FF&currStreakLabel=58A6FF" alt="${username}" />\n`;
  readme += `</p>\n\n`;
  
  readme += `<p align="center">\n`;
  readme += `  <img src="https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=radical&hide_border=true&bg_color=0D1117&color=58A6FF&line=58A6FF&point=58A6FF&area=true&area_color=58A6FF" alt="Activity Graph" />\n`;
  readme += `</p>\n\n`;
  
  readme += `<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">\n\n`;

  // DevCard Section
  if (devcardUrl) {
    readme += `---\n\n`;
    readme += `## 🎴 My DevCard\n\n`;
    readme += `<div align="center">\n`;
    readme += `  <iframe src="${devcardUrl}" width="100%" height="600" frameborder="0" scrolling="no" title="DevCard"></iframe>\n`;
    readme += `</div>\n\n`;
  }

  readme += `---\n\n`;

  // Connect Section with Enhanced Badges
  readme += `## 📫 Connect with Me\n\n`;
  readme += `<p align="left">\n`;
  readme += `  <a href="https://github.com/${username}" target="_blank">\n`;
  readme += `    <img align="left" alt="${username}'s Github" width="100px" src="https://img.shields.io/badge/Github-181717?style=for-the-badge&logo=Github&logoColor=white" />\n`;
  readme += `  </a>\n`;
  if (profile.blog) {
    const blogUrl = profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`;
    readme += `  <a href="${blogUrl}" target="_blank">\n`;
    readme += `    <img align="left" alt="${username}'s Portfolio" width="100px" src="https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=About.me&logoColor=white" />\n`;
    readme += `  </a>\n`;
  }
  if (profile.twitterUsername) {
    readme += `  <a href="https://twitter.com/${profile.twitterUsername}" target="_blank">\n`;
    readme += `    <img align="left" alt="${username}'s Twitter" width="100px" src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" />\n`;
    readme += `  </a>\n`;
  }
  readme += `</p>\n\n`;

  readme += `---\n\n`;

  // Fun Facts Section
  readme += `## 💡 Fun Facts\n\n`;
  readme += `- 🔥 I love solving complex problems and building scalable solutions\n`;
  if (stats.contributions > 1000) {
    readme += `- 📈 I've made over ${stats.contributions} contributions to open source\n`;
  }
  readme += `- 💻 I'm always exploring new technologies and frameworks\n`;
  readme += `- 🌱 Currently learning and improving my skills every day\n\n`;

  readme += `---\n\n`;
  readme += `<p align="center">⭐️ From <a href="https://github.com/${username}">@${username}</a></p>\n`;

  return readme;
}

