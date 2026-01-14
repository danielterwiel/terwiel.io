# PRD.md - Portfolio Website Performance Optimization

_Using the Ralph Wiggum Methodology: Iterative, PRD-based development_

> **About the Ralph Wiggum Methodology**: Named after Geoffrey Huntley's approach to AI-assisted development, this methodology emphasizes iterative loops where an AI agent repeatedly works on PRD items until all requirements pass. The agent autonomously selects tasks, implements them, validates completion, and moves to the next item. This enables long-running development sessions (hours to days) with minimal human intervention.

## Overview

This document defines the end state for optimizing Daniël's portfolio website. Each requirement below is structured for autonomous agent iteration with clear completion criteria. The agent should pick items from this PRD, complete them, mark progress, and iterate until all items pass.

## Current Problems

1. **Bundle Size** - D3.js monolithic import is 290.4kB, causing performance issues on mobile devices
2. **URL/History Management** - Stack/segment clicks push to history when they should replace; search replaces when it should push
3. **View Transitions Complexity** - Over-engineered animation system with Safari-specific hacks and 200+ lines of CSS
4. **Missing Design Element** - No ASCII cloud background pattern (subtle, decorative)
5. **Desktop-First Approach** - Mobile performance suffers due to desktop-first implementation

## Goals

Target end state for the portfolio website:

- **Mobile-first performance** - Optimized for mobile devices with 60fps animations
- **Preserve existing data structure** - Keep PROJECTS array and STACK configuration intact
- **Maintain visual identity** - Preserve Klein Blue (#002FA7) color scheme
- **WCAG 2.2 AA compliance** - Full accessibility compliance with proper ARIA labels and keyboard navigation
- **Subtle ASCII cloud background** - Decorative background pattern at low opacity
- **Correct history management** - Use `router.replace()` for filters, `router.push()` for search

## Implementation Requirements

### Part 1: Visualization Library Optimization

**Current State**: D3.js force simulation (290.4kB monolithic bundle)

**Options Evaluated**:

#### Option A: Canvas-based Chart.js

- **Benefits**: HTML5 Canvas with GPU acceleration for better mobile performance
- **Size**: ~60-80kB with tree shaking
- **Mobile**: Smooth rendering on mobile devices
- **Trade-off**: Less flexible interactions than SVG, requires custom hit detection

#### Option B: Apache ECharts

- **Benefits**: Adaptive rendering (Canvas/SVG/WebGL) based on data complexity
- **Size**: ~300kB with lazy loading support
- **Mobile**: Excellent performance with 10,000+ data points
- **Trade-off**: Larger bundle than Chart.js

#### Option C: Lightweight Custom Canvas Solution

- **Benefits**: Minimal bundle size, complete control over rendering
- **Size**: ~5-10kB (custom code only)
- **Mobile**: Maximum performance, no library overhead
- **Trade-off**: Higher development effort, need to implement all features manually

**Decision**: Option C (Custom Canvas) for maximum performance

#### Phase 1a: D3 Modular Imports (Tree-Shaking)

**Status**: ✅ COMPLETED

**Implementation**:

- Replaced monolithic `d3` package (290.4kB) with modular imports:
  - `d3-force` (force simulation)
  - `d3-shape` (arc, pie generators)
  - `d3-selection` (DOM selection)
  - `d3-transition` (animation transitions)
  - `d3-ease` (easing functions)
  - `d3-interpolate` (value interpolation)
- Updated all source files to use direct imports instead of `import * as d3`
- Added corresponding `@types/d3-*` packages for TypeScript support

**Files Modified**:

- `src/hooks/use-stack-simulation.ts` - Uses `forceSimulation` from d3-force
- `src/utils/stack-cloud/create-forces.ts` - Uses force functions from d3-force
- `src/utils/stack-cloud/calculate-domain-angles.ts` - Uses `pie` from d3-shape
- `src/utils/stack-cloud/boundary-force.ts` - Uses `Force` type from d3-force
- `src/utils/stack-cloud/root-exclusion-force.ts` - Uses `Force` type from d3-force
- `src/components/stack-cloud/root-node-chart.tsx` - Uses arc, pie, select, interpolate, etc.
- `src/types/simulation.ts` - Uses `SimulationNodeDatum` type from d3-force

**Results**:

- Removed 50 packages from node_modules (monolithic D3 bundle)
- Added 9 modular packages (targeted imports)
- Significant bundle size reduction through tree-shaking
- TypeScript type checks passing
- Knip validation passing

### Part 2: Project Display Simplification

**Status**: ✅ COMPLETED

**Implementation**:

- Removed View Transitions API from `projects.tsx` (no more `flushSync`, `startViewTransition`, or `ViewTransition` refs)
- Removed Safari-specific browser detection hacks
- Removed `view-transition-name` CSS custom property from `project.tsx`
- Replaced 200+ lines of `::view-transition-*` CSS selectors with simple animations
- Simplified to just two CSS animation classes: `.project-enter` and `.project-stay`
- Removed complex z-index management (z-19 to z-22) in favor of natural stacking
- Kept `diffProjectStates` utility for determining enter/stay states
- Added screen reader announcement for filter results (WCAG 2.2 SC 4.1.3)

**New Simple Approach**:

- `project-enter`: Fade in with subtle upward movement, staggered by item index
- `project-stay`: Subtle pulse animation for items that remain visible
- Works on all browsers without Safari-specific hacks
- Respects `prefers-reduced-motion` for accessibility

### Part 3: URL/History Management Fix

**Status**: ✅ COMPLETED

**Problem Identified**:

- `src/components/stack-cloud/stack-node.tsx:132` - Uses `router.push()` ❌ → Fixed to `router.replace()` ✅
- `src/components/stack-cloud/root-node-chart.tsx:855` - Uses `router.push()` ❌ → Fixed to `router.replace()` ✅
- `src/components/search-input.tsx:57,93,159` - Uses `router.replace()` ❌ → Fixed to `router.push()` ✅

**Solution Implemented**:

```tsx
// Stack nodes and segments should REPLACE history
// src/components/stack-cloud/stack-node.tsx:132
router.replace(`${pathname}${queryString}`, { scroll: false });

// src/components/stack-cloud/root-node-chart.tsx:855
router.replace(`${pathname}${queryString}`, { scroll: false });

// Search input should PUSH to history
// src/components/search-input.tsx:57,93,159
router.push(url, { scroll: false });
```

**Rationale**: Stack filters refine the same view (replace history), while search creates new navigation entries (push to history for back button functionality).

### Part 4: ASCII Cloud Background

**Status**: ✅ COMPLETED

**Implementation**:

- Created `src/components/ascii-clouds.tsx` - Canvas-based animated ASCII cloud component
- Uses procedural wave-based noise to generate flowing cloud patterns
- Characters used: ` `, `.`, `-`, `~`, `:`, `+`, `*`, `#` (density-based)
- Klein blue (#002FA7) color to match site theme
- Subtle opacity (8% max) for non-intrusive background effect
- Eases in over ~3 seconds using cubic easing function
- Each particle has individual lerping for smooth transitions
- Respects `prefers-reduced-motion` (returns null when enabled)
- Hidden in print mode via `print:hidden` class
- Fixed positioning at z-index -1 to stay behind all content
- `pointer-events: none` to not interfere with interactions
- Added component to main page layout (`src/app/page.tsx`)

### Part 5: Accessibility (WCAG 2.2 AA Compliance)

**Status**: ✅ COMPLETED

**Implementation:**

- ✅ Live Regions - Project filtering announcements implemented (WCAG 2.2 SC 4.1.3)
- ✅ ARIA Hidden - Decorative SVG elements marked for screen readers (WCAG 2.2 SC 1.1.1)
- ✅ Focus Indicators - Enhanced focus styles with `focus-visible` utilities (WCAG 2.2 SC 2.4.11)
- ✅ Skip Links - Expanded skip navigation to include Stack and Projects sections (WCAG 2.2 SC 2.4.1)
- ✅ ARIA Labels - SVG visualization has proper `role="group"` and `aria-label` attributes
- ✅ Keyboard Navigation - Roving tabindex pattern implemented for stack visualization
- ✅ Semantic HTML - Uses `<main>`, `<nav>`, proper button roles for interactive elements

**Requirements Checklist**:

1. **Semantic HTML First**
   - Use `<nav>`, `<main>`, `<section>`, `<article>`
   - Use `<button>` for buttons (not `<div role="button">`)
   - Use `<a>` for links

2. **ARIA Labels**

   ```tsx
   <svg role="img" aria-label="Technology stack distribution">
     <g role="list" aria-label="Stack items">
       <circle role="listitem" aria-label="React: 45% experience" />
     </g>
   </svg>
   ```

3. **Live Regions**

   ```tsx
   <div aria-live="polite" aria-atomic="true" className="sr-only">
     {filteredProjects.length} projects found
   </div>
   ```

4. **Focus Indicators**
   - Minimum 2px outline
   - High contrast (4.5:1 ratio minimum)
   - Visible on all interactive elements
   - Preserve `:focus-visible` styles

5. **Keyboard Navigation**
   - All interactive elements must be keyboard accessible
   - Logical tab order
   - Skip links for repeated content
   - ESC key closes modals/dropdowns

6. **Color Contrast** (WCAG AA = 4.5:1 for text, 3:1 for UI)
   - Test with tools like axe DevTools
   - Don't rely on color alone for meaning
   - Provide text labels alongside color indicators

7. **Touch Targets**
   - Minimum 44x44px (iOS) / 48x48dp (Android)
   - Adequate spacing between targets (8px minimum)

### Part 6: Mobile-First Approach

**Status**: ✅ COMPLETED

**Implementation Progress**:

- ✅ Mobile-first base styles - Tailwind utilities apply mobile-first, then `md:`/`lg:` breakpoints
- ✅ Touch targets 44x44px - All header buttons, contact dropdown, search clear button, and badges meet minimum
- ✅ `will-change` used sparingly - Only on animated elements, respects `prefers-reduced-motion`
- ✅ Scroll/resize events debounced - RAF throttling + debounce utility implemented
- ✅ Image lazy loading - Not applicable (using SVGs only)
- ✅ Hover states on hover-capable devices only - `@media (hover: hover)` wrapping implemented via custom Tailwind `hover-hover:` variant

**Design Philosophy**:

```scss
// Mobile base styles (320px and up)
.stack-visualization {
  // Mobile layout
  grid-template-columns: 1fr;
  font-size: 16px; // Minimum 16px to prevent iOS auto-zoom
}

// Tablet (640px and up)
@media (min-width: 640px) {
  .stack-visualization {
    grid-template-columns: 1fr 1fr;
  }
}

// Desktop (1024px and up)
@media (min-width: 1024px) {
  .stack-visualization {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

**Mobile Performance Optimizations**:

1. Lazy load images (use `loading="lazy"`)
2. Compress images (WebP with PNG fallback)
3. Reduce animations on mobile (use `@media (hover: hover)`)
4. Touch-friendly hit targets (minimum 44x44px)
5. Avoid hover states on touch devices
6. Use `will-change` sparingly (only during animations!)
7. Debounce scroll/resize events

### Part 7: Data Structure Preservation

**Requirements**:

- `PROJECTS` array structure remains unchanged ✅
- `STACK` configuration remains unchanged ✅
- Project icons remain unchanged ✅
- URL parameter structure remains compatible ✅

**Constraint**: No breaking changes to existing data structures

### Part 8: Technology Stack

**Keep**:

- Next.js 15 (App Router) ✅
- TypeScript ✅
- Tailwind CSS ✅
- Radix UI ✅
- Formspree ✅

**Replace**:

- ❌ D3.js → ✅ Chart.js or Custom Canvas
- ❌ Complex view transitions → ✅ Simple CSS animations
- ❌ SVG force simulation → ✅ Canvas rendering

**Add**:

- ✅ ASCII cloud background
- ✅ Better mobile touch handlers
- ✅ Enhanced a11y features

## Implementation Phases

### Phase 1: Foundation

1. Set up new Canvas-based visualization component
2. Create simple project card layout with CSS Grid
3. Implement ASCII clouds background
4. Fix URL/history management bug

### Phase 2: Core Features

1. Port all project data to new components
2. Implement filtering logic (same behavior, new implementation)
3. Add touch-friendly mobile interactions
4. Implement keyboard navigation

### Phase 3: Accessibility

1. Add ARIA labels and live regions
2. Implement focus management
3. Test with screen readers (NVDA, JAWS, VoiceOver)
4. Ensure all WCAG 2.2 AA criteria met

### Phase 4: Polish

1. Performance optimization (Lighthouse score 95+)
2. Cross-browser testing
3. Mobile device testing
4. Final accessibility audit

## Success Metrics

1. **Performance**
   - Lighthouse score: 95+ (baseline: ~75-80)
   - First Contentful Paint: <1.5s (baseline: ~2-3s)
   - Total bundle size: <150kB (baseline: ~450kB)
   - Mobile frame rate: 60fps consistently

2. **Accessibility**
   - WCAG 2.2 AA compliance: 100%
   - Keyboard navigation: All features accessible
   - Screen reader compatible: NVDA, JAWS, VoiceOver
   - Color contrast: All text meets 4.5:1 ratio

3. **User Experience**
   - Touch targets: All ≥44x44px
   - Back button functionality: search pushes history, filters replace
   - Smooth mobile animations
   - Functional on slow 3G connections

## Risks & Mitigations

### Risk 1: Canvas Accessibility

**Problem**: Canvas lacks semantic structure for screen readers
**Solution**: Implement hidden DOM layer with semantic markup for assistive technologies

### Risk 2: Browser Compatibility

**Problem**: Legacy browsers may lack Canvas API support
**Solution**: Progressive enhancement with static fallback for unsupported browsers

### Risk 3: Migration Complexity

**Problem**: Large-scale refactoring may introduce regressions
**Solution**: Parallel implementation with feature flags and A/B testing before full rollout

## Summary

This PRD outlines the optimization strategy for the portfolio website using iterative, agent-driven development. Key improvements include:

- Lightweight visualization libraries (Chart.js or custom Canvas)
- Simplified animation system
- Mobile-first responsive design
- Full WCAG 2.2 AA accessibility compliance
- Subtle ASCII cloud background
- Correct history management for navigation

**Core Principles**:

- Mobile-first implementation
- Simplicity over complexity
- Universal accessibility (WCAG 2.2 AA)
- Performance optimization

---

## Technical Appendix

### A. Recommended Canvas Visualization Implementation

```tsx
import { useEffect, useRef } from "react";
import { StackItem } from "~/types";

interface CanvasStackCloudProps {
  stacks: StackItem[];
  selected?: string | null;
  onStackClick?: (stack: StackItem) => void;
}

export function CanvasStackCloud({
  stacks,
  selected,
  onStackClick,
}: CanvasStackCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: false, // Opaque background = faster rendering
      desynchronized: true, // Reduce input latency
    });
    if (!ctx) return;

    // Create offscreen canvas for double buffering
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement("canvas");
    }

    // Render loop with requestAnimationFrame
    function render() {
      // Draw to offscreen canvas first
      // Then blit to main canvas
      // Prevents flicker during animation
    }

    const animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [stacks, selected]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Technology stack visualization"
      className="w-full h-full"
    />
  );
}
```

### B. Simple Project Card Animation

```css
/* Instead of view transitions API, use this: */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.project-card {
  animation: fadeInUp 0.3s ease-out;
  animation-fill-mode: both;
}

/* Stagger the animations */
.project-card:nth-child(1) {
  animation-delay: 0s;
}
.project-card:nth-child(2) {
  animation-delay: 0.05s;
}
.project-card:nth-child(3) {
  animation-delay: 0.1s;
}
/* etc */

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .project-card {
    animation: none;
  }
}
```

### C. Touch-Optimized Event Handling

```tsx
function useTouchOptimizedClick(onClick: () => void) {
  const touchStartPos = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only trigger click if finger didn't move much (distinguish from scroll)
    if (distance < 10) {
      onClick();
    }
  };

  return { onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd };
}
```

### D. Accessibility-First Canvas Pattern

```tsx
// Hybrid approach: Canvas for visuals, hidden DOM for screen readers
function AccessibleCanvas() {
  return (
    <div className="relative">
      {/* Visual layer (Canvas) */}
      <canvas className="absolute inset-0" aria-hidden="true" />

      {/* Semantic layer (Hidden DOM) */}
      <div className="sr-only" role="list" aria-label="Technology stacks">
        {stacks.map((stack) => (
          <button
            key={stack.id}
            role="listitem"
            aria-label={`${stack.name}: ${stack.percentage}%`}
            onClick={() => handleClick(stack)}
          >
            {stack.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

**Sources & Research**:

_Ralph Wiggum Methodology_:

- [11 Tips For AI Coding With Ralph Wiggum - AI Hero](https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum)
- [The Ralph Wiggum Approach: Running AI Coding Agents for Hours - DEV Community](https://dev.to/sivarampg/the-ralph-wiggum-approach-running-ai-coding-agents-for-hours-not-minutes-57c1)
- [Getting Started With Ralph - AI Hero](https://www.aihero.dev/getting-started-with-ralph)

_Technical Research_:

- [8 Best React Chart Libraries 2025 - Embeddable](https://embeddable.com/blog/react-chart-libraries)
- [SVG vs Canvas vs WebGL Performance 2025 - SVG Genie](https://www.svggenie.com/blog/svg-vs-canvas-vs-webgl-performance-2025)
- [Best React Chart Libraries 2025 - LogRocket](https://blog.logrocket.com/best-react-chart-libraries-2025/)
- [WCAG 2.2 Complete Guide 2025 - AllAccessible](https://www.allaccessible.org/blog/wcag-22-complete-guide-2025)
- [ARIA Labels Implementation Guide 2025 - AllAccessible](https://www.allaccessible.org/blog/implementing-aria-labels-for-web-accessibility)
- [Web Accessibility Best Practices 2025 - Broworks](https://www.broworks.net/blog/web-accessibility-best-practices-2025-guide)
