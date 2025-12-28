/**
 * IATrackMe Color Theme
 * Dark theme with neon sky blue and orange accents
 */

import { Platform } from "react-native";

// Neon colors for IATrackMe
const neonSkyBlue = "#00d4ff";
const neonOrange = "#ff6600";
const darkGray = "#1a1a1a";
const cardGray = "#252525";
const textLight = "#e0e0e0";
const textSecondary = "#a0a0a0";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: "#007AFF",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#007AFF",
  },
  dark: {
    text: textLight,
    background: darkGray,
    tint: neonSkyBlue,
    icon: textSecondary,
    tabIconDefault: textSecondary,
    tabIconSelected: neonSkyBlue,
    // IATrackMe specific colors
    neonSkyBlue: neonSkyBlue,
    neonOrange: neonOrange,
    cardBackground: cardGray,
    textSecondary: textSecondary,
    border: "#1a3a3f",
    success: "#00ff00",
  },
};

export const Fonts = Platform.select({
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
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Neomorphic shadow styles
export const NeomorphicShadows = {
  light: {
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  dark: {
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  inset: {
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
};
