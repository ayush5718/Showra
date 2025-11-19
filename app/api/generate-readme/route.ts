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

1. **NAME + SHORT TAGLINE** (Hero Section - MUST BE STUNNING):
   - Name MUST be centered: <h1 align="center"> with animated typing SVG
   - Tagline/Bio MUST be left-aligned: <h3 align="left">[Tagline]</h3>
   - Use reliable coding GIF: https://i.imgur.com/mChG9re.gif (DO NOT use broken sources)
   - Center the coding animation image: <div align="center"><img src="https://i.imgur.com/mChG9re.gif" width="400" /></div>
   - Profile views badge: <p align="left">
   - GitHub trophy badges: <p align="left">
   - Use proper spacing between elements (margin: 10px-20px)
   - Make bio/tagline clearly visible with good color contrast
   - CRITICAL: Write HTML directly, NOT in code blocks - it must render as HTML

2. **ABOUT ME**:
   - Section header: ## 🚀 About Me
   - Use a creative layout with icons and badges
   - 2-3 compelling sentences about what you do, your passion, and goals
   - Include animated badges for key info:
     - Location badge using shields.io format
     - Company badge using shields.io format
   - Add a quote or motto in a styled box
   - Use professional but engaging tone
   - Include stats badges: <img src="https://img.shields.io/badge/Repositories-${stats?.repos || 0}-blue?style=flat-square" />

3. **SKILLS / TECH STACK**:
   - Section header: ## 💻 Tech Stack
   - Group by categories with subheadings (Frontend, Backend, Tools & DevOps, etc.)
   - Each category MUST be in a beautiful gradient box with:
     - Gradient background: linear-gradient(135deg, rgba(color, 0.1) 0%, rgba(0, 0, 0, 0.5) 100%)
     - Colored border: 2px solid rgba(color, 0.4)
     - Border radius: 12px
     - Padding: 24px
     - Box shadow for depth
     - display: flex; flex-wrap: wrap; gap: 16px
   - Each technology MUST have:
     - Large icon (36x36px) from devicons with glow effect: filter: drop-shadow(0 0 4px rgba(color, 0.5))
     - Technology name as text (not badge): <span style="color: #ffffff; font-weight: 600; font-size: 14px;">[Name]</span>
     - Wrapped in a dark box: background: rgba(0, 0, 0, 0.6); padding: 12px 16px; border-radius: 10px
     - Colored border matching category
     - Box shadow for depth
   - All technologies in a category should appear in ONE row that wraps responsively
   - Use gradient boxes per category (cyan gradient for Frontend, pink gradient for Backend, purple gradient for Tools)
   - Make it modern and clean with icons and text labels
   - CRITICAL: Write HTML directly, NOT in code blocks - it must render as HTML

4. **CURRENT WORK / LEARNING** (MUST BE CREATIVE AND VISUAL):
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

5. **PROJECTS TO HIGHLIGHT** (MUST BE STUNNING AND CREATIVE):
   - Section header: ## 🚀 Featured Projects
   - Use HTML tables to create card-like layouts in a 2-column grid
   - Each project card MUST have inline styles for proper rendering:
     - Dark background: background-color: rgba(0, 0, 0, 0.5)
     - Colored border: border: 2px solid rgba(88, 166, 255, 0.4)
     - Rounded corners: border-radius: 12px
     - Proper padding: padding: 20px
   - Project name MUST be styled: color: #58A6FF, font-size: 1.2em, font-weight: 600
   - Description MUST be styled: color: rgba(255, 255, 255, 0.95)
   - Use badges with labelColor=0D1117 for dark backgrounds
   - Truncate long names to 28 characters max
   - Make project names clearly visible and clickable
   - Use flex layout for badges: display: flex; flex-wrap: wrap; gap: 8px

6. **GITHUB STATS**:
   - Section header: ## 📊 GitHub Stats
   - GitHub stats card: <img src="https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=radical&hide_border=true&bg_color=0D1117&title_color=58A6FF&icon_color=58A6FF&include_all_commits=true&count_private=true" />
   - Top languages card: <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=radical&hide_border=true&bg_color=0D1117&title_color=58A6FF&langs_count=8" />
   - GitHub streak stats: <img src="https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=radical&hide_border=true&background=0D1117&ring=58A6FF&fire=58A6FF&currStreakLabel=58A6FF" />
   - Activity graph: <img src="https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=radical&hide_border=true&bg_color=0D1117&color=58A6FF&line=58A6FF&point=58A6FF&area=true&area_color=58A6FF" />
   - Arrange stats in a visually appealing layout (side-by-side or stacked)

7. **DEVCARD SECTION** (if devcardUrl provided):
   - Section header: ## 🎴 My DevCard
   - Include iframe: <iframe src="${devcardUrl}" width="100%" height="600" frameborder="0" scrolling="no" title="DevCard"></iframe>
   - Center it properly

8. **CONTACT / SOCIAL LINKS**:
   - Section header: ## 📫 Connect with Me
   - LinkedIn (if available)
   - Portfolio/Blog (if available)
   - Email (if available)
   - Twitter (if available)
   - GitHub link
   - Format as organized list or badges
   - Use professional icons

9. **FUN / PERSONALITY SECTION**:
   - Section header: ## 💡 Fun Facts / About Me
   - Mini bio or interesting facts
   - Hobbies or interests (tech-related preferred)
   - A professional quote (optional)
   - Keep it clean, professional, not cringe
   - 2-3 bullet points max

10. **ACHIEVEMENTS / CERTIFICATIONS** (if applicable):
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
- Hero section should be eye-catching with animated elements
- Projects section should use card layouts with badges
- Current Work section should use visual indicators
- Make it so attractive that others would want to copy the design
- Use modern web design principles
- Create visual interest with colors, badges, and layouts
- Make each section unique and memorable

CRITICAL OUTPUT FORMAT:
- Return ONLY the raw README content
- DO NOT wrap the output in markdown code blocks (triple backticks)
- Write HTML tags directly so they render as HTML, not as code
- Start directly with the content (e.g., h1 align="center" or # Header)
- The output should be ready to paste directly into a GitHub README.md file
- All HTML must be written directly, not in code blocks

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

