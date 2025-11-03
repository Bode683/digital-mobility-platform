import { getTheme, type ColorScheme, type Theme } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useTheme(): Theme {
  const scheme = (useColorScheme() ?? "light") as ColorScheme;
  return getTheme(scheme);
}
