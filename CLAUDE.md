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

## Development Notes

- The site is designed with print optimization in mind - many classes include print-specific variants
- Component architecture separates regular and compact versions for different layout modes
- Uses Inter font from Google Fonts
- Includes favicon and proper metadata setup
- Built for Vercel deployment (includes .vercel directory)
