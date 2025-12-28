import AsyncStorage from "@react-native-async-storage/async-storage";
import { Activity, ActivityLog } from "@/constants/types";

export interface StreakData {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
  streakStartDate: string | null;
  totalCompletions: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  milestone: number; // 7, 30, 100, etc.
  unlockedAt?: number; // timestamp
  color: string;
}

// Define milestone badges
export const MILESTONE_BADGES: Badge[] = [
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "7-day streak",
    icon: "🔥",
    milestone: 7,
    color: "#FF6B6B",
  },
  {
    id: "streak_14",
    name: "Fortnight Fighter",
    description: "14-day streak",
    icon: "⚡",
    milestone: 14,
    color: "#4ECDC4",
  },
  {
    id: "streak_30",
    name: "Monthly Master",
    description: "30-day streak",
    icon: "🌟",
    milestone: 30,
    color: "#FFD93D",
  },
  {
    id: "streak_100",
    name: "Century Champion",
    description: "100-day streak",
    icon: "👑",
    milestone: 100,
    color: "#6BCB77",
  },
  {
    id: "streak_365",
    name: "Eternal Legend",
    description: "365-day streak",
    icon: "🏆",
    milestone: 365,
    color: "#FF006E",
  },
];

/**
 * Load streak data for a specific habit
 */
export async function loadStreakData(habitId: string): Promise<StreakData> {
  try {
    const streakDataStr = await AsyncStorage.getItem(`streak_${habitId}`);
    if (streakDataStr) {
      return JSON.parse(streakDataStr);
    }
    // Return default streak data
    return {
      habitId,
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: null,
      streakStartDate: null,
      totalCompletions: 0,
      badges: [],
    };
  } catch (error) {
    console.error(`Error loading streak data for habit ${habitId}:`, error);
    return {
      habitId,
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: null,
      streakStartDate: null,
      totalCompletions: 0,
      badges: [],
    };
  }
}

/**
 * Save streak data for a specific habit
 */
export async function saveStreakData(streakData: StreakData): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `streak_${streakData.habitId}`,
      JSON.stringify(streakData)
    );
  } catch (error) {
    console.error(
      `Error saving streak data for habit ${streakData.habitId}:`,
      error
    );
  }
}

/**
 * Calculate streak based on habit logs
 */
export async function calculateStreak(
  habitId: string,
  logs: ActivityLog[],
  habit: Activity
): Promise<StreakData> {
  const habitLogs = logs
    .filter((log) => log.activityId === habitId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let streakStartDate: string | null = null;
  let lastLogDate: string | null = null;

  if (habitLogs.length === 0) {
    return {
      habitId,
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: null,
      streakStartDate: null,
      totalCompletions: 0,
      badges: [],
    };
  }

  // Check if habit should be logged today based on frequency
  const today = new Date().toISOString().split("T")[0];
  const shouldLogToday = shouldHabitLogToday(habit);

  // Calculate streaks by checking consecutive days
  let tempStreak = 1;
  let tempStreakStart = habitLogs[0].date;

  for (let i = 1; i < habitLogs.length; i++) {
    const prevDate = new Date(habitLogs[i - 1].date);
    const currDate = new Date(habitLogs[i].date);
    const dayDiff = Math.floor(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === 1) {
      // Consecutive day
      tempStreak++;
    } else if (dayDiff > 1) {
      // Streak broken
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      tempStreak = 1;
      tempStreakStart = habitLogs[i].date;
    }
  }

  // Check if current streak is still active
  lastLogDate = habitLogs[habitLogs.length - 1].date;
  const lastLogDateObj = new Date(lastLogDate);
  const todayObj = new Date(today);
  const daysSinceLastLog = Math.floor(
    (todayObj.getTime() - lastLogDateObj.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastLog === 0 || (daysSinceLastLog === 1 && shouldLogToday)) {
    // Streak is still active
    currentStreak = tempStreak;
    streakStartDate = tempStreakStart;
  } else if (daysSinceLastLog > 1) {
    // Streak is broken
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    currentStreak = 0;
    streakStartDate = null;
  }

  // Get unlocked badges
    const badges = getUnlockedBadges(currentStreak);

  const streakData: StreakData = {
    habitId,
    currentStreak,
    longestStreak: Math.max(longestStreak, tempStreak),
    lastLogDate,
    streakStartDate,
    totalCompletions: habitLogs.length,
    badges,
  };

  return streakData;
}

/**
 * Determine if a habit should be logged today based on its frequency
 */
function shouldHabitLogToday(habit: Activity): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayOfMonth = today.getDate();

  switch (habit.frequency) {
    case "daily":
      return true;

    case "weekly":
      if (habit.frequencyDetails?.weekly) {
        // Convert Sunday (0) to index 6 for our array
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        return habit.frequencyDetails.weekly[adjustedDay] === true;
      }
      return true;

    case "monthly":
      if (habit.frequencyDetails?.monthly) {
        return habit.frequencyDetails.monthly[dayOfMonth - 1] === true;
      }
      return true;

    case "yearly":
      if (habit.frequencyDetails?.yearly) {
        const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(dayOfMonth).padStart(2, "0")}`;
        return habit.frequencyDetails.yearly.includes(monthDay);
      }
      return true;

    case "period":
      // For period-based habits, we'd need to check against creation date
      // This is a simplified version
      return true;

    default:
      return true;
  }
}

/**
 * Get badges unlocked for a given streak
 */
function getUnlockedBadges(streak: number): Badge[] {
  return MILESTONE_BADGES.filter((badge) => streak >= badge.milestone).map(
    (badge) => ({
      ...badge,
      unlockedAt: Date.now(),
    })
  );
}

/**
 * Update streak when a habit is logged
 */
export async function updateStreakOnLog(
  habitId: string,
  logs: ActivityLog[],
  habit: Activity
): Promise<StreakData> {
  const streakData = await calculateStreak(habitId, logs, habit);
  await saveStreakData(streakData);
  return streakData;
}

/**
 * Get all streak data for all habits
 */
export async function getAllStreakData(
  habits: Activity[],
  logs: ActivityLog[]
): Promise<{ [habitId: string]: StreakData }> {
  const allStreakData: { [habitId: string]: StreakData } = {};

  for (const habit of habits) {
    allStreakData[habit.id] = await calculateStreak(habit.id, logs, habit);
  }

  return allStreakData;
}

/**
 * Get total active streaks across all habits
 */
export async function getTotalActiveStreaks(
  habits: Activity[],
  logs: ActivityLog[]
): Promise<number> {
  const allStreakData = await getAllStreakData(habits, logs);
  return Object.values(allStreakData).filter((s) => s.currentStreak > 0).length;
}

/**
 * Get the longest active streak
 */
export async function getLongestActiveStreak(
  habits: Activity[],
  logs: ActivityLog[]
): Promise<number> {
  const allStreakData = await getAllStreakData(habits, logs);
  return Math.max(
    ...Object.values(allStreakData).map((s) => s.currentStreak),
    0
  );
}

/**
 * Get all unlocked badges across all habits
 */
export async function getAllUnlockedBadges(
  habits: Activity[],
  logs: ActivityLog[]
): Promise<Badge[]> {
  const allStreakData = await getAllStreakData(habits, logs);
  const badgesSet = new Set<string>();
  const allBadges: Badge[] = [];

  for (const streakData of Object.values(allStreakData)) {
    for (const badge of streakData.badges) {
      if (!badgesSet.has(badge.id)) {
        badgesSet.add(badge.id);
        allBadges.push(badge);
      }
    }
  }

  return allBadges;
}

/**
 * Reset streak for a habit (when it's missed)
 */
export async function resetStreak(habitId: string): Promise<void> {
  const streakData = await loadStreakData(habitId);
  streakData.currentStreak = 0;
  streakData.streakStartDate = null;
  await saveStreakData(streakData);
}

/**
 * Get streak statistics for display
 */
export async function getStreakStats(
  habits: Activity[],
  logs: ActivityLog[]
): Promise<{
  totalActiveStreaks: number;
  longestStreak: number;
  totalBadges: number;
  habitStreaks: { [habitId: string]: StreakData };
}> {
  const habitStreaks = await getAllStreakData(habits, logs);
  const activeStreaks = Object.values(habitStreaks).filter(
    (s) => s.currentStreak > 0
  ).length;
  const longestStreak = Math.max(
    ...Object.values(habitStreaks).map((s) => s.currentStreak),
    0
  );
  const allBadges = await getAllUnlockedBadges(habits, logs);

  return {
    totalActiveStreaks: activeStreaks,
    longestStreak,
    totalBadges: allBadges.length,
    habitStreaks,
  };
}
