/**
 * Public Card Storage Utilities
 * Store and retrieve devcard data in a way that's publicly accessible by username
 */

import { supabase } from "@/lib/supabaseClient";

export interface PublicCardData {
  username: string;
  profile: {
    login: string;
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    company: string | null;
    location: string | null;
    blog: string | null;
    twitterUsername: string | null;
    createdAt: string;
  };
  stats: {
    repos: number;
    stars: number;
    forks: number;
    pullRequests: number;
    issues: number;
    contributions: number;
    followers?: number;
  };
  languages: Array<{ name: string; percentage: number }>;
  technologies?: string[];
  topRepo: {
    name: string;
    description: string | null;
    stars: number;
    url: string;
  } | null;
  heatmap: Array<{ date: string; count: number }>;
  timeline: Array<{ label: string; total: number }>;
  repositories: Array<{
    name: string;
    description: string | null;
    stars: number;
    language: string | null;
    topics?: string[];
  }>;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Save card data to public storage
 * Uses Supabase storage buckets as a simple key-value store
 */
export async function savePublicCardData(cardData: PublicCardData, userId?: string): Promise<boolean> {
  try {
    const username = cardData.username.toLowerCase();
    const dataToStore = {
      ...cardData,
      userId: userId || null,
      updatedAt: new Date().toISOString(),
      createdAt: cardData.createdAt || new Date().toISOString(),
    };

    // Try to use Supabase storage first (simple JSON files)
    // If that doesn't work, we'll use a different approach
    
    // For now, use a simple approach: store in a 'devcards' bucket
    // Create the file path
    const fileName = `${username}.json`;
    
    // Convert to JSON string
    const jsonData = JSON.stringify(dataToStore);
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Try to upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('devcards')
      .upload(fileName, blob, {
        upsert: true,
        contentType: 'application/json',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Error saving to storage:', uploadError);
      // Fallback: Try to use a database table if storage fails
      // For now, we'll handle this gracefully
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving public card data:', error);
    return false;
  }
}

/**
 * Get public card data by username
 */
export async function getPublicCardData(username: string): Promise<PublicCardData | null> {
  try {
    const usernameLower = username.toLowerCase();
    const fileName = `${usernameLower}.json`;
    
    // Try to get from Supabase storage
    const { data, error } = await supabase.storage
      .from('devcards')
      .download(fileName);

    if (error || !data) {
      console.error('Error fetching from storage:', error);
      return null;
    }

    // Parse the JSON data
    const text = await data.text();
    const cardData = JSON.parse(text) as PublicCardData;
    
    return cardData;
  } catch (error) {
    console.error('Error getting public card data:', error);
    return null;
  }
}

/**
 * Delete public card data
 */
export async function deletePublicCardData(username: string): Promise<boolean> {
  try {
    const usernameLower = username.toLowerCase();
    const fileName = `${usernameLower}.json`;
    
    const { error } = await supabase.storage
      .from('devcards')
      .remove([fileName]);

    if (error) {
      console.error('Error deleting card data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting public card data:', error);
    return false;
  }
}

