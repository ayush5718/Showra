/**
 * Local storage utilities for card data
 */

const STORAGE_KEY = "showra-card-data";
const STORAGE_TIMESTAMP_KEY = "showra-card-timestamp";

export interface StoredCardData {
  profile: any;
  stats: any;
  languages: any[];
  technologies?: string[];
  topRepo: any;
  heatmap: any[];
  timeline: any[];
  repositories: any[];
  timestamp: number;
}

/**
 * Save card data to localStorage
 */
export function saveCardData(data: Omit<StoredCardData, "timestamp">): void {
  if (typeof window === "undefined") return;
  
  try {
    const dataToStore: StoredCardData = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error("Failed to save card data:", error);
  }
}

/**
 * Load card data from localStorage
 */
export function loadCardData(): StoredCardData | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored) as StoredCardData;
    // Data is valid for 24 hours
    const oneDay = 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > oneDay) {
      clearCardData();
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Failed to load card data:", error);
    return null;
  }
}

/**
 * Clear card data from localStorage
 */
export function clearCardData(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
  } catch (error) {
    console.error("Failed to clear card data:", error);
  }
}

/**
 * Check if card data exists and is fresh
 */
export function hasFreshCardData(): boolean {
  const data = loadCardData();
  return data !== null;
}

/**
 * AI Analysis Storage
 */
const AI_ANALYSIS_STORAGE_KEY = "showra-ai-analysis";
const AI_ANALYSIS_TIMESTAMP_KEY = "showra-ai-analysis-timestamp";

export interface StoredAIAnalysis {
  analysis: any;
  profileLogin: string;
  timestamp: number;
}

/**
 * Save AI analysis to localStorage
 */
export function saveAIAnalysis(profileLogin: string, analysis: any): void {
  if (typeof window === "undefined") return;
  
  try {
    const dataToStore: StoredAIAnalysis = {
      analysis,
      profileLogin,
      timestamp: Date.now(),
    };
    localStorage.setItem(AI_ANALYSIS_STORAGE_KEY, JSON.stringify(dataToStore));
    localStorage.setItem(AI_ANALYSIS_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error("Failed to save AI analysis:", error);
  }
}

/**
 * Load AI analysis from localStorage
 */
export function loadAIAnalysis(profileLogin: string): any | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(AI_ANALYSIS_STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored) as StoredAIAnalysis;
    
    // Check if it's for the same profile
    if (data.profileLogin !== profileLogin) {
      return null;
    }
    
    // Data is valid for 7 days (AI analysis doesn't change often)
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > sevenDays) {
      clearAIAnalysis();
      return null;
    }
    
    return data.analysis;
  } catch (error) {
    console.error("Failed to load AI analysis:", error);
    return null;
  }
}

/**
 * Clear AI analysis from localStorage
 */
export function clearAIAnalysis(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(AI_ANALYSIS_STORAGE_KEY);
    localStorage.removeItem(AI_ANALYSIS_TIMESTAMP_KEY);
  } catch (error) {
    console.error("Failed to clear AI analysis:", error);
  }
}

