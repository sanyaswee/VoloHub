# VoloHub Frontend Component Architecture

## Structure Overview

The frontend has been refactored to follow a clean, component-based architecture with proper separation of concerns.

### Directory Structure

```
frontend/src/
├── components/           # Reusable UI components
│   ├── Sidebar/
│   │   ├── Sidebar.tsx
│   │   └── Sidebar.css
│   ├── Header/
│   │   ├── Header.tsx
│   │   └── Header.css
│   ├── ProjectCard/
│   │   ├── ProjectCard.tsx
│   │   └── ProjectCard.css
│   └── index.ts         # Barrel export for components
│
├── views/               # Page-level views (routes)
│   ├── ProjectFeed/
│   │   ├── ProjectFeed.tsx
│   │   └── ProjectFeed.css
│   ├── Discover/
│   │   ├── Discover.tsx
│   │   └── Discover.css
│   ├── MyProjects/
│   │   ├── MyProjects.tsx
│   │   └── MyProjects.css
│   ├── Settings/
│   │   ├── Settings.tsx
│   │   └── Settings.css
│   └── index.ts         # Barrel export for views
│
├── types/               # TypeScript type definitions
│   ├── index.ts
│   ├── user.ts
│   ├── project.ts
│   ├── vote.ts
│   └── comment.ts
│
├── services/            # API and external services
│   └── api.ts
│
├── App.tsx              # Main app component (routing logic)
├── App.css              # App-level styles
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Component Responsibilities

### **Sidebar** (`components/Sidebar/`)
- Navigation menu
- Handles active state for current view
- Responsive mobile menu with overlay
- Profile section
- Props: `isOpen`, `onClose`, `currentView`, `onNavigate`

### **Header** (`components/Header/`)
- Mobile header with hamburger menu
- Desktop content header with search bar
- "New Project" button and notifications
- Props: `onMenuToggle`

### **ProjectCard** (`components/ProjectCard/`)
- Displays individual project information
- Glassmorphism card design
- Vote and comment stats
- Props: `project` (Project type)

## View Management

Views are switched through the navbar navigation. The `App.tsx` component manages:
- Current view state (`currentView`)
- Sidebar open/closed state
- View rendering logic via `renderView()` function

### Available Views
1. **Home** (`ProjectFeed`) - Main project feed (default)
2. **Discover** - Explore projects (placeholder)
3. **My Projects** - User's projects (placeholder)
4. **Settings** - User settings (placeholder)

## Adding New Views

To add a new view:

1. Create view directory in `views/`:
```bash
views/NewView/
  ├── NewView.tsx
  └── NewView.css
```

2. Create the component:
```tsx
import './NewView.css'

function NewView() {
  return (
    <div className="view-container">
      <h1 className="view-title">New View</h1>
      <p className="view-description">Description here</p>
      {/* View content */}
    </div>
  )
}

export default NewView
```

3. Export from `views/index.ts`:
```tsx
export { default as NewView } from './NewView/NewView'
```

4. Add to `App.tsx`:
   - Import the view
   - Add case to `renderView()` switch statement
   - Add navigation item to `Sidebar` component

## State Management

Currently using React's built-in state management:
- `useState` for local component state
- Props for parent-child communication
- View switching handled by App component

Future: Consider React Context or state management library as complexity grows.

## Styling Approach

- Each component has its own CSS file
- Follows VoloHub design system (see `copilot-instructions.md`)
- Dark-first design with glassmorphism effects
- Mobile-first responsive design
- Consistent spacing using 8pt grid

## Best Practices

1. **Component Organization**: Each component in its own folder with co-located CSS
2. **Type Safety**: Use TypeScript interfaces from `types/` directory
3. **Barrel Exports**: Import from `components/` or `views/` index files
4. **Naming**: PascalCase for components, kebab-case for directories
5. **Props**: Define clear interfaces for all component props
6. **Reusability**: Keep components focused and single-responsibility

## Next Steps

- Implement proper routing (React Router)
- Connect ProjectFeed to backend API
- Add authentication context
- Implement search functionality
- Build out placeholder views (Discover, MyProjects, Settings)
- Add loading and error states
- Implement project detail view
