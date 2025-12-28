import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop, Filter, FeDropShadow, FeGaussianBlur, FeOffset, FeMerge, FeMergeNode } from "react-native-svg";
import { Colors } from "@/constants/theme";
import { ThemedText } from "./themed-text";

interface BeveledProgressCircleProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  centerText?: string;
  subText?: string;
  style?: ViewStyle;
}

export function BeveledProgressCircle({
  progress,
  size = 200,
  strokeWidth = 15,
  centerText,
  subText,
  style,
}: BeveledProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Gradient for the progress stroke */}
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#ff9d00" />
            <Stop offset="100%" stopColor="#ff6600" />
          </LinearGradient>

          {/* Glow effect */}
          <Filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <FeGaussianBlur stdDeviation="5" result="blur" />
            <FeMerge>
              <FeMergeNode in="blur" />
              <FeMergeNode in="SourceGraphic" />
            </FeMerge>
          </Filter>

          {/* Inner shadow for embossed effect */}
          <Filter id="innerShadow">
            <FeDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5" />
          </Filter>
        </Defs>

        {/* Background Circle (Track) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#333"
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.3}
        />

        {/* Progress Circle with 3D/Beveled effect */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${center} ${center})`}
          filter="url(#glow)"
        />
        
        {/* Inner Bevel Highlight */}
        <Circle
          cx={center}
          cy={center}
          r={radius - strokeWidth / 4}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={1}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="transparent"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Center Content */}
      <View style={styles.centerContent}>
        {centerText && (
          <ThemedText style={styles.centerText}>{centerText}</ThemedText>
        )}
        {subText && (
          <ThemedText style={styles.subText}>{subText}</ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  centerContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 100,
    padding: 10,
  },
  centerText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#ff9d00",
    textShadowColor: "rgba(255, 157, 0, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subText: {
    fontSize: 16,
    color: "#e0e0e0",
    marginTop: 4,
    fontWeight: "600",
  },
});
