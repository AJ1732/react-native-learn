import { useColorScheme } from "nativewind";
import { vars } from "nativewind";

export const lightTheme = vars({
  "--canvas": "255 255 255",
  "--surface": "250 250 250",
  "--subtle": "245 245 245",
  "--fg": "23 23 23",
  "--fg-muted": "115 115 115",
  "--outline": "229 229 229",
  "--outline-subtle": "245 245 245",
  "--outline-strong": "212 212 212",
});

export const darkTheme = vars({
  "--canvas": "10 10 10",
  "--surface": "23 23 23",
  "--subtle": "38 38 38",
  "--fg": "250 250 250",
  "--fg-muted": "163 163 163",
  "--outline": "64 64 64",
  "--outline-subtle": "38 38 38",
  "--outline-strong": "82 82 82",
});

const paletteColors = {
  light: {
    icon: "#262626",
    iconMuted: "#737373",
    brandChevron: "#260033",
    refreshTint: "#bf00ff",
  },
  dark: {
    icon: "#d4d4d4",
    iconMuted: "#a3a3a3",
    brandChevron: "#e599ff",
    refreshTint: "#bf00ff",
  },
} as const;

export type PaletteColors = typeof paletteColors.light;

export function useThemeColors(): PaletteColors {
  const { colorScheme } = useColorScheme();
  return paletteColors[colorScheme === "dark" ? "dark" : "light"];
}
