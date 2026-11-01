# Plan: Replace Logos & Redesign Index Page

## Problem statement recap
The user wants:
1. Inside `public/images/` they recently updated 2 new logos: `drp-logo-blueback.png` and `drp-whiteback-logo.png`. Use those logos instead of old ones. Navbar logo and all logos must be the same.
2. Content is great but dark mode by default + bulky design makes it look like "vibe coding". Want to work on this especially the index page. Once index page is planned, persist design to other pages.

## Current state analysis
- New logos added: `public/images/drp-logo-blueback.png` (2000x2000, blue bg), `public/images/drp-whiteback-logo.png` (2000x2000) 
- Old logos still referenced: `logo.webp`, `logo.ico` in site.ts, BaseLayout, webmanifest
- Navbar currently uses a text-based "DA" mark (`.brand-mark` div) in Header.astro, not an image
- Design is very dark with heavy gradients, grid background, large sections, lots of cards/borders - looks "bulky"

## Logo replacement plan

### Strategy
- Use the new logo consistently. "drp-whiteback-logo.png" likely works better on dark backgrounds; "drp-logo-blueback.png" has blue background. For a clean look, better to use the whiteback version as the primary logo.
- Replace favicon, apple-touch-icon, webmanifest icons to use the new logo. Can convert/optimize or just use the PNG directly. 
- Replace the text "DA" brand mark in navbar with the actual logo image for consistency - "navbar logo and all logo must be same"
- Update SITE.logo in data/site.ts
- Update all references in BaseLayout.astro, site.webmanifest

### Specific changes
1. **Header.astro** - Replace `.brand-mark` (DA text box) with `<img>` using the new logo. Keep brand name and role. Make it same across all uses.
2. **BaseLayout.astro** - Update favicon links to use new logo (maybe use .png for favicon or convert; browsers accept PNG). Also update apple-touch-icon.
3. **public/site.webmanifest** - Update icons array to use new logos.
4. **src/data/site.ts** - Update `logo` field to point to new logo.
5. **Optionally** - Create optimized webp version of the chosen logo for better performance, or just use PNG. The new logos are larger but fine.

Also need to add CSS for `.brand-logo` in global.css since we're changing from `.brand-mark`.

## Index page redesign plan

### Goals
- Less "vibe coding", less bulky
- Tame the dark mode - maybe soften backgrounds, reduce heavy gradients/grid, cleaner spacing
- More refined, professional look while keeping great content
- Apply consistently to other pages later

### Specific changes to index.astro and global.css

**Hero section:**
- Simplify hero - reduce floating cards (the code snippet card and status card look a bit gimmicky/"vibe coding")
- Cleaner typography, better hierarchy
- Soften the background effects

**Overall styling:**
- Reduce or soften the fixed grid background in body::before (currently very visible)
- Tone down radial gradients on body
- Reduce excessive padding on sections (they're already using clamp but maybe make more compact)
- Simplify cards - reduce heavy borders, shadows
- Make it feel more editorial/minimal

**Specific tweaks:**
1. **global.css body background** - Remove or soften the grid pattern, reduce gradient intensity
2. **Hero** - Maybe remove or simplify float cards, cleaner layout
3. **Cards/panels** - Less border-heavy, cleaner
4. **Marquee** - Keep but maybe tone down
5. **Stats** - Maybe integrate differently
6. **Overall spacing** - Slightly tighter, more breathing room without bulk

But need to be careful not to lose the personality. The user says "content is really awesome" so preserve content structure, just refine design.

Let me look up what the user specifically doesn't like - "bulk design and dark mode by default it looks vibe coding as well as much bulky design". So:
- Dark mode is fine as default if refined, but needs to be less heavy/vibe-y
- Reduce bulk - less padding, cleaner sections
- Remove or tone down decorative elements that feel AI-generated/vibecoded

Looking at current design: heavy grid background, glowing accents, floating cards with code snippets, lots of borders and panels - these scream "vibe coding template". Want more refined, editorial.

## Implementation order
1. Update logos first (cleaner, straightforward)
2. Update Header to use image logo
3. Update BaseLayout favicons/webmanifest
4. Update SITE data
5. Add CSS for brand logo
6. Redesign index page - start with global styles (backgrounds), then index-specific changes
7. Test build

But in plan mode we only plan - user wants plan first. So I need to present this plan and ask for confirmation if needed, then implement.
