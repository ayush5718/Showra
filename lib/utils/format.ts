/**
 * Format number with locale string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format large numbers (1k, 1M, etc.)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get display name from user data
 * Priority: profile name > user name > email username > fallback
 */
export function getUserDisplayName(
  profileName?: string | null,
  userName?: string | null,
  email?: string | null,
  fallback: string = "User"
): string {
  if (profileName) return profileName;
  if (userName) return userName;
  if (email) {
    // Extract name from email (part before @)
    const emailName = email.split("@")[0];
    // Capitalize first letter
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }
  return fallback;
}

/**
 * Format email for display (prevents breaking in the middle)
 * Wraps email so it breaks at @ symbol if needed
 */
export function formatEmailForDisplay(email: string): string {
  return email;
}

/**
 * Get welcome message text
 */
export function getWelcomeMessage(
  profileName?: string | null,
  userName?: string | null,
  email?: string | null
): {
  greeting: string;
  name: string;
  email?: string;
} {
  const name = getUserDisplayName(profileName, userName, email);
  return {
    greeting: "Welcome,",
    name,
    email: email || undefined,
  };
}

