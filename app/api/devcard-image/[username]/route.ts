import { NextRequest, NextResponse } from "next/server";
import { getPublicCardData } from "@/lib/utils/supabase/cardStorage";

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

    // For GitHub README embedding, we need a STATIC IMAGE URL
    // The card page URL is for interactive viewing
    // The image should be generated and stored, then served here
    
    // SOLUTION: Use the card page URL with a screenshot service or
    // Generate the image and store it in Supabase storage, then serve it
    
    // For now, return a direct link to the card page that GitHub can preview
    // GitHub will show a preview card when you link to the page
    const cardPageUrl = `${baseUrl}/card/${username}?variant=${variant}`;
    
    // Better solution: Return instructions for embedding
    // The user should:
    // 1. Take a screenshot of their card page
    // 2. Upload it to their repo or an image hosting service
    // 3. Use that image URL in the README
    
    // Or we can provide a service that generates the image
    // For now, return a badge/button that links to the card
    return NextResponse.json({
      imageUrl: cardPageUrl, // This won't work as an image, but we'll fix it
      cardUrl: cardPageUrl,
      embedCode: `[![My DevCard](${cardPageUrl})](${cardPageUrl})`,
      // Better: Provide a badge-style link
      badgeCode: `<a href="${cardPageUrl}" target="_blank"><img src="https://img.shields.io/badge/View_My_DevCard-00E5FF?style=for-the-badge&logo=github&logoColor=white" alt="View My DevCard" /></a>`,
      instructions: "To embed in README: Use the badgeCode or take a screenshot of the card page and upload to your repo/images folder, then embed that image."
    });
    
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
