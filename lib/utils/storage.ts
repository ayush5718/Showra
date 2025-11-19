/**
 * Local storage utilities for card data
 */

const STORAGE_KEY = "showg-card-data";
const STORAGE_TIMESTAMP_KEY = "showg-card-timestamp";

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

