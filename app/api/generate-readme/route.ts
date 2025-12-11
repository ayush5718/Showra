import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { groupLanguagesByCategory, getIconNamesString, mapLanguageToIcon } from "@/lib/utils/format/languageMapper";
import { postProcessReadme } from "@/lib/utils/format";
import { detectTechnologies } from "@/lib/utils/transform/detectTechnologies";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("⚠️ GEMINI_API_KEY is not set in environment variables");
}

async function generateReadmeWithGemini(
  prompt: string,
  apiKey: string,
  model: string = "gemini-2.0-flash"
) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model: model });

    const result = await genModel.generateContent(prompt);
    const text = result.response.text();

    if (!text || text.trim() === "") {
      throw new Error("Empty response from Gemini API");
    }

    // Remove markdown code blocks if present (handle multiple formats)
    let readmeText = text.trim();
    
    // Remove code blocks with markdown, html, or no language specified
    const codeBlockPatterns = [
      /```(?:markdown|md|html)?\s*([\s\S]*?)\s*```/g,
      /```\s*([\s\S]*?)\s*```/g,
    ];
    
    for (const pattern of codeBlockPatterns) {
      const matches = readmeText.match(pattern);
      if (matches) {
        // Extract content from code blocks
        readmeText = readmeText.replace(pattern, '$1');
      }
    }
    
    // Clean up any remaining markdown code block markers
    readmeText = readmeText.replace(/^```[\w]*\s*/gm, '').replace(/\s*```$/gm, '');
    readmeText = readmeText.trim();

    return readmeText;
  } catch (error: any) {
    const status =
      error.status || error.code || error.error?.code || error.error?.status;
    const errorMessage = (
      error.message ||
      error.error?.message ||
      ""
    ).toLowerCase();

    const isRateLimit =
      status === 429 ||
      errorMessage.includes("429") ||
      errorMessage.includes("quota");
    const isServiceUnavailable =
      status === 503 ||
      errorMessage.includes("503") ||
      errorMessage.includes("overloaded") ||
      errorMessage.includes("unavailable");

    if (isRateLimit || isServiceUnavailable) {
      const errorType = isServiceUnavailable
        ? "SERVICE_UNAVAILABLE"
        : "RATE_LIMIT_EXCEEDED";
      throw new Error(errorType);
    }

    if (
      model === "gemini-2.0-flash" &&
      (error.message?.includes("not found") ||
        error.message?.includes("not supported"))
    ) {
      console.log("Trying fallback model: gemini-1.5-flash");
      try {
        return await generateReadmeWithGemini(prompt, apiKey, "gemini-1.5-flash");
      } catch (fallbackError) {
        throw error;
      }
    }

    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables.",
        },
        { status: 500 }
      );
    }

    const data = await request.json();

    const {
      profile,
      stats,
      languages,
      repositories,
      topRepo,
      bio,
      location,
      company,
      blog,
      twitterUsername,
    } = data;

    // Build repository information as structured data for AI analysis
    const reposInfo =
      repositories && repositories.length > 0
        ? JSON.stringify(repositories.slice(0, 10).map((repo: any) => ({
            name: repo.name,
            description: repo.description || "No description",
            stars: repo.stars || repo.stargazers_count || 0,
            language: repo.language || "Unknown",
            topics: repo.topics || [],
            url: repo.html_url || `https://github.com/${profile?.login || 'user'}/${repo.name}`
          })), null, 2)
        : "No repositories available";

    // Build languages info with intelligent categorization
    const languagesInfo =
      languages && languages.length > 0
        ? languages
            .slice(0, 10)
            .map((lang: any) => `- ${lang.name}: ${lang.percentage}%`)
            .join("\n")
        : "No language data available";

    // Detect technologies from repositories for better tech stack
    const detectedTechs = repositories && repositories.length > 0 
      ? detectTechnologies(repositories.slice(0, 10).map((repo: any) => ({
          name: repo.name,
          description: repo.description || '',
          language: repo.language,
          topics: repo.topics || []
        })))
      : [];

    // Group languages by category for intelligent tech stack organization
    const groupedLanguages = languages && languages.length > 0
      ? groupLanguagesByCategory(languages.slice(0, 15))
      : { languages: [], frontend: [], backend: [], database: [], devops: [], tools: [] };

    // Build tech stack mapping guide for AI
    const techStackGuide = `
TECH STACK ICON MAPPING GUIDE (Use these exact mappings):
${[
  ...groupedLanguages.languages.map(l => `- ${l.name} → icon: "${l.iconName}"`),
  ...groupedLanguages.frontend.map(l => `- ${l.name} → icon: "${l.iconName}" (Frontend)`),
  ...groupedLanguages.backend.map(l => `- ${l.name} → icon: "${l.iconName}" (Backend)`),
  ...groupedLanguages.database.map(l => `- ${l.name} → icon: "${l.iconName}" (Database)`),
  ...groupedLanguages.devops.map(l => `- ${l.name} → icon: "${l.iconName}" (DevOps)`),
  ...groupedLanguages.tools.map(l => `- ${l.name} → icon: "${l.iconName}" (Tool)`),
].join('\n')}

DETECTED TECHNOLOGIES FROM REPOSITORIES:
${detectedTechs.length > 0 
  ? detectedTechs.map(t => `- ${t.name} (confidence: ${t.confidence}%)`).join('\n')
  : 'None detected'}`;

    const devcardUrl = data.devcardUrl || '';
    const username = profile?.login || "developer";
    
    const prompt = `You are an EXPERT GitHub README architect and AI content strategist. Your task is to create a WORLD-CLASS, professional GitHub profile README that is:
- Visually stunning and immediately impressive
- Professionally written with authentic, compelling content
- Technically accurate based on the developer's actual work
- GitHub-compatible (all HTML renders correctly on GitHub)
- Unique and memorable (something others would want to copy)

CRITICAL TECHNICAL REQUIREMENTS:
1. HTML RENDERING: Write HTML tags directly (NOT in code blocks) so they render on GitHub
2. MARKDOWN SYNTAX: Use markdown for headers (#, ##), lists, links - but HTML for advanced styling
3. NO CODE BLOCKS: NEVER wrap output in triple backticks - write raw markdown/HTML
4. GITHUB COMPATIBILITY: Only use HTML/CSS that GitHub markdown supports
5. FORMATTING: Every image markdown ![](url) must be on its own line with proper spacing
6. VALIDATION: Ensure all URLs are correct, all usernames match, all syntax is valid

INTELLIGENT CONTENT GENERATION:
- Deeply analyze repositories to understand the developer's expertise and interests
- Write personalized, authentic content - not generic templates
- Create compelling narratives that tell a story about their coding journey
- Highlight unique strengths and achievements based on actual data
- Make connections between projects to show growth and learning
- Write descriptions that are specific, not vague or generic
- Use repository topics and descriptions to infer technologies and skills

DEVELOPER PROFILE:
- Name: ${profile?.name || profile?.login || "Developer"}
- Username: ${username}
- Bio: ${bio || "No bio available"}
- Location: ${location || "Not specified"}
- Company: ${company || "Not specified"}
- Blog/Portfolio: ${blog || "Not available"}
- Twitter: ${twitterUsername || "Not available"}

STATISTICS:
- Repositories: ${stats?.repos || 0}
- Stars Received: ${stats?.stars || 0}
- Forks: ${stats?.forks || 0}
- Contributions: ${stats?.contributions || 0}
- Followers: ${stats?.followers || 0}

TOP REPOSITORY:
${topRepo ? `- ${topRepo.name}: ${topRepo.description || "No description"} (${topRepo.stars || 0} stars)` : "No top repository"}

LANGUAGES:
${languagesInfo}

REPOSITORIES DATA (Analyze these deeply and generate compelling descriptions):
${reposInfo}

${techStackGuide}

INTELLIGENT REPOSITORY ANALYSIS REQUIRED:
- Analyze repository names, descriptions, and topics to understand the developer's expertise
- Identify patterns: Are they a full-stack developer? Frontend specialist? Backend engineer? DevOps expert?
- Create compelling project descriptions that highlight what makes each project special
- Use repository data to write personalized, authentic content about their work
- If repositories show specific domains (e.g., AI/ML, web apps, mobile apps), reflect that in the bio
- Generate project cards that tell a story, not just list features
- Make connections between projects to show growth and learning trajectory

${devcardUrl ? `DEVCARD URL: ${devcardUrl}\nCRITICAL: If the URL ends with .png/.jpg/.jpeg, it's an IMAGE URL - embed it directly as: <img src="${devcardUrl}" alt="My DevCard" width="600" /> or ![My DevCard](${devcardUrl})\nIf it's a page URL (ends with /card/username), use a clickable badge: <a href="${devcardUrl}" target="_blank"><img src="https://img.shields.io/badge/View_My_DevCard-00E5FF?style=for-the-badge&logo=github&logoColor=white" alt="View My DevCard" /></a>\nGitHub READMEs do NOT support iframes or interactive components - only static images and links.` : ''}

MANDATORY SECTIONS - Generate ALL of these in this exact order with CREATIVE, MODERN designs:

CRITICAL: Follow this exact order - do not rearrange sections or place content outside of designated sections.

1. **SOCIAL MEDIA BADGES** (Top Section - MUST BE FIRST):
   - Create a row of professional social media badges using shields.io for-the-badge style
   - Include badges for: LinkedIn, GitHub, Twitter (if available), Instagram (if available), YouTube (if available), Portfolio/Blog (if available)
   - Format: <a href="[URL]"><img align="left" alt="[label]" width="100px" src="https://img.shields.io/badge/[Label]-[Color]?style=for-the-badge&logo=[Logo]&logoColor=white" /></a>
   - Use proper spacing: <br><br> between rows if needed
   - Colors: LinkedIn (0A66C2), GitHub (181717), Twitter (1DA1F2), Instagram (E4405F), YouTube (FF0000), Portfolio (000000)
   - Make it visually appealing with proper alignment

2. **NAME + HERO SECTION** (MUST BE STUNNING AND UNIQUE):
   - Start with: # Hey Everyone! I'm [Name](https://github.com/${username})
   - Add <br><br> for spacing
   - Create a two-column layout using HTML divs:
     - Left column: Name, tagline, and key information
     - Right column: Animated coding GIF or terminal animation
   - Use: <div><img align="right" src="https://i.imgur.com/mChG9re.gif" width="40%"/></div> for right-aligned animation
   - OR use terminal GIF: <img align="right" src="https://github.com/${username}/${username}/blob/main/terminal.gif" width="40%"/>
   - Include profile views badge: <img src="https://komarev.com/ghpvc/?username=${username}&color=00a0a0&style=plastic" />
   - Add GitHub Trophy: <a href="https://github.com/ryo-ma/github-profile-trophy"><img src="https://github-profile-trophy.vercel.app/?username=${username}&column=8&theme=onedark&no-frame=true&no-bg=true"/></a>
   - Use creative tagline: <h4 align="center"><samp>[Professional tagline based on their work]</samp></h4>
   - Make it stand out with unique styling

3. **ABOUT ME / BIOGRAPHY** (Enhanced with Icons and Structure):
   - Section header: ## 🚀 About Me
   - Use a creative layout with icons and badges
   - Start with 2-3 compelling sentences about what you do, your passion, and goals
   - Include animated badges for key info:
     - Location badge using shields.io format
     - Company badge using shields.io format
   - If including a quote or motto, format it properly in a styled box:
     * Format: <div align="center"><blockquote><p><em>"Quote text here"</em></p></blockquote></div>
     * OR use a simpler format: <p align="center"><em>"Quote text here"</em></p>
     * CRITICAL: DO NOT place quotes at the top of the README, before the About Me section, or outside of any section
     * Quotes belong INSIDE the About Me section only, AFTER the section header (## 🚀 About Me) and main bio text
     * Structure should be: Section header → Main bio text → Quote (if included) → Badges
   - Use professional but engaging tone
   - Include stats badges: <img src="https://img.shields.io/badge/Repositories-${stats?.repos || 0}-blue?style=flat-square" />

4. **SKILLS / TECH STACK** (Enhanced with Icon APIs):
   - Section header: ## 💻 Tech Stack
   - Use skills.syvixor.com or skillicons.dev API for beautiful skill icons
   - USE THE EXACT ICON MAPPINGS PROVIDED ABOVE in "TECH STACK ICON MAPPING GUIDE"
   - CRITICAL FORMATTING RULES (MUST FOLLOW EXACTLY):
     * DO NOT use dashes, bullets, or list markers before image markdown syntax
     * DO NOT wrap image markdown in code blocks, backticks, or any formatting
     * DO NOT write category names as plain text - they MUST be markdown headers with ###
     * Write the image markdown syntax directly so it renders as actual images on GitHub
     * Each category MUST start with ### (three hashes) followed by the category name
     * Each category format: header on one line, blank line, then image markdown on next line
   - CORRECT FORMAT (copy this structure exactly):
     ### Languages

     ![](https://skills.syvixor.com/api/icons?i=js,ts,python,java&perline=18)

     ### Frontend

     ![](https://skills.syvixor.com/api/icons?i=react,nextjs,html,css,tailwind&perline=18)

     ### Backend

     ![](https://skillicons.dev/icons?i=nodejs,express,django,python&perline=18)

     ### Database

     ![](https://skills.syvixor.com/api/icons?i=postgresql,mongodb,redis&perline=18)

     ### DevOps

     ![](https://skills.syvixor.com/api/icons?i=docker,kubernetes,aws,terraform&perline=18)
   - WRONG FORMATS (DO NOT DO):
     * "Languages" (missing ###)
     * "- ![](url)" (with dash - WRONG)
     * "Languages: ![](url)" (on same line - WRONG)
     * No blank line between header and image - WRONG
     * Wrapped in code blocks - WRONG
   - INTELLIGENT ORGANIZATION:
     * Only show categories that actually have technologies (don't show empty categories)
     * Group by: Languages, Frontend, Backend, Database, DevOps, Tools
     * Use the exact icon names from the mapping guide above
     * Mix APIs: Use skills.syvixor.com for some categories, skillicons.dev for others for variety
     * Limit to 8-10 icons per category to keep it clean
     * Prioritize technologies detected from repositories + top languages

5. **CURRENT WORK / LEARNING** (MUST BE CREATIVE AND VISUAL):
   - Section header: ## 🔨 Currently Working On / Learning
   - Use animated badges or cards design
   - Create visual cards for each item using HTML tables
   - Each card should have: icon, title, description, and status badges
   - Use progress bars or animated indicators
   - Include GitHub links with badges
   - Add "In Progress" or "Learning" badges
   - Make it interactive-looking with modern badges
   - Use creative layouts with icons and descriptions
   - Format as cards or grid layout (2-column table)

6. **FEATURED REPOSITORIES** (Using GitHub Stats API Pins):
   - Section header: ## 🚀 Featured Projects / Check out my Repositories
   - Use GitHub readme-stats pin API for beautiful repository cards
   - Format: <a href="https://github.com/${username}/[repo]"><img align="[left/right/center]" src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=[repo]" /></a>
   - Show top 2-4 repositories in a grid layout
   - Use <span> wrapper with proper alignment
   - Add horizontal rule: <hr> before and after
   - Make repositories clickable and visually appealing
   - Include repository descriptions and stats automatically via API

7. **GITHUB STATS & TROPHIES**:
   - Section header: ## 📊 GitHub Stats
   - GitHub Trophy (centered, full width): <p align="center"><a href="https://github.com/ryo-ma/github-profile-trophy"><img width=800 src="https://github-profile-trophy.vercel.app/?username=${username}&column=8&theme=onedark&no-frame=true&no-bg=true"/></a></p>
   - GitHub stats card: <img src="https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=radical&hide_border=true&bg_color=0D1117&title_color=58A6FF&icon_color=58A6FF&include_all_commits=true&count_private=true" />
   - Top languages card: <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=radical&hide_border=true&bg_color=0D1117&title_color=58A6FF&langs_count=8" />
   - GitHub streak stats: <img src="https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=radical&hide_border=true&background=0D1117&ring=58A6FF&fire=58A6FF&currStreakLabel=58A6FF" />
   - Activity graph: <img src="https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=radical&hide_border=true&bg_color=0D1117&color=58A6FF&line=58A6FF&point=58A6FF&area=true&area_color=58A6FF" />
   - Arrange stats in a visually appealing layout (side-by-side or stacked)
   - Add horizontal rule separators: <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

8. **DEVCARD SECTION** (if devcardUrl provided):
   - Section header: ## 🎴 My DevCard
   - CRITICAL: GitHub READMEs only support STATIC IMAGES, not interactive components or iframes
   - If devcardUrl is an image URL (ends with .png/.jpg/.jpeg): 
     * Use: <p align="center"><img src="${devcardUrl}" alt="My DevCard" width="600" /></p>
     * Or markdown: <p align="center">![My DevCard](${devcardUrl})</p>
     * Make the image clickable by wrapping: <p align="center"><a href="${devcardUrl.replace(/\.(png|jpg|jpeg)$/i, '') || devcardUrl}" target="_blank"><img src="${devcardUrl}" alt="My DevCard" width="600" /></a></p>
   - If devcardUrl is a page URL (contains /card/):
     * Use a clickable badge: <p align="center"><a href="${devcardUrl}" target="_blank"><img src="https://img.shields.io/badge/View_My_DevCard-00E5FF?style=for-the-badge&logo=github&logoColor=white" alt="View My DevCard" /></a></p>
     * Or a text link: <p align="center"><a href="${devcardUrl}" target="_blank">🎴 <b>View My Interactive DevCard</b></a></p>
   - Make it visually appealing and centered
   - Add description: "Check out my developer profile card with real-time GitHub stats!"

9. **CONTACT / SOCIAL LINKS** (Enhanced Badge Layout):
   - Section header: ## 📫 Connect with Me
   - Use for-the-badge style badges in a row
   - Format: <a href="[URL]" target="_blank"><img src="https://img.shields.io/badge/[Label]-[Color]?style=for-the-badge&logo=[Logo]&logoColor=white" alt="[Label]" /></a>
   - Include: LinkedIn, GitHub, Twitter, Portfolio/Blog, Email (if available)
   - Use <p align="left"> wrapper for alignment
   - Make badges clickable and professional
   - Add proper spacing between badges

10. **FUN / PERSONALITY SECTION**:
   - Section header: ## 💡 Fun Facts / About Me
   - Mini bio or interesting facts
   - Hobbies or interests (tech-related preferred)
   - A professional quote (optional)
   - Keep it clean, professional, not cringe
   - 2-3 bullet points max

11. **ACHIEVEMENTS / CERTIFICATIONS** (if applicable):
    - Section header: ## 🏆 Achievements & Certifications
    - Any notable achievements
    - Certifications
    - Hackathons or competitions
    - Open source contributions
    - Only include if there's actual content

ADVANCED WRITING STYLE (Follow these principles):
1. AUTHENTICITY: Write as if you know the developer personally - use their actual data
2. SPECIFICITY: Instead of "I work on projects" → "I build full-stack web applications using React and Node.js"
3. IMPACT: Focus on what they've accomplished, not just what they do
4. STORYTELLING: Create a narrative flow - where they started, what they're doing now, where they're going
5. CONVERSATIONAL: Professional but human - avoid corporate speak or buzzword bingo
6. DATA-DRIVEN: Reference actual stats, repositories, and technologies from their profile
7. UNIQUE: Every sentence should add value - cut filler and generic statements
8. ACTIVE VOICE: "I build..." not "Projects are built by me..."
9. SHOW DON'T TELL: Instead of "I'm passionate" → show through project descriptions
10. TECHNICAL ACCURACY: Only mention technologies they actually use (from repos/languages data)

CREATIVE DESIGN PRINCIPLES:
- Use radical theme for GitHub stats (dark, professional)
- Create visual hierarchy with proper spacing
- Use HTML tables for grid layouts and card designs
- Use modern badges from shields.io (for-the-badge style)
- Combine markdown and HTML strategically
- Make it responsive and GitHub-friendly
- Include proper spacing between sections
- Use dividers (---) between major sections
- Center-align headers, left-align content
- Use animated typing SVG for hero section
- Create card-like layouts for projects
- Use colorful badges and icons
- Make sections visually distinct and attractive
- Use HTML tables for side-by-side layouts
- Include progress indicators and animated elements
- Create modern, professional card designs

AI-POWERED CREATIVITY INSTRUCTIONS:
1. REPOSITORY INTELLIGENCE:
   - Analyze repository names and descriptions to write personalized project highlights
   - Identify themes (e.g., "Passionate about AI/ML" if they have ML repos)
   - Write unique descriptions for each featured project (don't repeat generic text)
   - Highlight what makes each project special or noteworthy

2. VISUAL HIERARCHY:
   - Start with social badges (first impression)
   - Hero section with two-column layout (GIF + content)
   - Use GitHub Trophy prominently if they have achievements
   - Create visual flow: Badges → Hero → About → Tech → Projects → Stats → Contact

3. TECHNICAL EXCELLENCE:
   - Use exact icon mappings from the guide provided
   - Ensure all GitHub stats URLs use the correct username
   - Verify all badge URLs and repository links are valid
   - Test that all HTML will render correctly on GitHub

4. PERSONALIZATION POWER:
   - If they have many stars → highlight their popular projects
   - If they contribute a lot → emphasize their open source work
   - If they're at a company → mention it naturally
   - If they have a specific tech focus → make that clear throughout
   - Use their actual bio/description to inform the About Me section

5. CONTENT QUALITY:
   - Write project descriptions that make readers want to click
   - Create taglines that reflect their actual work (not generic)
   - Make the README tell a coherent story about who they are as a developer
   - Include specific technologies, numbers, and achievements

FINAL OUTPUT REQUIREMENTS:
1. FORMAT: Raw markdown/HTML ready for GitHub - NO code blocks, NO triple backticks
2. VALIDATION: All URLs must be correct, all usernames must match the provided data (${username})
3. COMPLETENESS: Include ALL mandatory sections in the correct order
4. QUALITY: Every section should be well-written, specific, and valuable
5. GITHUB COMPATIBILITY: Test in your mind - will this render correctly on GitHub?

CRITICAL SYNTAX RULES (Must follow exactly):
1. TECH STACK ICONS: 
   - Format: ### CategoryName (with ###, three hashes)
   - Then blank line (required)
   - Then: ![](https://skills.syvixor.com/api/icons?i=icon1,icon2&perline=18)
   - Use exact icon names from the mapping guide provided above
   - NO dashes, NO list markers, NO code blocks, NO indentation

2. QUOTES/MOTTOS:
   - ONLY inside About Me section (## 🚀 About Me)
   - Format: <div align="center"><blockquote><p><em>"text"</em></p></blockquote></div>
   - NEVER at the top of the README or before sections

3. HTML TAGS:
   - Write directly: <div>, <img>, <table>, etc.
   - NO wrapping in code blocks (no triple backticks)
   - Must be valid HTML that GitHub markdown supports

4. IMAGES & URLS:
   - Use markdown syntax: ![](url) for tech stack icons
   - Or HTML: <img src="url" /> for badges and stats
   - All GitHub stats URLs must use correct username: ${username}
   - Verify all repository URLs are correct

5. SECTION ORDER:
   - Social Badges → Hero → About Me → Tech Stack → Currently Working → Featured Projects → GitHub Stats → DevCard (if provided) → Contact → Fun Facts → Achievements

QUALITY CHECKLIST (Before finalizing output):
✓ All sections included and in correct order
✓ Tech stack uses correct icon mappings and proper format (### Header, blank line, ![](url))
✓ Repository descriptions are specific and compelling (not generic)
✓ All URLs and usernames are correct and valid
✓ Content is personalized based on actual repository data provided
✓ No generic or filler content - every sentence adds value
✓ Visual elements (badges, stats, trophies) are included and working
✓ README tells a cohesive story about the developer
✓ Formatting matches GitHub markdown standards
✓ No code blocks wrapping the output
✓ Ready to copy-paste directly into GitHub README.md

Return ONLY the complete, polished README content. Make it exceptional, professional, authentic, and visually stunning. This should be a README that makes people think "Wow, I want my profile to look like this!" Every word should be intentional, every section should be valuable, and the entire README should reflect the developer's unique expertise and personality based on their actual GitHub data.`;

    let readme = await generateReadmeWithGemini(
      prompt,
      GEMINI_API_KEY,
      "gemini-2.0-flash"
    );

    // Validate and post-process README
    if (!readme || readme.trim().length < 100) {
      console.warn("Generated README seems too short, using fallback");
      throw new Error("Generated README content is too short or empty");
    }

    // Post-process to fix common issues
    readme = postProcessReadme(readme);
    
    // Final validation
    if (readme.length < 100) {
      throw new Error("Post-processed README content is too short");
    }

    return NextResponse.json({ readme });
  } catch (error) {
    console.error("Error in generate-readme API:", error);

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message === "RATE_LIMIT_EXCEEDED") {
        return NextResponse.json(
          {
            error: "RATE_LIMIT_EXCEEDED",
            message: "API rate limit exceeded. Please try again in a few moments.",
          },
          { status: 429 }
        );
      }

      if (error.message === "SERVICE_UNAVAILABLE") {
        return NextResponse.json(
          {
            error: "SERVICE_UNAVAILABLE",
            message: "AI service is currently overloaded. Please try again in a few moments.",
          },
          { status: 503 }
        );
      }

      // Handle validation errors
      if (error.message.includes("too short") || error.message.includes("empty")) {
        console.error("Generated README validation failed:", error.message);
        return NextResponse.json(
          {
            error: "GENERATION_FAILED",
            message: "Failed to generate valid README content. Please try again.",
          },
          { status: 500 }
        );
      }
    }

    // Generic error response with helpful message
    return NextResponse.json(
      {
        error: "API_ERROR",
        message: error instanceof Error 
          ? (error.message.includes("API") || error.message.includes("key") 
              ? error.message 
              : "Failed to generate README. Please try again.")
          : "Unknown error occurred while generating README.",
      },
      { status: 500 }
    );
  }
}

