# Product Requirements Document (PRD)

## Portfolio Rewrite - Mobile-First Pure CSS Visualization

**Project**: terwiel.io Portfolio Rewrite
**Version**: 2.0
**Date**: 2025-01-15
**Author**: Ralph (AI Coding Agent)
**Methodology**: Ralph Wiggum Technique

---

## Overview

This PRD documents the complete rewrite of the terwiel.io portfolio website. The goal is to replace the D3.js-based force-directed graph visualization with a pure CSS solution while maintaining or improving functionality, drastically improving mobile performance, and adhering to the highest WCAG 2.2 accessibility standards.

### Current State

- **Stack**: Next.js 15, TypeScript, Tailwind CSS, D3.js (d3-ease, d3-force, d3-interpolate, d3-selection, d3-shape, d3-transition)
- **Visualization**: D3 force-directed graph with physics simulation (1138 lines in root-node-chart.tsx alone)
- **Layout**: Desktop split-screen (StackCloud left, Projects right), Mobile stacked
- **Performance Issues**: Heavy D3 calculations, physics simulation impact on mobile
- **URL History Bug**: Stack segment clicks push to history when they should replace

### Target State

- **Stack**: Next.js 15, TypeScript, Tailwind CSS, NO D3
- **Visualization**: Pure CSS-based visualization (Grid, Flexbox, CSS animations, transforms)
- **Layout**: Mobile-first responsive design
- **Performance**: Lighthouse score 95+ on mobile, smooth 60fps animations
- **Accessibility**: WCAG 2.2 Level AA compliance minimum, AAA where feasible
- **Background**: Subtle ASCII clouds (performant, respects prefers-reduced-motion)

---

## Core Principles

1. **Mobile-First**: Design and build for mobile first, enhance for desktop
2. **Performance**: Every feature must be performant on mid-range mobile devices
3. **Accessibility**: WCAG 2.2 compliance is non-negotiable
4. **Simplicity**: Pure CSS preferred over JavaScript complexity
5. **Data Integrity**: Keep existing data structure, may change internal data structure
6. **Progressive Enhancement**: Core functionality works without JS, enhanced with JS
7. **Testing**: Use agent-browser.dev for validation throughout development

---

## Feature Requirements (Ralph Format)

### Part 1: Project Setup & Architecture

```json
{
  "category": "Setup",
  "id": "SETUP-001",
  "title": "Initialize rewrite structure on current branch",
  "description": "Set up the foundation for the rewrite and folder structure",
  "acceptance_criteria": [
    "Directory structure planned for new components",
    "Old stack-cloud components identified for deletion",
    "New visualization approach documented in comments"
  ],
  "steps_to_verify": [
    "Check 'src/components/' for new structure",
    "Verify old files are marked for deletion"
  ],
  "passes": true
}
```

```json
{
  "category": "Setup",
  "id": "SETUP-002",
  "title": "Remove D3.js dependencies",
  "description": "Remove all D3 packages from package.json and update imports throughout codebase",
  "acceptance_criteria": [
    "All d3-* packages removed from package.json dependencies",
    "All d3-* packages removed from devDependencies",
    "No import statements from 'd3-*' anywhere in codebase",
    "npm install completes successfully",
    "TypeScript compilation succeeds (tsc --noEmit)"
  ],
  "steps_to_verify": [
    "Search codebase for 'from \"d3' - should return 0 results",
    "Run 'npm install' without errors",
    "Run 'npm run typecheck' without errors"
  ],
  "dependencies": ["SETUP-001"],
  "passes": true
}
```

```json
{
  "category": "Setup",
  "id": "SETUP-003",
  "title": "Define new data structure for CSS-based visualization",
  "description": "Design and implement data structure optimized for CSS Grid/Flexbox layout instead of physics simulation",
  "acceptance_criteria": [
    "New type definitions created in src/types/",
    "Data structure supports hierarchical stack relationships (parent-child)",
    "Data structure includes layout hints (grid position, visual grouping)",
    "Existing project data migrated to new structure",
    "All domain categories preserved (Front-end, Back-end, Design, DevOps, QA, AI)",
    "Documentation comments explain structure"
  ],
  "steps_to_verify": [
    "Check src/types/ for new type definitions",
    "Verify src/data/stack.ts uses new structure",
    "Confirm all 11 projects have valid stack items",
    "TypeScript compilation passes"
  ],
  "dependencies": ["SETUP-002"],
  "passes": true
}
```

### Part 2: Core Layout & Navigation

```json
{
  "category": "Layout",
  "id": "LAYOUT-001",
  "title": "Implement mobile-first base layout",
  "description": "Create new page layout that works perfectly on mobile (320px+) and scales up to desktop",
  "acceptance_criteria": [
    "Mobile layout (320px-768px): Single column, stack visualization above projects",
    "Tablet layout (768px-1024px): Optimized for touch, readable spacing",
    "Desktop layout (1024px+): Two-column layout with sticky stack visualization",
    "No horizontal scroll on any viewport size",
    "Smooth transitions between breakpoints",
    "Touch targets minimum 44x44px (WCAG 2.2 SC 2.5.8)",
    "Test on agent-browser.dev mobile simulation"
  ],
  "steps_to_verify": [
    "Open in browser DevTools, test 320px, 375px, 768px, 1024px, 1920px widths",
    "Use agent-browser.dev to test on simulated devices",
    "Check touch target sizes with browser inspector",
    "Verify no horizontal overflow with 'overflow-x' check"
  ],
  "dependencies": ["SETUP-003"],
  "passes": true
}
```

```json
{
  "category": "Layout",
  "id": "LAYOUT-002",
  "title": "Implement ASCII clouds background",
  "description": "Integrate subtle ASCII clouds effect as background (already partially implemented in src/components/ascii-clouds.tsx), ensure maximum performance",
  "acceptance_criteria": [
    "ASCII clouds render at 60fps on mobile devices",
    "Uses requestAnimationFrame for smooth animation",
    "Respects prefers-reduced-motion (static or disabled when set)",
    "Z-index properly layered (background, behind all content)",
    "Opacity subtle (max 0.08-0.10) to not distract from content",
    "Canvas properly sized and responsive",
    "No memory leaks (cleanup on unmount)",
    "Klein blue color (#002FA7) used for clouds",
    "Lighthouse performance score not impacted"
  ],
  "steps_to_verify": [
    "Open DevTools Performance tab, record 6 seconds, verify consistent 60fps",
    "Set prefers-reduced-motion in DevTools, verify clouds stop/simplify",
    "Check z-index hierarchy in Elements panel",
    "Use Memory profiler to verify no leaks after navigation",
    "Run Lighthouse audit, verify Performance >= 95"
  ],
  "dependencies": ["LAYOUT-001"],
  "passes": true
}
```

```json
{
  "category": "Navigation",
  "id": "NAV-001",
  "title": "Fix URL history management",
  "description": "Implement proper history management: router.replace() for stack interactions, router.push() for search queries",
  "acceptance_criteria": [
    "Clicking stack segment uses router.replace() (no history entry)",
    "Clicking stack node uses router.replace() (no history entry)",
    "Typing in search uses router.push() (creates history entry)",
    "Back button returns to previous search, not previous stack selection",
    "Forward button works correctly",
    "URL properly reflects current state",
    "No duplicate history entries",
    "Test scenario: Click stack A -> stack B -> search 'Rust' -> back button returns to stack B view with no filter"
  ],
  "steps_to_verify": [
    "Open browser with History panel visible",
    "Perform test scenario above",
    "Verify history.length increases only on search",
    "Use agent-browser.dev to verify behavior"
  ],
  "dependencies": ["LAYOUT-001"],
  "passes": true
}
```

### Part 3: Stack Visualization (Pure CSS)

```json
{
  "category": "Visualization",
  "id": "VIZ-001",
  "title": "Design CSS-based stack visualization layout",
  "description": "Create visual design and CSS architecture for displaying technology stack without D3.js physics",
  "acceptance_criteria": [
    "Layout approach decided: CSS Grid, Flexbox, or hybrid",
    "Visual hierarchy clearly shows domains (Front-end, Back-end, Design, DevOps, QA, AI)",
    "Hierarchical relationships visible (e.g., Tanstack -> Tanstack Router)",
    "Works on mobile (320px+) without horizontal scroll",
    "Sketch/wireframe documented in code comments or separate file",
    "Color scheme uses existing OKLCH palette (Klein blue, domain colors)",
    "Animation strategy defined (CSS transitions, transforms, keyframes)",
    "Interaction pattern decided (click, hover, focus)"
  ],
  "steps_to_verify": [
    "Review design documentation or comments",
    "Verify layout renders correctly at 320px, 768px, 1024px widths",
    "Check color contrast meets WCAG 2.2 AA (4.5:1 for text)",
    "Test keyboard navigation (Tab, Enter, Arrow keys)"
  ],
  "dependencies": ["SETUP-003"],
  "passes": true
}
```

```json
{
  "category": "Visualization",
  "id": "VIZ-002",
  "title": "Implement domain grouping component",
  "description": "Create component to display technology domains (Front-end, Back-end, etc.) as interactive groups",
  "acceptance_criteria": [
    "Each domain rendered as distinct visual group",
    "Domain colors from DOMAIN_COLORS constant used",
    "Accessible labels (aria-label, role attributes)",
    "Keyboard navigable (Tab order logical)",
    "Focus indicators visible and meet WCAG 2.2 SC 2.4.7",
    "Touch-friendly on mobile (44x44px minimum)",
    "Smooth transitions on interaction (300ms max)",
    "Hover states only on devices that support hover (hover:hover media query)",
    "No layout shift on interaction (CLS = 0)"
  ],
  "steps_to_verify": [
    "Navigate with keyboard only, verify all domains reachable",
    "Use axe DevTools to check accessibility",
    "Check focus indicators with :focus-visible styles",
    "Test touch targets on mobile simulation",
    "Measure CLS in Lighthouse (should be 0)"
  ],
  "dependencies": ["VIZ-001"],
  "passes": false
}
```

```json
{
  "category": "Visualization",
  "id": "VIZ-003",
  "title": "Implement stack item component (CSS only)",
  "description": "Create individual stack item badges/cards using pure CSS, no D3",
  "acceptance_criteria": [
    "Each technology renders as clickable item",
    "Icons display correctly (existing SVG icons)",
    "CSS transitions for hover/focus/active states",
    "Magnetic effect classes applied (magnetic-base, magnetic-rounded-lg)",
    "Parent-child relationships visually indicated",
    "Clicking item filters projects (uses router.replace())",
    "Selected state persists visually",
    "Works with CSS Grid or Flexbox layout",
    "Scales properly across viewport sizes",
    "No JavaScript required for visual layout"
  ],
  "steps_to_verify": [
    "Click each stack item, verify project list filters",
    "Check URL uses replace (no history entry)",
    "Verify visual hierarchy shows parent-child relationships",
    "Test on mobile (320px) and desktop (1920px)",
    "Disable JavaScript, verify layout still works"
  ],
  "dependencies": ["VIZ-002"],
  "passes": false
}
```

```json
{
  "category": "Visualization",
  "id": "VIZ-004",
  "title": "Implement CSS animations for stack interactions",
  "description": "Add smooth, performant animations for user interactions using CSS only",
  "acceptance_criteria": [
    "Hover state animates with transform (scale, translate)",
    "Focus state shows clear visual indicator (ring, outline)",
    "Active/pressed state provides feedback (scale down)",
    "Selected state distinguished from unselected",
    "Transitions use cubic-bezier easing (ease-in-out)",
    "Will-change property used judiciously for performance",
    "Animations respect prefers-reduced-motion",
    "No janky animations (all 60fps on mobile)",
    "Transform and opacity only (avoid layout-affecting properties)",
    "GPU acceleration used (transform: translate3d)"
  ],
  "steps_to_verify": [
    "Record Performance profile, verify 60fps during animations",
    "Set prefers-reduced-motion, verify animations reduce/stop",
    "Check DevTools Layers panel for GPU acceleration",
    "Test on agent-browser.dev mobile simulation",
    "Verify no layout thrashing (no forced reflows)"
  ],
  "dependencies": ["VIZ-003"],
  "passes": false
}
```

```json
{
  "category": "Visualization",
  "id": "VIZ-005",
  "title": "Implement responsive grid/layout system",
  "description": "Create responsive layout that adapts from mobile to desktop without JavaScript",
  "acceptance_criteria": [
    "Mobile (320-768px): Single column, compact spacing",
    "Tablet (768-1024px): 2-3 columns or optimized single column",
    "Desktop (1024+): Multi-column or sidebar layout",
    "CSS Grid or Flexbox with wrap",
    "Container queries used if beneficial (optional)",
    "No JavaScript for layout calculations",
    "Works correctly in landscape orientation on mobile",
    "Proper gap spacing (1rem minimum for readability)",
    "Visual balance across all viewports"
  ],
  "steps_to_verify": [
    "Test at 320px, 375px, 768px, 1024px, 1440px, 1920px",
    "Rotate mobile to landscape, verify layout adapts",
    "Disable JavaScript, verify layout remains functional",
    "Check spacing with DevTools ruler/grid overlay"
  ],
  "dependencies": ["VIZ-004"],
  "passes": false
}
```

### Part 4: Projects Display & Filtering

```json
{
  "category": "Projects",
  "id": "PROJ-001",
  "title": "Redesign project card component",
  "description": "Create new project card design that works beautifully on mobile and scales to desktop",
  "acceptance_criteria": [
    "Mobile-optimized layout (vertical stack)",
    "All project data displayed: company, role, teamSize, industry, location, dateFrom, dateTo, description, url, stack",
    "Side project badge if sideProject: true",
    "Icon displays correctly (using existing icons)",
    "Stack badges clickable (triggers filter with router.replace())",
    "Touch-friendly interaction zones (44x44px minimum)",
    "Readable typography (16px minimum body text)",
    "Sufficient color contrast (WCAG 2.2 AA: 4.5:1)",
    "Focus management for keyboard users",
    "Semantic HTML (article, header, time elements)"
  ],
  "steps_to_verify": [
    "View on mobile (320px), verify all content readable",
    "Click stack badges, verify filtering works",
    "Navigate with keyboard, verify focus order logical",
    "Run axe DevTools, zero accessibility violations",
    "Measure text contrast ratios"
  ],
  "dependencies": ["VIZ-005"],
  "passes": false
}
```

```json
{
  "category": "Projects",
  "id": "PROJ-002",
  "title": "Implement project list with CSS animations",
  "description": "Display all projects with smooth filter animations using pure CSS",
  "acceptance_criteria": [
    "All 11 projects render correctly",
    "Filter animations smooth (opacity, transform)",
    "Entering items fade in (opacity 0 -> 1)",
    "Exiting items fade out (opacity 1 -> 0)",
    "Staying items subtle scale pulse (optional)",
    "Animation duration 300-400ms",
    "View Transitions API used if supported (progressive enhancement)",
    "Fallback to CSS transitions in unsupported browsers",
    "No layout shift during animations (position: absolute for exiting items)",
    "Performance 60fps on mobile"
  ],
  "steps_to_verify": [
    "Filter projects by stack item, verify smooth animation",
    "Record Performance tab, verify 60fps during filter",
    "Test in Chrome (View Transitions), Safari (fallback), Firefox (fallback)",
    "Check Layout Shift score (should be 0)",
    "Test on mobile simulation (agent-browser.dev)"
  ],
  "dependencies": ["PROJ-001"],
  "passes": false
}
```

```json
{
  "category": "Projects",
  "id": "PROJ-003",
  "title": "Implement project filtering logic",
  "description": "Build filtering system that works with stack selections and search queries",
  "acceptance_criteria": [
    "Filter by stack item (exact match)",
    "Filter by domain (shows all projects with any stack item in that domain)",
    "Filter by search query (matches company, role, industry, description, stack names)",
    "Case-insensitive matching",
    "Combines filters correctly (AND logic)",
    "Empty state shown when no matches",
    "Screen reader announcements for filter results (aria-live)",
    "URL state synced (query parameter)",
    "Filter cache for performance (if needed)",
    "Debounced search input (1s delay)"
  ],
  "steps_to_verify": [
    "Click stack item, verify correct projects shown",
    "Search 'Rust', verify correct projects shown",
    "Combine: select domain + search query",
    "Verify empty state shown when no matches",
    "Test with screen reader (NVDA/VoiceOver), verify announcements",
    "Check URL updates correctly"
  ],
  "dependencies": ["PROJ-002"],
  "passes": false
}
```

### Part 5: Search & Interaction

```json
{
  "category": "Search",
  "id": "SEARCH-001",
  "title": "Enhance search input component",
  "description": "Optimize existing search component for new architecture and ensure it uses router.push()",
  "acceptance_criteria": [
    "Search input visible on mobile and desktop",
    "Placeholder text helpful: 'Search - e.g. Rust, 2022, Logistics'",
    "Debounced input (1s) uses router.push() (creates history)",
    "Enter key triggers immediate search (router.push())",
    "Clear button (X icon) works correctly",
    "Focus management (auto-focus on open if modal)",
    "Keyboard navigation (Tab, Escape)",
    "Accessible labels (aria-label)",
    "Mobile keyboard type='search' for proper keyboard",
    "Touch-friendly (44x44px input height)"
  ],
  "steps_to_verify": [
    "Type in search, wait 1s, verify URL updates with router.push",
    "Press Enter, verify immediate navigation",
    "Click X, verify input clears and filter resets",
    "Test keyboard navigation (Tab, Escape)",
    "Check browser History panel for entries",
    "Test on mobile device keyboard"
  ],
  "dependencies": ["PROJ-003"],
  "passes": false
}
```

```json
{
  "category": "Search",
  "id": "SEARCH-002",
  "title": "Implement empty state component",
  "description": "Show helpful empty state when no projects match filter/search",
  "acceptance_criteria": [
    "Displays when filtered list is empty",
    "Shows the search term or filter applied",
    "Provides clear message: 'No projects found for \"{term}\"'",
    "Suggests action: 'Try a different search term or clear filters'",
    "Accessible (proper heading hierarchy, aria-live region)",
    "Visually centered and well-designed",
    "Optional illustration (simple SVG)",
    "Animation on appear (fade in)"
  ],
  "steps_to_verify": [
    "Search for 'nonexistent', verify empty state shows",
    "Check message includes search term",
    "Verify helpful suggestion provided",
    "Test with screen reader, verify announcement",
    "Verify animation smooth (60fps)"
  ],
  "dependencies": ["SEARCH-001"],
  "passes": false
}
```

### Part 6: Accessibility (WCAG 2.2)

```json
{
  "category": "Accessibility",
  "id": "A11Y-001",
  "title": "Implement comprehensive keyboard navigation",
  "description": "Ensure all interactive elements fully keyboard accessible (WCAG 2.2 SC 2.1.1, 2.1.2)",
  "acceptance_criteria": [
    "All interactive elements reachable via Tab",
    "Logical tab order (left-to-right, top-to-bottom)",
    "Shift+Tab reverses navigation",
    "Enter/Space activates buttons and links",
    "Escape closes modals/dropdowns",
    "Arrow keys navigate within groups (roving tabindex)",
    "Focus visible at all times (focus-visible pseudo-class)",
    "No keyboard traps (can exit all components)",
    "Skip links implemented ('Skip to content', 'Skip to projects')",
    "Focus returns to trigger element after modal close"
  ],
  "steps_to_verify": [
    "Navigate entire page using only keyboard",
    "Verify tab order matches visual order",
    "Test all interactions (filter, search, navigation)",
    "Verify skip links work",
    "Use keyboard trap checker tool"
  ],
  "dependencies": ["SEARCH-002"],
  "passes": false
}
```

```json
{
  "category": "Accessibility",
  "id": "A11Y-002",
  "title": "Implement ARIA labels and semantic HTML",
  "description": "Add proper ARIA attributes and use semantic HTML5 elements (WCAG 2.2 SC 4.1.2, 1.3.1)",
  "acceptance_criteria": [
    "Semantic HTML used: header, nav, main, article, section, aside, footer",
    "Headings hierarchical (h1 -> h2 -> h3, no skipping levels)",
    "Landmarks properly labeled (aria-label on nav, main, etc.)",
    "Buttons use <button>, links use <a>",
    "Forms use proper labels (label[for] or aria-label)",
    "Interactive elements have accessible names (aria-label, aria-labelledby)",
    "Dynamic content uses aria-live regions (polite for filters)",
    "aria-expanded, aria-controls used for expandable sections",
    "No redundant ARIA (don't re-state native semantics)",
    "Valid HTML5 (W3C validator passes)"
  ],
  "steps_to_verify": [
    "Run axe DevTools accessibility checker (0 violations)",
    "Validate HTML with W3C Validator",
    "Check heading structure with HeadingsMap extension",
    "Test with screen reader (NVDA on Windows, VoiceOver on Mac)",
    "Verify all interactive elements have accessible names"
  ],
  "dependencies": ["A11Y-001"],
  "passes": false
}
```

```json
{
  "category": "Accessibility",
  "id": "A11Y-003",
  "title": "Ensure color contrast and visual accessibility",
  "description": "Meet WCAG 2.2 Level AA color contrast requirements (SC 1.4.3, 1.4.6, 1.4.11)",
  "acceptance_criteria": [
    "Text contrast ratio >= 4.5:1 (normal text)",
    "Large text contrast ratio >= 3:1 (18pt+, 14pt+ bold)",
    "UI component contrast >= 3:1 (borders, icons)",
    "Focus indicators contrast >= 3:1 against background",
    "Color not sole means of conveying information (use icons, text)",
    "Klein blue (#002FA7) contrast checked against all backgrounds",
    "Domain colors tested for contrast",
    "Dark mode support (optional but consider)",
    "Text resizable to 200% without loss of content",
    "No text in images (use CSS or SVG)"
  ],
  "steps_to_verify": [
    "Use WebAIM Contrast Checker on all text",
    "Test with Chrome DevTools color picker contrast ratio",
    "Zoom browser to 200%, verify readability",
    "Use Colour Contrast Analyser tool",
    "Test with simulated color blindness (Chrome DevTools)"
  ],
  "dependencies": ["A11Y-002"],
  "passes": false
}
```

```json
{
  "category": "Accessibility",
  "id": "A11Y-004",
  "title": "Implement touch target size compliance",
  "description": "Ensure all touch targets meet WCAG 2.2 SC 2.5.8 (44x44px minimum)",
  "acceptance_criteria": [
    "All buttons >= 44x44px touch area",
    "All links >= 44x44px touch area",
    "Stack items >= 44x44px",
    "Form inputs >= 44px height",
    "Spacing between targets >= 8px",
    "Visual size may be smaller if padding creates 44x44px hit area",
    "Works on mobile devices (tested with agent-browser.dev)",
    "No accidental activations due to small targets",
    "Test with large pointer (accessibility setting)"
  ],
  "steps_to_verify": [
    "Measure all interactive elements in DevTools (should show 44x44px)",
    "Test on mobile device or simulator",
    "Use touch target overlay tool (accessibility inspector)",
    "Try activating with finger on real device",
    "Check spacing between adjacent targets (>= 8px)"
  ],
  "dependencies": ["A11Y-003"],
  "passes": false
}
```

```json
{
  "category": "Accessibility",
  "id": "A11Y-005",
  "title": "Implement screen reader optimization",
  "description": "Optimize experience for screen reader users (WCAG 2.2 SC 4.1.3)",
  "acceptance_criteria": [
    "All images have alt text (decorative images alt='')",
    "aria-live regions announce dynamic changes (filter results)",
    "Loading states announced to screen readers",
    "Error messages associated with form fields (aria-describedby)",
    "Visually hidden text for icon-only buttons (sr-only class)",
    "Page title descriptive and unique",
    "Link text descriptive (avoid 'click here')",
    "Tested with NVDA (Windows) and VoiceOver (Mac/iOS)",
    "Navigation landmarks correctly announced",
    "Form validation messages accessible"
  ],
  "steps_to_verify": [
    "Test full page with NVDA screen reader",
    "Test full page with VoiceOver screen reader",
    "Filter projects, verify announcement of result count",
    "Submit search, verify loading state announced",
    "Navigate with landmarks (NVDA: D for landmark, H for heading)",
    "Record test session video for documentation"
  ],
  "dependencies": ["A11Y-004"],
  "passes": false
}
```

### Part 7: Performance Optimization

```json
{
  "category": "Performance",
  "id": "PERF-001",
  "title": "Optimize initial page load",
  "description": "Achieve Lighthouse Performance score >= 95 on mobile",
  "acceptance_criteria": [
    "Lighthouse Performance score >= 95 (mobile)",
    "First Contentful Paint (FCP) < 1.8s",
    "Largest Contentful Paint (LCP) < 2.5s",
    "Time to Interactive (TTI) < 3.8s",
    "Total Blocking Time (TBT) < 200ms",
    "Cumulative Layout Shift (CLS) < 0.1",
    "No render-blocking resources",
    "Images optimized (Next.js Image component)",
    "Fonts preloaded (if custom fonts used)",
    "Critical CSS inlined (Next.js handles this)"
  ],
  "steps_to_verify": [
    "Run Lighthouse audit in Chrome DevTools (Mobile)",
    "Check all Core Web Vitals meet targets",
    "Test on slow 3G throttling",
    "Use WebPageTest for detailed analysis",
    "Test on agent-browser.dev mobile simulation"
  ],
  "dependencies": ["A11Y-005"],
  "passes": false
}
```

```json
{
  "category": "Performance",
  "id": "PERF-002",
  "title": "Optimize runtime performance",
  "description": "Ensure smooth 60fps animations and interactions on mobile devices",
  "acceptance_criteria": [
    "All animations run at 60fps",
    "No frame drops during scroll",
    "No frame drops during filter animations",
    "Long tasks < 50ms (no main thread blocking)",
    "Interaction to Next Paint (INP) < 200ms",
    "Use transform and opacity only for animations",
    "GPU acceleration enabled (translate3d, will-change)",
    "Minimize reflows and repaints",
    "Efficient event handlers (passive listeners, debouncing)",
    "No memory leaks (proper cleanup)"
  ],
  "steps_to_verify": [
    "Record Performance profile during interactions",
    "Verify 60fps in FPS meter",
    "Check for long tasks in Performance panel",
    "Use Lighthouse to measure INP",
    "Profile memory over time (no increasing trend)",
    "Test on agent-browser.dev with CPU throttling"
  ],
  "dependencies": ["PERF-001"],
  "passes": false
}
```

```json
{
  "category": "Performance",
  "id": "PERF-003",
  "title": "Optimize bundle size",
  "description": "Minimize JavaScript bundle size by removing D3 and optimizing imports",
  "acceptance_criteria": [
    "Total bundle size reduced by >= 30% compared to current",
    "No D3 packages in bundle",
    "Tree-shaking effective (no unused exports)",
    "Dynamic imports for non-critical components",
    "Vendor bundle split properly",
    "Compression enabled (gzip or brotli)",
    "Analyze bundle with next/bundle-analyzer",
    "No duplicate dependencies"
  ],
  "steps_to_verify": [
    "Run 'npm run build', check output size",
    "Compare with current build size (should be ~30% smaller)",
    "Use webpack-bundle-analyzer to visualize",
    "Search bundle for 'd3' (should not appear)",
    "Check for duplicate packages (npm ls or bundle analyzer)"
  ],
  "dependencies": ["PERF-002"],
  "passes": false
}
```

```json
{
  "category": "Performance",
  "id": "PERF-004",
  "title": "Implement efficient caching strategy",
  "description": "Use memoization and React optimization techniques to prevent unnecessary re-renders",
  "acceptance_criteria": [
    "useMemo for expensive calculations (filtering)",
    "useCallback for event handlers passed to children",
    "React.memo for pure components",
    "Proper dependency arrays (no missing/extra deps)",
    "Filter cache implemented (if beneficial)",
    "No unnecessary re-renders (React DevTools Profiler)",
    "Suspense boundaries for lazy loading",
    "StartTransition for non-urgent updates"
  ],
  "steps_to_verify": [
    "Use React DevTools Profiler to record session",
    "Verify no unnecessary re-renders during interaction",
    "Check each useMemo/useCallback has correct deps",
    "Run ESLint exhaustive-deps rule (0 warnings)",
    "Compare re-render count before/after optimization"
  ],
  "dependencies": ["PERF-003"],
  "passes": false
}
```

### Part 8: Testing & Validation

```json
{
  "category": "Testing",
  "id": "TEST-001",
  "title": "Test across browsers and devices",
  "description": "Ensure cross-browser compatibility (Chrome, Firefox, Safari, Edge)",
  "acceptance_criteria": [
    "Chrome (desktop & mobile): All features work",
    "Firefox (desktop & mobile): All features work",
    "Safari (desktop & iOS): All features work, view transitions fallback",
    "Edge (desktop): All features work",
    "Samsung Internet (mobile): All features work (if possible to test)",
    "Layout consistent across browsers (within reason)",
    "Graceful degradation for unsupported features",
    "Polyfills added if needed (View Transitions API)",
    "Tested on agent-browser.dev"
  ],
  "steps_to_verify": [
    "Test on Chrome latest (Windows, macOS, Android)",
    "Test on Firefox latest (Windows, macOS, Android)",
    "Test on Safari latest (macOS, iOS)",
    "Test on Edge latest (Windows)",
    "Use agent-browser.dev for mobile browsers",
    "Document any browser-specific issues"
  ],
  "dependencies": ["PERF-004"],
  "passes": false
}
```

```json
{
  "category": "Testing",
  "id": "TEST-002",
  "title": "Validate accessibility compliance",
  "description": "Run comprehensive accessibility audits and achieve WCAG 2.2 Level AA compliance",
  "acceptance_criteria": [
    "axe DevTools: 0 violations",
    "WAVE tool: 0 errors",
    "Lighthouse Accessibility score: 100",
    "Manual keyboard navigation test passed",
    "Manual screen reader test passed (NVDA + VoiceOver)",
    "Color contrast test passed (all text)",
    "Touch target test passed (all elements >= 44x44px)",
    "W3C HTML Validator: 0 errors",
    "Focus management test passed",
    "ARIA implementation test passed"
  ],
  "steps_to_verify": [
    "Run axe DevTools on all pages",
    "Run WAVE tool on all pages",
    "Run Lighthouse Accessibility audit",
    "Perform manual keyboard test (Tab through entire page)",
    "Perform manual screen reader test (NVDA and VoiceOver)",
    "Validate HTML with W3C Validator",
    "Document test results"
  ],
  "dependencies": ["TEST-001"],
  "passes": false
}
```

```json
{
  "category": "Testing",
  "id": "TEST-003",
  "title": "Test on real mobile devices",
  "description": "Validate on actual mobile devices, not just simulators",
  "acceptance_criteria": [
    "iPhone (iOS 16+): All features work, smooth performance",
    "Android (recent version): All features work, smooth performance",
    "Mid-range device tested (not flagship): Performance acceptable",
    "Touch interactions work correctly (tap, swipe, pinch)",
    "Landscape orientation works",
    "Mobile keyboard interactions work",
    "Mobile Safari quirks addressed (if any)",
    "Chrome on Android tested",
    "agent-browser.dev testing completed"
  ],
  "steps_to_verify": [
    "Test on physical iPhone (or Xcode Simulator)",
    "Test on physical Android device (or Android Studio Emulator)",
    "Test on mid-range device (not flagship)",
    "Record video of interactions for documentation",
    "Use agent-browser.dev for comprehensive mobile testing",
    "Note any device-specific issues"
  ],
  "dependencies": ["TEST-002"],
  "passes": false
}
```

```json
{
  "category": "Testing",
  "id": "TEST-004",
  "title": "Validate Core Web Vitals",
  "description": "Measure and confirm all Core Web Vitals meet 'Good' thresholds",
  "acceptance_criteria": [
    "LCP (Largest Contentful Paint) < 2.5s (Good)",
    "FID (First Input Delay) < 100ms (Good) or INP < 200ms",
    "CLS (Cumulative Layout Shift) < 0.1 (Good)",
    "Measured on real mobile devices (3G network)",
    "Measured with Chrome User Experience Report data (if available)",
    "PageSpeed Insights shows 'Good' for all CWV",
    "Field data (real users) meets targets (if traffic available)",
    "Lab data (Lighthouse) meets targets"
  ],
  "steps_to_verify": [
    "Run PageSpeed Insights for URL",
    "Check all Core Web Vitals in 'Good' range",
    "Test with network throttling (Slow 3G)",
    "Use WebPageTest for detailed CWV report",
    "Monitor Field Data in Chrome UX Report (if available)",
    "Document scores with screenshots"
  ],
  "dependencies": ["TEST-003"],
  "passes": false
}
```

### Part 9: Documentation & Cleanup

```json
{
  "category": "Documentation",
  "id": "DOC-001",
  "title": "Update CLAUDE.md with new architecture",
  "description": "Document the new architecture, removed D3 dependencies, and CSS visualization approach",
  "acceptance_criteria": [
    "CLAUDE.md updated with new architecture description",
    "D3.js removal documented",
    "CSS visualization approach explained",
    "New component structure documented",
    "Performance improvements noted",
    "Accessibility features documented",
    "Updated development workflow (if changed)",
    "Known issues/limitations listed (if any)"
  ],
  "steps_to_verify": [
    "Read CLAUDE.md and verify accuracy",
    "Confirm all major changes documented",
    "Check for clarity and completeness",
    "Verify no outdated references to D3"
  ],
  "dependencies": ["TEST-004"],
  "passes": false
}
```

```json
{
  "category": "Documentation",
  "id": "DOC-002",
  "title": "Add inline code comments and JSDoc",
  "description": "Document complex logic, CSS techniques, and component APIs with clear comments",
  "acceptance_criteria": [
    "All components have JSDoc comments",
    "Complex functions have explanation comments",
    "CSS tricks/techniques documented (e.g., sticky positioning, grid layout)",
    "Props interfaces fully documented",
    "Utility functions have JSDoc",
    "Accessibility features explained in comments",
    "Performance optimizations noted in comments",
    "No TODO comments left unresolved"
  ],
  "steps_to_verify": [
    "Review all .tsx and .ts files for JSDoc comments",
    "Check that complex logic has explanations",
    "Verify prop interfaces documented",
    "Search for TODO comments, resolve or document",
    "Read through codebase as if new developer"
  ],
  "dependencies": ["DOC-001"],
  "passes": false
}
```

```json
{
  "category": "Cleanup",
  "id": "CLEAN-001",
  "title": "Remove old D3-based components",
  "description": "Delete all old stack-cloud D3 components and unused files",
  "acceptance_criteria": [
    "src/components/stack-cloud/ directory removed",
    "src/hooks/use-stack-simulation.ts removed",
    "src/utils/stack-cloud/ directory removed (if all D3-related)",
    "src/types/simulation.ts removed (if D3-specific)",
    "All imports to deleted files removed",
    "No dead code remaining",
    "TypeScript compilation succeeds",
    "npm run knip shows no unused files"
  ],
  "steps_to_verify": [
    "Run 'npm run knip' to check for unused files",
    "Search codebase for references to deleted files",
    "Run 'npm run typecheck' (should pass)",
    "Run 'npm run build' (should succeed)",
    "Manually verify deleted files are gone"
  ],
  "dependencies": ["DOC-002"],
  "passes": false
}
```

```json
{
  "category": "Cleanup",
  "id": "CLEAN-002",
  "title": "Run linter and fix all issues",
  "description": "Ensure code quality with Biome linter and formatter",
  "acceptance_criteria": [
    "npm run lint returns 0 errors, 0 warnings",
    "npm run format applied successfully",
    "All code follows project style guide (Biome config)",
    "No console.log statements left in production code",
    "No unused variables or imports",
    "No any types (except where necessary with comment)",
    "All files formatted consistently"
  ],
  "steps_to_verify": [
    "Run 'npm run lint' (should pass with 0 issues)",
    "Run 'npm run format' to format all files",
    "Run 'npm run typecheck' (should pass)",
    "Search for console.log (should be none)",
    "Review any 'any' types for necessity"
  ],
  "dependencies": ["CLEAN-001"],
  "passes": false
}
```

### Part 10: Final Integration & Deployment

```json
{
  "category": "Integration",
  "id": "INT-001",
  "title": "Integration test of complete user flows",
  "description": "Test end-to-end user scenarios to ensure everything works together",
  "acceptance_criteria": [
    "User flow 1: View stack -> click domain -> see filtered projects",
    "User flow 2: View stack -> click stack item -> see filtered projects -> back button works correctly",
    "User flow 3: Search for technology -> see results -> clear search -> see all projects",
    "User flow 4: Navigate with keyboard only -> complete all actions",
    "User flow 5: Use screen reader -> complete all actions",
    "User flow 6: Mobile device -> touch interactions work -> no horizontal scroll",
    "All flows complete without errors",
    "All flows smooth and performant",
    "No console errors or warnings"
  ],
  "steps_to_verify": [
    "Execute each user flow manually",
    "Record video of each flow for documentation",
    "Check browser console for errors (should be clean)",
    "Verify back/forward navigation works correctly",
    "Test on agent-browser.dev"
  ],
  "dependencies": ["CLEAN-002"],
  "passes": false
}
```

```json
{
  "category": "Integration",
  "id": "INT-002",
  "title": "Verify data integrity and completeness",
  "description": "Ensure all 11 projects and all stack items display correctly",
  "acceptance_criteria": [
    "All 11 projects render without errors",
    "All project data fields populated correctly",
    "All stack items render with correct icons",
    "All domain colors display correctly",
    "All hierarchical relationships preserved (parent-child)",
    "All links work (external project URLs)",
    "Date formatting correct (date-fns)",
    "No missing icons or placeholders",
    "Side project badge shows for correct projects (PROJECT_9, PROJECT_8)"
  ],
  "steps_to_verify": [
    "View each project individually",
    "Click each stack item, verify filter works",
    "Verify all icons display (no broken images)",
    "Check date formatting for all projects",
    "Verify side project badges appear on PROJECT_9 and PROJECT_8",
    "Click all external links (open in new tabs)"
  ],
  "dependencies": ["INT-001"],
  "passes": false
}
```

```json
{
  "category": "Deployment",
  "id": "DEPLOY-001",
  "title": "Build production bundle and verify",
  "description": "Create production build and validate output",
  "acceptance_criteria": [
    "npm run build completes successfully",
    "Build output shows file sizes",
    "Total bundle size reduced compared to previous version",
    "No build warnings or errors",
    "All routes pre-rendered correctly (if static)",
    "Source maps generated (for debugging)",
    "Assets optimized (images, fonts)",
    "HTML, CSS, JS minified"
  ],
  "steps_to_verify": [
    "Run 'npm run build'",
    "Check build output for errors/warnings",
    "Compare bundle sizes with previous build",
    "Verify all static pages generated correctly",
    "Run 'npm start' and test production build locally"
  ],
  "dependencies": ["INT-002"],
  "passes": false
}
```

```json
{
  "category": "Deployment",
  "id": "DEPLOY-002",
  "title": "Deploy to staging and validate",
  "description": "Deploy to staging environment (Vercel preview) and run final tests",
  "acceptance_criteria": [
    "Deployed to Vercel preview URL",
    "All pages load correctly on staging",
    "All interactions work on staging",
    "Run Lighthouse on staging URL (Performance >= 95)",
    "Run accessibility audit on staging (axe, WAVE)",
    "Test on real devices accessing staging URL",
    "No console errors on staging",
    "Agent-browser.dev tests pass on staging"
  ],
  "steps_to_verify": [
    "Deploy to Vercel (automatic on push or manual)",
    "Access preview URL in multiple browsers",
    "Run Lighthouse on preview URL",
    "Run axe DevTools on preview URL",
    "Test on real mobile devices",
    "Test on agent-browser.dev",
    "Document staging URL and test results"
  ],
  "dependencies": ["DEPLOY-001"],
  "passes": false
}
```

```json
{
  "category": "Deployment",
  "id": "DEPLOY-003",
  "title": "Production deployment and monitoring",
  "description": "Deploy to production (main branch) and monitor initial performance",
  "acceptance_criteria": [
    "Merged to main branch (or production branch)",
    "Production deployment successful",
    "Production URL accessible",
    "DNS/routing works correctly",
    "SSL certificate valid",
    "Analytics tracking works (if implemented)",
    "Error monitoring set up (Sentry or similar, if used)",
    "Core Web Vitals monitored (Chrome UX Report)",
    "No errors in first 24 hours",
    "Performance metrics meet targets"
  ],
  "steps_to_verify": [
    "Merge to main/production branch",
    "Verify deployment success in Vercel dashboard",
    "Access production URL (terwiel.io)",
    "Run final Lighthouse audit on production",
    "Monitor error tracking for 24-48 hours",
    "Check Core Web Vitals in PageSpeed Insights after 24h",
    "Verify analytics data flowing (if implemented)"
  ],
  "dependencies": ["DEPLOY-002"],
  "passes": false
}
```

---

## Success Criteria Summary

This rewrite will be considered successful when:

1. ✅ **D3.js Removed**: Zero D3 dependencies, pure CSS visualization
2. ✅ **Mobile Performance**: Lighthouse Performance >= 95 on mobile
3. ✅ **Accessibility**: WCAG 2.2 Level AA compliance (Level AAA where feasible)
4. ✅ **Core Web Vitals**: All CWV in "Good" range (LCP < 2.5s, INP < 200ms, CLS < 0.1)
5. ✅ **Bundle Size**: 30%+ reduction in JavaScript bundle size
6. ✅ **Smooth Animations**: 60fps on mobile devices
7. ✅ **Correct URL Behavior**: Stack uses replace, search uses push
8. ✅ **ASCII Clouds**: Subtle background effect, performant, respects motion preferences
9. ✅ **Browser Support**: Works in Chrome, Firefox, Safari, Edge (latest versions)
10. ✅ **Mobile-First**: Perfect experience on 320px+ devices
11. ✅ **Data Integrity**: All 11 projects display correctly with all features
12. ✅ **Zero Console Errors**: Clean browser console in production

---

## Testing Resources

- **agent-browser.dev**: Primary mobile/browser testing tool
- **Lighthouse**: Performance and accessibility audits
- **axe DevTools**: Accessibility checker (Chrome/Firefox extension)
- **WAVE**: Web accessibility evaluation tool
- **NVDA**: Windows screen reader (free)
- **VoiceOver**: macOS/iOS screen reader (built-in)
- **WebPageTest**: Detailed performance analysis
- **Chrome DevTools**: Performance profiling, network throttling
- **Firefox DevTools**: Accessibility inspector

---

## Implementation Notes for Ralph (AI Agent)

1. **Priority Order**: Implement features in the order listed (SETUP → LAYOUT → NAV → VIZ → PROJ → SEARCH → A11Y → PERF → TEST → DOC → CLEAN → INT → DEPLOY)
2. **Dependencies**: Do not start a task until its dependencies are marked passes: true
3. **Testing**: Test each feature immediately after implementation (don't batch testing)
4. **Agent-Browser**: Use agent-browser.dev frequently throughout development
5. **Documentation**: Update comments as you go, don't leave for the end
6. **Performance**: Profile early and often, don't optimize prematurely but catch regressions
7. **Accessibility**: Test with screen reader regularly, not just automated tools
8. **Mobile-First**: Start every component at 320px width, then scale up
9. **Passes Field**: Mark passes: true ONLY when all acceptance criteria met and verified
10. **Progress**: Update this PRD as you complete items, commit PRD changes with code changes

---

## Architecture Decisions

### CSS Visualization Approach (Replacing D3)

**Option A: CSS Grid with Static Positions** (RECOMMENDED)

- Layout stack items in CSS Grid
- Fixed positions based on domain and hierarchy
- CSS transitions for hover/focus/active states
- Pros: Simple, predictable, performant, works without JS
- Cons: Less dynamic than force layout, requires manual positioning

**Option B: Flexbox with Wrapping**

- Use flexbox with wrap for automatic flow
- Group by domain, auto-arrange within groups
- CSS transitions for interactions
- Pros: Responsive, no manual positioning, simple
- Cons: Less control over layout, harder to show hierarchy

**Option C: CSS Grid with Auto-placement + Subgrid**

- Use CSS Grid auto-placement for main layout
- Subgrid for hierarchical children
- CSS animations for interactions
- Pros: Balance of structure and automation, shows hierarchy well
- Cons: Subgrid support (Edge 117+, but acceptable)

**Chosen**: Option A (CSS Grid with Static Positions) for maximum control and performance on mobile.

### Animation Strategy

- **Enter animations**: `opacity: 0 -> 1`, `transform: translateY(10px) -> translateY(0)`, 300ms
- **Exit animations**: `opacity: 1 -> 0`, `transform: translateY(0) -> translateY(-10px)`, 200ms
- **Hover animations**: `transform: scale(1.05)`, `box-shadow: larger`, 200ms
- **Focus animations**: `ring` effect with `outline` or `box-shadow`, instant
- **View Transitions API**: Use as progressive enhancement in Chrome, fallback to CSS transitions
- **Reduced motion**: Remove all animations, use instant state changes

### URL Structure

- **Root**: `/` (shows all projects)
- **Search**: `/?query=rust` (pushes to history)
- **Filter by stack**: `/?filter=React` (replaces history)
- **Filter by domain**: `/?filter=Front-end` (replaces history)
- **Combined**: `/?query=rust&filter=React` (last action determines push/replace)

---

## References & Resources

### Documentation

- [Ralph Wiggum Technique](https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum)
- [Getting Started with Ralph](https://www.aihero.dev/getting-started-with-ralph)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [CSS Grid Layout Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [View Transitions API](https://developer.chrome.com/docs/web-platform/view-transitions/)
- [Core Web Vitals](https://web.dev/vitals/)

### Testing Tools

- [agent-browser.dev](https://agent-browser.dev/) - Browser testing tool
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Performance testing
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility testing
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation

### Inspiration

- [ASCII Clouds Example](https://caidan.dev/portfolio/ascii_clouds/) - Background effect inspiration

### Search Results

- [Ralph Wiggum Technique Search Results](https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum)
- [Lightweight CSS Frameworks for Mobile](https://dev.to/sm0ke/lightweight-css-framework-a-curated-list-4hc3)
- [Force-directed Graph Visualization Libraries](https://elise-deux.medium.com/the-list-of-graph-visualization-libraries-7a7b89aab6a6)

---

**END OF PRD**

_This document will be updated as features are completed. Each item's `passes` field will be set to `true` when all acceptance criteria are met and verified._
