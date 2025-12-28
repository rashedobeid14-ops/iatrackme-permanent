import { Share, Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { Badge, StreakData } from "./streak-tracker";

/**
 * Share a streak achievement as text
 */
export async function shareStreakAsText(habitName: string, streak: number) {
  try {
    const message = `🔥 I've reached a ${streak}-day streak on "${habitName}" using IATrackMe! \n\nBuilding better habits every day. 🎯 #IATrackMe #HabitTracker`;
    
    const result = await Share.share({
      message,
      title: "My Habit Streak",
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // shared with activity type of result.activityType
      } else {
        // shared
      }
    } else if (result.action === Share.dismissedAction) {
      // dismissed
    }
  } catch (error: any) {
    Alert.alert("Error", error.message);
  }
}

/**
 * Share a badge achievement as text
 */
export async function shareBadgeAsText(badge: Badge, habitName?: string) {
  try {
    const habitInfo = habitName ? ` for "${habitName}"` : "";
    const message = `🏆 I just unlocked the "${badge.name}" badge${habitInfo} on IATrackMe! \n\n${badge.description} ${badge.icon}\n\nJoin me in building better habits! 🎯 #IATrackMe #Achievements`;
    
    const result = await Share.share({
      message,
      title: "New Achievement Unlocked!",
    });

    if (result.action === Share.sharedAction) {
      // shared
    }
  } catch (error: any) {
    Alert.alert("Error", error.message);
  }
}

/**
 * Generate a simple text-based summary for sharing multiple stats
 */
export async function shareOverallStats(stats: {
  totalActiveStreaks: number;
  longestStreak: number;
  totalBadges: number;
}) {
  try {
    const message = `📊 My IATrackMe Progress Summary:\n\n` +
      `🔥 Active Streaks: ${stats.totalActiveStreaks}\n` +
      `🏆 Longest Streak: ${stats.longestStreak} days\n` +
      `🎖️ Badges Unlocked: ${stats.totalBadges}\n\n` +
      `Tracking my way to a better me! 🎯 #IATrackMe #Productivity`;
    
    await Share.share({
      message,
      title: "My Habit Progress",
    });
  } catch (error: any) {
    Alert.alert("Error", error.message);
  }
}

/**
 * Note: For actual image generation (ViewShot), we would need 
 * react-native-view-shot, but we'll stick to text sharing for now 
 * to keep dependencies minimal and ensure it works in all environments.
 */
