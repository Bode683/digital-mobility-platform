# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React Native mobility/ride-hailing application built with Expo, TypeScript, and Supabase. The app features real-time ride booking, driver tracking, Mapbox integration for routing, and comprehensive state management using TanStack Query and React Context.

## Development Commands

### Starting the App
```bash
npx expo start          # Start development server
expo run:android        # Run on Android emulator/device
expo run:ios            # Run on iOS simulator/device
expo start --web        # Run on web
```

### Code Quality
```bash
npm run lint            # Run ESLint
```

### Utilities
```bash
npm run clear-async-storage  # Clear app's async storage
npm run reset-project        # Reset project (use with caution)
```

### Testing with EAS Build
Since Mapbox requires native modules, you'll need EAS development builds for testing native features:
```bash
eas build --profile development --platform android
eas build --profile development --platform ios
```

## Architecture

### Tech Stack
- **React Native 0.81.5** + **Expo 54.0.21** - Cross-platform framework
- **TypeScript 5.9.2** - Strict mode enabled
- **Expo Router 6.0.14** - File-based routing with typed routes
- **TanStack Query 5.90.5** - Server state management and caching
- **Supabase** - Authentication and profile storage only (other data uses local storage or future backend)
- **Axios 1.12.2** + **axios-retry** - HTTP client with retry logic
- **Mapbox (@rnmapbox/maps)** - Maps, routing, geocoding
- **Zod 3.25.76** - Runtime validation (single source of truth for schemas + types)
- **React Native Paper 5.14.5** - Material Design 3 UI components

### Directory Structure

```
mobility/
├── app/                              # Expo Router - routing layer only
│   ├── _layout.tsx                  # Root layout with auth guards
│   ├── (drawer)/                    # Authenticated routes group
│   │   ├── _layout.tsx              # Drawer navigation
│   │   ├── home.tsx                 # Main booking screen
│   │   ├── in-ride.tsx              # Active ride tracking
│   │   ├── ride-confirmation.tsx    # Ride confirmation flow
│   │   └── [other screens]
│   ├── auth.tsx                     # Login/signup
│   ├── onboarding.tsx               # First-time user flow
│   └── index.tsx                    # Entry point
│
├── src/                             # Application logic (never put logic in app/)
│   ├── api/                         # Core API layer
│   │   ├── auth.api.ts              # Auth endpoints
│   │   ├── profiles.api.ts          # Profile CRUD
│   │   ├── trips.api.ts             # Trip CRUD
│   │   ├── schemas.ts               # Zod validation schemas
│   │   ├── types.ts                 # TypeScript types (inferred from Zod)
│   │   ├── queryKeys.ts             # TanStack Query key factory
│   │   └── errors.ts                # Unified error normalization
│   │
│   ├── context/
│   │   └── ApiContext.tsx           # Global: Supabase client, HTTP client, auth state
│   │
│   ├── lib/
│   │   ├── supabase.ts              # Supabase singleton client
│   │   ├── httpClient.ts            # Axios instance with auth interceptors
│   │   ├── queryClient.ts           # TanStack Query configuration
│   │   └── constants.ts             # App constants
│   │
│   ├── features/                    # Feature-based architecture
│   │   ├── ride-booking/            # Ride workflow
│   │   │   ├── api/                 # Feature-specific API calls
│   │   │   ├── contexts/            # RideBookingContext (useReducer)
│   │   │   ├── components/          # UI components
│   │   │   ├── hooks/               # Custom hooks
│   │   │   ├── utils/
│   │   │   │   └── rideStateMachine.ts  # State transition validation
│   │   │   └── index.ts             # Public API
│   │   ├── map/                     # Map integration
│   │   ├── driver-management/       # Driver matching & tracking
│   │   ├── payments/                # Payment processing
│   │   └── profile/                 # User profile
│   │
│   ├── hooks/                       # Global custom hooks
│   │   ├── useAuth.ts               # Auth state from ApiContext
│   │   ├── useProfile.ts            # Profile data (TanStack Query)
│   │   └── useTrips.ts              # Trips list (TanStack Query)
│   │
│   └── components/                  # Shared UI components
```

### State Management Strategy

**Hybrid approach with clear boundaries:**

1. **TanStack Query** - Server state (trips, profiles, payments)
   - Automatic caching, stale-time management, request deduplication
   - Query keys in `src/api/queryKeys.ts` (hierarchical structure)
   - Example: `queryKeys.trips.detail(tripId)` or `queryKeys.trips.active(userId)`

2. **ApiContext (React Context)** - Global singletons
   - Authentication state (session, user)
   - Client instances (Supabase, HTTP client)
   - Never put data fetching here - use TanStack Query instead

3. **Feature Contexts (useReducer + Context)** - Complex feature workflows
   - `RideBookingContext` - ride workflow, location selection
   - `MapContext` - map state, camera position, routes
   - `DriverContext` - driver assignment, tracking
   - `PaymentContext` - payment methods, transactions

**Why this pattern:**
- Auth is event-driven (Supabase listener) → Context
- Data is request-driven (cacheable, stale-aware) → TanStack Query
- Complex workflows with many actions → useReducer + Context

### Authentication Flow

```
1. Supabase.auth.signIn() → JWT token + session
2. ApiContext listens via onAuthStateChange
3. Session stored in React state
4. HTTP client interceptor injects: Authorization: Bearer <token>
5. Auto-refresh handled by Supabase
6. On logout: queryClient.clear() to reset all queries
```

**Navigation Guards:** `app/_layout.tsx` redirects unauthenticated users to `/auth`

### API Layer & Validation

**Request Flow:**
```
Component → useTrips() hook → api.trips.listTrips() → httpClient/Supabase
  → Interceptors (auth, retry, error normalization) → Zod validation → Typed data
```

**Validation Pattern:**
- Define Zod schemas in `src/api/schemas.ts`
- Infer TypeScript types: `type Trip = z.infer<typeof TripSchema>`
- Parse all API responses: `TripSchema.parse(data)`
- Single source of truth for validation + types

**Error Handling:**
- All errors normalized to `ApiError` (see `src/api/errors.ts`)
- HTTP client has 3 retry attempts with exponential backoff
- Query/mutation errors → toast notifications

### Ride Workflow State Machine

**Critical:** Ride status transitions are validated to prevent race conditions.

```typescript
// Valid transitions (src/features/ride-booking/utils/rideStateMachine.ts)
requested → accepted → arriving → in_progress → completed
     ↓         ↓          ↓            ↓
  cancelled (from any active state)
```

**Never directly set ride status** - always validate transitions via state machine.

### Mapbox Integration

- **Directions API** - Uses `driving-traffic` profile for traffic-aware routing
- **Geocoding** - Forward/reverse address lookup
- **Live tracking** - Driver location updates (currently mock, future: WebSocket/Supabase Realtime)

**Environment variables required:**
```
EXPO_PUBLIC_MAPBOX_TOKEN
RNMAPBOX_MAPS_DOWNLOAD_TOKEN  # For EAS builds
```

### Backend Architecture

**IMPORTANT:** Supabase is used ONLY for Auth and Profiles. Any other storage needs should use local storage (AsyncStorage). A full backend will be developed later.

Current Supabase usage:
- Authentication (email/password, session management)
- User profiles table

Everything else (trips, payments, etc.) uses mock data or local storage.

## Development Conventions

### Code Style
- **Functional programming** - Avoid classes, prefer composition
- **TypeScript strict mode** - All code must be type-safe
- **Named exports** - Favor named exports over default exports
- **Descriptive names** - Use auxiliary verbs (isLoading, hasError)
- **Feature-based organization** - Group by feature, not by type

### Path Aliases (tsconfig.json)
```typescript
import { useAuth } from '@/hooks/useAuth'
import { RideBooking } from '@/features/ride-booking'
import { API } from '@/api'
```

Available aliases: `@/api`, `@/components`, `@/features`, `@/hooks`, `@/lib`, `@/context`, `@/constants`

### Naming Conventions
- **Directories:** lowercase-with-dashes (e.g., `ride-booking/`)
- **Components:** PascalCase (e.g., `RideTypeSelection.tsx`)
- **Hooks:** `use` prefix (e.g., `useDriverLocation.ts`)
- **Contexts:** `{Feature}Context.tsx` (e.g., `RideBookingContext.tsx`)
- **API modules:** `{resource}.api.ts` (e.g., `trips.api.ts`)

### File Organization within Features
Each feature should follow this structure:
```
feature-name/
  ├── api/            # Feature-specific API calls
  ├── contexts/       # Feature state (useReducer + Context)
  ├── components/     # UI components
  ├── hooks/          # Custom hooks
  ├── screens/        # Full-screen views
  ├── types/          # TypeScript types
  ├── utils/          # Utilities
  └── index.ts        # Public API (controlled exports)
```

### Separation of Concerns
- **app/ directory** - Routing layer ONLY. No business logic.
- **src/ directory** - All application logic, components, API calls
- **Data fetching** - Always in `src/api/`, never in components or app/

### State Management Rules
- **Minimize useState/useEffect** - Prefer Context and useReducer for complex state
- **Use TanStack Query** - For all data fetching and server state
- **Use useReducer** - When state changes depend on previous state or have many actions
- **Memoization** - Use `React.memo()`, `useMemo`, `useCallback` to prevent re-renders

### Error Handling
- **Early returns** - Handle errors at the beginning of functions
- **Avoid else statements** - Use if-return pattern
- **Error boundaries** - Wrap async code (useEffect, network requests)
- **Zod validation** - Runtime validation for all external data
- **Descriptive messages** - Error messages must be user-friendly
- **Sanitize inputs** - Prevent XSS attacks

### Performance
- **Lazy loading** - Use React.lazy() and Suspense for non-critical components
- **Image optimization** - Use expo-image, WebP format, size data, lazy loading
- **React Navigation lazy** - Use `lazy` prop for stack/tab navigators
- **Profile regularly** - Use React Native's built-in performance tools

### Security
- **HTTPS only** - All API communication must use HTTPS
- **Secure storage** - Use react-native-encrypted-storage for sensitive data
- **Auth headers** - Include Authorization, Content-Type in all requests
- **Token refresh** - Handle token expiration gracefully
- **Input sanitization** - Always sanitize user inputs

## Important Patterns

### Query Keys Pattern
```typescript
// src/api/queryKeys.ts - Hierarchical structure
export const queryKeys = {
  trips: {
    all: ['trips'],
    lists: () => [...queryKeys.trips.all, 'list'],
    list: (filters: TripFilters) => [...queryKeys.trips.lists(), filters],
    detail: (id: string) => [...queryKeys.trips.all, id],
    active: (userId: string) => [...queryKeys.trips.all, 'active', userId],
  }
}

// Usage:
useQuery({ queryKey: queryKeys.trips.active(userId), ... })

// Selective invalidation:
queryClient.invalidateQueries({ queryKey: queryKeys.trips.all }) // All trips
queryClient.invalidateQueries({ queryKey: queryKeys.trips.lists() }) // All lists
```

### Real-Time Polling Pattern
```typescript
// Active ride polling (src/hooks/useTrips.ts)
useQuery({
  queryKey: queryKeys.trips.active(userId),
  queryFn: () => api.trips.getActiveTrip(userId),
  staleTime: 30_000,           // Consider stale after 30s
  refetchInterval: 30_000,     // Poll every 30s
  refetchOnWindowFocus: true,  // Refetch when app focused
})
```

### Singleton Pattern for Clients
```typescript
// src/lib/supabase.ts
let supabaseInstance: SupabaseClient | null = null

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key)
  }
  return supabaseInstance
}
```

## Recent Development Focus

Based on recent commits, active work includes:
- Race condition fixes in ride workflow
- State management improvements
- Driver assignment and status transitions
- Completed rides handling

When working on ride booking features, pay special attention to state transitions and race conditions.

## Environment Variables

Required in `.env` or EAS Secrets:
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_API_BASE_URL
EXPO_PUBLIC_MAPBOX_TOKEN
RNMAPBOX_MAPS_DOWNLOAD_TOKEN  # For EAS builds
```

## Common Gotchas

1. **Mapbox requires native builds** - Cannot use Expo Go for testing Mapbox features
2. **Supabase is auth + profiles only** - Don't add other tables until full backend is ready
3. **Always validate state transitions** - Use rideStateMachine.ts for ride status changes
4. **TanStack Query caching** - Remember to invalidate queries after mutations
5. **Path aliases in Babel** - Both tsconfig.json AND babel.config.js must match
6. **Strict TypeScript** - No any types, all code must be properly typed