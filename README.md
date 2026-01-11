# Flare UI - Feature Flag Management System

A modern React + TypeScript SPA for managing feature flags across projects, scopes, and environments. Built with Feature-Sliced Design architecture for maintainability and scalability.

## Project Overview

Flare UI is a feature flag management system that allows teams to:
- Manage feature flags across multiple projects
- Control flag states per environment (dev, staging, production)
- Assign granular permissions at project and scope levels
- Invite and manage team members with role-based access control

The frontend communicates with a .NET Web API backend via REST API using cookie-based authentication.

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast development server and build tool
- **React Router** - Client-side routing with v6
- **TanStack Query (React Query)** - Server state management, caching, and optimistic updates
- **Zustand** - Lightweight client state management (auth, UI state)
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation for forms and API responses
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Accessible, customizable UI components built on Radix UI
- **Axios** - HTTP client with interceptors
- **Sonner** - Beautiful toast notifications

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Project Structure - Feature-Sliced Design

This project follows **Feature-Sliced Design (FSD)** architecture, which organizes code into layers and slices for better maintainability and scalability.

```
src/
├── app/           Application initialization, providers, routing
│   ├── providers/ React Query, Router, Theme providers
│   └── routes/    Route configuration
│
├── pages/         Route-level page components
│   ├── projects/  Projects list page
│   ├── flags/     Feature flags page
│   └── users/     User management page
│
├── widgets/       Complex UI blocks composed of features and entities
│   ├── header/    Application header
│   └── flags/     Feature flag table widget
│
├── features/      User interactions and business features
│   ├── auth/      Login, logout, password change
│   ├── project/   Create, edit, delete projects
│   ├── scope/     Scope management
│   ├── flag/      Feature flag CRUD operations
│   └── user/      User management features
│
├── entities/      Business entities with data fetching logic
│   ├── project/   Project model and React Query hooks
│   ├── scope/     Scope model and hooks
│   ├── flag/      Feature flag model and hooks
│   └── user/      User model and hooks
│
└── shared/        Reusable code shared across the app
    ├── api/       Axios instance, API clients
    ├── hooks/     Custom React hooks (usePermissions, etc.)
    ├── lib/       Utilities (toast, permissions, cn, etc.)
    ├── stores/    Zustand stores (authStore)
    ├── types/     TypeScript types and interfaces
    └── ui/        Shadcn/UI components and custom UI components
```

### FSD Import Rules

**Layers are hierarchical** - A layer can only import from layers below it:
- `app` → can import from all layers
- `pages` → can import from `widgets`, `features`, `entities`, `shared`
- `widgets` → can import from `features`, `entities`, `shared`
- `features` → can import from `entities`, `shared`
- `entities` → can import from `shared`
- `shared` → no dependencies on other layers

**Slices are isolated** - Features don't import from other features, entities don't import from other entities, etc.

## Domain Model

### Project
- Unique `alias` for external API identification
- Unique `apiKey` for SDK authentication
- Contains scopes and feature flags
- Users have project-level permissions

### Scope
- Belongs to a project
- Unique `alias` within the project
- Represents an environment (development, staging, production)
- Controls which users can read/update feature flags

### Feature Flag
- Belongs to a project
- Unique `key` within the project
- Has on/off values per scope
- Toggle operations controlled by scope-level permissions

### User & Permissions

**Global Roles:**
- **Admin** - Full system access, bypasses project-level permission checks
- **User** - Standard user with assigned permissions

**Project-Level Permissions:**
- `ManageUsers` - Invite/remove users, edit permissions
- `ManageFeatureFlags` - Create, edit, delete feature flags
- `ManageScopes` - Create, edit, delete scopes
- `ViewApiKey` - View project API key
- `RegenerateApiKey` - Regenerate project API key
- `ManageProjectSettings` - Edit project settings, archive/unarchive
- `DeleteProject` - Delete the project

**Scope-Level Permissions:**
- `ReadFeatureFlags` - View feature flag values for a scope
- `UpdateFeatureFlags` - Toggle feature flag values for a scope

## Authentication & Authorization

- **Cookie-based authentication** - Session cookies with HTTP-only flag
- **Login flow** - Username + password (no email-based auth)
- **Permission system** - Two-level: project permissions and scope permissions
- **Admin bypass** - Admins bypass project-level permission checks but NOT scope-level (environments require explicit access)
- **Force password change** - New users must change temporary password on first login

## Key Features

1. **Project Management**
   - Create, view, edit, archive, and delete projects
   - Generate and regenerate API keys
   - View project details and metadata

2. **Scope Management**
   - Create scopes for different environments
   - Assign unique aliases to scopes
   - Manage scope-level permissions

3. **Feature Flag Management**
   - Create feature flags with unique keys
   - Toggle flags on/off per scope
   - Optimistic UI updates for instant feedback
   - Bulk operations support

4. **User Management**
   - Invite users to projects with default permissions
   - Assign project-level and scope-level permissions
   - Edit user permissions
   - Remove users from projects
   - Global admin user management

5. **Permission-Based UI**
   - Buttons and actions disabled when user lacks permission
   - Tooltips explain required permissions
   - Permission gates conditionally render UI elements

## Development Guidelines

### Code Style
- **Language**: All code and comments in English
- **TypeScript**: Strict mode, avoid `any` types
- **Imports**: Follow FSD import rules strictly
- **Components**: Use Shadcn/UI components from `shared/ui`
- **Styling**: Tailwind CSS utility classes, mobile-first responsive design

### State Management
- **Server state**: TanStack Query for all API data
- **Client state**: Zustand for auth state
- **Forms**: React Hook Form + Zod validation

### API Integration
- API calls in `entities/*/model` or `features/*/model` files
- Use React Query hooks: `useQuery`, `useMutation`
- Implement optimistic updates for better UX
- Handle errors with toast notifications

### Permission Checks
Before rendering actions or performing operations, check permissions:
```typescript
const { canPerformProjectAction, canPerformScopeAction } = usePermissions(projectId);

// Project permission check
const canManage = canPerformProjectAction(ProjectPermission.ManageUsers);

// Scope permission check
const canUpdate = canPerformScopeAction(scopeId, ScopePermission.UpdateFeatureFlags);
```

Use `PermissionGate` component for conditional rendering:
```typescript
<PermissionGate projectId={projectId} projectPermission={ProjectPermission.ManageUsers}>
  <Button>Invite User</Button>
</PermissionGate>
```

### Error Handling
- Global error boundary catches unhandled errors
- Feature-level error boundaries for graceful degradation
- Toast notifications for user-facing errors
- Console logging for debugging

### Loading States
- Use skeleton loaders for better perceived performance
- `TableSkeleton` for data tables
- `CardSkeleton` for card grids
- `PageLoader` for full-page loading
- `InlineSpinner` for button loading states

## Architecture Decisions

### Why Feature-Sliced Design?
- **Scalability**: Easy to add new features without affecting existing code
- **Maintainability**: Clear boundaries between layers and slices
- **Team collaboration**: Multiple developers can work on different features without conflicts
- **Testability**: Isolated slices are easier to test

### Why React Query?
- **Caching**: Automatic request deduplication and background refetching
- **Optimistic updates**: Instant UI feedback with rollback on error
- **Developer experience**: Less boilerplate compared to Redux
- **Server state management**: Designed specifically for async server data

### Why Zustand for Auth?
- **Lightweight**: Minimal bundle size for simple client state
- **No boilerplate**: Direct store manipulation without actions/reducers
- **Persistence**: Easy integration with localStorage for session persistence

### Why Shadcn/UI?
- **Accessibility**: Built on Radix UI primitives with ARIA support
- **Customization**: Components live in your codebase, fully customizable
- **Type safety**: Full TypeScript support
- **Design system**: Consistent, professional UI out of the box

## Optimistic Updates

The app uses optimistic UI updates for instant feedback on user actions. Example from feature flag toggling:

1. **Cancel ongoing queries** to prevent race conditions
2. **Snapshot current cache state** for rollback
3. **Optimistically update cache** with new value
4. **On error**: Rollback cache to snapshot
5. **On success**: Refetch to ensure consistency

See `src/entities/flag/model/useFeatureFlags.ts` for implementation details.

## Contributing

### Code Review Checklist
- [ ] Follows FSD import rules
- [ ] TypeScript strict mode (no `any`)
- [ ] Permission checks before actions
- [ ] Error handling with toast notifications
- [ ] Loading states for async operations
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (ARIA labels, keyboard navigation)

### Commit Messages
Follow conventional commits format:
- `feat: Add user invitation feature`
- `fix: Resolve permission check bug`
- `docs: Update README with setup instructions`
- `refactor: Simplify flag toggle logic`

## License

[Your License Here]

## Support

For questions or issues, please contact the development team or open an issue in the repository.
