import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { ThemedText } from "./themed-text";

interface FilledProgressCircleProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  fillColor: string;
  backgroundColor: string;
  centerText?: string;
  centerTextColor?: string;
}

export function FilledProgressCircle({
  progress,
  size = 120,
  strokeWidth = 12,
  fillColor,
  backgroundColor,
  centerText,
  centerTextColor = "#fff",
}: FilledProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Calculate the angle for the pie slice (0 to 360 degrees)
  const angle = progress * 360;
  
  // Convert angle to radians and calculate the end point of the arc
  const radians = (angle * Math.PI) / 180;
  const endX = size / 2 + radius * Math.cos(radians - Math.PI / 2);
  const endY = size / 2 + radius * Math.sin(radians - Math.PI / 2);
  
  // Determine if we need the large arc flag (for angles > 180)
  const largeArcFlag = angle > 180 ? 1 : 0;

  // Create the path for the filled pie slice
  const pathData = `
    M ${size / 2} ${size / 2}
    L ${size / 2} ${size / 2 - radius}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
    Z
  `;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={backgroundColor}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Filled progress pie slice */}
        {progress > 0 && (
          <Path
            d={pathData}
            fill={fillColor}
            stroke={fillColor}
            strokeWidth={1}
          />
        )}
      </Svg>
      
      {/* Center text */}
      {centerText && (
        <View style={styles.centerTextContainer}>
          <ThemedText style={[styles.centerText, { color: centerTextColor }]}>
            {centerText}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerTextContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  centerText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
