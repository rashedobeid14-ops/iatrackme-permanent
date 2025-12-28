import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Alert,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, NeomorphicShadows } from "@/constants/theme";
import { getCategoryById } from "@/constants/categories";
import { CategoryIcon } from "@/components/category-icon";
import { MultiStepHabitModal } from "@/components/multi-step-habit-modal";
import { Activity, ActivityLog, ActivityType, FilterList } from "@/constants/types";

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Activity[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterList | null>(null);
  const dateScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setTimeout(() => scrollToToday(), 300);
  }, []);

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

  const scrollToToday = () => {
    if (dateScrollRef.current) {
      dateScrollRef.current.scrollTo({ x: 15 * 88, animated: true });
    }
  };

  const isSameDate = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDate(date, today);
  };

  const handleCreateHabit = async (habitData: any) => {
    try {
      const newHabit: Activity = {
        id: Date.now().toString(),
        ...habitData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        archived: false,
        pinned: false,
        backgroundColor: getCategoryById(habitData.categoryId)?.backgroundColor || "#252525",
        color: getCategoryById(habitData.categoryId)?.color || "#fff",
      };

      const updatedHabits = [...habits, newHabit];
      await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
      setShowAddHabitModal(false);
    } catch (error) {
      console.error("Error creating habit:", error);
      Alert.alert("Error", "Failed to create habit. Please try again.");
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const updatedHabits = habits.map((h) => {
        if (h.id === taskId) {
          return {
            ...h,
            isCompleted: !h.isCompleted,
            completedAt: !h.isCompleted ? Date.now() : undefined,
          };
        }
        return h;
      });
      await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleArchiveActivity = async (activityId: string) => {
    try {
      const updatedHabits = habits.map((h) => {
        if (h.id === activityId) {
          return {
            ...h,
            archived: !h.archived,
            updatedAt: Date.now(),
          };
        }
        return h;
      });
      await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
    } catch (error) {
      console.error("Error archiving activity:", error);
    }
  };

  const getDateRange = () => {
    const dates = [];
    const today = new Date();
    for (let i = -15; i <= 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getRecentLogs = () => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    return logs.filter((log) => log.date === dateStr);
  };

  const getActiveLogs = () => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    return logs.filter((log) => log.date === dateStr);
  };

  const getHabitsForDate = () => {
    let filteredHabits = habits;
    if (activeFilter) {
      filteredHabits = filteredHabits.filter(h => {
        const categoryMatch = activeFilter.filters.categories.length === 0 || activeFilter.filters.categories.includes(h.categoryId);
        const typeMatch = activeFilter.filters.types.length === 0 || activeFilter.filters.types.includes(h.type);
        const statusMatch = activeFilter.filters.status === 'all' || 
                           (activeFilter.filters.status === 'active' && !h.archived) ||
                           (activeFilter.filters.status === 'archived' && h.archived);
        return categoryMatch && typeMatch && statusMatch;
      });
    } else {
      filteredHabits = filteredHabits.filter(h => !h.archived);
    }
    return filteredHabits;
  };

  const handleLogHabit = async (habitId: string) => {
    try {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      const dateStr = selectedDate.toISOString().split("T")[0];
      const newLog: ActivityLog = {
        id: Date.now().toString(),
        activityId: habitId,
        date: dateStr,
        duration: habit.targetTime,
        completionPercentage: 100,
        timestamp: Date.now(),
      };

      const updatedLogs = [...logs, newLog];
      await AsyncStorage.setItem("habitLogs", JSON.stringify(updatedLogs));
      setLogs(updatedLogs);

      Alert.alert("Success", `${habit.name} logged!`);
    } catch (error) {
      console.error("Error logging habit:", error);
    }
  };

  const dateRange = getDateRange();
  const recentLogs = getRecentLogs();
  const activeLogs = getActiveLogs();
  const habitsForDate = getHabitsForDate();

  return (
    <ThemedView style={styles.container}>
      <View style={{ paddingTop: Math.max(insets.top, 20) }}>
        <ScrollView
          ref={dateScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateStrip}
          contentContainerStyle={styles.dateStripContent}
          scrollEventThrottle={16}
        >
          {dateRange.map((date, index) => {
            const isCurrentDate = isSameDate(date, selectedDate);
            const isTodayDate = isToday(date);

            return (
              <Pressable
                key={index}
                onPress={() => setSelectedDate(date)}
                style={[
                  styles.dateItem,
                  isTodayDate && !isCurrentDate && styles.dateItemToday,
                  isCurrentDate && styles.dateItemSelected,
                ]}
              >
                <ThemedText
                  style={[
                    styles.dateDay,
                    isTodayDate && !isCurrentDate && styles.dateDayToday,
                    isCurrentDate && styles.dateDaySelected,
                  ]}
                >
                  {date.toLocaleDateString("en-US", { weekday: "short" }).substring(0, 3)}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.dateNumber,
                    isTodayDate && !isCurrentDate && styles.dateNumberToday,
                    isCurrentDate && styles.dateNumberSelected,
                  ]}
                >
                  {date.getDate()}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Today</ThemedText>
        <ThemedText style={styles.subtitle}>
          {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </ThemedText>
      </View>

      <FlatList
        data={[
          { type: "recentLogs", data: recentLogs },
          { type: "activeLogs", data: activeLogs },
          { type: "allHabits", data: habitsForDate },
        ]}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 80) },
        ]}
        renderItem={({ item }) => {
          if (item.type === "recentLogs") {
            const logsData = item.data as ActivityLog[];
            return (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>RECENT LOGS</ThemedText>
                {logsData.length === 0 ? (
                  <ThemedText style={styles.emptyText}>No logs for this date</ThemedText>
                ) : (
                  logsData.map((log) => {
                    const habit = habits.find((h) => h.id === log.activityId);
                    return (
                      <View key={log.id} style={styles.logItem}>
                        <ThemedText style={styles.logText}>
                          {habit?.name} - {log.duration}min
                        </ThemedText>
                      </View>
                    );
                  })
                )}
              </View>
            );
          }

          if (item.type === "activeLogs") {
            const logsData = item.data as ActivityLog[];
            return (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>ACTIVE HABITS</ThemedText>
                {logsData.length === 0 ? (
                  <ThemedText style={styles.emptyText}>No habits logged for this date</ThemedText>
                ) : (
                  logsData.map((log) => {
                    const habit = habits.find((h) => h.id === log.activityId);
                    return (
                      <View key={log.id} style={styles.activeItem}>
                        <CategoryIcon
                          icon={getCategoryById(habit?.categoryId || "health")?.icon || "⭐"}
                          backgroundColor={habit?.backgroundColor || "#252525"}
                          size="small"
                        />
                        <ThemedText style={styles.activeName}>{habit?.name}</ThemedText>
                      </View>
                    );
                  })
                )}
              </View>
            );
          }

          if (item.type === "allHabits") {
            const habitsData = getHabitsForDate();
            
            const renderActivity = (activity: Activity) => {
              const isTask = activity.type === 'task';
              const isRecurring = activity.type === 'recurring_task';
              
              return (
                <Pressable
                  key={activity.id}
                  style={[styles.habitItem, NeomorphicShadows.dark]}
                  onPress={() => isTask ? handleToggleTask(activity.id) : handleLogHabit(activity.id)}
                >
                  <CategoryIcon
                    icon={getCategoryById(activity.categoryId)?.icon || "⭐"}
                    backgroundColor={activity.backgroundColor}
                    size="small"
                  />
                  <View style={styles.habitInfo}>
                    <ThemedText style={[
                      styles.habitName,
                      isTask && activity.isCompleted && { textDecorationLine: 'line-through', opacity: 0.6 }
                    ]}>
                      {activity.name}
                    </ThemedText>
                    <ThemedText style={styles.habitTarget}>
                      {isTask ? `Due: ${activity.dueDate} ${activity.dueTime}` : `${activity.targetTime} min • ${activity.startTime}`}
                      {isRecurring && " • Recurring"}
                    </ThemedText>
                  </View>
                  <View style={styles.activityActions}>
                    <Pressable
                      style={[
                        styles.logButton,
                        isTask && activity.isCompleted && { backgroundColor: Colors.dark.success + '40' }
                      ]}
                      onPress={() => isTask ? handleToggleTask(activity.id) : handleLogHabit(activity.id)}
                    >
                      <ThemedText style={styles.logButtonText}>
                        {isTask ? (activity.isCompleted ? "Done" : "Do") : "Log"}
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={styles.archiveButton}
                      onPress={() => handleArchiveActivity(activity.id)}
                    >
                      <ThemedText style={styles.archiveButtonText}>
                        {activity.archived ? "Unarchive" : "Archive"}
                      </ThemedText>
                    </Pressable>
                  </View>
                </Pressable>
              );
            };

            return (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>ACTIVITIES</ThemedText>
                {habitsData.length === 0 ? (
                  <ThemedText style={styles.emptyText}>
                    No activities yet. Tap the + button to add one!
                  </ThemedText>
                ) : (
                  habitsData.map(renderActivity)
                )}
              </View>
            );
          }

          return null;
        }}
      />

      <Pressable
        style={styles.fab}
        onPress={() => setShowAddHabitModal(true)}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </Pressable>

      <MultiStepHabitModal
        visible={showAddHabitModal}
        onClose={() => setShowAddHabitModal(false)}
        onCreateHabit={handleCreateHabit}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    color: Colors.dark.neonSkyBlue,
  },
  subtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
  },
  dateStrip: {
    height: 100,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  dateStripContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },
  dateItem: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.cardBackground,
  },
  dateItemToday: {
    borderColor: Colors.dark.neonSkyBlue,
    borderWidth: 2,
  },
  dateItemSelected: {
    borderColor: Colors.dark.neonOrange,
    backgroundColor: Colors.dark.cardBackground,
    borderWidth: 2,
  },
  dateDay: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  dateDayToday: {
    color: Colors.dark.neonSkyBlue,
  },
  dateDaySelected: {
    color: Colors.dark.neonOrange,
  },
  dateNumber: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  dateNumberToday: {
    color: Colors.dark.neonSkyBlue,
  },
  dateNumberSelected: {
    color: Colors.dark.neonOrange,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: Colors.dark.neonSkyBlue,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 12,
    letterSpacing: 1,
  },
  emptyText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 12,
  },
  logItem: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.neonOrange,
  },
  logText: {
    color: Colors.dark.text,
    fontSize: 12,
  },
  activeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 10,
  },
  activeName: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  habitItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    color: Colors.dark.text,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  habitTarget: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  activityActions: {
    flexDirection: "column",
    gap: 4,
    alignItems: "flex-end",
  },
  logButton: {
    backgroundColor: Colors.dark.neonSkyBlue,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  archiveButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.cardBackground,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  archiveButtonText: {
    color: Colors.dark.textSecondary,
    fontSize: 10,
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.neonSkyBlue,
    justifyContent: "center",
    alignItems: "center",
    ...NeomorphicShadows.dark,
  },
  fabText: {
    color: Colors.dark.background,
    fontSize: 28,
    fontWeight: "bold",
  },
});
