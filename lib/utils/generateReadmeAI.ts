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

  // Modern Hero Section - Name Centered, Description Left-Aligned
  readme += `<div align="center">\n\n`;
  
  // Name with animated typing effect - Centered
  readme += `<h1 align="center" style="margin-bottom: 10px;">\n`;
  readme += `  <img src="https://readme-typing-svg.herokuapp.com/?lines=Hi+👋,+I'm+${encodeURIComponent(name)};&color=00E5FF&center=true&width=500&height=45&size=32&fontSize=32" alt="Typing SVG" />\n`;
  readme += `</h1>\n\n`;
  
  readme += `</div>\n\n`;
  
  // Tagline/Bio - Left Aligned
  readme += `<h3 align="left" style="margin-top: 10px; margin-bottom: 20px; color: rgba(255, 255, 255, 0.9); font-weight: 400;">\n`;
  readme += `  ${tagline}\n`;
  readme += `</h3>\n\n`;
  
  // Coding animation with reliable source
  readme += `<div align="center" style="margin: 20px 0;">\n`;
  readme += `  <img src="https://i.imgur.com/mChG9re.gif" alt="Coding Animation" width="400" style="max-width: 100%; height: auto; border-radius: 10px;" />\n`;
  readme += `</div>\n\n`;
  
  // Profile views badge - Left Aligned
  readme += `<p align="left" style="margin: 10px 0;">\n`;
  readme += `  <img src="https://komarev.com/ghpvc/?username=${username}&label=Profile%20views&color=0e75b6&style=flat" alt="${username}" />\n`;
  readme += `</p>\n\n`;

  // GitHub trophy - Left Aligned
  readme += `<p align="left" style="margin: 10px 0;">\n`;
  readme += `  <a href="https://github.com/ryo-ma/github-profile-trophy"><img src="https://github-profile-trophy.vercel.app/?username=${username}&theme=radical&no-frame=true&no-bg=true&margin-w=4&margin-h=4" alt="${username}" /></a>\n`;
  readme += `</p>\n\n`;

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

  // Tech Stack Section
  readme += `## 💻 Tech Stack\n\n`;
  
  if (languages && languages.length > 0) {
    // Group languages by category
    const frontendLangs = ['javascript', 'typescript', 'html', 'css', 'react', 'vue', 'angular', 'svelte'];
    const backendLangs = ['python', 'java', 'go', 'rust', 'php', 'ruby', 'node', 'c++', 'c#', 'django', 'flask', 'express'];
    const toolsLangs = ['docker', 'kubernetes', 'git', 'linux', 'aws', 'azure', 'gcp'];
    
    const frontend = languages.filter(l => frontendLangs.some(fl => l.name.toLowerCase().includes(fl)));
    const backend = languages.filter(l => backendLangs.some(bl => l.name.toLowerCase().includes(bl)));
    const tools = languages.filter(l => toolsLangs.some(tl => l.name.toLowerCase().includes(tl)));
    const others = languages.filter(l => !frontendLangs.some(fl => l.name.toLowerCase().includes(fl)) && 
                                         !backendLangs.some(bl => l.name.toLowerCase().includes(bl)) &&
                                         !toolsLangs.some(tl => l.name.toLowerCase().includes(tl)));

    // Tech Stack with badges in a grid layout
    const techColors: Record<string, string> = {
      'JavaScript': 'F7DF1E',
      'TypeScript': '3178C6',
      'Python': '3776AB',
      'React': '61DAFB',
      'Node.js': '339933',
      'Java': 'ED8B00',
      'Go': '00ADD8',
      'Rust': '000000',
      'HTML': 'E34F26',
      'CSS': '1572B6',
      'Vue': '4FC08D',
      'Angular': 'DD0031',
      'Docker': '2496ED',
      'Kubernetes': '326CE5',
      'AWS': '232F3E',
      'Git': 'F05032',
    };

    // Tech Stack with modern, clean design
    if (frontend.length > 0) {
      readme += `### Frontend\n`;
      readme += `<div style="background: linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(0, 0, 0, 0.5) 100%); border: 2px solid rgba(0, 229, 255, 0.4); border-radius: 12px; padding: 24px; margin: 16px 0; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; box-shadow: 0 4px 6px rgba(0, 229, 255, 0.1);">\n`;
      frontend.slice(0, 10).forEach((lang) => {
        const langLower = lang.name.toLowerCase().replace(/\s+/g, '-');
        const langName = lang.name.replace(/\s+/g, '%20');
        const color = techColors[lang.name] || '00E5FF';
        readme += `<div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(0, 0, 0, 0.6); padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(0, 229, 255, 0.3); transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">\n`;
        readme += `  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/${langLower}/${langLower}-original.svg" alt="${lang.name}" width="36" height="36" style="object-fit: contain; filter: drop-shadow(0 0 4px rgba(0, 229, 255, 0.5));" />\n`;
        readme += `  <span style="color: #ffffff; font-weight: 600; font-size: 14px;">${lang.name}</span>\n`;
        readme += `</div>\n`;
      });
      readme += `</div>\n\n`;
    }

    if (backend.length > 0) {
      readme += `### Backend\n`;
      readme += `<div style="background: linear-gradient(135deg, rgba(255, 0, 204, 0.1) 0%, rgba(0, 0, 0, 0.5) 100%); border: 2px solid rgba(255, 0, 204, 0.4); border-radius: 12px; padding: 24px; margin: 16px 0; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; box-shadow: 0 4px 6px rgba(255, 0, 204, 0.1);">\n`;
      backend.slice(0, 10).forEach((lang) => {
        const langLower = lang.name.toLowerCase().replace(/\s+/g, '-');
        const langName = lang.name.replace(/\s+/g, '%20');
        const color = techColors[lang.name] || 'FF00CC';
        readme += `<div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(0, 0, 0, 0.6); padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(255, 0, 204, 0.3); transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">\n`;
        readme += `  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/${langLower}/${langLower}-original.svg" alt="${lang.name}" width="36" height="36" style="object-fit: contain; filter: drop-shadow(0 0 4px rgba(255, 0, 204, 0.5));" />\n`;
        readme += `  <span style="color: #ffffff; font-weight: 600; font-size: 14px;">${lang.name}</span>\n`;
        readme += `</div>\n`;
      });
      readme += `</div>\n\n`;
    }

    if (tools.length > 0) {
      readme += `### Tools & DevOps\n`;
      readme += `<div style="background: linear-gradient(135deg, rgba(157, 75, 255, 0.1) 0%, rgba(0, 0, 0, 0.5) 100%); border: 2px solid rgba(157, 75, 255, 0.4); border-radius: 12px; padding: 24px; margin: 16px 0; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; box-shadow: 0 4px 6px rgba(157, 75, 255, 0.1);">\n`;
      tools.slice(0, 10).forEach((lang) => {
        const langLower = lang.name.toLowerCase().replace(/\s+/g, '-');
        const langName = lang.name.replace(/\s+/g, '%20');
        const color = techColors[lang.name] || '9D4BFF';
        readme += `<div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(0, 0, 0, 0.6); padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(157, 75, 255, 0.3); transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">\n`;
        readme += `  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/${langLower}/${langLower}-original.svg" alt="${lang.name}" width="36" height="36" style="object-fit: contain; filter: drop-shadow(0 0 4px rgba(157, 75, 255, 0.5));" />\n`;
        readme += `  <span style="color: #ffffff; font-weight: 600; font-size: 14px;">${lang.name}</span>\n`;
        readme += `</div>\n`;
      });
      readme += `</div>\n\n`;
    }

    if (others.length > 0) {
      readme += `### Other Technologies\n`;
      readme += `<div style="background: linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(0, 0, 0, 0.5) 100%); border: 2px solid rgba(0, 229, 255, 0.4); border-radius: 12px; padding: 24px; margin: 16px 0; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; box-shadow: 0 4px 6px rgba(0, 229, 255, 0.1);">\n`;
      others.slice(0, 10).forEach((lang) => {
        const langLower = lang.name.toLowerCase().replace(/\s+/g, '-');
        const langName = lang.name.replace(/\s+/g, '%20');
        const color = techColors[lang.name] || '00E5FF';
        readme += `<div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(0, 0, 0, 0.6); padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(0, 229, 255, 0.3); transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">\n`;
        readme += `  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/${langLower}/${langLower}-original.svg" alt="${lang.name}" width="36" height="36" style="object-fit: contain; filter: drop-shadow(0 0 4px rgba(0, 229, 255, 0.5));" />\n`;
        readme += `  <span style="color: #ffffff; font-weight: 600; font-size: 14px;">${lang.name}</span>\n`;
        readme += `</div>\n`;
      });
      readme += `</div>\n\n`;
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

  // Featured Projects - Creative Card Layout
  readme += `## 🚀 Featured Projects\n\n`;
  
  if (repositories && repositories.length > 0) {
    const featuredRepos = repositories.slice(0, 6);
    
    // Create 2-column grid layout
    readme += `<table>\n`;
    for (let i = 0; i < featuredRepos.length; i += 2) {
      readme += `<tr>\n`;
      
      // First project in row
      const repo1 = featuredRepos[i];
      const repo1NameDisplay = repo1.name.length > 28 ? repo1.name.substring(0, 28) + '...' : repo1.name;
      readme += `<td width="50%" style="background-color: rgba(0, 0, 0, 0.5); border: 2px solid rgba(88, 166, 255, 0.4); border-radius: 12px; padding: 20px; vertical-align: top; margin: 8px;">\n`;
      readme += `  <h3 style="margin-top: 0; margin-bottom: 12px; color: #58A6FF; font-size: 1.2em; font-weight: 600; line-height: 1.3;"><a href="https://github.com/${username}/${repo1.name}" style="color: #58A6FF; text-decoration: none; border-bottom: 1px solid transparent;" onmouseover="this.style.borderBottomColor='#58A6FF'" onmouseout="this.style.borderBottomColor='transparent'">${repo1NameDisplay}</a></h3>\n`;
      readme += `  <p style="color: rgba(255, 255, 255, 0.95); margin: 12px 0; line-height: 1.6; font-size: 0.95em;">${repo1.description || "A project I'm working on"}</p>\n`;
      readme += `  <div style="margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px;">\n`;
      readme += `    <img src="https://img.shields.io/github/stars/${username}/${repo1.name}?style=flat-square&logo=github&logoColor=white&labelColor=0D1117&color=58A6FF&label=" alt="Stars" />\n`;
      if (repo1.language) {
        const langColor = repo1.language === 'JavaScript' ? 'F7DF1E' : repo1.language === 'TypeScript' ? '3178C6' : repo1.language === 'Python' ? '3776AB' : repo1.language === 'Java' ? 'ED8B00' : repo1.language === 'Go' ? '00ADD8' : '00E5FF';
        readme += `    <img src="https://img.shields.io/badge/${encodeURIComponent(repo1.language)}-${langColor}?style=flat-square&logo=${repo1.language.toLowerCase()}&logoColor=white&labelColor=0D1117" alt="Language" />\n`;
      }
      readme += `    <a href="https://github.com/${username}/${repo1.name}"><img src="https://img.shields.io/badge/View-Repository-9D4BFF?style=flat-square&logo=github&logoColor=white&labelColor=0D1117" alt="View" /></a>\n`;
      readme += `  </div>\n`;
      readme += `</td>\n`;
      
      // Second project in row (if exists)
      if (i + 1 < featuredRepos.length) {
        const repo2 = featuredRepos[i + 1];
        const repo2NameDisplay = repo2.name.length > 28 ? repo2.name.substring(0, 28) + '...' : repo2.name;
        readme += `<td width="50%" style="background-color: rgba(0, 0, 0, 0.5); border: 2px solid rgba(88, 166, 255, 0.4); border-radius: 12px; padding: 20px; vertical-align: top; margin: 8px;">\n`;
        readme += `  <h3 style="margin-top: 0; margin-bottom: 12px; color: #58A6FF; font-size: 1.2em; font-weight: 600; line-height: 1.3;"><a href="https://github.com/${username}/${repo2.name}" style="color: #58A6FF; text-decoration: none; border-bottom: 1px solid transparent;" onmouseover="this.style.borderBottomColor='#58A6FF'" onmouseout="this.style.borderBottomColor='transparent'">${repo2NameDisplay}</a></h3>\n`;
        readme += `  <p style="color: rgba(255, 255, 255, 0.95); margin: 12px 0; line-height: 1.6; font-size: 0.95em;">${repo2.description || "A project I'm working on"}</p>\n`;
        readme += `  <div style="margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px;">\n`;
        readme += `    <img src="https://img.shields.io/github/stars/${username}/${repo2.name}?style=flat-square&logo=github&logoColor=white&labelColor=0D1117&color=58A6FF&label=" alt="Stars" />\n`;
        if (repo2.language) {
          const langColor = repo2.language === 'JavaScript' ? 'F7DF1E' : repo2.language === 'TypeScript' ? '3178C6' : repo2.language === 'Python' ? '3776AB' : repo2.language === 'Java' ? 'ED8B00' : repo2.language === 'Go' ? '00ADD8' : '00E5FF';
          readme += `    <img src="https://img.shields.io/badge/${encodeURIComponent(repo2.language)}-${langColor}?style=flat-square&logo=${repo2.language.toLowerCase()}&logoColor=white&labelColor=0D1117" alt="Language" />\n`;
        }
        readme += `    <a href="https://github.com/${username}/${repo2.name}"><img src="https://img.shields.io/badge/View-Repository-9D4BFF?style=flat-square&logo=github&logoColor=white&labelColor=0D1117" alt="View" /></a>\n`;
        readme += `  </div>\n`;
        readme += `</td>\n`;
      } else {
        readme += `<td width="50%"></td>\n`;
      }
      
      readme += `</tr>\n`;
    }
    readme += `</table>\n\n`;
  } else if (topRepo) {
    readme += `<table>\n`;
    readme += `<tr>\n`;
    readme += `<td width="100%">\n`;
    readme += `  <h3><a href="https://github.com/${username}/${topRepo.name}">${topRepo.name}</a></h3>\n`;
    readme += `  <p>${topRepo.description || "A project I'm working on"}</p>\n`;
    readme += `  <p>\n`;
    readme += `    <img src="https://img.shields.io/github/stars/${username}/${topRepo.name}?style=flat-square&logo=github" alt="Stars" />\n`;
    readme += `    <img src="https://img.shields.io/badge/View-Repository-9D4BFF?style=flat-square&logo=github" alt="View" />\n`;
    readme += `  </p>\n`;
    readme += `</td>\n`;
    readme += `</tr>\n`;
    readme += `</table>\n\n`;
  }

  readme += `---\n\n`;

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

  // DevCard Section
  if (devcardUrl) {
    readme += `---\n\n`;
    readme += `## 🎴 My DevCard\n\n`;
    readme += `<div align="center">\n`;
    readme += `  <iframe src="${devcardUrl}" width="100%" height="600" frameborder="0" scrolling="no" title="DevCard"></iframe>\n`;
    readme += `</div>\n\n`;
  }

  readme += `---\n\n`;

  // Connect Section
  readme += `## 📫 Connect with Me\n\n`;
  readme += `<p align="left">\n`;
  if (profile.blog) {
    readme += `  <a href="${profile.blog}" target="_blank"><img src="https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=About.me&logoColor=white" alt="Portfolio" /></a>\n`;
  }
  if (profile.twitterUsername) {
    readme += `  <a href="https://twitter.com/${profile.twitterUsername}" target="_blank"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter" /></a>\n`;
  }
  readme += `  <a href="https://github.com/${username}" target="_blank"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>\n`;
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

