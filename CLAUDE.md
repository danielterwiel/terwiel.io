# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built using Next.js 15 with TypeScript, based on the T3 Stack template. The project is a resume/CV site for Daniël Terwiel with two layout modes: a full layout and a compact one-page print-friendly layout.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build production version (includes profiling)
- `npm run lint` - Run Biome linter
- `npm run knip` - Check for unused files, exports, and dependencies
- `npm start` - Start production server

### Post-Change Workflow

After making changes to the codebase, run the following commands to ensure code quality:

1. `npm run knip` - Detect and remove unused files, exports, and dependencies
2. `npm run lint` - Check for linting issues

NOTE: do not rebuild the project. We got a dev server running.

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

### Styling

- Uses Tailwind CSS with custom configuration in `tailwind.config.ts`
- Typography plugin enabled for prose styling
- Custom color: `klein: "#002FA7"` (International Klein Blue)
- Print-specific classes throughout for optimized printing
- Global styles in `src/styles/globals.css`

### Year

The year is 2025. Use this year for your web searches when applicable. Do not use 2024 for web searches unless I say so.

### Testing

I manually test my components. No need to rebuild or run the dev server. Just fix type and lint errors at the end of each prompt response.

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

- Strict TypeScript settings enabled
- Path aliases configured
- Includes Next.js plugin for enhanced TypeScript support

### ESLint Configuration

- Based on Next.js recommended config
- TypeScript rules with type-checking enabled
- Custom rules for consistent imports and unused variables
- Inline type imports preferred

## Key Dependencies

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 3.x with Typography plugin
- **Forms**: Formspree v3 for contact form handling
- **UI Components**: Radix UI for accessible components (Collapsible, Form)
- **Icons**: Custom SVG handling with @svgr/webpack
- **Validation**: Zod 3.x for schema validation
- **Environment**: @t3-oss/env-nextjs for env var management
- **Date handling**: date-fns 2.x

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
- Uses Inter font from Google Fonts
- Includes favicon and proper metadata setup
- Built for Vercel deployment (includes .vercel directory)
- View transitions API is used for smooth project list filtering animations
- Safari requires special handling for view transitions due to rendering bugs with sticky positioned elements
