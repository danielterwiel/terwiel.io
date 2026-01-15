# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built using Next.js 15 with TypeScript, based on the T3 Stack template. The project is a resume/CV site for Daniël Terwiel with two layout modes: a full layout and a compact one-page print-friendly layout.

**Rewrite Status (2025)**: The D3.js dependencies have been **completely removed** and replaced with a pure CSS visualization. The rewrite is in the final documentation and cleanup phase. See PRD.md for detailed requirements and progress tracking.

## Development Commands

- `npm run dev` - Start development server (runs on http://localhost:3000)
- `npm run build` - Build production version (includes profiling with --profile flag)
- `npm run lint` - Run Biome linter (checks code quality)
- `npm run lint:fix` - Run Biome linter and auto-fix issues
- `npm run format` - Format code with Biome
- `npm run format:check` - Check code formatting without modifying files
- `npm run knip` - Check for unused files, exports, and dependencies
- `npm run typecheck` - Run TypeScript type checking without emitting files
- `npm start` - Start production server

### Post-Change Workflow

**CRITICAL**: After making ANY changes to the codebase, you MUST run the following workflow to ensure quality:

1. **Test in Browser**: Use agent-browser (see Testing section below) to verify functionality
2. **Type Check**: `npm run typecheck` - Ensure no TypeScript errors
3. **Lint**: `npm run lint` - Check for linting issues
4. **Dead Code**: `npm run knip` - Detect unused code (verify before removing)

**DO NOT** rebuild the project after changes unless explicitly required. A dev server is running that hot-reloads.

**Note on Knip**: Knip finds unused files, dependencies, and exports. Some reports may be false positives (e.g., Next.js conventions like `layout.tsx`, `page.tsx`, config files). Always verify before removing reported items. Common false positives include:

- Next.js App Router files (layout.tsx, page.tsx, not-found.tsx)
- Configuration files (next.config.mjs, tailwind.config.ts, postcss.config.cjs)
- Type-only dependencies used in TypeScript files
- Dependencies used in config files

## Architecture

### Layout System

The application has a unique dual-layout architecture:

1. **Full Layout** (`src/app/page.tsx:44-59`): Standard multi-section layout with Header, About, Experience, Contact, and Footer components
2. **Compact Layout** (`src/app/page.tsx:26-40`): Single-page print-optimized layout using compact versions of all components (CompactHeader, CompactAbout, CompactExperience, CompactContact)

The layout is controlled by a `LayoutToggle` component and state managed in the main page component with `useState`.

### Component Structure

- **Regular components**: `src/components/header.tsx`, `src/components/about.tsx`, etc.
- **Compact components**: `src/components/compact-*.tsx` - specialized versions optimized for single-page printing
- **Utility components**: `src/components/icon.tsx`, `src/components/profile-picture.tsx`, etc.
- **Stack visualization** (CSS-based): `src/components/stack-cloud-css/` - see below

### Stack Visualization Architecture (Pure CSS)

The stack visualization has been rewritten to use **pure CSS** instead of D3.js force-directed graphs. This provides:
- **60fps animations** on mobile devices
- **No JavaScript** required for visual layout (only for interactivity)
- **~30% smaller bundle** size compared to D3.js version

**Component Hierarchy** (`src/components/stack-cloud-css/`):

```
stack-cloud.tsx          # Main wrapper with Suspense boundary
├── stack-cloud-content.tsx  # CSS Grid layout, domain groups container
│   ├── root-node.tsx        # Pure SVG pie chart (domain distribution)
│   └── domain-group.tsx     # Flexbox container for each domain
│       └── stack-item.tsx   # Individual technology button (44x44px touch target)
└── stack-cloud-loader.tsx   # Loading spinner with domain colors
```

**Layout Strategy**:
- **CSS Grid** with `auto-fit` and `minmax(140px, 1fr)` for responsive columns
- **Flexbox** for stack items within domain groups
- **No JavaScript layout calculations** - browser handles responsive behavior
- **Mobile-first** breakpoints (320px → 768px → 1024px)

**Animation Strategy**:
- GPU-accelerated transforms only (`transform`, `opacity`)
- `will-change` hints on animated elements
- `prefers-reduced-motion` respected throughout
- Spring easing: `cubic-bezier(0.25, 1.65, 0.65, 1)` for playful interactions

### Styling

- Uses Tailwind CSS with custom configuration in `tailwind.config.ts`
- Typography plugin enabled for prose styling
- Custom color: `klein: "#002FA7"` (International Klein Blue)
- Print-specific classes throughout for optimized printing
- Global styles in `src/styles/globals.css`

### Year

The year is 2025. Use this year for your web searches when applicable. Do not use 2024 for web searches unless I say so.

## Testing

**MANDATORY TESTING WORKFLOW**: Every code change MUST be validated using agent-browser before considering the work complete.

### Agent-Browser Testing (Required)

The `agent-browser` package is installed as a dependency. Use it to test all interactive functionality after making changes.

**Basic Testing Flow**:

1. **Navigate**: Open the development server
   ```bash
   npx agent-browser open http://localhost:3000
   ```

2. **Snapshot**: Get interactive elements with reference IDs
   ```bash
   npx agent-browser snapshot -i
   ```
   This returns refs like `@e1`, `@e2` for each interactive element.

3. **Interact**: Test functionality using refs
   ```bash
   npx agent-browser click @e5
   npx agent-browser fill @e3 "search query"
   npx agent-browser screenshot
   ```

4. **Verify**: Check that interactions work correctly
   - Filtering works (stack items, domains)
   - Search functionality works
   - URL state updates correctly (router.replace vs router.push)
   - Animations are smooth
   - No console errors

**Common Test Scenarios**:

```bash
# Test stack filtering
npx agent-browser open http://localhost:3000
npx agent-browser snapshot -i
npx agent-browser click @e[stack-item-ref]  # Click a stack item
npx agent-browser screenshot                 # Verify filtered state

# Test search
npx agent-browser fill @e[search-input-ref] "React"
npx agent-browser screenshot                 # Verify search results

# Test keyboard navigation
npx agent-browser press Tab                  # Navigate with keyboard
npx agent-browser press Enter                # Activate focused element
```

**What to Test**:

- [ ] All interactive elements are clickable
- [ ] Stack filtering works (shows correct projects)
- [ ] Search filtering works (matches projects correctly)
- [ ] URL updates correctly (check address bar in snapshots)
- [ ] No console errors (check browser console)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Touch targets are adequate size (44x44px minimum)
- [ ] Animations are smooth (no jank)

**Test Before**:
- Submitting any code changes
- Marking a task as complete
- Creating a pull request
- Deploying to staging/production

### Manual Testing Notes

- The dev server supports hot reload - no need to restart after changes
- Just fix type and lint errors at the end of each iteration
- Use browser DevTools for visual debugging (Elements, Console, Network)
- Test in multiple browsers (Chrome, Firefox, Safari) for critical changes

### Path Aliases

- `~/*` maps to `./src/*` (configured in `tsconfig.json`)

### SVG Handling

Custom webpack configuration in `next.config.mjs` to handle SVG imports as React components using `@svgr/webpack`. SVGs can be imported as components or as URLs using the `?url` query parameter.

### Environment Variables

Uses `@t3-oss/env-nextjs` for type-safe environment validation in `src/env.mjs`. Currently minimal setup with only NODE_ENV validation.

### Next.js 15 Compatibility Notes

This project has been updated to Next.js 15 with the following changes:

- Components using `useSearchParams()` are wrapped in Suspense boundaries to support static generation
- The HighlightedText, HighlightedIcon, SearchInput, and Projects components have been refactored to use Suspense
- The project builds and runs successfully with Next.js 15 while maintaining backward compatibility

### TypeScript Configuration

- Strict TypeScript settings enabled (`strict: true`)
- Path aliases configured (`~/*` maps to `./src/*`)
- Includes Next.js plugin for enhanced TypeScript support
- Always run `npm run typecheck` after changes to catch type errors

### Code Quality Tools

**Biome** (Linter + Formatter):
- Replaces ESLint and Prettier for better performance
- Configuration in `biome.json` (if exists) or uses defaults
- Enforces consistent code style across the project
- Custom rules for imports and unused variables
- Inline type imports preferred (`import type { Foo } from "..."`)

**Knip** (Dead Code Detection):
- Finds unused files, exports, dependencies, and types
- Has known false positives for Next.js conventions (see above)
- Always verify findings before removing code
- Especially useful after refactoring or removing features

## Key Dependencies

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 3.x with Typography plugin
- **Forms**: Formspree v3 for contact form handling
- **UI Components**: Radix UI for accessible components (Dropdown Menu, Form)
- **Icons**: Custom SVG handling with @svgr/webpack
- **Validation**: Zod 3.x for schema validation
- **Environment**: @t3-oss/env-nextjs for env var management
- **Date handling**: date-fns 2.x
- **Testing**: agent-browser for headless browser automation and testing
- **Bundle Analysis**: @next/bundle-analyzer for bundle size optimization

**Removed Dependencies** (as of 2025 rewrite):
- ~~D3.js packages~~ (d3-ease, d3-force, d3-interpolate, d3-selection, d3-shape, d3-transition) - replaced with pure CSS visualization

## Z-Index Hierarchy

**IMPORTANT**: All z-index values are defined in `tailwind.config.ts` and should be used consistently. Do not use arbitrary z-index values.

### Z-Index Scale (Tailwind):
- `z-0`: Default layer (body, containers, StackCloud sidebar)
- `z-10`: Main content (Projects container)
- `z-20`: View transitions for projects (project items: 19-22)
  - `z-19`: Project fade-out items
  - `z-20`: Exiting project items
  - `z-21`: Entering project items
  - `z-22`: Staying/visible project items
- `z-40`: View transition group for header (Chrome only, below sticky header)
- `z-50`: Sticky elements (Header, contact dropdown)
- `z-60`: Safari-specific header override (only on Safari, overrides z-50 to stay above view transitions)
- `z-100`: Emergency layer (use only for critical edge cases)

### Key Rules:
1. Header (sticky): Always `z-50` in HTML, with Safari override to `z-60` in CSS
2. Contact dropdown: `z-50` (same as header, inside portal)
3. Project items during transitions: `z-19` to `z-22` range
4. View transition pseudo-elements: `z-40` (below header)
5. Never use arbitrary z-index values like `z-9999` or `z-100000`

### Safari Specific:
- Safari disables view transitions for the header (`view-transition-name: glass-header`) due to clipping bug
- On Safari, header z-index is boosted to `z-60` to stay above project animations
- Chrome continues to use view transitions with header at `z-40` group level

## Development Notes

- The site is designed with print optimization in mind - many classes include print-specific variants
- Component architecture separates regular and compact versions for different layout modes
- Uses Bahnschrift font family (system font, defined in `tailwind.config.ts`)
- Includes favicon and proper metadata setup
- Built for Vercel deployment (includes .vercel directory)
- View transitions API is used for smooth project list filtering animations
- Safari requires special handling for view transitions due to rendering bugs with sticky positioned elements
- **Stack visualization uses pure CSS** - no D3.js physics simulation, layout calculated by browser
- ASCII clouds background is decorative and dynamically loaded (doesn't block initial render)

## Performance & Optimization

### Bundle Size & Load Performance

**D3.js Removal Impact**:
- D3 packages removed: ~50-80 kB reduction
- Current bundle: 94.6 kB page-specific, 218 kB first load total
- All pages statically prerendered at build time

**Dynamic Imports** (non-critical components loaded asynchronously):
- `AsciiClouds` - decorative background (SSR disabled)
- `ContactDialog` - contact form with Formspree (SSR disabled)

**Run `npm run analyze`** to visualize bundle composition (opens interactive treemap).

### Core Web Vitals Optimizations

| Metric | Target | Implementation |
|--------|--------|----------------|
| LCP < 2.5s | ✅ | Static generation, system fonts, async decorative components |
| INP < 200ms | ✅ | Passive event listeners, RAF throttling, React.memo/useMemo |
| CLS < 0.1 | ✅ | Position absolute for exit animations, fixed dimensions |

### Custom Magnetic Effect System

The project uses a custom "magnetic effect" system for interactive elements defined in `tailwind.config.ts`:

- **Base classes**: `magnetic-base`, `magnetic-node`, `magnetic-input`, `magnetic-card`, `magnetic-button`
- **Shape variants**: `magnetic-rounded-lg`, `magnetic-rounded-full`
- **State variants**: `magnetic-hover`, `magnetic-active`, `magnetic-selected`
- **Ring effect**: `magnetic-with-ring` (adds animated ring on interaction)

Uses OKLCH color space for perceptually uniform colors and better depth perception.

### Hover-Hover Media Query

Custom Tailwind variant `hover-hover:` prevents hover states from triggering on touch devices:

```tsx
// Only applies hover styles on devices with hover capability
<button className="hover-hover:scale-105">Click me</button>
```

Also available as `group-hover-hover:` for group hover states.

### View Transitions

Next.js 15 experimental view transitions are enabled (`experimental.viewTransition: true` in `next.config.mjs`). Use with caution on Safari (see Z-Index Hierarchy section).

### ASCII Clouds Background

A subtle animated background using HTML5 Canvas with Perlin noise (`src/components/ascii-clouds.tsx`):
- **Color**: Klein blue (`oklch(37.85% 0.1954 263.23 / 0.06)`)
- **Performance**: Throttled to 30fps, GPU-accelerated via `will-change: transform`
- **Accessibility**: Respects `prefers-reduced-motion` (static single frame when enabled)
- **Loading**: Dynamically imported with SSR disabled (non-blocking)

### Touch Targets

**WCAG 2.2 Requirement**: All interactive elements must have a minimum 44x44px touch target size (SC 2.5.8). This is enforced and should be tested with agent-browser.

## Critical Architecture Patterns

### URL State Management

**IMPORTANT**: Different user actions require different history management:

- **Stack filtering** (clicking stack items/domains): Use `router.replace()` - does NOT create history entry
- **Search queries** (typing in search): Use `router.push()` - CREATES history entry
- **Why**: Users expect back button to return to previous search, not previous stack selection

Test this behavior with agent-browser after any routing changes.

### Suspense Boundaries

Next.js 15 requires Suspense boundaries for components using `useSearchParams()`. Components that use search params:

- `HighlightedText`
- `HighlightedIcon`
- `SearchInput`
- `Projects`

These must be wrapped in `<Suspense>` boundaries to support static generation.

### Performance Monitoring

The project uses `--profile` flag in build script to enable React profiling. Use React DevTools Profiler to analyze component render performance.

## Accessibility (WCAG 2.2)

This project achieves **WCAG 2.2 Level AA compliance**. See PRD.md for detailed implementation records.

**Implemented Features**:

| Feature | Implementation |
|---------|----------------|
| **Color Contrast** (SC 1.4.3) | All text >= 4.5:1 ratio, focus ring 7.62:1 |
| **Touch Targets** (SC 2.5.8) | All buttons >= 44x44px (`min-w-[44px] min-h-[44px]`) |
| **Keyboard Navigation** (SC 2.1.1) | Roving tabindex, arrow keys, Escape handling |
| **Focus Indicators** (SC 2.4.7) | `FOCUS_COLOR_HEX` (#1c50a7), visible ring styles |
| **Semantic HTML** (SC 4.1.2) | `<article>`, `<section>`, `<nav>`, `<header>`, `<main>` |
| **Skip Links** (SC 2.4.1) | "Skip to main", "Skip to stack", "Skip to projects" |
| **Reduced Motion** (SC 2.3.3) | CSS + JS detection, static fallbacks throughout |
| **Screen Reader** (SC 4.1.3) | aria-live regions, loading announcements, aria-labels |

**Key Accessibility Files**:
- `src/components/skip-links.tsx` - Skip navigation links
- `src/hooks/use-roving-tabindex.ts` - Arrow key navigation within groups
- `src/hooks/use-prefers-reduced-motion.ts` - Motion preference detection
- `src/styles/globals.css` - Focus styles (`.focus-standard`, `.focus-button`, etc.)

**Test with**:
- axe DevTools (Chrome/Firefox extension)
- WAVE tool (web accessibility evaluation)
- Lighthouse Accessibility audit (target: 100 score)
- agent-browser keyboard navigation tests

## Common Pitfalls

1. **Don't use arbitrary z-index values** - Only use defined values from `tailwind.config.ts`
2. **Don't add hover states without `hover-hover:` on mobile** - Causes sticky hover on touch
3. **Don't skip agent-browser testing** - Required for all interactive changes
4. **Don't use `router.push()` for stack filtering** - Should be `router.replace()`
5. **Don't remove Suspense boundaries** - Required for Next.js 15 with useSearchParams
6. **Don't ignore Knip warnings without investigation** - They often indicate real issues
7. **Don't use Klein blue without checking contrast** - Must meet WCAG 4.5:1 ratio
8. **Don't create touch targets < 44x44px** - WCAG 2.2 requirement

## References

- **PRD**: See `PRD.md` for detailed rewrite requirements and progress tracking
- **README**: See `README.md` for project context and credits
- **Agent-Browser**: https://github.com/vercel-labs/agent-browser
- **WCAG 2.2**: https://www.w3.org/WAI/WCAG22/quickref/
- **Next.js 15**: https://nextjs.org/docs
