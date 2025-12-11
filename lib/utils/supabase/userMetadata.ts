/**
 * Supabase User Metadata Utilities
 * Store and retrieve user-specific metadata in Supabase user metadata field
 */

import { supabase } from "@/lib/supabaseClient";

export interface UserMetadata {
  githubData?: {
    lastFetched?: string;
    profile?: any;
    stats?: any;
    languages?: any[];
    repositories?: any[];
    technologies?: string[];
    topRepo?: any;
    heatmap?: any[];
    timeline?: any[];
    aiAnalysis?: any;
    aiAnalysisTimestamp?: string;
  };
  preferences?: {
    selectedCardDesign?: 'card1' | 'card2' | 'card3' | 'card4';
    theme?: string;
    autoRefresh?: boolean;
  };
  analytics?: {
    cardsGenerated?: number;
    lastCardGenerated?: string;
    favoriteDesign?: string;
  };
}

/**
 * Get user metadata from Supabase
 */
export async function getUserMetadata(): Promise<UserMetadata | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('Error getting user:', error);
      return null;
    }

    return (user.user_metadata as UserMetadata) || {};
  } catch (error) {
    console.error('Error fetching user metadata:', error);
    return null;
  }
}

/**
 * Update user metadata in Supabase
 */
export async function updateUserMetadata(metadata: Partial<UserMetadata>): Promise<boolean> {
  try {
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    
    if (getUserError || !user) {
      console.error('Error getting user:', getUserError);
      return false;
    }

    // Get existing metadata
    const existingMetadata = (user.user_metadata as UserMetadata) || {};
    
    // Merge with new metadata
    const updatedMetadata: UserMetadata = {
      ...existingMetadata,
      ...metadata,
      githubData: {
        ...existingMetadata.githubData,
        ...metadata.githubData,
      },
      preferences: {
        ...existingMetadata.preferences,
        ...metadata.preferences,
      },
      analytics: {
        ...existingMetadata.analytics,
        ...metadata.analytics,
      },
    };

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: updatedMetadata,
    });

    if (updateError) {
      console.error('Error updating user metadata:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return false;
  }
}

/**
 * Save GitHub data to user metadata
 */
export async function saveGitHubDataToMetadata(githubData: UserMetadata['githubData']): Promise<boolean> {
  return updateUserMetadata({
    githubData: {
      ...githubData,
      lastFetched: new Date().toISOString(),
    },
  });
}

/**
 * Get saved GitHub data from metadata
 */
export async function getGitHubDataFromMetadata(): Promise<UserMetadata['githubData'] | null> {
  const metadata = await getUserMetadata();
  return metadata?.githubData || null;
}

/**
 * Save user preferences
 */
export async function saveUserPreferences(preferences: UserMetadata['preferences']): Promise<boolean> {
  return updateUserMetadata({ preferences });
}

/**
 * Get user preferences
 */
export async function getUserPreferences(username?: string): Promise<UserMetadata['preferences'] | null> {
  // If username provided, try to get preferences by matching user's GitHub login
  if (username) {
    const metadata = await getUserMetadata();
    const githubLogin = metadata?.githubData?.profile?.login;
    if (githubLogin === username) {
      return metadata?.preferences || null;
    }
    // Return null if username doesn't match (for now)
    // In future, could query by username if we add that field
    return null;
  }
  const metadata = await getUserMetadata();
  return metadata?.preferences || null;
}

/**
 * Get user metadata by GitHub username (requires fetching from Supabase)
 * This is a simplified version - in production, you'd query a users table
 */
export async function getUserMetadataByUsername(username: string): Promise<UserMetadata | null> {
  // For now, this only works for the current user
  // In production, you'd want a proper users table to query by username
  const metadata = await getUserMetadata();
  const githubLogin = metadata?.githubData?.profile?.login;
  if (githubLogin === username) {
    return metadata;
  }
  return null;
}

/**
 * Update analytics
 */
export async function updateAnalytics(analytics: Partial<UserMetadata['analytics']>): Promise<boolean> {
  const metadata = await getUserMetadata();
  return updateUserMetadata({
    analytics: {
      ...metadata?.analytics,
      ...analytics,
    },
  });
}

/**
 * Save AI analysis to user metadata
 */
export async function saveAIAnalysisToMetadata(profileLogin: string, analysis: any): Promise<boolean> {
  const metadata = await getUserMetadata();
  return updateUserMetadata({
    githubData: {
      ...metadata?.githubData,
      aiAnalysis: analysis,
      aiAnalysisTimestamp: new Date().toISOString(),
    },
  });
}

/**
 * Get saved AI analysis from metadata
 */
export async function getAIAnalysisFromMetadata(profileLogin: string): Promise<any | null> {
  const metadata = await getUserMetadata();
  const githubData = metadata?.githubData;
  
  if (!githubData?.aiAnalysis) {
    return null;
  }
  
  // Check if analysis is still valid (7 days)
  if (githubData.aiAnalysisTimestamp) {
    const timestamp = new Date(githubData.aiAnalysisTimestamp).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > sevenDays) {
      return null;
    }
  }
  
  return githubData.aiAnalysis;
}

