import { NextRequest, NextResponse } from "next/server";
import { getPublicCardData } from "@/lib/utils/supabase/cardStorage";
import { supabase } from "@/lib/supabaseClient";

/**
 * API endpoint to generate and store card image
 * This creates a static PNG image of the devcard and stores it in Supabase storage
 * Returns the public URL that can be embedded in READMEs
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const body = await request.json();
    const imageDataUrl = body.imageDataUrl; // Base64 encoded image from client

    if (!username || !imageDataUrl) {
      return NextResponse.json(
        { error: "Username and imageDataUrl are required" },
        { status: 400 }
      );
    }

    // Convert data URL to buffer
    const base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase storage
    const fileName = `${username.toLowerCase()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('devcards')
      .upload(fileName, buffer, {
        upsert: true,
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return NextResponse.json(
        { error: "Failed to upload image", details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('devcards')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    return NextResponse.json({
      success: true,
      imageUrl,
      markdownCode: `![My DevCard](${imageUrl})`,
      htmlCode: `<img src="${imageUrl}" alt="My DevCard" width="600" />`,
      message: "Card image generated successfully! Use the imageUrl in your README."
    });

  } catch (error) {
    console.error("Error generating card image:", error);
    return NextResponse.json(
      {
        error: "Failed to generate card image",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

