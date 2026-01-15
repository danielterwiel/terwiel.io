# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Next.js 15 portfolio site (T3 Stack). Dual layout: full + compact print-friendly version.

## Commands

```bash
npm run dev      # Dev server (keep running)
npm run knip     # Find unused code (verify before deleting - Next.js files are false positives)
npm run lint     # Biome linter
npm run build    # Production build
```

**After changes**: Run `knip` then `lint`. Don't rebuild - dev server handles it.

## Architecture

**Dual layout** (`src/app/page.tsx`): Toggle between full layout (Header/About/Experience/Contact/Footer) and compact print layout (CompactHeader/CompactAbout/etc).

**Path alias**: `~/*` → `./src/*`

**SVG**: Import as components via `@svgr/webpack`. Use `?url` for URL imports.

## Styling

Tailwind CSS with custom config. Key custom color: `klein: "#002FA7"`.

### Z-Index (defined in `tailwind.config.ts`)

| Layer           | z-value | Usage                    |
| --------------- | ------- | ------------------------ |
| Default         | 0       | Body, StackCloud sidebar |
| Content         | 10      | Projects container       |
| Transitions     | 19-22   | Project item animations  |
| View transition | 40      | Header group (Chrome)    |
| Sticky          | 50      | Header, contact dropdown |
| Safari override | 60      | Header (Safari only)     |

**Never use arbitrary z-index values.**

### Safari View Transitions

Safari disables header view transitions (`glass-header`) due to clipping bug. Header gets `z-60` on Safari to stay above animations.

## Testing

Manual testing only. Fix type/lint errors after each change.

## Year

Use 2025 for web searches (not 2024).

## Plan Mode

- Make plan extremely concise. Sacrifice grammar for concision.
- List unresolved questions at end, if any.
