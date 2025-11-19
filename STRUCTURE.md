# Project Structure

## Components Organization

### `/components/pages/` - Page-specific components
- `home/` - Home page components
  - `ModernHero.tsx` - Hero section
  - `CardShowcase.tsx` - Card showcase section
  - `FeaturesSection.tsx` - Features section
- `dashboard/` - Dashboard page components
  - `ModernDashboard.tsx` - Main dashboard

### `/components/features/` - Feature-specific components
- `card/` - DevCard feature components
  - `DevCard.tsx` - Main card component
  - `DevCardPreview.tsx` - Preview component
  - `CardLoadingAnimation.tsx` - Loading animation
  - `READMEPreview.tsx` - README preview
  - `DevCard.module.css` - Card styles
- `auth/` - Authentication components (future)

### `/components/layout/` - Layout components
- `ModernNavbar.tsx` - **Redesigned navbar** with gradient logo
- `ModernFooter.tsx` - Footer
- `Navbar.tsx` - Old navbar (can be removed)
- `Footer.tsx` - Old footer (can be removed)

### `/components/common/` - Shared/common components
- `SplitText.tsx` - Text animation component
- `Button.tsx` - Button component
- `InputBox.tsx` - Input component
- `Loader.tsx` - Loader component
- `RepoCard.tsx` - Repo card component

### `/components/ui/` - UI components
- `SimpleTooltip.tsx` - Tooltip component
- `Spotlight.tsx` - Spotlight effect
- `GridBackdrop.tsx` - Grid background
- `HeroHighlight.tsx` - Hero highlight
- Other UI components...

### `/components/react-bits/` - React-bits components
- Each component in its own subfolder with `.jsx` and `.css` files
- `LigthRays/` - Light rays effect
- `MagicBento/` - Magic bento grid
- `Shuffle/` - Text shuffle animation
- `TextType/` - Typewriter effect
- And more...

### `/components/sections/` - Legacy sections (can be cleaned up)
- Old section components

## Utils Organization

### `/lib/utils/` - Utility functions
- `index.ts` - Main export file
- `cn.ts` - Class name utility
- `format.ts` - Formatting utilities (numbers, dates)
- `validation.ts` - Validation utilities
- `constants.ts` - App constants (ROUTES, COLORS, etc.)

### `/lib/` - Other libraries
- `auth/` - Authentication store
- `hooks/` - Custom hooks
- `detectTechnologies.ts` - Technology detection
- `geminiAI.ts` - AI integration
- `supabaseClient.ts` - Supabase client

## Routes

### `/app/` - Next.js app router
- `page.tsx` - Home page
- `dashboard/page.tsx` - Dashboard page
- `api/` - API routes
- `auth/callback/` - Auth callback

## Key Improvements

1. **Navbar Redesign**: 
   - Gradient logo text
   - Better button styling
   - Improved mobile menu
   - Uses constants from utils

2. **Folder Structure**:
   - Page components in `pages/`
   - Feature components in `features/`
   - Proper separation of concerns

3. **Utils Organization**:
   - Centralized utilities
   - Constants in one place
   - Format and validation helpers

4. **Code Quality**:
   - Consistent imports using `@/` alias
   - Proper TypeScript types
   - Clean component structure

