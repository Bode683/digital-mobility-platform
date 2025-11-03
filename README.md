# Digital Mobility Platform 🚗

A modern mobility/taxi app built with **Expo** and **React Native**. It is written in **TypeScript** and uses **Supabase** for its backend, including user authentication and database storage. The application leverages **@tanstack/react-query** for efficient data fetching and state management.

The app features a tab-based navigation structure with "Home", "Explore", and "Profile" screens, powered by **expo-router** for file-based routing and typed routes. It includes user authentication (sign-up and sign-in with email and password) and a profile section where users can manage their information.

**Mapbox integration** is a core feature, utilizing **@rnmapbox/maps** for displaying maps, handling location selection, and providing routing functionalities. Animations and gestures are handled with **react-native-reanimated** and **react-native-gesture-handler**. Input validation is performed using **Zod**.

The UI is built using a mix of components from `@rneui/themed` and custom components found in the `src/components/` directory. The project is configured for iOS, Android, and web platforms, with native builds (Android/iOS) managed via **EAS Build** due to the use of native modules like Mapbox GL.

## Features

- ✨ **Animated Splash Screen** - Smooth logo animation on app launch
- 📱 **Onboarding Carousel** - 3-slide introduction for first-time users
- 🔐 **Modern Auth UI** - Tabbed sign in/sign up with social login buttons
- 🎨 **Custom Theme System** - Light/dark mode support
- 🔒 **Protected Routes** - Automatic navigation based on auth state
- 🗺️ **Mapbox Integration** - Location selection, routing, and real-time tracking

For detailed onboarding flow documentation, see [ONBOARDING.md](./ONBOARDING.md).

## Get started

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Start the app:**

    ```bash
    npx expo start
    ```

    In the output, you'll find options to open the app in a:

    - [development build](https://docs.expo.dev/develop/development-builds/introduction/)
    - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
    - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
    - [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

    _Note: For Mapbox features, you will need to create an EAS development build for Android/iOS as they rely on native modules._

3.  **Run on Android:**

    ```bash
    expo run:android
    ```

4.  **Run on iOS:**

    ```bash
    expo run:ios
    ```

5.  **Run on Web:**

    ```bash
    expo start --web
    ```

6.  **Linting:**
    To check for code quality and style issues:

    ```bash
    npm run lint
    ```

7.  **Clear Async Storage:**
    To clear application's async storage:
    ```bash
    npm run clear-async-storage
    ```

## Development Conventions

- **Routing:** The project uses file-based routing provided by **Expo Router**, with typed routes enabled.
- **TypeScript:** The project enforces strict TypeScript rules (`"strict": true`). Path aliases are configured to use `@/*` for cleaner imports, mapping to `src/`, `app/`, `assets/`, `components/`, `constants/`, `hooks/`, `lib/`, `api/`, `context/`, and `features/`.
- **Backend:** **Supabase** is used for backend services. The client is initialized using a singleton pattern in `src/lib/supabase.ts`. API keys are managed through environment variables (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
- **State Management:** Component state is managed with React hooks. For authentication, the root layout (`app/_layout.tsx`) handles session state and redirects users based on their authentication status. Data fetching is handled with **@tanstack/react-query**.
- **UI Components:** The app uses a mix of components from `@rneui/themed` and custom-built components found in the `src/components/` directory. Animations and gestures are implemented using `react-native-reanimated` and `react-native-gesture-handler`.
- **Styling:** Styles are defined using `StyleSheet.create`. The app supports both light and dark color schemes.
- **EAS Build:** **Expo Application Services (EAS) Build** is used for creating native development and production builds for Android and iOS. Mapbox-related environment variables (`EXPO_PUBLIC_MAPBOX_TOKEN`, `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`) are passed as EAS Secrets.
- **Validation:** **Zod** is used for schema validation, particularly in API request handling.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
