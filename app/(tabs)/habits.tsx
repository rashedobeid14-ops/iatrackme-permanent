import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  FlatList,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, NeomorphicShadows } from "@/constants/theme";
import { getCategoryById } from "@/constants/categories";
import { CategoryIcon } from "@/components/category-icon";
import { FilledProgressCircle } from "@/components/filled-progress-circle";
import { Activity, ActivityLog } from "@/constants/types";
import { TimePickerModal } from "@/components/time-picker-modal";

export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Activity[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [selectedHabitForLogging, setSelectedHabitForLogging] = useState<Activity | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadData = async () => {
    try {
      const habitsData = await AsyncStorage.getItem("habits");
      const logsData = await AsyncStorage.getItem("habitLogs");

      if (habitsData) setHabits(JSON.parse(habitsData));
      if (logsData) setLogs(JSON.parse(logsData));
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const getHabitCompletionPercentage = (habitId: string): number => {
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = logs.filter(
      (log) => log.activityId === habitId && log.date === today
    );

    if (todayLogs.length === 0) return 0;

    const avgCompletion =
      todayLogs.reduce((sum, log) => sum + log.completionPercentage, 0) /
      todayLogs.length;
    return avgCompletion;
  };

  const getTotalTimeLaps = (habitId: string): string => {
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = logs.filter(
      (log) => log.activityId === habitId && log.date === today
    );

    const totalMinutes = todayLogs.reduce((sum, log) => sum + log.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleManualLog = (habit: Activity) => {
    setSelectedHabitForLogging(habit);
    setIsTimePickerVisible(true);
  };

  const onConfirmTimeLog = async (h: number, m: number, s: number) => {
    if (!selectedHabitForLogging) return;
    
    const durationInMinutes = h * 60 + m + s / 60;
    if (durationInMinutes <= 0) {
      Alert.alert("Error", "Please select a duration greater than 0");
      return;
    }

    const completionPercentage = Math.min(
      100,
      Math.round((durationInMinutes / selectedHabitForLogging.targetTime) * 100)
    );

    const newLog: ActivityLog = {
      id: Date.now().toString(),
      activityId: selectedHabitForLogging.id,
      date: new Date().toISOString().split("T")[0],
      duration: Math.round(durationInMinutes),
      completionPercentage,
      timestamp: Date.now(),
    };

    try {
      const logsData = await AsyncStorage.getItem("habitLogs");
      const logs = logsData ? JSON.parse(logsData) : [];
      const updatedLogs = [...logs, newLog];
      await AsyncStorage.setItem("habitLogs", JSON.stringify(updatedLogs));
      
      Alert.alert("Success", `Logged ${Math.round(durationInMinutes)}m for ${selectedHabitForLogging.name}`);
      setIsTimePickerVisible(false);
      loadData();
    } catch (error) {
      console.error("Error logging time:", error);
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const updatedHabits = habits.filter((h) => h.id !== habitId);
      await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
      Alert.alert("Success", "Habit deleted");
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const handleDeleteHabit = (habitId: string, habitName: string) => {
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habitName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteHabit(habitId),
        },
      ]
    );
  };

  const renderHabitCard = ({ item }: { item: Activity }) => {
    const completion = getHabitCompletionPercentage(item.id);
    const timeLaps = getTotalTimeLaps(item.id);
    const category = getCategoryById(item.categoryId);
    const completionRatio = completion / 100;

    return (
      <Pressable
        style={[styles.habitCard, NeomorphicShadows.dark]}
        onPress={() => handleManualLog(item)}
        onLongPress={() => handleDeleteHabit(item.id, item.name)}
      >
        <View style={styles.habitCardContent}>
          {/* Left: Category Icon */}
          <View style={styles.habitCardLeft}>
            <CategoryIcon
              icon={category?.icon || "⭐"}
              backgroundColor={item.backgroundColor}
              size="large"
            />
          </View>

          {/* Center: Habit Info */}
          <View style={styles.habitCardCenter}>
            <ThemedText style={styles.habitName}>{item.name}</ThemedText>
            <ThemedText style={styles.habitCategory}>
              {category?.name || "Other"}
            </ThemedText>
            <ThemedText style={styles.habitTarget}>
              Target: {item.targetTime} minutes
            </ThemedText>
            <ThemedText style={styles.habitTimeLaps}>
              Today: {timeLaps}
            </ThemedText>
          </View>

          {/* Right: Progress Circle */}
          <View style={styles.habitCardRight}>
            <FilledProgressCircle
              progress={completionRatio}
              size={100}
              strokeWidth={10}
              fillColor={Colors.dark.neonOrange}
              backgroundColor={Colors.dark.cardBackground}
              centerText={`${Math.round(completion)}%`}
              centerTextColor={Colors.dark.neonOrange}
            />
          </View>
        </View>

        {/* Bottom: Stats Bar */}
        <View style={styles.habitCardStats}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Completion</ThemedText>
            <ThemedText style={styles.statValue}>
              {Math.round(completion)}%
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Time Spent</ThemedText>
            <ThemedText style={styles.statValue}>{timeLaps}</ThemedText>
          </View>
        </View>

        {/* Delete Hint */}
        <ThemedText style={styles.deleteHint}>
          Long press to delete
        </ThemedText>
      </Pressable>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedText style={styles.headerTitle}>Your Habits</ThemedText>
      <ThemedText style={styles.headerSubtitle}>
        {habits.length} habit{habits.length !== 1 ? "s" : ""} tracked
      </ThemedText>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyIcon}>📋</ThemedText>
      <ThemedText style={styles.emptyTitle}>No Habits Yet</ThemedText>
      <ThemedText style={styles.emptyText}>
        Go to Calendar tab and tap the + button to create your first habit!
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={renderHabitCard}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 80) },
        ]}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        scrollEnabled={true}
      />

      <TimePickerModal
        isVisible={isTimePickerVisible}
        onClose={() => setIsTimePickerVisible(false)}
        onConfirm={onConfirmTimeLog}
        habitName={selectedHabitForLogging?.name}
        targetTime={selectedHabitForLogging?.targetTime}
        currentProgress={selectedHabitForLogging ? (logs.filter(l => l.activityId === selectedHabitForLogging.id && l.date === new Date().toISOString().split("T")[0]).reduce((sum, l) => sum + l.duration, 0)) : 0}
      />
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
    paddingVertical: 16,
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    color: Colors.dark.neonSkyBlue,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 18,
  },
  habitCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  habitCardContent: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  habitCardLeft: {
    justifyContent: "center",
    alignItems: "center",
  },
  habitCardCenter: {
    flex: 1,
    justifyContent: "center",
  },
  habitName: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  habitCategory: {
    color: Colors.dark.neonSkyBlue,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  habitTarget: {
    color: Colors.dark.textSecondary,
    fontSize: 10,
    marginBottom: 2,
  },
  habitTimeLaps: {
    color: Colors.dark.neonOrange,
    fontSize: 10,
    fontWeight: "600",
  },
  habitCardRight: {
    justifyContent: "center",
    alignItems: "center",
  },
  habitCardStats: {
    flexDirection: "row",
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 9,
    fontWeight: "500",
    marginBottom: 2,
  },
  statValue: {
    color: Colors.dark.neonOrange,
    fontSize: 12,
    fontWeight: "bold",
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 8,
  },
  deleteHint: {
    color: Colors.dark.textSecondary,
    fontSize: 9,
    fontStyle: "italic",
    textAlign: "center",
  },
});
