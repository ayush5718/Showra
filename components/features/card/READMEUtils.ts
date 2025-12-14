/**
 * Utilities for parsing and manipulating README markdown
 */

export interface READMESection {
  id: string;
  name: string;
  content: string;
  startIndex: number;
  endIndex: number;
  level: number; // Header level (1, 2, 3, etc.)
  visible: boolean;
}

/**
 * Parse README into sections based on headers
 */
export function parseReadmeSections(content: string): READMESection[] {
  const sections: READMESection[] = [];
  const lines = content.split('\n');
  
  let currentSection: {
    id: string;
    name: string;
    startIndex: number;
    level: number;
    content: string[];
  } | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line is a header
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headerMatch) {
      // Save previous section if exists
      if (currentSection) {
        sections.push({
          id: currentSection.id,
          name: currentSection.name,
          content: currentSection.content.join('\n'),
          startIndex: currentSection.startIndex,
          endIndex: i - 1,
          level: currentSection.level,
          visible: true, // Default to visible
        });
      }
      
      // Start new section
      const level = headerMatch[1].length;
      const title = headerMatch[2].trim();
      const sectionId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      currentSection = {
        id: sectionId,
        name: title,
        startIndex: i,
        level,
        content: [line],
      };
    } else if (currentSection) {
      currentSection.content.push(line);
    }
  }
  
  // Add last section
  if (currentSection) {
    sections.push({
      id: currentSection.id,
      name: currentSection.name,
      content: currentSection.content.join('\n'),
      startIndex: currentSection.startIndex,
      endIndex: lines.length - 1,
      level: currentSection.level,
      visible: true,
    });
  }
  
  return sections;
}

/**
 * Get section display name from header text
 */
export function getSectionDisplayName(sectionId: string, title: string): string {
  const nameMap: Record<string, string> = {
    'social': 'Social Badges',
    'badges': 'Social Badges',
    'hey-everyone': 'Hero Section',
    'hi-there': 'Hero Section',
    'about-me': 'About Me',
    'about': 'About Me',
    'tech-stack': 'Tech Stack',
    'technologies': 'Tech Stack',
    'languages': 'Tech Stack',
    'projects': 'Projects',
    'repositories': 'Repositories',
    'github-stats': 'GitHub Stats',
    'stats': 'GitHub Stats',
    'devcard': 'DevCard',
    'my-devc-card': 'DevCard',
    'contact': 'Contact',
    'connect-with-me': 'Contact',
    'social-links': 'Contact',
    'fun-facts': 'Fun Facts',
    'achievements': 'Achievements',
  };
  
  return nameMap[sectionId] || title;
}

/**
 * Toggle section visibility in content
 */
export function toggleSectionVisibility(
  content: string,
  sectionId: string,
  visible: boolean
): string {
  const sections = parseReadmeSections(content);
  const section = sections.find(s => s.id === sectionId);
  
  if (!section) return content;
  
  if (visible) {
    // Show section - remove HTML comment wrappers
    const escapedSectionId = sectionId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const hiddenPattern = new RegExp(
      `<!--\\s*HIDDEN:\\s*${escapedSectionId}\\s*-->\\s*([\\s\\S]*?)\\s*<!--\\s*END\\s*HIDDEN\\s*-->`,
      'gi'
    );
    
    if (hiddenPattern.test(content)) {
      return content.replace(hiddenPattern, (match, sectionContent) => {
        return sectionContent.trim();
      });
    }
  } else {
    // Hide section - wrap in HTML comment if not already hidden
    const escapedSectionId = sectionId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const hiddenPattern = new RegExp(
      `<!--\\s*HIDDEN:\\s*${escapedSectionId}\\s*-->`,
      'gi'
    );
    
    if (!hiddenPattern.test(content)) {
      // Find and replace the section content
      const sectionLines = content.split('\n');
      const sectionStart = section.startIndex;
      const sectionEnd = section.endIndex;
      
      // Reconstruct the section with hidden markers
      const beforeSection = sectionLines.slice(0, sectionStart).join('\n');
      const afterSection = sectionLines.slice(sectionEnd + 1).join('\n');
      const hiddenSection = `<!-- HIDDEN: ${sectionId} -->\n${section.content}\n<!-- END HIDDEN -->`;
      
      return [beforeSection, hiddenSection, afterSection].filter(Boolean).join('\n');
    }
  }
  
  return content;
}

/**
 * Apply font to elements in content
 */
export function applyFontToContent(
  content: string,
  elementType: 'header' | 'body' | 'code',
  fontFamily: string
): string {
  let updated = content;
  const fontSuffix = elementType === 'code' ? ', monospace' : ', sans-serif';
  const fontStyle = `font-family: '${fontFamily}'${fontSuffix}`;
  
  if (elementType === 'header') {
    // Update headers with existing style attributes - replace font-family in style
    updated = updated.replace(
      /<(h[1-4])([^>]*style="[^"]*font-family:[^"]*"[^>]*)>/gi,
      (match, tag, attrs) => {
        return match.replace(/font-family:\s*[^";]+/gi, fontStyle);
      }
    );
    
    // Update headers without style attributes - add style attribute
    updated = updated.replace(
      /<(h[1-4])((?![^>]*style)([^>]*))>/gi,
      (match, tag, attrs) => {
        // Check if tag is self-closing or has content
        if (attrs.endsWith('/')) {
          return match.replace('>', ` style="${fontStyle}">`);
        }
        return `<${tag}${attrs} style="${fontStyle}">`;
      }
    );
  }
  
  if (elementType === 'body') {
    // Update paragraphs, spans, divs with existing style - replace font-family
    updated = updated.replace(
      /<(p|span|div)([^>]*style="[^"]*font-family:[^"]*"[^>]*)>/gi,
      (match) => {
        return match.replace(/font-family:\s*[^";]+/gi, fontStyle);
      }
    );
    
    // Add style to paragraphs without style
    updated = updated.replace(
      /<(p)((?![^>]*style)([^>]*))>/gi,
      (match, tag, attrs) => {
        return `<${tag}${attrs} style="${fontStyle}">`;
      }
    );
  }
  
  if (elementType === 'code') {
    // Update code, samp, pre with existing style - replace font-family
    updated = updated.replace(
      /<(code|samp|pre)([^>]*style="[^"]*font-family:[^"]*"[^>]*)>/gi,
      (match) => {
        return match.replace(/font-family:\s*[^";]+/gi, fontStyle);
      }
    );
    
    // Add style to code elements without style
    updated = updated.replace(
      /<(code|samp|pre)((?![^>]*style)([^>]*))>/gi,
      (match, tag, attrs) => {
        return `<${tag}${attrs} style="${fontStyle}">`;
      }
    );
  }
  
  return updated;
}

