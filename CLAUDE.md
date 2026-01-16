# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start dev server (usually already running)
- `npm run lint` - Biome linter
- `npm run knip` - Find unused files/exports/dependencies
- `npm run typecheck` - TypeScript type checking

After changes: run `npm run knip` then `npm run lint`. Do not rebuild - dev server handles hot reload.

**Knip false positives**: Next.js conventions (`layout.tsx`, `page.tsx`, `not-found.tsx`), config files, type-only dependencies.

## Architecture

Portfolio site with D3-powered interactive "StackCloud" visualization.

### Layout

Split-panel desktop layout (`src/app/page.tsx`):
- Left: StackCloud (D3 force simulation) - fixed position
- Right: Projects list (filterable) - scrollable

Both panels linked via URL search params (`?q=` from SearchInput, `?filter=` from StackCloud clicks).

### StackCloud System

D3 force-directed graph showing tech stack experience. Key files:
- `src/components/stack-cloud/stack-cloud.tsx` - Dynamic loader wrapper (d3 is 290kB)
- `src/components/stack-cloud/stack-cloud-content.tsx` - Main visualization
- `src/hooks/use-stack-simulation.ts` - D3 simulation logic
- `src/utils/stack-cloud/*.ts` - Physics, positioning, forces

Nodes sized by experience years (calculated from project date ranges in `src/data/projects.ts`). Grouped into domain segments (Front-end, Back-end, DevOps, Design, etc.).

### Data Flow

1. `src/data/stack.ts` - Stack definitions (name → domain + icon)
2. `src/data/projects.ts` - Projects with stack arrays and date ranges
3. Experience calculated at runtime via `src/utils/calculate-*.ts`
4. Filtering via `src/utils/filter-projects.ts` with cache (`src/utils/filter-cache.ts`)

### View Transitions

Projects list uses View Transitions API for filtering animations.
- Safari macOS: Disabled (rendering bugs with sticky header)
- Safari iOS/Chrome: Enabled
- CSS in `src/styles/globals.css` handles transition pseudo-elements

### Z-Index (defined in `tailwind.config.ts`)

- `z-0`: Default
- `z-10`: Projects
- `z-19-22`: View transitions
- `z-40`: Header transition group (Chrome)
- `z-50`: Sticky header
- `z-60`: Safari header override

Never use arbitrary z-index values.

## Conventions

- Path alias: `~/` → `src/`
- SVGs: Imported as React components via `@svgr/webpack`
- Colors: OKLCH format, Klein Blue (`#002FA7`) as brand color
- Types: Centralized in `src/types/index.ts`
- Imports: Biome organizes - packages first, then React, then local (`~/`), then types

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
