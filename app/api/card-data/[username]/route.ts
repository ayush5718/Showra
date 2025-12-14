import { NextRequest, NextResponse } from "next/server";
import { getPublicCardData } from "@/lib/utils/supabase/cardStorage";
import { getUserMetadataByUsername } from "@/lib/utils/supabase/userMetadata";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // First, try to get from public storage
    let cardData = await getPublicCardData(username);
    
    // If not found in public storage, try to get from user metadata (for backward compatibility)
    if (!cardData) {
      const metadata = await getUserMetadataByUsername(username);
      if (metadata?.githubData) {
        const githubData = metadata.githubData;

        // Transform the data to match CardWrapper props
        cardData = {
          username: username,
          profile: {
            login: githubData.profile?.login || username,
            name: githubData.profile?.name || null,
            avatarUrl: githubData.profile?.avatar_url || githubData.profile?.avatarUrl || "",
            bio: githubData.profile?.bio || null,
            company: githubData.profile?.company || null,
            location: githubData.profile?.location || null,
            blog: githubData.profile?.blog || null,
            twitterUsername: githubData.profile?.twitter_username || githubData.profile?.twitterUsername || null,
            createdAt: githubData.profile?.created_at || githubData.profile?.createdAt || new Date().toISOString(),
          },
          stats: {
            repos: githubData.stats?.repos || githubData.stats?.public_repos || 0,
            stars: githubData.stats?.stars || githubData.stats?.totalStars || 0,
            forks: githubData.stats?.forks || 0,
            pullRequests: githubData.stats?.pullRequests || 0,
            issues: githubData.stats?.issues || 0,
            contributions: githubData.stats?.contributions || 0,
            followers: githubData.stats?.followers || githubData.profile?.followers || 0,
          },
          languages: githubData.languages || [],
          technologies: githubData.technologies || [],
          topRepo: githubData.topRepo || null,
          heatmap: githubData.heatmap || [],
          timeline: githubData.timeline || [],
          repositories: githubData.repositories || [],
        };
      }
    }

    if (!cardData) {
      return NextResponse.json(
        { 
          error: "Card data not found for this username",
          message: "This card hasn't been created yet. Please visit the dashboard to generate your devcard first.",
        },
        { status: 404 }
      );
    }

    // Return the card data in the format expected by CardPageContent
    return NextResponse.json(cardData);
  } catch (error) {
    console.error("Error fetching card data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch card data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

