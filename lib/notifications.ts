import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Activity, ActivityLog } from "@/constants/types";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  reminderTime: string; // HH:MM format
  reminderDays: boolean[]; // 7 days of week
  habitReminders: { [habitId: string]: boolean };
}

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

/**
 * Load notification settings from storage
 */
export async function loadNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settings = await AsyncStorage.getItem("notificationSettings");
    if (settings) {
      return JSON.parse(settings);
    }
    // Default settings
    return {
      enabled: false,
      reminderTime: "09:00",
      reminderDays: [true, true, true, true, true, false, false], // Weekdays
      habitReminders: {},
    };
  } catch (error) {
    console.error("Error loading notification settings:", error);
    return {
      enabled: false,
      reminderTime: "09:00",
      reminderDays: [true, true, true, true, true, false, false],
      habitReminders: {},
    };
  }
}

/**
 * Save notification settings to storage
 */
export async function saveNotificationSettings(
  settings: NotificationSettings
): Promise<void> {
  try {
    await AsyncStorage.setItem("notificationSettings", JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving notification settings:", error);
  }
}

/**
 * Schedule a daily reminder notification for a habit
 */
export async function scheduleHabitReminder(
  habit: Activity,
  reminderTime: string
): Promise<string | null> {
  try {
    const [hours, minutes] = reminderTime.split(":").map(Number);

    // Parse habit start time
    const [habitHours, habitMinutes] = habit.startTime.split(":").map(Number);

    // Use habit start time if available, otherwise use reminder time
    const finalHours = habit.startTime ? habitHours : hours;
    const finalMinutes = habit.startTime ? habitMinutes : minutes;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time for your habit! 🎯",
        body: `It's time to do: ${habit.name}`,
        data: {
          habitId: habit.id,
          habitName: habit.name,
          type: "habit_reminder",
        },
        sound: true,
        badge: 1,
      },
      trigger: {
        type: "daily",
        hour: finalHours,
        minute: finalMinutes,
      },
    });

    // Store notification ID for later cancellation
    const notificationIds = await AsyncStorage.getItem("notificationIds");
    const ids = notificationIds ? JSON.parse(notificationIds) : {};
    ids[habit.id] = notificationId;
    await AsyncStorage.setItem("notificationIds", JSON.stringify(ids));

    return notificationId;
  } catch (error) {
    console.error("Error scheduling habit reminder:", error);
    return null;
  }
}

/**
 * Cancel a scheduled habit reminder
 */
export async function cancelHabitReminder(habitId: string): Promise<void> {
  try {
    const notificationIds = await AsyncStorage.getItem("notificationIds");
    if (notificationIds) {
      const ids = JSON.parse(notificationIds);
      const notificationId = ids[habitId];

      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        delete ids[habitId];
        await AsyncStorage.setItem("notificationIds", JSON.stringify(ids));
      }
    }
  } catch (error) {
    console.error("Error canceling habit reminder:", error);
  }
}

/**
 * Schedule all active habit reminders
 */
export async function scheduleAllHabitReminders(
  habits: Activity[],
  reminderTime: string
): Promise<void> {
  try {
    // Cancel all existing reminders first
    const notificationIds = await AsyncStorage.getItem("notificationIds");
    if (notificationIds) {
      const ids = JSON.parse(notificationIds);
      for (const notificationId of Object.values(ids)) {
        await Notifications.cancelScheduledNotificationAsync(
          notificationId as string
        );
      }
    }

    // Schedule new reminders for all non-archived habits
    const activeHabits = habits.filter((h) => !h.archived);
    for (const habit of activeHabits) {
      await scheduleHabitReminder(habit, reminderTime);
    }
  } catch (error) {
    console.error("Error scheduling all habit reminders:", error);
  }
}

/**
 * Send an immediate notification (for testing or manual triggers)
 */
export async function sendImmediateNotification(
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
        badge: 1,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("Error sending immediate notification:", error);
  }
}

/**
 * Send a streak milestone notification
 */
export async function sendStreakMilestoneNotification(
  habitName: string,
  streak: number
): Promise<void> {
  const messages: { [key: number]: string } = {
    7: "🔥 7-day streak! You're on fire!",
    14: "🌟 14-day streak! Amazing consistency!",
    30: "🏆 30-day streak! You're unstoppable!",
    100: "👑 100-day streak! Legendary status!",
  };

  const message = messages[streak] || `🎉 ${streak}-day streak! Keep it up!`;

  await sendImmediateNotification(
    "Streak Milestone! 🎯",
    `${habitName}: ${message}`,
    {
      habitName,
      streak: streak.toString(),
      type: "streak_milestone",
    }
  );
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error clearing notifications:", error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
}
