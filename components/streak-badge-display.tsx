import React from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, NeomorphicShadows } from "@/constants/theme";
import { Badge } from "@/lib/streak-tracker";

interface StreakBadgeDisplayProps {
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  habitName?: string;
  onBadgePress?: (badge: Badge) => void;
}

export function StreakBadgeDisplay({
  currentStreak,
  longestStreak,
  badges,
  habitName,
  onBadgePress,
}: StreakBadgeDisplayProps) {
  return (
    <ThemedView style={styles.container}>
      {/* Current Streak Section */}
      <View style={[styles.streakCard, NeomorphicShadows.dark]}>
        <View style={styles.streakContent}>
          <ThemedText style={styles.streakLabel}>Current Streak</ThemedText>
          <View style={styles.streakNumber}>
            <ThemedText style={styles.streakValue}>{currentStreak}</ThemedText>
            <ThemedText style={styles.streakUnit}>days</ThemedText>
          </View>
          {habitName && (
            <ThemedText style={styles.habitName}>{habitName}</ThemedText>
          )}
        </View>
        <View style={styles.streakIcon}>
          <ThemedText style={styles.streakEmoji}>
            {currentStreak > 0 ? "🔥" : "⏸️"}
          </ThemedText>
        </View>
      </View>

      {/* Longest Streak */}
      {longestStreak > 0 && longestStreak !== currentStreak && (
        <View style={[styles.statCard, NeomorphicShadows.dark]}>
          <ThemedText style={styles.statLabel}>Longest Streak</ThemedText>
          <ThemedText style={styles.statValue}>{longestStreak} days</ThemedText>
        </View>
      )}

      {/* Badges Section */}
      {badges.length > 0 && (
        <View style={styles.badgesSection}>
          <ThemedText style={styles.badgesTitle}>Achievements</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.badgesScroll}
          >
            {badges.map((badge) => (
              <Pressable
                key={badge.id}
                style={[styles.badgeItem, NeomorphicShadows.dark]}
                onPress={() => onBadgePress?.(badge)}
              >
                <ThemedText style={styles.badgeIcon}>{badge.icon}</ThemedText>
                <ThemedText style={styles.badgeName}>{badge.name}</ThemedText>
                <ThemedText style={styles.badgeDesc}>
                  {badge.milestone}d
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Empty State */}
      {currentStreak === 0 && badges.length === 0 && (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyIcon}>🎯</ThemedText>
          <ThemedText style={styles.emptyText}>
            Start logging to build your streak!
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingVertical: 12,
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  streakContent: {
    flex: 1,
  },
  streakLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
    fontWeight: "600",
  },
  streakNumber: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  streakValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.dark.neonOrange,
  },
  streakUnit: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  habitName: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 8,
  },
  streakIcon: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.background,
  },
  streakEmoji: {
    fontSize: 32,
  },
  statCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark.neonSkyBlue,
  },
  badgesSection: {
    marginTop: 8,
  },
  badgesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 12,
  },
  badgesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  badgeItem: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 100,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
});
