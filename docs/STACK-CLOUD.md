# StackCloud Component Specification

## Problem Statement

Create a responsive, iOS Safari-compatible D3 force-directed visualization that displays technology stacks from the portfolio projects as interactive nodes. The visualization must handle dynamic viewport changes (device rotation, iOS toolbar show/hide) gracefully and provide a smooth, accessible experience across all modern browsers and devices.

## Goals

- **iOS Safari First**: Robust handling of viewport changes, touch interactions, and Safari-specific quirks
- **Responsive**: Seamless adaptation between portrait/landscape, small phones to desktop
- **Performant**: Smooth 60fps animation with minimal React re-renders
- **Accessible**: ARIA labels, reduced motion support, keyboard navigation ready
- **Maintainable**: Clean separation of concerns, type-safe data flow

---

## Visual Behavior

### Root Node

- **Position**: Exactly centered in the container at all times
- **Size**: Diameter = `40vmin` of the current viewport (40% of `min(width, height)`)
  - Recomputed on every viewport resize or orientation change
  - Fixed size (not influenced by simulation forces)
  - Example: On a 375×667 viewport (iPhone), diameter = 150px (40% of 375)
- **Appearance**:
  - Circle with border
  - Text "root" centered inside
  - Distinct visual style to differentiate from stack nodes
- **Anchoring**: Uses D3 `fx`/`fy` properties to pin position exactly at computed center

### Stack Nodes

- **Generation**: One node per unique stack technology extracted from `data/projects.ts`
- **Size**: Uniform radius scaled from viewport units for consistent touch targets
  - Minimum 44px diameter for iOS touch target guidelines
  - Scaled relative to viewport using `vmin` buckets
- **Appearance**:
  - Circle shape
  - Border color matching the stack's brand color from `ICON_COLORS`
  - SVG icon centered inside (60-70% of node diameter)
  - Hover/focus states for interactivity
- **Positioning**: Determined by D3 force simulation, colliding gently around root
- **Collision**: Must not overlap with each other or the root node

### Layout Rules

- All nodes must remain within the container bounds
- Stack nodes cannot overlap the root's "exclusion radius"
- Smooth, organic movement with gentle forces (no violent jittering)
- Stable final positions (simulation cools to rest state)

---

## Responsiveness

### Container Sizing Strategy

#### CSS Approach (Primary)

```css
.stack-cloud-container {
  /* Modern browsers with dynamic viewport support */
  width: 100dvw;
  height: 100dvh;
}

/* Fallback for older browsers */
@supports not (height: 100dvh) {
  .stack-cloud-container {
    width: 100vw;
    height: 100vh;
  }
}
```

#### JavaScript Measurement

1. Use a wrapper `ref` to get exact dimensions via `getBoundingClientRect()`
2. Compute drawing area accounting for padding/margins
3. Derive center point: `{ x: width / 2, y: height / 2 }`
4. Derive root radius: `Math.min(width, height) * 0.4 / 2`

### Dynamic Viewport Handling

#### Listeners Required

1. **ResizeObserver** on wrapper element
   - Detects container size changes
   - Triggers geometry recomputation

2. **VisualViewport Events**
   - `window.visualViewport.addEventListener('resize', handler)`
   - `window.visualViewport.addEventListener('scroll', handler)`
   - Handles iOS toolbar show/hide and keyboard appearance

3. **Media Query (Orientation)**
   - Detects portrait ↔ landscape transitions
   - Triggers simulation reheat with new bounds

#### Recomputation Flow

```
Viewport change detected
  ↓
Measure new container dimensions
  ↓
Compute new center (cx, cy)
  ↓
Compute new root radius
  ↓
Update root.fx = cx, root.fy = cy
  ↓
Update boundary force constraints
  ↓
Reheat simulation (alpha = 0.3)
  ↓
Simulation settles to new layout
```

### Portrait/Landscape Adaptation

- **Portrait**: Nodes may arrange in tighter vertical distribution
- **Landscape**: Nodes spread wider horizontally
- **Transition**: Smooth animation as simulation reheats and settles
- **Root**: Always remains centered, size recalculated to 40% of new `min(width, height)`

---

## Accessibility

### Motion

- **Respect `prefers-reduced-motion`**:
  - If true: Set `alphaDecay` very high (0.9+) so simulation settles almost instantly
  - Alternative: Pause simulation after initial layout, show static positions
  - No continuous animation or floating effect

### ARIA & Semantics

- SVG has `role="img"` or `role="application"` with `aria-label="Technology stack visualization"`
- Root node: `aria-label="Root node"`
- Each stack node: `aria-label="[Stack Name] technology"` (e.g., "React technology")
- Grouping: Use `<g role="list">` for nodes, `<g role="listitem">` for each node

### Keyboard Navigation (Future-Ready)

- Structure allows for tab navigation through nodes
- Focus rings on nodes when focused
- Enter/Space to activate (if interactive features added)
- For v1: Ensure structure is in place even if not fully interactive

---

## Performance

### Rendering Strategy

- **Single SVG element**: One `<svg>` container, no nested SVG elements
- **Group-based nodes**: Each node is a `<g>` with `transform="translate(x, y)"`
- **Ref-based updates**: Store node elements in refs, update `transform` directly on each tick
- **No React state on tick**: Simulation ticks do NOT trigger React re-renders
- **requestAnimationFrame**: D3 handles this internally via `simulation.on('tick', handler)`

### Transform Pattern

```tsx
// On each tick (outside React render)
nodeRef.current?.setAttribute("transform", `translate(${d.x}, ${d.y})`);
```

### Icon Rendering

- Use inline SVG React components from `Icon` object
- Size icons with `viewBox` scaling, not image decoding
- Center icons in nested `<g>` with `transform="translate(-50%, -50%)"` equivalent
- Set `pointer-events: none` on icons to avoid interfering with node interactions

### Optimization Targets

- 60fps animation on iPhone 12+
- Simulation cools within 2-3 seconds for ~35 nodes
- No jank during orientation change
- Low CPU usage when simulation is at rest

---

## D3 Simulation Design

### Forces Configuration

1. **forceCenter(width/2, height/2)**
   - Weak centering gravity to keep overall layout centered
   - Strength: 0.05 - 0.1 (gentle)

2. **forceCollide(d => d.radius + padding)**
   - Prevents node overlap
   - Padding: 4-8px between nodes
   - Iterations: 2-3 for stability without performance cost
   - Strength: 1.0 (full collision avoidance)

3. **forceManyBody()**
   - Optional: Mild repulsion for spacing
   - Strength: -5 to -20 (weak repel)
   - Only if needed; test without first

4. **Custom Boundary Force**
   - Keeps nodes within container bounds
   - Applied on each tick: if node escapes bounds, nudge back with velocity damping
   - Prevents nodes from drifting off-screen

5. **Custom Root Exclusion Force**
   - Pushes stack nodes away from root if they enter its exclusion radius
   - Exclusion radius = root.radius + minDistance (e.g., root.radius \* 1.2)
   - Applied as radial force outward from root center

### Root Node Anchoring

```javascript
rootNode.fx = centerX; // Fixed x position
rootNode.fy = centerY; // Fixed y position
// D3 will NOT move this node during simulation
```

### Node Data Structure

```typescript
type SimulationNode = {
  id: string; // Unique stack slug
  name: string; // Display name
  radius: number; // Node radius in px
  iconKey: string; // Icon component key
  color: string; // Border color (hex)
  x?: number; // D3-managed
  y?: number; // D3-managed
  vx?: number; // D3-managed velocity
  vy?: number; // D3-managed velocity
  fx?: number | null; // Fixed x (for root only)
  fy?: number | null; // Fixed y (for root only)
};
```

### Simulation Lifecycle

1. **Initialization**: Create simulation with all forces, `alpha(1)`, `alphaDecay(0.02)`
2. **Tick**: Update DOM transforms (not React state)
3. **Cool**: Simulation naturally decays to rest (`alpha < alphaMin`)
4. **Reheat**: On viewport change, set `alpha(0.3)` and `restart()`

---

## Data Layer

### Extraction Utility

**Location**: `src/utils/extractStacks.ts`

**Function Signature**:

```typescript
export function extractUniqueStacks(projects: Project[]): Stack[];
```

**Process**:

1. Iterate through all projects
2. Extract `stack` array from each project
3. Collect unique stack items by `name` (deduplicate)
4. Transform to `Stack` schema with icon and color mapping

**Schema Definitions**:

```typescript
// Based on existing data/projects.ts shape
type Project = {
  id: string;
  company: string;
  stack: StackItem[];
  // ... other fields
};

type StackItem = {
  name: StackName; // e.g., "React", "TypeScript"
  domain: Domain;
  icon: string; // Icon key from STACK_ICONS
  url?: string;
};

// Output schema for simulation
type Stack = {
  id: string; // Normalized slug (e.g., "react")
  name: StackName; // Display name (e.g., "React")
  iconKey: string; // Icon component key from Icon object
  color: string; // Hex color from ICON_COLORS
  domain: Domain; // For future filtering/grouping
};
```

**Validation**: Use `@effect/schema` to validate parsed data structure

**Deduplication**: Use `Map<string, Stack>` keyed by normalized slug

---

## Icon and Color Mapping

### Existing Infrastructure

- **Icons**: `src/components/icon.tsx` exports `Icon` object with all SVG components
- **Mapping**: `src/utils/icon-colors.ts` provides `STACK_ICONS` (name → icon key) and `ICON_COLORS` (icon key → hex)
- **Helper**: `getIconHexColor(iconName)` retrieves color with fallback

### Node Rendering Pattern

```tsx
<g transform={`translate(${x}, ${y})`} className="stack-node">
  {/* Border circle */}
  <circle r={radius} fill="none" stroke={color} strokeWidth={2} />

  {/* Icon centered */}
  <g
    transform={`translate(${-iconSize / 2}, ${-iconSize / 2})`}
    pointerEvents="none"
  >
    <IconComponent width={iconSize} height={iconSize} />
  </g>
</g>
```

### Sizing

- Node radius: 28-44px (depending on viewport size)
- Icon size: 60-70% of node diameter (e.g., 35px icon in 56px node)
- Border width: 2px

### Color Application

- Use hex colors directly in `stroke` attribute
- No need for Tailwind classes on SVG elements inside D3-managed nodes
- Maintain color consistency with existing project design

---

## iOS Safari Specifics

### Dynamic Viewport Units

✅ **Supported**: `dvh`, `dvw`, `svh`, `lvh` are fully supported in Safari 15.4+ (iOS 15.4+, March 2022)

**Implementation**:

```css
/* Primary: Dynamic units */
height: 100dvh;
width: 100dvw;

/* Fallback: Traditional units */
@supports not (height: 100dvh) {
  height: 100vh;
  width: 100vw;
}
```

**Safe Area**: If full-bleed needed, consider `padding: env(safe-area-inset-*)`

### VisualViewport API

✅ **Supported**: Widely available in Safari (iOS 13+)

**Purpose**:

- Detect iOS toolbar show/hide (address bar, tab bar)
- Detect keyboard appearance
- Get accurate viewport dimensions accounting for UI chrome

**Implementation**:

```typescript
useEffect(() => {
  const handleViewportChange = () => {
    const vvp = window.visualViewport;
    if (vvp) {
      // vvp.width, vvp.height give accurate visible area
      updateSimulationBounds(vvp.width, vvp.height);
    }
  };

  window.visualViewport?.addEventListener("resize", handleViewportChange);
  window.visualViewport?.addEventListener("scroll", handleViewportChange);

  return () => {
    window.visualViewport?.removeEventListener("resize", handleViewportChange);
    window.visualViewport?.removeEventListener("scroll", handleViewportChange);
  };
}, []);
```

### Touch Handling

- **touch-action**: Set `touch-action: none` on SVG ONLY if drag is enabled (not in v1)
- **Passive listeners**: Use `{ passive: true }` for scroll/wheel events to avoid blocking
- **Pointer events**: Prefer `pointerdown`/`pointermove` over touch events for unified handling
- **No drag in v1**: Skip drag implementation to avoid touch-action conflicts with page scroll

### Avoiding Common Pitfalls

1. **100vh jump**: Avoided by using `100dvh` which accounts for dynamic UI
2. **Touch delay**: Not applicable (no drag in v1)
3. **Pinch-zoom conflicts**: Not applicable (no drag in v1)
4. **Scroll blocking**: Use passive listeners
5. **Flicker on rotate**: Debounce resize handlers (50-100ms)

---

## Acceptance Criteria

### Functional Requirements

- ✅ Single root node always centered, size = 40vmin of current viewport
- ✅ Root node does not drift or move during simulation
- ✅ All unique stacks from projects.ts rendered as nodes
- ✅ Each stack node displays correct icon and border color
- ✅ No node overlap (collision detection working)
- ✅ All nodes remain within container bounds
- ✅ Stack nodes do not overlap root node

### Responsiveness

- ✅ Container uses `100dvh`/`100dvw` with `100vh`/`100vw` fallback
- ✅ Layout adapts smoothly to portrait ↔ landscape rotation
- ✅ Root re-centers and resizes correctly on orientation change
- ✅ iOS toolbar show/hide handled via VisualViewport without flicker
- ✅ No "100vh jump" on iOS Safari

### Accessibility

- ✅ Respects `prefers-reduced-motion` (instant settle or no animation)
- ✅ SVG has descriptive `aria-label`
- ✅ All nodes have accessible names
- ✅ Keyboard navigation structure in place

### Performance

- ✅ 60fps animation on iPhone 12/14/15/16
- ✅ Simulation settles within 2-3 seconds with ~35 nodes
- ✅ No visible jank during orientation change or scroll
- ✅ Low CPU usage when at rest (simulation paused)
- ✅ No React re-renders on simulation tick

### Browser Compatibility

- ✅ iOS Safari (15.4+): Full support with dvh/VisualViewport
- ✅ iOS Safari (13-15.3): Graceful fallback to vh with VisualViewport
- ✅ Safari macOS (latest): Full support
- ✅ Chrome/Edge desktop: Full support
- ✅ Firefox desktop: Full support

---

## Test Matrix

### Devices & Browsers

| Device       | Browser | Priority | Scenarios                              |
| ------------ | ------- | -------- | -------------------------------------- |
| iPhone 12    | Safari  | **High** | Portrait, landscape, toolbar, rotation |
| iPhone 14/15 | Safari  | **High** | Portrait, landscape, toolbar, rotation |
| iPhone 16    | Safari  | **High** | Portrait, landscape, toolbar, rotation |
| iPad (any)   | Safari  | Medium   | Portrait, landscape, rotation          |
| MacBook      | Safari  | Medium   | Resize window, zoom                    |
| Desktop      | Chrome  | Medium   | Resize, zoom                           |
| Desktop      | Firefox | Low      | Resize, zoom                           |

### Test Scenarios

#### 1. Initial Load

- ✅ Root node centered on first paint
- ✅ All stack nodes appear and settle smoothly
- ✅ No console errors or warnings
- ✅ Correct number of nodes (1 root + unique stacks)

#### 2. Portrait ↔ Landscape Rotation

- ✅ Root re-centers immediately
- ✅ Root resizes to 40% of new `min(width, height)`
- ✅ Stack nodes rearrange smoothly
- ✅ No nodes escape container bounds
- ✅ No flickering or jumping

#### 3. iOS Toolbar Show/Hide

- ✅ Container height adjusts via dvh or VisualViewport
- ✅ Root remains centered during transition
- ✅ No layout shift or content jump
- ✅ Smooth adaptation (no jank)

#### 4. Reduced Motion

- ✅ Simulation settles instantly or near-instantly
- ✅ No continuous floating animation
- ✅ Final layout still valid and collision-free

#### 5. Window Resize (Desktop)

- ✅ Container resizes with window
- ✅ Root re-centers and resizes correctly
- ✅ Nodes redistribute smoothly
- ✅ No visual glitches

#### 6. Many Nodes (Stress Test)

- ✅ ~35 unique stacks render smoothly
- ✅ No performance degradation
- ✅ Simulation settles in reasonable time
- ✅ No memory leaks (check DevTools)

---

## Implementation Plan

### Phase 1: Data Layer ✅ READY TO IMPLEMENT

**File**: `src/utils/extractStacks.ts` (NEW FILE)

**What to build**:

```typescript
// Export type for simulation nodes
export type Stack = {
  id: string; // Normalized slug: "react", "typescript"
  name: StackName; // Display name: "React", "TypeScript"
  iconKey: string; // Icon key: "BrandReact", "BrandTypescript"
  color: string; // Hex: "#61DAFB", "#3178C6"
  domain: Domain; // "Front-end", "Back-end", "DevOps", "Design"
  parent?: string; // Optional parent (e.g., "Tanstack")
};

// Main extraction function
export function extractUniqueStacks(projects: Project[]): Stack[];
```

**Implementation details**:

1. Import types from `~/data/projects` (Project, StackItem, Domain, StackName)
2. Import utilities from `~/utils/icon-colors` (STACK_ICONS, getIconHexColor)
3. Flatten all project.stack arrays
4. Deduplicate by name using Map
5. Transform to Stack schema with icon/color lookup
6. Sort alphabetically by name
7. Return Stack[]

**Helper function**:

```typescript
function normalizeStackName(name: string): string {
  return name.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-").trim();
}
```

**Expected output**: 35 unique Stack objects

**Verification**: Run `extractUniqueStacks(PROJECTS)` in console, expect 35 items with valid icons/colors

---

### Phase 2: Component Structure ✅ READY TO IMPLEMENT

**File**: `src/components/stack-cloud.tsx` (NEW FILE)

**What to build**:

```typescript
'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { PROJECTS } from '~/data/projects';
import { extractUniqueStacks } from '~/utils/extractStacks';
import { Icon } from '~/components/icon';

type SimulationNode = {
  id: string;
  type: 'root' | 'stack';
  name: string;
  radius: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  iconKey?: string;
  color?: string;
};

export function StackCloud() {
  // Refs
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<SimulationNode, undefined> | null>(null);
  const nodesRef = useRef<Map<string, SVGGElement>>(new Map());

  // State
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
    centerX: number;
    centerY: number;
    rootRadius: number;
    stackRadius: number;
  } | null>(null);

  // Extract stacks once
  const stacks = useMemo(() => extractUniqueStacks(PROJECTS), []);

  // ... implementation continues

  return (
    <div ref={wrapperRef} className="stack-cloud-wrapper">
      <svg ref={svgRef} className="stack-cloud-svg" />
    </div>
  );
}
```

**CSS** (add to `src/styles/globals.css`):

```css
.stack-cloud-wrapper {
  width: 100%;
  aspect-ratio: 1;
  min-height: 400px;
  max-height: 600px;
  position: relative;
  overflow: hidden;
}

@supports (height: 100dvh) {
  .stack-cloud-wrapper {
    /* Modern viewport units available */
  }
}

.stack-cloud-svg {
  width: 100%;
  height: 100%;
  display: block;
}
```

---

### Phase 3: Measurement & Initialization ✅ READY TO IMPLEMENT

**Add to StackCloud component**:

```typescript
// Measure container
const measureContainer = useCallback(() => {
  if (!wrapperRef.current) return null;

  const rect = wrapperRef.current.getBoundingClientRect();
  const vmin = Math.min(rect.width, rect.height);

  return {
    width: rect.width,
    height: rect.height,
    centerX: rect.width / 2,
    centerY: rect.height / 2,
    rootRadius: (vmin * 0.4) / 2,
    stackRadius: vmin < 400 ? 22 : vmin < 600 ? 26 : 30,
  };
}, []);

// Initial measurement on mount
useEffect(() => {
  const measurements = measureContainer();
  if (measurements) setDimensions(measurements);
}, [measureContainer]);

// ResizeObserver
useEffect(() => {
  if (!wrapperRef.current) return;

  const resizeObserver = new ResizeObserver(
    debounce((entries) => {
      for (const entry of entries) {
        const measurements = measureContainer();
        if (measurements) {
          setDimensions(measurements);
          updateSimulation(measurements);
        }
      }
    }, 100),
  );

  resizeObserver.observe(wrapperRef.current);
  return () => resizeObserver.disconnect();
}, [measureContainer]);
```

**Helper**: Add debounce utility if not present, or inline:

```typescript
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

---

### Phase 4: Root Node Only ✅ READY TO IMPLEMENT

**Simulation initialization**:

```typescript
const initializeSimulation = useCallback(
  (measurements: NonNullable<typeof dimensions>) => {
    if (!svgRef.current) return;

    const { centerX, centerY, rootRadius } = measurements;

    // Create root node
    const rootNode: SimulationNode = {
      id: "root",
      type: "root",
      name: "root",
      radius: rootRadius,
      x: centerX,
      y: centerY,
      fx: centerX,
      fy: centerY,
    };

    // Create simulation
    const simulation = d3
      .forceSimulation<SimulationNode>([rootNode])
      .alphaDecay(0.5)
      .velocityDecay(0.7)
      .on("tick", handleTick);

    simulationRef.current = simulation;
  },
  [],
);

const handleTick = useCallback(() => {
  if (!simulationRef.current) return;

  simulationRef.current.nodes().forEach((node) => {
    const el = nodesRef.current.get(node.id);
    if (el && node.x !== undefined && node.y !== undefined) {
      el.setAttribute("transform", `translate(${node.x}, ${node.y})`);
    }
  });
}, []);

// Initialize when dimensions available
useEffect(() => {
  if (!dimensions) return;
  initializeSimulation(dimensions);

  return () => {
    simulationRef.current?.stop();
  };
}, [dimensions, initializeSimulation]);
```

**JSX for root node**:

```typescript
return (
  <div ref={wrapperRef} className="stack-cloud-wrapper">
    {dimensions && (
      <svg
        ref={svgRef}
        className="stack-cloud-svg"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        role="img"
        aria-label="Technology stack visualization"
      >
        <g
          ref={(el) => {
            if (el) nodesRef.current.set('root', el);
            else nodesRef.current.delete('root');
          }}
          className="node"
          aria-label="Root node"
        >
          <circle
            r={dimensions.rootRadius}
            fill="white"
            stroke="#002FA7"
            strokeWidth={3}
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={dimensions.rootRadius * 0.3}
            fill="#002FA7"
            fontWeight="600"
          >
            root
          </text>
        </g>
      </svg>
    )}
  </div>
);
```

**Checkpoint**: Root node appears centered, doesn't move, resizes on window resize

---

### Phase 5: Add Stack Nodes ✅ READY TO IMPLEMENT

**Update simulation initialization**:

```typescript
const initializeSimulation = useCallback(
  (measurements: NonNullable<typeof dimensions>) => {
    const { centerX, centerY, rootRadius, stackRadius, width, height } =
      measurements;

    // Root node
    const rootNode: SimulationNode = {
      id: "root",
      type: "root",
      name: "root",
      radius: rootRadius,
      x: centerX,
      y: centerY,
      fx: centerX,
      fy: centerY,
    };

    // Stack nodes
    const stackNodes: SimulationNode[] = stacks.map((stack) => ({
      id: stack.id,
      type: "stack",
      name: stack.name,
      radius: stackRadius,
      iconKey: stack.iconKey,
      color: stack.color,
      // Random initial position (not overlapping root)
      x: centerX + (Math.random() - 0.5) * width * 0.6,
      y: centerY + (Math.random() - 0.5) * height * 0.6,
    }));

    const allNodes = [rootNode, ...stackNodes];

    // Create simulation with forces
    const simulation = d3
      .forceSimulation<SimulationNode>(allNodes)
      .force("center", d3.forceCenter(centerX, centerY).strength(0.05))
      .force(
        "collide",
        d3
          .forceCollide<SimulationNode>()
          .radius((d) => d.radius + 4)
          .iterations(2),
      )
      .force("boundary", createBoundaryForce(width, height))
      .force(
        "rootExclusion",
        createRootExclusionForce(centerX, centerY, rootRadius),
      )
      .alphaDecay(0.02)
      .velocityDecay(0.4)
      .on("tick", handleTick);

    simulationRef.current = simulation;
  },
  [stacks],
);
```

**Custom forces**:

```typescript
function createBoundaryForce(width: number, height: number) {
  const padding = 10;
  return () => {
    const nodes = simulationRef.current?.nodes() ?? [];
    nodes.forEach((node: SimulationNode) => {
      if (node.fx !== undefined) return; // Skip fixed nodes

      const r = node.radius;
      if (node.x !== undefined) {
        if (node.x - r < padding) {
          node.x = padding + r;
          node.vx = (node.vx ?? 0) * 0.5;
        }
        if (node.x + r > width - padding) {
          node.x = width - padding - r;
          node.vx = (node.vx ?? 0) * 0.5;
        }
      }
      if (node.y !== undefined) {
        if (node.y - r < padding) {
          node.y = padding + r;
          node.vy = (node.vy ?? 0) * 0.5;
        }
        if (node.y + r > height - padding) {
          node.y = height - padding - r;
          node.vy = (node.vy ?? 0) * 0.5;
        }
      }
    });
  };
}

function createRootExclusionForce(cx: number, cy: number, rootRadius: number) {
  const exclusionRadius = rootRadius * 1.3;
  const strength = 0.1;

  return () => {
    const nodes = simulationRef.current?.nodes() ?? [];
    nodes.forEach((node: SimulationNode) => {
      if (node.fx !== undefined || node.x === undefined || node.y === undefined)
        return;

      const dx = node.x - cx;
      const dy = node.y - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < exclusionRadius) {
        const angle = Math.atan2(dy, dx);
        const targetDistance = exclusionRadius + node.radius;
        const force = (targetDistance - distance) * strength;

        node.vx = (node.vx ?? 0) + Math.cos(angle) * force;
        node.vy = (node.vy ?? 0) + Math.sin(angle) * force;
      }
    });
  };
}
```

**JSX for stack nodes** (add after root node):

```typescript
{stacks.map((stack) => {
  const IconComponent = Icon[stack.iconKey as keyof typeof Icon];
  const iconSize = dimensions.stackRadius * 1.4; // 70% of diameter

  return (
    <g
      key={stack.id}
      ref={(el) => {
        if (el) nodesRef.current.set(stack.id, el);
        else nodesRef.current.delete(stack.id);
      }}
      aria-label={`${stack.name} technology`}
    >
      <circle
        r={dimensions.stackRadius}
        fill="white"
        stroke={stack.color}
        strokeWidth={2}
      />
      {IconComponent && (
        <g
          transform={`translate(${-iconSize/2}, ${-iconSize/2})`}
          pointerEvents="none"
        >
          <IconComponent width={iconSize} height={iconSize} />
        </g>
      )}
    </g>
  );
})}
```

**Checkpoint**: 35 stack nodes appear, collide with each other and root, stay in bounds

---

### Phase 6: Viewport Adaptation ✅ READY TO IMPLEMENT

**Add VisualViewport listener**:

```typescript
useEffect(() => {
  if (!window.visualViewport) return;

  const handleVisualViewportChange = debounce(() => {
    const measurements = measureContainer();
    if (measurements) {
      setDimensions(measurements);
      updateSimulation(measurements);
    }
  }, 50);

  window.visualViewport.addEventListener("resize", handleVisualViewportChange);
  window.visualViewport.addEventListener("scroll", handleVisualViewportChange);

  return () => {
    window.visualViewport.removeEventListener(
      "resize",
      handleVisualViewportChange,
    );
    window.visualViewport.removeEventListener(
      "scroll",
      handleVisualViewportChange,
    );
  };
}, [measureContainer]);
```

**Update simulation on resize**:

```typescript
const updateSimulation = useCallback(
  (measurements: NonNullable<typeof dimensions>) => {
    if (!simulationRef.current) return;

    const { centerX, centerY, rootRadius, stackRadius, width, height } =
      measurements;
    const nodes = simulationRef.current.nodes();

    // Update root
    const rootNode = nodes[0];
    if (rootNode) {
      rootNode.fx = centerX;
      rootNode.fy = centerY;
      rootNode.radius = rootRadius;
    }

    // Update stack nodes radii
    nodes.slice(1).forEach((node) => {
      node.radius = stackRadius;
    });

    // Update forces
    simulationRef.current
      .force("center", d3.forceCenter(centerX, centerY).strength(0.05))
      .force(
        "collide",
        d3
          .forceCollide<SimulationNode>()
          .radius((d) => d.radius + 4)
          .iterations(2),
      )
      .force("boundary", createBoundaryForce(width, height))
      .force(
        "rootExclusion",
        createRootExclusionForce(centerX, centerY, rootRadius),
      );

    // Reheat simulation
    simulationRef.current.alpha(0.3).restart();
  },
  [],
);
```

**Checkpoint**: Rotation and resize work smoothly, root stays centered

---

### Phase 7: Accessibility ✅ READY TO IMPLEMENT

**Add reduced motion support**:

```typescript
useEffect(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion && simulationRef.current) {
    simulationRef.current.alphaDecay(0.9); // Instant settle
  }
}, []);
```

**Update ARIA** (already included in JSX above):

- SVG: `role="img"` ✅
- SVG: `aria-label="Technology stack visualization"` ✅
- Root node: `aria-label="Root node"` ✅
- Stack nodes: `aria-label="${stack.name} technology"` ✅

**Checkpoint**: Animation stops quickly with reduced motion enabled

---

### Phase 8: Integration ✅ READY TO IMPLEMENT

**File**: `src/app/page.tsx`

**Edit**:

```tsx
import { StackCloud } from "~/components/stack-cloud";

export default function HomePage() {
  return (
    <div className="flex justify-center">
      <main className="flex min-h-screen max-w-xl p-4 flex-col print:m-0 a4-page prose w-full">
        <SearchInput />
        <StackCloud /> {/* ADD THIS */}
        <Experience />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}
```

**Checkpoint**: Component appears in page below SearchInput

---

### Phase 9: Polish & Verification

**Add to package.json** (if D3 not installed):

```bash
npm install d3 @types/d3
```

**Run checks**:

1. `npm run lint` - Fix any linting issues
2. `npm run build` - Ensure build succeeds
3. `npm run dev` - Test in browser

**Test matrix**:

- ✅ Desktop: Resize window, verify layout adapts
- ✅ Mobile: Rotate device, verify smooth adaptation
- ✅ iOS Safari: Scroll to hide toolbar, verify centering
- ✅ Reduced motion: Enable in system settings, verify instant settle

**Final checklist**:

- [ ] 36 nodes render (1 root + 35 stacks)
- [ ] Root always centered
- [ ] No node overlap
- [ ] All nodes stay in bounds
- [ ] Smooth resize/rotation
- [ ] No console errors
- [ ] Icons render correctly
- [ ] Colors match brand guidelines
- [ ] Reduced motion works
- [ ] Build succeeds

---

## iOS Safari Readiness Checklist

| Requirement                       | Status       | Implementation                                                           |
| --------------------------------- | ------------ | ------------------------------------------------------------------------ |
| **Dynamic viewport units**        | ✅ Specified | `100dvh`/`100dvw` with `@supports` fallback to `100vh`/`100vw`           |
| **VisualViewport API**            | ✅ Specified | Event listeners for `resize` and `scroll` on `window.visualViewport`     |
| **Portrait/Landscape adaptation** | ✅ Specified | Media query + recompute on orientation change, reheat simulation         |
| **Touch handling**                | ✅ Specified | Passive listeners, no drag in v1 (no `touch-action` conflicts)           |
| **Reduced motion**                | ✅ Specified | High `alphaDecay` (0.9+) or instant settle when `prefers-reduced-motion` |
| **Safe area insets**              | 📋 Noted     | Optional `padding: env(safe-area-inset-*)` if full-bleed container       |
| **No 100vh jump**                 | ✅ Specified | Solved by `100dvh` usage                                                 |
| **Performance on mobile**         | ✅ Specified | Single SVG, transform updates, ref-based, no React re-renders on tick    |

---

## Open Questions & Risks

### Questions

1. ✅ **Drag interactions**: Confirmed NO drag in v1 for iOS Safari robustness
2. ✅ **Icon/color mapping**: Confirmed existing system covers all stacks
3. 📋 **Interactive behaviors**: Should clicking a stack node filter projects or navigate? (For v2)
4. 📋 **Animation duration**: Should simulation settle faster on mobile to save battery?

### Risks

1. **Performance on older devices**: iPhone 8/X may struggle with 35+ nodes
   - _Mitigation_: Test on older devices, reduce node count or force iterations if needed

2. **Safari 13-15.3 without dvh**: Fallback to `vh` may cause minor toolbar jump
   - _Mitigation_: VisualViewport listeners still adjust layout; acceptable degradation

3. **Icon rendering weight**: 35 inline SVGs may be heavy
   - _Mitigation_: Icons are already optimized, use `pointer-events: none`, test memory usage

4. **Simulation stability edge cases**: Nodes may jitter if forces are imbalanced
   - _Mitigation_: Tune force strengths during implementation, add velocity damping if needed

---

## Definition of Done

- ✅ `docs/STACK-CLOUD.md` finalized (this document)
- ⏳ Component renders in `page.tsx` below `SearchInput`
- ⏳ Single root node centers perfectly across devices and orientations
- ⏳ Unique `Stack[]` derived from `data/projects.ts` via util in `src/utils`
- ⏳ Nodes render with correct border colors and centered SVG icons
- ⏳ Simulation stable on iOS Safari (dvh + VisualViewport handling)
- ⏳ Accessibility and reduced motion honored
- ⏳ All acceptance criteria met
- ⏳ Test matrix scenarios passing on target devices

---

**Version**: 1.0.0
**Last Updated**: 2025-10-02
**Author**: AI Assistant (Claude)
**Status**: Draft Ready for Implementation
