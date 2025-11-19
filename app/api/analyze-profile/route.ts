import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment variable (server-side only, not exposed to frontend)
// Use GEMINI_API_KEY (without NEXT_PUBLIC_ prefix) to keep it server-side only
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("⚠️ GEMINI_API_KEY is not set in environment variables");
}

async function generateWithGemini(
  prompt: string,
  apiKey: string,
  model: string = "gemini-2.0-flash"
) {
  try {
    // Use the official @google/generative-ai package
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model: model });

    const result = await genModel.generateContent(prompt);

    // Extract text from response using the correct API
    const text = result.response.text();

    if (!text || text.trim() === "") {
      throw new Error("Empty response from Gemini API");
    }

    // Parse JSON response
    let jsonText = text.trim();
    // Remove markdown code blocks if present
    const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonText = jsonMatch[1];
    }

    // Extract JSON object
    const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonText = jsonObjectMatch[0];
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error(
        "Failed to parse JSON from response:",
        jsonText.substring(0, 500)
      );
      throw new Error("Invalid JSON response from Gemini API");
    }

    if (!analysis.expertise || !Array.isArray(analysis.expertise)) {
      throw new Error("Invalid analysis structure - missing expertise array");
    }

    if (!analysis.summary || typeof analysis.summary !== "string") {
      throw new Error("Invalid analysis structure - missing summary");
    }

    // commitsDescription is optional, but if present should be a string
    if (
      analysis.commitsDescription &&
      typeof analysis.commitsDescription !== "string"
    ) {
      // Remove invalid commitsDescription
      delete analysis.commitsDescription;
    }

    // Validate techStack
    if (
      analysis.techStack &&
      (!Array.isArray(analysis.techStack) ||
        !analysis.techStack.every(
          (item: any) =>
            item &&
            typeof item.name === "string" &&
            typeof item.percentage === "number"
        ))
    ) {
      delete analysis.techStack;
    }

    // Validate strengthAreas
    if (
      analysis.strengthAreas &&
      (!Array.isArray(analysis.strengthAreas) ||
        !analysis.strengthAreas.every(
          (item: any) =>
            item &&
            typeof item.category === "string" &&
            typeof item.rating === "number" &&
            item.rating >= 1 &&
            item.rating <= 10
        ))
    ) {
      delete analysis.strengthAreas;
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    // Handle 429 (rate limit) and 503 (service overloaded) errors - don't retry, return error immediately
    const status =
      error.status || error.code || error.error?.code || error.error?.status;
    const errorMessage = (
      error.message ||
      error.error?.message ||
      ""
    ).toLowerCase();
    const errorStatus = (error.error?.status || "").toLowerCase();

    // Check for rate limit (429) or service unavailable (503) errors
    const isRateLimit =
      status === 429 ||
      errorMessage.includes("429") ||
      errorMessage.includes("quota");
    const isServiceUnavailable =
      status === 503 ||
      errorMessage.includes("503") ||
      errorMessage.includes("overloaded") ||
      errorMessage.includes("unavailable") ||
      errorStatus === "unavailable";

    if (isRateLimit || isServiceUnavailable) {
      const errorType = isServiceUnavailable
        ? "SERVICE_UNAVAILABLE"
        : "RATE_LIMIT_EXCEEDED";
      console.warn(
        `${errorType} for model ${model} (status: ${status}). Using fallback analysis.`
      );
      throw new Error(errorType);
    }

    console.error(`Error with model ${model}:`, error);

    // Try fallback model if primary fails (only for non-rate-limit/service errors)
    if (
      model === "gemini-2.0-flash" &&
      (error.message?.includes("not found") ||
        error.message?.includes("not supported"))
    ) {
      console.log("Trying fallback model: gemini-1.5-flash");
      try {
        return await generateWithGemini(prompt, apiKey, "gemini-1.5-flash");
      } catch (fallbackError) {
        throw error; // Throw original error
      }
    }

    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is available
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

    // Build repository information string
    const reposInfo =
      data.repositories && data.repositories.length > 0
        ? data.repositories
            .slice(0, 10)
            .map(
              (repo: any) =>
                `- ${repo.name}: ${repo.description || "No description"} (${
                  repo.stars || 0
                } stars, ${repo.language || "N/A"})`
            )
            .join("\n")
        : "No repositories available";

    const prompt = `You are an expert developer analyst. Analyze this GitHub developer profile comprehensively and provide detailed insights:

DEVELOPER PROFILE:
- Name: ${data.profile.name || data.profile.login}
- Username: @${data.profile.login}
- Bio: ${data.profile.bio || "No bio provided"}
- Location: ${data.profile.location || "Not specified"}

STATISTICS:
- Total Repositories: ${data.stats.repos}
- Total Stars Received: ${data.stats.stars}
- Total Forks: ${data.stats.forks}
- Current Year Contributions: ${data.stats.contributions}

TOP REPOSITORIES (showing their work):
${reposInfo}

PROGRAMMING LANGUAGES (with usage percentage):
${data.languages
  .map(
    (l: { name: string; percentage: number }) => `- ${l.name}: ${l.percentage}%`
  )
  .join("\n")}

TOP REPOSITORY:
- Name: ${data.topRepo?.name || "N/A"}
- Stars: ${data.topRepo?.stars || 0}
- Description: ${data.topRepo?.description || "No description"}

ANALYSIS REQUIREMENTS:
Based on ALL the above information (repositories, languages, contributions, bio), provide a comprehensive analysis:

1. **Professional Summary** (max 120 characters): Write a clear, professional description that explains what field this developer specializes in, their expertise level, and what technologies they work with. Make it informative so anyone can understand their specialization. Example: "Web developer specializing in JavaScript, HTML, CSS, and TypeScript with full-stack capabilities."

2. **Skill Expertise Analysis**: Categorize their skills into areas like Frontend, Backend, Mobile, DevOps, Data Science, Full Stack, etc. For each category, provide:
   - Level (0-100 percentage)
   - Top 3 technologies they use in that category
   - Brief description

3. **Top 3 Professional Strengths**: Based on their repositories, contributions, and languages, identify their strongest areas.

4. **Relevant Skill Tags** (max 6): Technologies, frameworks, or domains they work with.

5. **Commits/Week Description** (max 80 characters): Write a brief, professional description of their coding style or approach based on their activity. Example: "Tends to write clean and modular frontend code." or "Focuses on performance and responsive design."

6. **Tech Stack** (array of top 3-5 technologies with percentages): Based on repositories, descriptions, and languages, identify the actual technologies/frameworks they use (e.g., React, Next.js, Node.js, Express, MongoDB, PostgreSQL, Docker, etc.). NOT just base languages like JavaScript, HTML, CSS. Calculate percentages based on how many repositories use each technology. Return as array of objects with "name" and "percentage" (0-100).

7. **Strength Areas** (array of top 3 dynamic categories with ratings out of 10): Based on their repositories, contributions, languages, and overall activity, identify their strongest skill areas. These should be DYNAMIC categories based on what they actually do (e.g., "Frontend", "Backend", "Full Stack", "Mobile", "DevOps", "Data Science", "Machine Learning", "Game Development", "Open Source", "API Development", etc.). NOT fixed categories - analyze what they're actually good at. For each category, provide a rating from 1-10 based on evidence from their repositories and contributions. Return as array of objects with "category" (string) and "rating" (number 1-10).

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just pure JSON):
{
  "expertise": [
    {
      "category": "Frontend",
      "level": 85,
      "technologies": ["React", "TypeScript", "CSS"],
      "description": "Strong frontend development skills with modern frameworks"
    }
  ],
  "summary": "Web developer specializing in JavaScript, HTML, CSS, and TypeScript with full-stack capabilities.",
  "strengths": ["Strong in React development", "Experienced with TypeScript", "Full-stack capabilities"],
  "tags": ["Full Stack", "React", "TypeScript", "Node.js", "JavaScript", "Git"],
  "commitsDescription": "Tends to write clean and modular frontend code.",
  "techStack": [
    { "name": "React", "percentage": 45 },
    { "name": "Next.js", "percentage": 30 },
    { "name": "Node.js", "percentage": 25 }
  ],
  "strengthAreas": [
    { "category": "Frontend", "rating": 8 },
    { "category": "Backend", "rating": 6 },
    { "category": "Dev Tools", "rating": 5 }
  ]
}`;

    // Use @google/generative-ai library with gemini-2.0-flash (official package)
    // GEMINI_API_KEY is only used server-side, never exposed to frontend
    return await generateWithGemini(prompt, GEMINI_API_KEY, "gemini-2.0-flash");
  } catch (error) {
    console.error("Error in analyze-profile API:", error);

    // Handle rate limit and service unavailable errors specifically
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
            message:
              "Gemini API is currently overloaded. Using fallback analysis.",
          },
          { status: 503 }
        );
      }
    }

    // For all other errors, return 500 but with a message that triggers fallback
    return NextResponse.json(
      {
        error: "API_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
