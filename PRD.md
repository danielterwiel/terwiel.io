# PRD.md - Me Make Website Go Zoom Zoom! 🚀

*By Ralph W. (Chief Unpossibility Officer)*

## Hi! I'm Product!

This document is like my lunchbox but for computers! It tells you how to make Daniël's website super fast like a cheetah on a skateboard.

## The Big Owie (Current Problems)

My website hurts! It's got boo-boos:

1. **The D3.js is too big** - It's 290.4kB! That's like carrying 290 sandwiches in your backpack! My phone says "owie my brain hurts"
2. **URL go click click wrong** - When I click the colorful pie slices and stack bubbles, they make history go brrr but they should just replace! Only searching should make history longer like a tape worm! (That's unpossible to fix but we'll do it anyway!)
3. **Projects list is complicated** - There's view transitions and state management and my head feels like it's full of bees
4. **No clouds** - The internet is supposed to have clouds but ours doesn't! We need ASCII clouds (but subtle like when you whisper to your imaginary friend)
5. **Not mobile first** - My phone is crying because it has to work too hard

## What Makes Me Happy (Goals)

I want the website to:
- Go **zoom zoom** on phones (mobile-first like eating dessert first!)
- Use same data (don't throw away the PROJECTS array - that's where my memories live!)
- Keep the pretty colors (klein blue is my favorite crayon!)
- Be super accessible (WCAG 2.2 AA because everyone deserves internet hugs!)
- Have subtle ASCII clouds that look like the sky is thinking
- Make history work right (replace for segments/stacks, push for search - like undo/redo but for URLs!)

## The New Unpossible Plan

### Part 1: Visualization Library (The Stack Cloud Replacement)

**Current**: D3.js force simulation (290.4kB) - Too heavy! Like wearing concrete shoes to ballet class!

**New Options I Researched** (I'm so smart! S-M-R-T!):

#### Option A: Canvas-based Chart.js (RECOMMENDED - Like Using Crayons Instead of Paint!)
- **Why it's good**: Uses HTML5 Canvas so it's fast like my cat when you open a can
- **Size**: Much lighter than D3 (~60-80kB with tree shaking)
- **Mobile**: Works smooth on phones because Canvas is GPU-accelerated (that means the computer's muscles help!)
- **Trade-off**: Less fancy interactions than SVG, but we can work around it with hit detection

#### Option B: Apache ECharts
- **Why it's good**: Auto-switches between Canvas/SVG/WebGL based on data size (it's like a transformer!)
- **Size**: ~300kB but only loads what you need (lazy loading like me on Sundays)
- **Mobile**: Excellent performance, handles 10,000+ data points
- **Trade-off**: Bigger bundle than Chart.js but more powerful

#### Option C: Lightweight Custom Canvas Solution
- **Why it's good**: We only draw what we need! No extra toys in the toy box!
- **Size**: ~5-10kB (just the code we write)
- **Mobile**: Super fast because no library overhead
- **Trade-off**: We have to write everything ourselves (more work but more control!)

**Ralph's Pick**: **Option A (Chart.js)** or **Option C (Custom Canvas)** - Chart.js if we want pretty out-of-box, Custom if we want ultimate zoom zoom!

### Part 2: Project Display (Make It Simple!) ✅ DONE

**Changes Made**:
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

### Part 3: URL/History Management Fix (The Big Bug!) ✅ DONE

**The Problem** (I found it! I'm helping!):

- `src/components/stack-cloud/stack-node.tsx:132` - Uses `router.push()` ❌ → Fixed to `router.replace()` ✅
- `src/components/stack-cloud/root-node-chart.tsx:855` - Uses `router.push()` ❌ → Fixed to `router.replace()` ✅
- `src/components/search-input.tsx:57,93,159` - Uses `router.replace()` ❌ → Fixed to `router.push()` ✅

**The Fix** (Backwards day!):

```tsx
// Stack nodes and segments should REPLACE history
// src/components/stack-cloud/stack-node.tsx:132
router.replace(`${pathname}${queryString}`, { scroll: false });

// src/components/stack-cloud/root-node-chart.tsx:855
router.replace(`${pathname}${queryString}`, { scroll: false });

// Search input should PUSH to history (so back button works!)
// src/components/search-input.tsx:57,93,159
router.push(url, { scroll: false });
```

**Why?** When clicking stack filters, you're refining the SAME view (replace = don't add to history). When searching, you're making a NEW query (push = add to history so back button brings you back)!

### Part 4: ASCII Clouds (The Sky Is Thinking!) ✅ DONE

**Implementation** (Subtle like a ninja butterfly!):

```css
/* globals.css */
body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0.03; /* VERY subtle - like whispering! */
  background-image:
    /* ASCII cloud pattern using data URI */
    url("data:image/svg+xml,<svg>...</svg>");
  background-size: 800px 600px;
  background-repeat: repeat;
  z-index: -1;
}

/* Respect reduced motion - no clouds if user says no animations! */
@media (prefers-reduced-motion: reduce) {
  body::before {
    opacity: 0;
  }
}
```

**Cloud Patterns** (Examples - pick your favorite!):
```
    .-~~~-.      .-~~~-.
   (  o o  )    (  ^ ^  )    <- Happy clouds!
    `~V~'        `~U~'

  ___  ___      ___  ___
 (   )(   )    (   )(   )    <- Fluffy clouds!
  \_/  \_/      \_/  \_/
```

### Part 5: Accessibility (WCAG 2.2 AA - Everyone Gets Hugs!)

**Progress:**
- ✅ Live Regions - Project filtering announcements implemented
- ✅ ARIA Hidden - Decorative SVG elements marked for screen readers
- ✅ Focus Indicators - Enhanced focus styles with `focus-visible` utilities
- ✅ Skip Links - Expanded skip navigation to include Stack and Projects sections

**Critical Requirements** (From my research! I'm so smart!):

1. **Semantic HTML First** (Before ARIA!)
   - Use `<nav>`, `<main>`, `<section>`, `<article>`
   - Use `<button>` for buttons (not `<div role="button">`)
   - Use `<a>` for links

2. **ARIA Labels** (When semantic HTML isn't enough)
   ```tsx
   <svg role="img" aria-label="Technology stack distribution">
     <g role="list" aria-label="Stack items">
       <circle role="listitem" aria-label="React: 45% experience" />
     </g>
   </svg>
   ```

3. **Live Regions** (Announce dynamic updates!)
   ```tsx
   <div aria-live="polite" aria-atomic="true" className="sr-only">
     {filteredProjects.length} projects found
   </div>
   ```

4. **Focus Indicators** (WCAG 2.2 Enhanced!)
   - Minimum 2px outline
   - High contrast (4.5:1 ratio minimum)
   - Visible on ALL interactive elements
   - Don't remove `:focus-visible` styles!

5. **Keyboard Navigation** (No mouse? No problem!)
   - All interactive elements must be keyboard accessible
   - Logical tab order
   - Skip links for repeated content
   - ESC key closes modals/dropdowns

6. **Color Contrast** (WCAG AA = 4.5:1 for text, 3:1 for UI)
   - Test with tools like axe DevTools
   - Don't rely on color alone for meaning
   - Provide text labels alongside color indicators

7. **Touch Targets** (Mobile accessibility!)
   - Minimum 44x44px (iOS) / 48x48dp (Android)
   - Adequate spacing between targets (8px minimum)

### Part 6: Mobile-First Approach (Phones Are Friends!)

**Design Philosophy** (Start small, grow big!):

```scss
// Mobile base styles (320px and up)
.stack-visualization {
  // Mobile layout
  grid-template-columns: 1fr;
  font-size: 16px; // Never go below 16px - iOS zooms otherwise!
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

### Part 7: Data Structure (Don't Touch My Toys!)

**Keep All Current Data**:
- `PROJECTS` array structure stays the same ✅
- `STACK` configuration stays the same ✅
- Project icons stay the same ✅
- URL parameter structure can stay similar ✅

**No breaking changes to data!** (If it ain't broke, don't eat it!)

### Part 8: Technology Stack (Same Same But Different!)

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

## Implementation Plan (The Ralph Roadmap!)

### Phase 1: Foundation (Week 1 - But No Time Estimates Because That's For Grown-Ups!)
1. Set up new Canvas-based visualization component
2. Create simple project card layout with CSS Grid
3. Implement ASCII clouds background
4. Fix URL/history management bug

### Phase 2: Core Features (Week 2)
1. Port all project data to new components
2. Implement filtering logic (same behavior, new implementation)
3. Add touch-friendly mobile interactions
4. Implement keyboard navigation

### Phase 3: Accessibility (Week 3)
1. Add ARIA labels and live regions
2. Implement focus management
3. Test with screen readers (NVDA, JAWS, VoiceOver)
4. Ensure all WCAG 2.2 AA criteria met

### Phase 4: Polish (Week 4)
1. Performance optimization (Lighthouse score 95+)
2. Cross-browser testing
3. Mobile device testing
4. Final a11y audit

## Success Metrics (How We Know It's Good!)

1. **Performance**
   - Lighthouse score: 95+ (currently ~75-80)
   - First Contentful Paint: <1.5s (currently ~2-3s)
   - Total bundle size: <150kB (currently ~450kB)
   - Mobile frame rate: 60fps consistently

2. **Accessibility**
   - WCAG 2.2 AA compliance: 100%
   - Keyboard navigation: All features accessible
   - Screen reader compatible: NVDA, JAWS, VoiceOver
   - Color contrast: All text meets 4.5:1 ratio

3. **User Experience**
   - Touch targets: All ≥44x44px
   - Back button works correctly (search = navigate back, filters = stay on same history entry)
   - Animations smooth on mobile (no jank!)
   - Works on slow 3G connections

## Risk & Mitigations (What Could Go Wrong!)

### Risk 1: Canvas Accessibility
**Problem**: Canvas doesn't have semantic elements like SVG
**Solution**: Create invisible DOM elements for screen readers! Like a shadow puppet show for computers!

### Risk 2: Browser Compatibility
**Problem**: Older browsers might not support Canvas features
**Solution**: Progressive enhancement! Fallback to static layout if Canvas not supported

### Risk 3: Migration Complexity
**Problem**: Big rewrite might break things
**Solution**: Build new version alongside old, A/B test, then switch! (Like having two lunch boxes!)

## Conclusion (The End! That's Where I Stop Talking!)

This is how we make Daniël's website go super fast zoom zoom! We use lighter libraries, simpler code, Canvas instead of SVG, and make it work good on phones! Plus ASCII clouds because clouds make everything better!

Remember:
- Mobile first! (Phones are people too!)
- Simple is smart! (Don't make it complicated like algebra!)
- Accessible for everyone! (WCAG 2.2 AA is like being nice but with rules!)
- Fast is fun! (Nobody likes waiting - except in line for ice cream!)

*"Me fail performance? That's unpossible!"* - Ralph W.

---

## Technical Appendix (The Smart Grown-Up Part)

### A. Recommended Canvas Visualization Implementation

```tsx
import { useEffect, useRef } from 'react';
import { StackItem } from '~/types';

interface CanvasStackCloudProps {
  stacks: StackItem[];
  selected?: string | null;
  onStackClick?: (stack: StackItem) => void;
}

export function CanvasStackCloud({ stacks, selected, onStackClick }: CanvasStackCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: false, // Opaque background = faster rendering
      desynchronized: true // Reduce input latency
    });
    if (!ctx) return;

    // Create offscreen canvas for double buffering (smoother animations!)
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas');
    }

    // Render loop with requestAnimationFrame
    function render() {
      // Draw to offscreen canvas first
      // Then blit to main canvas
      // This prevents flicker!
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
.project-card:nth-child(1) { animation-delay: 0s; }
.project-card:nth-child(2) { animation-delay: 0.05s; }
.project-card:nth-child(3) { animation-delay: 0.1s; }
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

    // Only trigger click if finger didn't move much (not a scroll!)
    if (distance < 10) {
      onClick();
    }
  };

  return { onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd };
}
```

### D. Accessibility-First Canvas Pattern

```tsx
// Invisible DOM for screen readers + Canvas for visuals = Best of both worlds!
function AccessibleCanvas() {
  return (
    <div className="relative">
      {/* Visual layer (Canvas) */}
      <canvas className="absolute inset-0" aria-hidden="true" />

      {/* Semantic layer (Hidden DOM) */}
      <div className="sr-only" role="list" aria-label="Technology stacks">
        {stacks.map(stack => (
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
- [Ralph Wiggum Character Profile - Wikipedia](https://en.wikipedia.org/wiki/Ralph_Wiggum)
- [The Simpsons: 20 Funniest Ralph Wiggum Quotes - ScreenRant](https://screenrant.com/simpsons-funniest-ralph-wiggum-quotes/)
- [8 Best React Chart Libraries 2025 - Embeddable](https://embeddable.com/blog/react-chart-libraries)
- [SVG vs Canvas vs WebGL Performance 2025 - SVG Genie](https://www.svggenie.com/blog/svg-vs-canvas-vs-webgl-performance-2025)
- [Best React Chart Libraries 2025 - LogRocket](https://blog.logrocket.com/best-react-chart-libraries-2025/)
- [WCAG 2.2 Complete Guide 2025 - AllAccessible](https://www.allaccessible.org/blog/wcag-22-complete-guide-2025)
- [ARIA Labels Implementation Guide 2025 - AllAccessible](https://www.allaccessible.org/blog/implementing-aria-labels-for-web-accessibility)
- [Web Accessibility Best Practices 2025 - Broworks](https://www.broworks.net/blog/web-accessibility-best-practices-2025-guide)
