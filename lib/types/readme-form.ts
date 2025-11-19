/**
 * Type definitions for README form data
 */

export interface FormDataType {
  name?: string;
  title?: string;
  about?: string;
  location?: string;
  email?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  codepen?: string;
  dev?: string;
  medium?: string;
  facebook?: string;
  stackoverflow?: string;
  currentWork?: string;
  education?: string;
  funFact?: string;
  skills?: string[];
  showVisitors?: boolean;
  showTrophies?: boolean;
  showStats?: boolean;
  showStreak?: boolean;
  templateStyle?: 'classic' | 'modern' | 'minimal' | 'creative' | 'professional';
  layoutStyle?: 'standard' | 'creative' | 'compact';
}

