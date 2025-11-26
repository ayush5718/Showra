import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    // Build languages info
    const languagesInfo =
      languages && languages.length > 0
        ? languages
            .slice(0, 10)
            .map((lang: any) => `- ${lang.name}: ${lang.percentage}%`)
            .join("\n")
        : "No language data available";

    const devcardUrl = data.devcardUrl || '';
    const username = profile?.login || "developer";
    
    const prompt = `You are an expert at creating world-class, professional GitHub profile README files. Generate a comprehensive, engaging, and highly professional README that showcases the developer's expertise and personality.

CRITICAL REQUIREMENTS:
1. Use HTML tags for advanced styling BUT ensure they render properly (no code blocks showing)
2. Use markdown for basic formatting (headers, lists, links)
3. DO NOT wrap HTML in code blocks - write HTML directly so it renders
4. Analyze the repositories provided and generate appropriate styling based on their content
5. Create a professional, clean design with excellent visual hierarchy
6. Use professional badges, shields, and GitHub stats widgets
7. Include ALL required sections listed below
8. Make content engaging but professional - no cringe, no excessive emojis
9. Use emojis strategically and sparingly (1-2 per section max)
10. Write compelling, professional copy based on actual repository data
11. Include dynamic GitHub stats with proper URLs
12. Create sections that flow naturally and tell a story
13. IMPORTANT: Generate HTML that will render in GitHub markdown, not show as code

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

REPOSITORIES DATA (Analyze these and generate appropriate styling):
${reposInfo}

IMPORTANT: Analyze each repository's:
- Name and description to create compelling project cards
- Language to choose appropriate colors and icons
- Stars count to highlight popular projects
- Topics to understand tech stack used
- Generate styling that matches the repository's purpose and tech stack

${devcardUrl ? `DEVCARD IFRAME URL: ${devcardUrl}\nInclude this devcard iframe in a dedicated section.` : ''}

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
   - CRITICAL FORMATTING RULES:
     * DO NOT use dashes or list items before image markdown syntax
     * DO NOT wrap image markdown in code blocks or backticks
     * DO NOT write category names as plain text - they MUST be markdown headers
     * Write the image markdown syntax directly so it renders as images
     * Each category MUST start with ### (three hashes) followed by the category name
     * Each category should have: markdown header (###), blank line, then image markdown on next line
   - Correct format structure (MUST follow this exactly):
     * Line 1: ### Languages (MUST start with ###, not just "Languages")
     * Line 2: (blank line - REQUIRED)
     * Line 3: ![](https://skills.syvixor.com/api/icons?i=tech1,tech2,tech3&perline=18)
     * Line 4: (blank line before next category - REQUIRED)
   - Example of CORRECT output structure (copy this format exactly):
     ### Languages

     ![](https://skills.syvixor.com/api/icons?i=cpp,c,python,js,java,bash&perline=18)

     ### Frontend

     ![](https://skills.syvixor.com/api/icons?i=html,css,tailwind,javascript,react&perline=18)

     ### Backend

     ![](https://skillicons.dev/icons?i=django,php,nodejs,express&perline=18)
   - WRONG formats (DO NOT do any of these):
     * Languages (missing ### - will not render as header)
     * Languages: ![](url) (on same line - WRONG)
     * - ![](url) (with dash/list item - WRONG)
     * Languages\n![](url) (no blank line - WRONG)
     * \`\`\`markdown\n![](url)\n\`\`\` (in code block - WRONG)
   - Map languages from the provided data to appropriate icon names (e.g., JavaScript -> js, TypeScript -> ts, Python -> python, Node.js -> nodejs)
   - Use both APIs for variety: skills.syvixor.com and skillicons.dev
   - Only show categories that have technologies based on the developer's actual languages/repos
   - Group technologies logically based on the languages provided in the data
   - Make it visually organized and easy to scan

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
   - Include iframe: <iframe src="${devcardUrl}" width="100%" height="600" frameborder="0" scrolling="no" title="DevCard"></iframe>
   - Center it properly

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

WRITING STYLE:
- Professional but approachable
- Concise and impactful
- No filler words
- Use active voice
- Show, don't tell
- Be specific about technologies and projects
- Write compelling descriptions

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

SPECIAL INSTRUCTIONS FOR CREATIVITY:
- Start with social media badges at the very top - this is the first thing people see
- Hero section should use two-column layout with animated GIF on right side
- Use skills icon APIs (skills.syvixor.com, skillicons.dev) for beautiful skill displays
- Include GitHub Trophy section prominently
- Use repository pins API for featured projects
- Add horizontal rule separators between major sections
- Make it so attractive and unique that others would want to copy the design
- Use modern web design principles with proper spacing and alignment
- Create visual interest with colors, badges, icons, and layouts
- Make each section unique and memorable
- Include profile views counter and GitHub Trophy badges
- Use <samp> tags for professional taglines
- Add animated elements and GIFs where appropriate

CRITICAL OUTPUT FORMAT:
- Return ONLY the raw README content
- DO NOT wrap the output in markdown code blocks (triple backticks)
- Write HTML tags directly so they render as HTML, not as code
- Start directly with the content (e.g., h1 align="center" or # Header)
- The output should be ready to paste directly into a GitHub README.md file
- All HTML must be written directly, not in code blocks
- MOST IMPORTANT RULES:
  1. For tech stack image markdown syntax like ![](url), write it EXACTLY as shown with no wrapping, no dashes before it, no code blocks, no indentation. It must be on its own line after the category header (### Category Name) with a blank line before it
  2. Category headers in Tech Stack MUST start with ### (three hashes) - NEVER write just "Languages" or "Frontend", always write "### Languages", "### Frontend", etc.
  3. DO NOT place quotes or mottos at the top level before sections - quotes belong INSIDE the About Me section, formatted properly
  4. Each tech stack category must follow this exact format: "### CategoryName" on one line, blank line, then "![](url)" on next line

Return ONLY the complete README content in markdown/HTML format. Make it comprehensive, professional, engaging, visually stunning, and CREATIVE. Include ALL sections listed above. Use HTML extensively for advanced styling, layouts, and visual appeal. Make it stand out from typical READMEs.`;

    const readme = await generateReadmeWithGemini(
      prompt,
      GEMINI_API_KEY,
      "gemini-2.0-flash"
    );

    return NextResponse.json({ readme });
  } catch (error) {
    console.error("Error in generate-readme API:", error);

    if (error instanceof Error) {
      if (error.message === "RATE_LIMIT_EXCEEDED") {
        return NextResponse.json(
          {
            error: "RATE_LIMIT_EXCEEDED",
            message: "API rate limit exceeded. Please try again later.",
          },
          { status: 429 }
        );
      }

      if (error.message === "SERVICE_UNAVAILABLE") {
        return NextResponse.json(
          {
            error: "SERVICE_UNAVAILABLE",
            message: "Gemini API is currently overloaded. Please try again later.",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "API_ERROR",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

