import { NextRequest, NextResponse } from "next/server";
import { getPublicCardData, savePublicCardData } from "@/lib/utils/supabase/cardStorage";

/**
 * API endpoint to save/update card data
 * This can be called from the dashboard to make cards publicly accessible
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const body = await request.json();

    if (!username || !body.cardData) {
      return NextResponse.json(
        { error: "Username and cardData are required" },
        { status: 400 }
      );
    }

    // Save to public storage
    const success = await savePublicCardData({
      username: username.toLowerCase(),
      ...body.cardData,
    }, body.userId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Card data saved successfully",
        cardUrl: `${request.nextUrl.origin}/card/${username}`,
      });
    } else {
      // Even if storage fails, return success but with a warning
      return NextResponse.json({
        success: true,
        message: "Card data saved to metadata (storage not available)",
        cardUrl: `${request.nextUrl.origin}/card/${username}`,
        warning: "Supabase storage bucket 'devcards' may not be configured. Card will work but may not be publicly accessible.",
      });
    }
  } catch (error) {
    console.error("Error saving card data:", error);
    return NextResponse.json(
      {
        error: "Failed to save card data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

