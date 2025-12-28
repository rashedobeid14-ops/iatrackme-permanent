import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Switch,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, NeomorphicShadows } from "@/constants/theme";
import {
  NotificationSettings,
  loadNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermissions,
  scheduleAllHabitReminders,
} from "@/lib/notifications";
import { Activity } from "@/constants/types";

interface NotificationSettingsComponentProps {
  habits: Activity[];
  onSettingsChange?: (settings: NotificationSettings) => void;
}

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function NotificationSettingsComponent({
  habits,
  onSettingsChange,
}: NotificationSettingsComponentProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    reminderTime: "09:00",
    reminderDays: [true, true, true, true, true, false, false],
    habitReminders: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await loadNotificationSettings();
      setSettings(loadedSettings);
      setLoading(false);
    } catch (error) {
      console.error("Error loading notification settings:", error);
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          "Permission Denied",
          "Notifications require permission. Please enable them in your device settings."
        );
        return;
      }

      // Schedule all reminders when enabling
      await scheduleAllHabitReminders(habits, settings.reminderTime);
    }

    const updatedSettings = { ...settings, enabled };
    setSettings(updatedSettings);
    await saveNotificationSettings(updatedSettings);
    onSettingsChange?.(updatedSettings);
  };

  const handleReminderTimeChange = async (time: string) => {
    // Validate time format HH:MM
    if (!/^\d{2}:\d{2}$/.test(time)) return;

    const updatedSettings = { ...settings, reminderTime: time };
    setSettings(updatedSettings);
    await saveNotificationSettings(updatedSettings);

    // Reschedule reminders with new time
    if (settings.enabled) {
      await scheduleAllHabitReminders(habits, time);
    }

    onSettingsChange?.(updatedSettings);
  };

  const handleToggleDay = async (dayIndex: number) => {
    const updatedDays = [...settings.reminderDays];
    updatedDays[dayIndex] = !updatedDays[dayIndex];

    const updatedSettings = { ...settings, reminderDays: updatedDays };
    setSettings(updatedSettings);
    await saveNotificationSettings(updatedSettings);

    // Reschedule reminders with new days
    if (settings.enabled) {
      await scheduleAllHabitReminders(habits, settings.reminderTime);
    }

    onSettingsChange?.(updatedSettings);
  };

  const handleToggleHabitReminder = async (habitId: string) => {
    const updatedHabitReminders = { ...settings.habitReminders };
    updatedHabitReminders[habitId] = !updatedHabitReminders[habitId];

    const updatedSettings = {
      ...settings,
      habitReminders: updatedHabitReminders,
    };
    setSettings(updatedSettings);
    await saveNotificationSettings(updatedSettings);
    onSettingsChange?.(updatedSettings);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading notification settings...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Main Toggle */}
      <View style={[styles.section, NeomorphicShadows.dark]}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>
            Push Notifications
          </ThemedText>
          <Switch
            value={settings.enabled}
            onValueChange={handleToggleNotifications}
            trackColor={{
              false: Colors.dark.border,
              true: Colors.dark.neonSkyBlue,
            }}
            thumbColor={settings.enabled ? Colors.dark.neonOrange : "#f4f3f4"}
          />
        </View>
        <ThemedText style={styles.sectionDescription}>
          Receive reminders to complete your habits
        </ThemedText>
      </View>

      {settings.enabled && (
        <>
          {/* Reminder Time */}
          <View style={[styles.section, NeomorphicShadows.dark]}>
            <ThemedText style={styles.sectionTitle}>Reminder Time</ThemedText>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                placeholder="09:00"
                placeholderTextColor={Colors.dark.textSecondary}
                value={settings.reminderTime}
                onChangeText={handleReminderTimeChange}
                maxLength={5}
              />
              <ThemedText style={styles.timeHint}>HH:MM</ThemedText>
            </View>
            <ThemedText style={styles.sectionDescription}>
              Default time for all habit reminders
            </ThemedText>
          </View>

          {/* Days Selection */}
          <View style={[styles.section, NeomorphicShadows.dark]}>
            <ThemedText style={styles.sectionTitle}>Reminder Days</ThemedText>
            <View style={styles.daysGrid}>
              {WEEKDAYS.map((day, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.dayButton,
                    settings.reminderDays[index] && styles.dayButtonActive,
                  ]}
                  onPress={() => handleToggleDay(index)}
                >
                  <ThemedText
                    style={[
                      styles.dayButtonText,
                      settings.reminderDays[index] &&
                        styles.dayButtonTextActive,
                    ]}
                  >
                    {day.substring(0, 3)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Individual Habit Reminders */}
          {habits.length > 0 && (
            <View style={[styles.section, NeomorphicShadows.dark]}>
              <ThemedText style={styles.sectionTitle}>
                Habit Reminders
              </ThemedText>
              <ScrollView
                style={styles.habitsList}
                showsVerticalScrollIndicator={false}
              >
                {habits
                  .filter((h) => !h.archived)
                  .map((habit) => (
                    <View key={habit.id} style={styles.habitItem}>
                      <ThemedText style={styles.habitName}>
                        {habit.name}
                      </ThemedText>
                      <Switch
                        value={settings.habitReminders[habit.id] ?? true}
                        onValueChange={() => handleToggleHabitReminder(habit.id)}
                        trackColor={{
                          false: Colors.dark.border,
                          true: Colors.dark.neonSkyBlue,
                        }}
                        thumbColor={
                          settings.habitReminders[habit.id] ?? true
                            ? Colors.dark.neonOrange
                            : "#f4f3f4"
                        }
                      />
                    </View>
                  ))}
              </ScrollView>
              <ThemedText style={styles.sectionDescription}>
                Choose which habits should send reminders
              </ThemedText>
            </View>
          )}
        </>
      )}

      {/* Info Box */}
      <View style={[styles.infoBox, NeomorphicShadows.dark]}>
        <ThemedText style={styles.infoIcon}>ℹ️</ThemedText>
        <ThemedText style={styles.infoText}>
          Notifications will be sent at your selected time on the chosen days.
          Make sure notifications are enabled in your device settings.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingVertical: 12,
  },
  section: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  sectionDescription: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 8,
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 12,
  },
  timeInput: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "600",
  },
  timeHint: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 12,
  },
  dayButton: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  dayButtonActive: {
    backgroundColor: Colors.dark.neonSkyBlue,
    borderColor: Colors.dark.neonOrange,
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
  dayButtonTextActive: {
    color: Colors.dark.background,
  },
  habitsList: {
    maxHeight: 300,
    marginVertical: 12,
  },
  habitItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  habitName: {
    fontSize: 14,
    color: Colors.dark.text,
    flex: 1,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 12,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
});
