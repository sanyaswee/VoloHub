# VoloHub AI Coding Instructions

## IMPORTANT: FRONTEND ONLY - READ THIS FIRST

⚠️ **These instructions apply EXCLUSIVELY to the frontend codebase located in the `/frontend` directory.**

- You should NEVER modify, touch, or interact with the `/backend` directory or any Python/Django files.
- The backend is a separate Django REST Framework application managed independently - do not make changes to it.
- Your scope is strictly limited to: React components, TypeScript files, CSS, Vite configuration, package.json, and frontend tooling within `/frontend`.
- When discussing the backend, only reference its API endpoints and data models for integration purposes - never modify backend code.
- All file paths and operations should be relative to or within the `/frontend` directory.

---

## Project Overview

**VoloHub** is a volunteer and community project platform built with:
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Django REST Framework (separate backend folder)
- **Database Models**: User, Project, Vote, Comment
- **Focus**: Clean, maintainable code for a civic engagement platform

---

## Design System & Philosophy

### Dark-First Design
- **Layer 1 (Base)**: `#121212` - Main canvas background
- **Layer 2 (Elevated)**: `#191919` - Sidebar, panels
- **Layer 3 (Interactive)**: `#282828` - Input fields, cards
- **Layer 4 (Glass)**: `rgba(25, 25, 25, 0.7)` with `backdrop-filter: blur(10px)` - Modals, overlays
- **Accent Blue**: `#4A90E2` (active states, CTAs on hover, focus)
- **Text Primary**: `#FFFFFF`, **Text Secondary**: `#B0B0B0`
- **Borders**: `#333333` solid or `rgba(255, 255, 255, 0.1)` for glass

### Glassmorphism
Use glass effects for **modals, cards, dropdowns, tooltips** - NOT for navigation bars, inputs, or buttons:
```css
background: rgba(25, 25, 25, 0.7);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 8-12px;
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
```

### Spacing System (8pt Grid)
- **xs**: `0.25rem` (4px), **sm**: `0.5rem`, **md**: `1rem`, **lg**: `1.5rem`, **xl**: `2rem`, **xxl**: `3rem`
- Use multiples of `0.5rem` for all spacing

### Typography
- **Font Stack**: `'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif`
- **Type Scale**: Display `3.2em`, H1 `1.5rem`, H2 `1.25rem`, Body `1rem`, Small `0.95rem`, Caption `0.875rem`
- **Weights**: Regular `400`, Medium `500`, Semibold `600`, Bold `700`

### Border Radius
- **Standard buttons/inputs**: `6px`
- **Cards/modals**: `8-12px`
- **Search bars**: `50px` (pill shape)
- **Avatars/icon buttons**: `50%` (circle)

### Responsive Strategy (Mobile-First)
- **Mobile** (<480px): Base styles, single column, essential features
- **Tablet** (≥768px): Expand navigation, two columns
- **Desktop** (≥1024px): Fixed sidebar, multi-column layouts, full glass effects
- Reduce blur on mobile (`8px` max) for performance

---

## Code Style and Structure

### TypeScript Best Practices
- Use TypeScript for all code; prefer **interfaces** over types for object shapes
- Avoid enums; use const objects or string unions
- Avoid `any`; use `unknown` if type is truly unknown
- Use functional components with TypeScript props interfaces
- Enable strict mode in TypeScript config
- Define prop types using interface:
  ```typescript
  interface ProjectCardProps {
    project: Project
  }
  ```

### React 19 Patterns
- Use **functional components** with the `function` keyword
- Hooks: `useState`, `useEffect`, `useContext`, `useReducer`, `useMemo`, `useCallback`
- Create custom hooks to extract reusable logic
- Use `React.memo()` for component memoization when appropriate
- Implement `React.lazy()` and `Suspense` for code splitting
- Prefer controlled components over uncontrolled components
- Use cleanup functions in `useEffect` to prevent memory leaks

### Naming Conventions
- **Directories**: lowercase with dashes (e.g., `components/auth-wizard`)
- **Components**: PascalCase files and names (e.g., `ProjectCard.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **CSS Classes**: Semantic names, BEM-style (e.g., `.project-card__header`)

### File Structure
```
frontend/src/
  components/
    ProjectCard/
      ProjectCard.tsx
      ProjectCard.css
  App.tsx
  App.css
  main.tsx
  index.css
```

---

## UI Component Patterns

### Buttons
**Primary Action** (e.g., "New Project"):
- Default: `background: transparent`, `color: #FFFFFF`
- Hover: `background: #4A90E2`
- Padding: `0.75rem 1.5rem`, Border radius: `6px`, Font weight: `600`

**Icon Buttons** (Notification, hamburger):
- Size: `44x44px` (40px mobile)
- Background: `transparent` → `rgba(255, 255, 255, 0.1)` on hover
- Shape: `border-radius: 50%`
- Padding: `0.7em`

### Cards (Glass Effect)
```css
.project-card {
  background: rgba(25, 25, 25, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.5);
}
```

### Navigation
- **Active State**: `background: #4A90E2` (full highlight)
- **Hover**: `background: rgba(74, 144, 226, 0.1)` (10% tint)
- **Icon + Text**: 20x20px icon, `12px` gap, flexbox aligned

### Input Fields
**Search Bar**:
- Background: `#282828`, Shape: `border-radius: 50px`
- Icon inside left, color: `#B0B0B0`
- Focus: Blue border `#4A90E2`, darker background `#2a2a2a`

---

## Animation Guidelines

### Timing
- **Fast** (`0.1s`): Scale effects, micro-interactions
- **Standard** (`0.2s`): Background colors, borders, opacity
- **Slow** (`0.3s`): Position changes, slides, modals

### Easing
- Default: `ease` - Natural acceleration/deceleration
- **Never animate** `backdrop-filter` (performance)

### Transitions to Include
- `background-color`, `border-color`, `opacity`, `transform`, `box-shadow`

---

## State Management

- Use **React Context API** for global state
- Lift state up to share between components
- Use Context with `useReducer` for complex state logic
- Consider Zustand or Jotai if complexity grows

---

## API Integration

- Create a dedicated API service layer for backend communication
- Use `async/await` with proper error handling
- Implement loading and error states for all data fetching
- **Backend API base URL**: `http://localhost:8000/api/` (adjust for production)
- Handle authentication tokens properly (localStorage/sessionStorage)
- **Backend Models**: User, Project, Vote, Comment

Example Project interface:
```typescript
interface Project {
  id: number
  name: string
  description: string
  location: string
  city: string
  votes: number
  comments_count: number
}
```

---

## Performance Optimization

- Minimize re-renders with `React.memo`, `useMemo`, `useCallback`
- Use `React.lazy()` and `Suspense` for code splitting
- Optimize images: use WebP/AVIF, lazy loading
- Leverage Vite's code splitting and tree shaking
- **Glass effects**: Use sparingly (max 3-5 visible), reduce blur on mobile

---

## Accessibility

- Use semantic HTML elements
- Implement proper ARIA attributes (e.g., `aria-label` on icon buttons)
- Ensure keyboard navigation support
- Maintain 4.5:1 color contrast minimum
- Provide alt text for images
- Respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; }
    .glass { backdrop-filter: none; background: rgba(25, 25, 25, 0.95); }
  }
  ```

---

## Development Workflow

### Commands
- **Dev server**: `npm run dev` (Vite with HMR)
- **Build**: `npm run build` (TypeScript + Vite build)
- **Preview**: `npm run preview` (test production build)
- **Lint**: `npm run lint` (ESLint)

### Vite-Specific
- Environment variables: Use `VITE_` prefix for client-side access
- Configure proxy in `vite.config.ts` for backend API during development
- Leverage Vite's fast refresh and asset optimization

---

## Key Conventions

- Follow component-based architecture
- Keep components focused and single-responsibility
- Extract reusable logic into custom hooks
- Use TypeScript strict mode
- Document complex logic with comments
- Use meaningful commit messages (conventional commits)
- **Never modify backend code** - only reference API endpoints

---

## Design Anti-Patterns to Avoid

❌ Pure black `#000000` → ✅ Use `#121212` minimum  
❌ Drop shadows on non-glass → ✅ Use layered backgrounds or glass  
❌ Overusing glass effects → ✅ Reserve for elevated surfaces only  
❌ Animating `backdrop-filter` → ✅ Animate `transform`, `opacity`, `box-shadow`  
❌ Bright, saturated colors → ✅ Use muted, professional tones  
❌ Many font sizes → ✅ Stick to type scale  

---

## Decision Framework

When unsure about a design decision:
1. Is it minimal? Remove everything non-essential
2. Is it consistent? Check existing patterns first
3. Is it accessible? Test contrast, size, keyboard access
4. Does it perform well? Test glass effects on mobile
5. Is it intentional? Every design choice should have a reason
6. Does it scale? Test mobile → tablet → desktop
7. Does it need glass? Only if it should feel elevated/floating

---

## Z-Index Scale

- **Base content**: `0`
- **Sidebar**: `100`
- **Mobile header**: `101`
- **Overlay**: `99`
- **Dropdowns/Tooltips**: `200`
- **Modals**: `300`
- **Toast Notifications**: `400`

Use increments of 100; reserve space between for variants.
