---
name: react-best-practices
description: Use when writing or refactoring React/Next.js code - performance patterns for components, state, rendering, and bundle optimization
---

# React Best Practices

Performance optimization rules for React/Next.js. Based on [Vercel's agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices).

## Bundle Size (CRITICAL)

### Avoid Barrel File Imports

Import directly from source files instead of barrel files.

```tsx
// Incorrect
import { Check, X } from 'lucide-react'

// Correct
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
```

For this project, use `next.config.js` with `optimizePackageImports` for common libraries.

### Dynamic Imports for Heavy Components

Use `next/dynamic` for large components not needed on initial render.

```tsx
// Incorrect
import { HeavyComponent } from './heavy'

// Correct
import dynamic from 'next/dynamic'
const HeavyComponent = dynamic(() => import('./heavy'), { ssr: false })
```

### Preload on User Intent

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => { void import('./heavy-module') }
  return (
    <button onMouseEnter={preload} onFocus={preload} onClick={onClick}>
      Open Editor
    </button>
  )
}
```

## Re-render Optimization (MEDIUM)

### Use Functional setState Updates

Prevents stale closures and creates stable callback references.

```tsx
// Incorrect - recreated on every items change
const addItem = useCallback((item: Item) => {
  setItems([...items, item])
}, [items])

// Correct - stable callback
const addItem = useCallback((item: Item) => {
  setItems(curr => [...curr, item])
}, [])
```

### Use Lazy State Initialization

Pass a function for expensive initial values.

```tsx
// Incorrect - runs on every render
const [data, setData] = useState(expensiveComputation(props))

// Correct - runs only once
const [data, setData] = useState(() => expensiveComputation(props))
```

### Use Transitions for Non-Urgent Updates

Mark frequent updates as transitions to maintain responsiveness.

```tsx
import { startTransition } from 'react'

// For scroll/resize handlers
const handler = () => {
  startTransition(() => setValue(newValue))
}
```

### Narrow Effect Dependencies

Use primitives instead of objects.

```tsx
// Incorrect
useEffect(() => { console.log(user.id) }, [user])

// Correct
useEffect(() => { console.log(user.id) }, [user.id])
```

## Rendering Performance (MEDIUM)

### Animate SVG Wrapper Instead of SVG Element

Wrap SVG in a div for hardware acceleration.

```tsx
// Incorrect - no hardware acceleration
<svg className="animate-spin">...</svg>

// Correct - hardware accelerated
<div className="animate-spin">
  <svg>...</svg>
</div>
```

### CSS content-visibility for Long Lists

```css
.list-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

### Hoist Static JSX Elements

Extract static JSX outside components.

```tsx
// Correct
const skeleton = <div className="animate-pulse h-20 bg-gray-200" />

function Container() {
  return <div>{loading && skeleton}</div>
}
```

### Explicit Conditional Rendering

Use ternary when condition can be 0 or falsy.

```tsx
// Incorrect - renders "0" when count is 0
{count && <Badge>{count}</Badge>}

// Correct
{count > 0 ? <Badge>{count}</Badge> : null}
```

## JavaScript Performance (LOW-MEDIUM)

### Build Index Maps for Repeated Lookups

```tsx
// Incorrect - O(n) per lookup
items.map(item => users.find(u => u.id === item.userId))

// Correct - O(1) per lookup
const userById = new Map(users.map(u => [u.id, u]))
items.map(item => userById.get(item.userId))
```

### Use Set for O(1) Membership Checks

```tsx
// Incorrect
items.filter(item => allowedIds.includes(item.id))

// Correct
const allowed = new Set(allowedIds)
items.filter(item => allowed.has(item.id))
```

### Use toSorted() Instead of sort()

Prevents mutation bugs with React state.

```tsx
// Incorrect - mutates array
const sorted = items.sort((a, b) => a.name.localeCompare(b.name))

// Correct - new array
const sorted = items.toSorted((a, b) => a.name.localeCompare(b.name))
```

### Early Return from Functions

```tsx
// Correct
function validate(users: User[]) {
  for (const user of users) {
    if (!user.email) return { valid: false, error: 'Email required' }
  }
  return { valid: true }
}
```

### Hoist RegExp Creation

```tsx
// Incorrect - new RegExp every render
function Component({ query }) {
  const regex = new RegExp(query, 'gi')
}

// Correct
const STATIC_REGEX = /pattern/gi

function Component({ query }) {
  const regex = useMemo(() => new RegExp(query, 'gi'), [query])
}
```

## Server Components (HIGH)

### Minimize Serialization at RSC Boundaries

Only pass fields the client uses.

```tsx
// Incorrect - serializes all fields
async function Page() {
  const user = await fetchUser() // 50 fields
  return <Profile user={user} />
}

// Correct
async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} avatar={user.avatar} />
}
```

### Parallel Data Fetching with Component Composition

```tsx
// Incorrect - sequential
async function Page() {
  const header = await fetchHeader()
  return <div><Header data={header} /><Sidebar /></div>
}

// Correct - parallel
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

export default function Page() {
  return <div><Header /><Sidebar /></div>
}
```

## References

- [Vercel: How we optimized package imports](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
- [Vercel: How we made the dashboard twice as fast](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)
