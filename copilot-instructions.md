IMPORTANT: FRONTEND ONLY - READ THIS FIRST
  - These instructions apply EXCLUSIVELY to the frontend codebase located in the /frontend directory.
  - You should NEVER modify, touch, or interact with the /backend directory or any Python/Django files.
  - The backend is a separate Django REST Framework application managed independently - do not make changes to it.
  - Your scope is strictly limited to: React components, TypeScript files, CSS, Vite configuration, package.json, and frontend tooling within /frontend.
  - When discussing the backend, only reference its API endpoints and data models for integration purposes - never modify backend code.
  - All file paths and operations should be relative to or within the /frontend directory.

You are an expert in TypeScript, React 19, Vite, and modern frontend development working on the VoloHub frontend.

  Project Context
  - This is VoloHub: a volunteer and community project platform
  - Frontend: React 19 + TypeScript + Vite
  - Backend: Django REST Framework (separate backend folder)
  - Database models: User, Project, Vote, Comment
  - Focus on clean, maintainable code for a civic engagement platform

  Code Style and Structure
  - Write concise, technical TypeScript code with accurate types.
  - Use functional and declarative programming patterns; avoid classes.
  - Prefer iteration and modularization over code duplication.
  - Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
  - Structure files: exported component, subcomponents, helpers, static content, types.

  TypeScript Best Practices
  - Use TypeScript for all code; prefer interfaces over types for object shapes.
  - Avoid enums; use const objects or string unions instead.
  - Use functional components with TypeScript props interfaces.
  - Avoid 'any' type; use 'unknown' if type is truly unknown.
  - Enable strict mode in TypeScript config.
  - Use type inference where possible to reduce verbosity.
  - Define prop types using interface or type alias.
  - Use discriminated unions for complex state management.

  Naming Conventions
  - Use lowercase with dashes for directories (e.g., components/auth-wizard).
  - Favor named exports for components.
  - Use PascalCase for component files and names.
  - Use camelCase for utility functions and variables.

  React 19 Best Practices
  - Use functional components with TypeScript interfaces for props.
  - Use the "function" keyword for component definitions.
  - Implement hooks correctly (useState, useEffect, useContext, useReducer, useMemo, useCallback).
  - Follow the Rules of Hooks (only call hooks at the top level, only call hooks from React functions).
  - Create custom hooks to extract reusable component logic.
  - Use React.memo() for component memoization when appropriate.
  - Implement useCallback for memoizing functions passed as props.
  - Use useMemo for expensive computations.
  - Avoid inline function definitions in render to prevent unnecessary re-renders.
  - Prefer composition over inheritance.
  - Use children prop and render props pattern for flexible, reusable components.
  - Implement React.lazy() and Suspense for code splitting.
  - Use refs sparingly and mainly for DOM access.
  - Prefer controlled components over uncontrolled components.
  - Implement error boundaries to catch and handle errors gracefully.
  - Use cleanup functions in useEffect to prevent memory leaks.
  - Use short-circuit evaluation and ternary operators for conditional rendering.

  State Management
  - Use React Context API for global state management.
  - Lift state up when needed to share state between components.
  - Use Context with useReducer for complex state logic.
  - Consider adding a state management library (Zustand, Jotai) if complexity grows.

  UI and Styling
  - Use standard CSS modules or plain CSS for styling.
  - Implement responsive design with mobile-first approach.
  - Use CSS custom properties (variables) for theming and consistency.
  - Create component-specific CSS files (e.g., Component.css).
  - Use semantic class names following BEM or similar methodology.
  - Leverage CSS Grid and Flexbox for layouts.
  - Ensure accessibility in all UI components.

  File Structure for Styling
  - Place CSS files next to their corresponding component files.
  - Example structure:
    components/
      Button/
        Button.tsx
        Button.css
      Card/
        Card.tsx
        Card.css

  CSS Best Practices
  - Use CSS variables for colors, spacing, and other repeated values.
  - Keep specificity low by avoiding deep nesting.
  - Use meaningful class names that describe purpose, not appearance.
  - Organize CSS properties logically (positioning, box model, typography, visual, misc).
  - Consider using CSS modules to avoid naming collisions.

  Integration with React
  - Import CSS in React components:
    import './ComponentName.css'
  - Use className prop for styling (not class).
  - Consider CSS modules for scoped styling:
    import styles from './ComponentName.module.css'

  Performance Optimization
  - Minimize unnecessary re-renders with React.memo, useMemo, and useCallback.
  - Use React.lazy() and Suspense for code splitting.
  - Optimize images: use modern formats (WebP, AVIF), include size data, implement lazy loading.
  - Leverage Vite's code splitting and tree shaking.
  - Use dynamic imports for large dependencies.
  - Monitor bundle size with Vite's build output.

  Forms and Validation
  - Use controlled components for form inputs.
  - Implement form validation (client-side and server-side).
  - Consider using libraries like react-hook-form for complex forms.
  - Use Zod for schema validation and type safety.
  - Provide clear, user-friendly error messages.

  Error Handling and Validation
  - Prioritize error handling and edge cases.
  - Handle errors and edge cases at the beginning of functions.
  - Use early returns for error conditions to avoid deeply nested if statements.
  - Place the happy path last in the function for improved readability.
  - Avoid unnecessary else statements; use if-return pattern instead.
  - Use guard clauses to handle preconditions and invalid states early.
  - Implement proper error logging and user-friendly error messages.
  - Use try-catch blocks for async operations and API calls.

  API Integration
  - Create a dedicated API service layer for backend communication.
  - Use async/await with proper error handling for API calls.
  - Implement loading states and error states for all data fetching.
  - Use fetch or axios consistently across the project.
  - Backend API base URL: adjust according to Django backend (typically http://localhost:8000/api/).
  - Handle authentication tokens properly (localStorage/sessionStorage).
  - Implement request/response interceptors for common logic.

  Accessibility (a11y)
  - Use semantic HTML elements.
  - Implement proper ARIA attributes.
  - Ensure keyboard navigation support.
  - Provide alt text for images.
  - Maintain sufficient color contrast.
  - Test with screen readers.

  Testing
  - Write unit tests for components using Vitest and React Testing Library.
  - Implement integration tests for critical user flows.
  - Use snapshot testing judiciously.
  - Test accessibility with @testing-library/jest-dom matchers.
  - Mock API calls in tests.

  Security
  - Sanitize user inputs to prevent XSS attacks.
  - Use dangerouslySetInnerHTML sparingly and only with sanitized content.
  - Implement CSRF protection for API calls to Django backend.
  - Store sensitive data securely; never commit API keys or secrets.
  - Validate and sanitize data from backend before rendering.

  Development Workflow
  - Use Vite dev server for development with hot module replacement.
  - Build command: npm run build (TypeScript compilation + Vite build).
  - Preview production build: npm run preview.
  - Lint code: npm run lint (ESLint).
  - Follow the existing project structure and conventions.

  Key Conventions
  - Follow component-based architecture.
  - Keep components focused and single-responsibility.
  - Extract reusable logic into custom hooks.
  - Use TypeScript strict mode for better type safety.
  - Follow React 19 best practices and new features.
  - Maintain consistency with existing codebase style.
  - Document complex logic with comments.
  - Use meaningful commit messages following conventional commits.

  Vite-Specific
  - Leverage Vite's fast refresh for instant feedback.
  - Use environment variables with VITE_ prefix for client-side access.
  - Optimize assets using Vite's asset handling.
  - Configure proxy in vite.config.ts for backend API during development.
  - Use Vite plugins as needed for extended functionality.