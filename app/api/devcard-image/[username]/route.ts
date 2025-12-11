import { NextRequest, NextResponse } from "next/server";
import { getPublicCardData } from "@/lib/utils/supabase/cardStorage";
import { supabase } from "@/lib/supabaseClient";

/**
 * API endpoint to serve devcard as a static image
 * This generates/serves an image URL that can be embedded in GitHub READMEs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const searchParams = request.nextUrl.searchParams;
    const variant = searchParams.get("variant") || "card1";
    const format = searchParams.get("format") || "png"; // png, jpeg, svg

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    
    // Get card data to verify it exists
    const cardData = await getPublicCardData(username);
    if (!cardData) {
      return NextResponse.json(
        { error: "Card not found. Please create your devcard first." },
        { status: 404 }
      );
    }

    // Check if image exists in Supabase storage
    const fileName = `${username.toLowerCase()}.png`;
    
    try {
      // Try to get the public URL for the image
      const { data: publicUrlData } = supabase.storage
        .from('devcards')
        .getPublicUrl(fileName);
      
      const imageUrl = publicUrlData.publicUrl;
      
      // Verify the image exists by checking if we can access it
      // For now, return the URL - if it doesn't exist, user needs to generate it first
      return NextResponse.json({
        imageUrl: imageUrl,
        exists: true,
        markdownCode: `![My DevCard](${imageUrl})`,
        htmlCode: `<img src="${imageUrl}" alt="My DevCard" width="600" />`,
        message: "Image URL ready for README embedding"
      });
    } catch (error) {
      // Image doesn't exist - return error with instructions
      const cardPageUrl = `${baseUrl}/card/${username}?variant=${variant}`;
      return NextResponse.json({
        error: "Card image not generated yet",
        imageUrl: null,
        cardUrl: cardPageUrl,
        message: "Please generate your card image first by creating your card in the dashboard. The image will be automatically generated.",
        instructions: "The card image is generated automatically when you create your devcard in the dashboard."
      }, { status: 404 });
    }
    
  } catch (error) {
    console.error("Error in devcard-image API:", error);
    return NextResponse.json(
      {
        error: "Failed to generate devcard image",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
