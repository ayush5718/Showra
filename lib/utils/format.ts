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

/**
 * Post-process README content to fix common issues and improve quality
 */
export function postProcessReadme(readme: string): string {
  if (!readme || readme.trim().length === 0) {
    return readme;
  }

  let processed = readme;
  
  // Remove markdown code blocks that wrap the entire content
  processed = processed.replace(/^```(?:markdown|md|html)?\s*\n([\s\S]*?)\n```$/g, '$1');
  processed = processed.replace(/```markdown\n([\s\S]*?)\n```/g, '$1');
  
  // Fix tech stack icon syntax - ensure proper format
  // Remove any dashes, bullets, or list markers before image syntax
  processed = processed.replace(/^[\s\-\*\•]*!\[/gm, '![');
  
  // Fix category headers - ensure they have ###
  processed = processed.replace(/^(Languages|Frontend|Backend|DevOps|Database|Tools|Frameworks|Technologies):\s*$/gmi, '### $1');
  
  // Fix broken image syntax (if wrapped incorrectly in code blocks or backticks)
  processed = processed.replace(/`!\[(.*?)\]\((.*?)\)`/g, '![$1]($2)');
  processed = processed.replace(/```\s*!\[(.*?)\]\((.*?)\)\s*```/g, '![$1]($2)');
  
  // Ensure blank lines between category headers and images (critical for rendering)
  processed = processed.replace(/(### .+)\n(?!\n)!\[/g, '$1\n\n![');
  
  // Fix tech stack sections - ensure proper spacing
  // Pattern: ### Category\n![...] should have blank line between
  processed = processed.replace(/(### [^\n]+)\n(?!\n)(!\[)/g, '$1\n\n$2');
  
  // Remove any leading/trailing code block markers
  processed = processed.replace(/^```[\w]*\s*\n/gm, '').replace(/\n```$/gm, '');
  
  // Fix quote placement - ensure quotes are in About Me section, not at top
  const lines = processed.split('\n');
  const firstLines = lines.slice(0, 15).join('\n');
  const quotePattern = /^["'](.+)["']\s*$/gm;
  
  if (quotePattern.test(firstLines) && !firstLines.includes('## 🚀 About Me')) {
    // Find standalone quotes at the top
    const standaloneQuoteMatch = firstLines.match(/^["'](.+?)["']\s*$/m);
    if (standaloneQuoteMatch) {
      const quoteText = standaloneQuoteMatch[1];
      // Remove the quote from top
      processed = processed.replace(/^["'](.+?)["']\s*$/m, '');
      // Insert it in About Me section if it exists
      if (processed.includes('## 🚀 About Me')) {
        processed = processed.replace(
          /(## 🚀 About Me\n)/,
          `$1\n<div align="center">\n<blockquote>\n<p><em>"${quoteText}"</em></p>\n</blockquote>\n</div>\n\n`
        );
      }
    }
  }
  
  // Fix common markdown issues
  // Remove extra blank lines (more than 2 consecutive)
  processed = processed.replace(/\n{4,}/g, '\n\n\n');
  
  // Fix list items that should be headers
  processed = processed.replace(/^[\s]*[-\*]\s*(Languages|Frontend|Backend|DevOps|Database|Tools|Frameworks):\s*$/gmi, '### $1');
  
  // Ensure image URLs are properly formatted (no spaces)
  processed = processed.replace(/!\[(.*?)\]\(\s*(.+?)\s*\)/g, '![$1]($2)');
  
  // Fix broken HTML tags
  processed = processed.replace(/<img\s+src=/g, '<img src=');
  processed = processed.replace(/<img src="([^"]+)"\s*\/?>/g, (match, src) => {
    // Ensure proper img tag format
    return `<img src="${src}" />`;
  });
  
  // Remove any invisible characters or zero-width spaces
  processed = processed.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // Final cleanup - ensure no double spaces
  processed = processed.replace(/[ ]{2,}/g, ' ');
  
  return processed.trim();
}

