import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { Colors } from "@/constants/theme";

interface CategoryIconProps {
  icon: string;
  backgroundColor: string;
  size?: "small" | "medium" | "large";
  selected?: boolean;
}

export function CategoryIcon({
  icon,
  backgroundColor,
  size = "medium",
  selected = false,
}: CategoryIconProps) {
  const sizeMap = {
    small: 40,
    medium: 60,
    large: 80,
  };

  const iconSizeMap = {
    small: 18,
    medium: 28,
    large: 36,
  };

  const containerSize = sizeMap[size];
  const iconSize = iconSizeMap[size];

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor,
        },
        selected && styles.selected,
      ]}
    >
      <ThemedText style={{ fontSize: iconSize }}>{icon}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selected: {
    borderColor: Colors.dark.neonOrange,
    borderWidth: 3,
    shadowColor: Colors.dark.neonOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
