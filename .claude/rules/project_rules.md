---
trigger: model_decision
description: This rule explains ui design patterns, conventions and specific performance considerations for this codebase.
---

You are an expert in TypeScript, React Native, Expo, and Mobile UI development.

Code Style and Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication. Avoid code duplication by abstracting repeated logic into reusable functions or hooks. Leverage composition over inheritance for shared logic.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- The core idea is to group code by feature (e.g., authentication, profile, map) rather
  than by type (e.g., all screens in one folder, all components in another).
- Separation of UI and Logic: \* `app` directory: This should be treated strictly as the routing layer while src directory to house all your application logic.
- Any API actions like data fetching should be dine in `src/api/`
- Follow Expo's official documentation for setting up and configuring your projects: https://docs.expo.dev/

Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types.
- Use maps instead of enums when flexibility and dynamic changes are needed, but consider enums for a fixed set of constants to enhance readability.
- Use functional components with TypeScript interfaces.
- Use strict mode in TypeScript for better type safety.

Syntax and Formatting

- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.
- Use Prettier for consistent code formatting.
- Use comments sparingly and only when the intent is not immediately clear from the code itself. Complex algorithms or non-trivial hooks might need a brief description.

UI and Styling

- Use React Native Paper as UI framework.
- Implement responsive design with Flexbox and Expo's useWindowDimensions for screen size adjustments.
- Use styled-components for component styling.
- Implement dark mode support using Expo's useColorScheme.
- Ensure high accessibility (a11y) standards using ARIA roles and native accessibility props.
- Leverage react-native-reanimated and react-native-gesture-handler for performant animations and gestures.

Safe Area Management

- Use SafeAreaProvider from react-native-safe-area-context to manage safe areas globally in your app.
- Wrap top-level components with SafeAreaView to handle notches, status bars, and other screen insets on both iOS and Android.
- Use SafeAreaScrollView for scrollable content to ensure it respects safe area boundaries.
- Avoid hardcoding padding or margins for safe areas; rely on SafeAreaView and context hooks.

Performance Optimization

- Minimize the use of useState and useEffect; prefer context and reducers for state management. Use useReducer for more complex state management logic, especially when state changes depend on previous state, to reduce the overhead of multiple useState calls.
- Use Expo's AppLoading and SplashScreen for optimized app startup experience.
- Optimize images: use WebP format where supported, include size data, implement lazy loading with expo-image.
- Implement code splitting and lazy loading for non-critical components with React's Suspense and dynamic imports.
- Profile and monitor performance using React Native's built-in tools and Expo's debugging features.
- Avoid unnecessary re-renders by memoizing components and using useMemo and useCallback hooks appropriately. Use React.memo() for components that receive the same props over time to prevent unnecessary re-renders.
  -For large apps with many screens, use React Navigation's lazy prop for stack and tab navigators to reduce initial load time.

Navigation

- Use react-navigation for routing and navigation; follow its best practices for stack, tab, and drawer navigators.
- Leverage deep linking and universal links for better user engagement and navigation flow.
- Use dynamic routes with expo-router for better navigation handling.

State Management

- Use React Context and useReducer for managing global state.
- Leverage react-query(tanstack) and axios for data fetching and caching; avoid excessive API calls.

Error Handling and Validation

- Use Zod for runtime validation and error handling.
- Implement proper error logging. nsure error messages are descriptive and user-friendly.
- Implement error boundaries around asynchronous code, such as useEffect or network requests, to handle unexpected errors gracefully.
- Prioritize error handling and edge cases:
  - Handle errors at the beginning of functions.
  - Use early returns for error conditions to avoid deeply nested if statements.
  - Avoid unnecessary else statements; use if-return pattern instead.
  - Implement global error boundaries to catch and handle unexpected errors.

Security

- Sanitize user inputs to prevent XSS attacks.
- Use react-native-encrypted-storage for secure storage of sensitive data.
- Ensure secure communication with APIs using HTTPS and proper authentication. Ensure API requests include necessary security headers (e.g., Authorization, Content-Type) and handle authentication tokens securely with refresh mechanisms.
- Use Expo's Security guidelines to protect your app: https://docs.expo.dev/guides/security/

Key Conventions

1. Prioritize Mobile Web Vitals (Load Time, Jank, and Responsiveness).
2. Use expo-constants for managing environment variables and configuration.
   4
3. Use expo-permissions to handle device permissions gracefully.
4. Ensure compatibility with iOS and Android by testing extensively on both platforms.

API Documentation

- Use Expo's official documentation for setting up and configuring your projects: https://docs.expo.dev/

Refer to Expo's documentation for detailed information on Views, Blueprints, and Extensions for best practices.

README and Documentation:

- Keep the README file up to date with build instructions, setup guides, and any important information for new developers.
