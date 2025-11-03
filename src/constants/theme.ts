/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#38bdf8";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    primary: "#0a7ea4",
    secondary: "#6b7280",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    muted: "#f3f4f6",
    card: "#ffffff",
    border: "#e5e7eb",
    input: "#f9fafb",
    overlay: "rgba(0,0,0,0.4)",
    skeleton: "#e5e7eb",
    textMuted: "#6b7280",
    backgroundElevated: "#f9fafb",
    surface: "#f9fafb",
    accent: "#0a7ea4",
    onPrimary: "#ffffff",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    primary: "#38bdf8",
    secondary: "#94a3b8",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#f87171",
    muted: "#1f2937",
    card: "#111827",
    border: "#374151",
    input: "#111827",
    overlay: "rgba(0,0,0,0.6)",
    skeleton: "#374151",
    textMuted: "#9ca3af",
    backgroundElevated: "#0b0f10",
    surface: "#0b0f10",
    accent: "#38bdf8",
    onPrimary: "#000000",
  },
} as const;

type FontSet = { sans: string; serif: string; rounded: string; mono: string };

export const Fonts: FontSet = Platform.select<FontSet>({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
})!;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radii = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

export const Elevation = {
  0: 0,
  1: 2,
  2: 4,
  3: 8,
  4: 12,
} as const;

export const Opacity = {
  disabled: 0.5,
  hover: 0.8,
  focus: 0.9,
} as const;

export const Z = {
  dropdown: 1000,
  modal: 1100,
  toast: 1200,
} as const;

export const Typography = {
  h1: {
    fontFamily: Fonts.sans,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
  },
  h2: {
    fontFamily: Fonts.sans,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  h3: {
    fontFamily: Fonts.sans,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400",
  },
  caption: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
  },
  mono: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
  },
} as const;

export type ColorScheme = keyof typeof Colors;

export type Theme = {
  scheme: ColorScheme;
  colors: (typeof Colors)[ColorScheme];
  spacing: typeof Spacing;
  radii: typeof Radii;
  elevation: typeof Elevation;
  opacity: typeof Opacity;
  z: typeof Z;
  typography: typeof Typography;
  fonts: typeof Fonts;
};

export function getTheme(scheme: ColorScheme): Theme {
  return {
    scheme,
    colors: Colors[scheme],
    spacing: Spacing,
    radii: Radii,
    elevation: Elevation,
    opacity: Opacity,
    z: Z,
    typography: Typography,
    fonts: Fonts,
  } as const;
}

export const navigationLightTheme = {
  dark: false,
  colors: {
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.error,
  },
} as const;

export const navigationDarkTheme = {
  dark: true,
  colors: {
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.error,
  },
} as const;
