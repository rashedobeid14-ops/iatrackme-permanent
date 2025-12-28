import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, NeomorphicShadows } from "@/constants/theme";
import { Activity, ActivityLog } from "@/constants/types";
import { StreakBadgeDisplay } from "@/components/streak-badge-display";
import { BeveledProgressCircle } from "@/components/beveled-progress-circle";
import {
  getStreakStats,
  StreakData,
  getAllUnlockedBadges,
} from "@/lib/streak-tracker";
import { shareStreakAsText, shareBadgeAsText, shareOverallStats } from "@/lib/sharing";

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Activity[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [streakStats, setStreakStats] = useState<any>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const habitsData = await AsyncStorage.getItem("habits");
      const logsData = await AsyncStorage.getItem("habitLogs");

      const parsedHabits = habitsData ? JSON.parse(habitsData) : [];
      const parsedLogs = logsData ? JSON.parse(logsData) : [];

      setHabits(parsedHabits);
      setLogs(parsedLogs);

      // Calculate streak stats
      const stats = await getStreakStats(parsedHabits, parsedLogs);
      setStreakStats(stats);

      // Get all unlocked badges
      const badges = await getAllUnlockedBadges(parsedHabits, parsedLogs);
      setAllBadges(badges);

      // Set first active habit as selected
      const activeHabits = parsedHabits.filter((h: Activity) => !h.archived);
      if (activeHabits.length > 0) {
        setSelectedHabitId(activeHabits[0].id);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  const calculateAverageCompletion = () => {
    if (logs.length === 0) return 0;
    const total = logs.reduce((sum, log) => sum + log.completionPercentage, 0);
    return Math.round(total / logs.length);
  };

  const getSelectedHabitStreak = (): StreakData | null => {
    if (!selectedHabitId || !streakStats) return null;
    return streakStats.habitStreaks[selectedHabitId] || null;
  };

  const getRecentLogs = () => {
    return logs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
        <ThemedText>Loading analytics...</ThemedText>
      </ThemedView>
    );
  }

  const selectedHabitStreak = getSelectedHabitStreak();
  const activeHabits = habits.filter((h) => !h.archived);
  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  return (
    <ThemedView style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 80) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Analytics
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Your journey to consistency
          </ThemedText>
        </View>

        {/* Overall Statistics Cards */}
        <Pressable 
          style={styles.statsGrid}
          onLongPress={() => shareOverallStats({
            totalActiveStreaks: streakStats?.totalActiveStreaks || 0,
            longestStreak: streakStats?.longestStreak || 0,
            totalBadges: allBadges.length,
          })}
        >
          <View style={[styles.statCard, NeomorphicShadows.dark]}>
            <ThemedText style={styles.statLabel}>Total Habits</ThemedText>
            <ThemedText style={styles.statValue}>{activeHabits.length}</ThemedText>
          </View>

          <View style={[styles.statCard, NeomorphicShadows.dark]}>
            <ThemedText style={styles.statLabel}>Active Streaks</ThemedText>
            <ThemedText style={styles.statValue}>
              {streakStats?.totalActiveStreaks || 0}
            </ThemedText>
          </View>

          <View style={[styles.statCard, NeomorphicShadows.dark]}>
            <ThemedText style={styles.statLabel}>Longest Streak</ThemedText>
            <ThemedText style={styles.statValue}>
              {streakStats?.longestStreak || 0}
            </ThemedText>
          </View>

          <View style={[styles.statCard, NeomorphicShadows.dark]}>
            <ThemedText style={styles.statLabel}>Avg Completion</ThemedText>
            <ThemedText style={styles.statValue}>
              {calculateAverageCompletion()}%
            </ThemedText>
          </View>
        </Pressable>

        {/* 3D Progress Section */}
        {activeHabits.length > 0 && selectedHabitId && (
          <View style={[styles.section, styles.progressSection]}>
            <View style={styles.progressHeader}>
              <ThemedText style={styles.sectionTitle}>Current Progress</ThemedText>
              <ThemedText style={styles.habitNameHeader}>
                {selectedHabit?.name}
              </ThemedText>
            </View>
            
            <View style={styles.progressContainer}>
              <BeveledProgressCircle
                progress={(() => {
                  if (!selectedHabit) return 0;
                  const habitLogs = logs.filter(l => l.activityId === selectedHabitId);
                  const totalDuration = habitLogs.reduce((sum, l) => sum + l.duration, 0);
                  return Math.min(1, totalDuration / (selectedHabit.targetTime || 1));
                })()}
                centerText={`${Math.round(((() => {
                  if (!selectedHabit) return 0;
                  const habitLogs = logs.filter(l => l.activityId === selectedHabitId);
                  const totalDuration = habitLogs.reduce((sum, l) => sum + l.duration, 0);
                  return Math.min(1, totalDuration / (selectedHabit.targetTime || 1));
                })()) * 100)}%`}
                subText={`${(() => {
                  const habitLogs = logs.filter(l => l.activityId === selectedHabitId);
                  const totalDuration = habitLogs.reduce((sum, l) => sum + l.duration, 0);
                  return totalDuration;
                })()}/${selectedHabit?.targetTime || 0} min`}
              />
              
              <View style={styles.progressStats}>
                <View style={styles.miniStat}>
                  <ThemedText style={styles.miniStatLabel}>Completion:</ThemedText>
                  <ThemedText style={styles.miniStatValue}>
                    {Math.round((logs.filter(l => l.activityId === selectedHabitId && l.completionPercentage >= 100).length / Math.max(1, logs.filter(l => l.activityId === selectedHabitId).length)) * 100)}%
                  </ThemedText>
                </View>
                <View style={styles.miniStat}>
                  <ThemedText style={styles.miniStatLabel}>Longest streak:</ThemedText>
                  <ThemedText style={styles.miniStatValue}>
                    {streakStats?.habitStreaks[selectedHabitId]?.longestStreak || 0} days
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Habit Selector for Streaks */}
        {activeHabits.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Habit Details</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.habitSelector}
            >
              {activeHabits.map((habit) => (
                <Pressable
                  key={habit.id}
                  style={[
                    styles.habitButton,
                    selectedHabitId === habit.id && styles.habitButtonActive,
                  ]}
                  onPress={() => setSelectedHabitId(habit.id)}
                >
                  <ThemedText
                    style={[
                      styles.habitButtonText,
                      selectedHabitId === habit.id &&
                        styles.habitButtonTextActive,
                    ]}
                  >
                    {habit.name}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>

            {/* Selected Habit Streak Display */}
            {selectedHabitStreak && (
              <View>
                <StreakBadgeDisplay
                  currentStreak={selectedHabitStreak.currentStreak}
                  longestStreak={selectedHabitStreak.longestStreak}
                  badges={selectedHabitStreak.badges}
                  habitName={selectedHabit?.name}
                  onBadgePress={(badge) => shareBadgeAsText(badge, selectedHabit?.name)}
                />
                {selectedHabitStreak.currentStreak > 0 && (
                  <Pressable 
                    style={[styles.shareButton, NeomorphicShadows.dark]}
                    onPress={() => shareStreakAsText(
                      selectedHabit?.name || "Habit",
                      selectedHabitStreak.currentStreak
                    )}
                  >
                    <ThemedText style={styles.shareButtonText}>📤 Share Streak</ThemedText>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        )}

        {/* Badges Section */}
        {allBadges.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              🏆 Achievements Unlocked
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.badgesScroll}
            >
              {allBadges.map((badge) => (
                <Pressable
                  key={badge.id}
                  style={[styles.badgeCard, NeomorphicShadows.dark]}
                  onPress={() => shareBadgeAsText(badge)}
                >
                  <ThemedText style={styles.badgeIcon}>{badge.icon}</ThemedText>
                  <ThemedText style={styles.badgeName}>{badge.name}</ThemedText>
                  <ThemedText style={styles.badgeMilestone}>
                    {badge.milestone}d
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Activity */}
        {logs.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
            <View style={styles.activityList}>
              {getRecentLogs().map((log) => {
                const habit = habits.find((h) => h.id === log.activityId);
                return (
                  <View
                    key={log.id}
                    style={[styles.activityItem, NeomorphicShadows.dark]}
                  >
                    <View style={styles.activityContent}>
                      <ThemedText style={styles.activityHabit}>
                        {habit?.name || "Unknown"}
                      </ThemedText>
                      <ThemedText style={styles.activityDate}>
                        {new Date(log.date).toLocaleDateString()}
                      </ThemedText>
                    </View>
                    <View style={styles.activityStats}>
                      <ThemedText style={styles.activityDuration}>
                        {log.duration}m
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.activityCompletion,
                          {
                            color:
                              log.completionPercentage >= 100
                                ? Colors.dark.neonOrange
                                : Colors.dark.neonSkyBlue,
                          },
                        ]}
                      >
                        {log.completionPercentage}%
                      </ThemedText>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Empty State */}
        {logs.length === 0 && (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyIcon}>📊</ThemedText>
            <ThemedText style={styles.emptyText}>
              No activity yet. Start logging habits to see your analytics!
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark.neonSkyBlue,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 12,
  },
  progressSection: {
    backgroundColor: "rgba(255, 157, 0, 0.05)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 157, 0, 0.2)",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  habitNameHeader: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: "600",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  progressStats: {
    gap: 12,
  },
  miniStat: {
    gap: 4,
  },
  miniStatLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  miniStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  badgesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  badgeCard: {
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
  badgeMilestone: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
  },
  habitSelector: {
    marginBottom: 16,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  habitButton: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  habitButtonActive: {
    backgroundColor: Colors.dark.neonSkyBlue,
    borderColor: Colors.dark.neonOrange,
  },
  habitButtonText: {
    fontSize: 12,
    color: Colors.dark.text,
    fontWeight: "600",
  },
  habitButtonTextActive: {
    color: Colors.dark.background,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  activityContent: {
    flex: 1,
  },
  activityHabit: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  activityStats: {
    alignItems: "flex-end",
    gap: 4,
  },
  activityDuration: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.neonOrange,
  },
  activityCompletion: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
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
  shareButton: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.dark.neonSkyBlue,
  },
});
