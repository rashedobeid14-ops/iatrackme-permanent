# Integration Guide: Phase 19 & 22 Features

This guide provides step-by-step instructions for integrating the new Push Notifications (Phase 19) and Streak Tracking (Phase 22) features into the existing IATrackMe app.

---

## Prerequisites

- All dependencies installed: `pnpm install`
- Existing app structure intact
- AsyncStorage working for data persistence
- Expo notifications library available

---

## Step 1: Add New Files

### Copy Utility Files

```bash
# Notification utilities
cp lib/notifications.ts app/lib/notifications.ts

# Streak tracking utilities
cp lib/streak-tracker.ts app/lib/streak-tracker.ts
```

### Copy Component Files

```bash
# Notification settings component
cp components/notification-settings.tsx app/components/notification-settings.tsx

# Streak badge display component
cp components/streak-badge-display.tsx app/components/streak-badge-display.tsx
```

### Copy Updated Screen Files

```bash
# Updated analytics screen
cp app/(tabs)/analytics-updated.tsx app/(tabs)/analytics.tsx

# Updated settings screen
cp app/(tabs)/settings-updated.tsx app/(tabs)/settings.tsx
```

---

## Step 2: Update Multi-Step Habit Modal

**File:** `components/multi-step-habit-modal.tsx`

Add streak initialization when habit is created:

```typescript
import { saveStreakData } from "@/lib/streak-tracker";

// Inside handleFinish function, after habit is created:
const handleFinish = () => {
  // ... existing code ...
  
  onCreateHabit({
    name: habitName,
    categoryId: selectedCategory,
    targetTime: parseInt(targetTime) || 30,
    startTime,
    use24HourFormat,
    frequency,
    frequencyDetails,
    type: activityType,
    dueDate: activityType === 'task' ? dueDate : undefined,
    dueTime: activityType === 'task' ? dueTime : undefined,
  });

  // Reset form
  // ... existing reset code ...
};
```

Then in the parent component (Calendar tab), update `handleCreateHabit`:

```typescript
import { saveStreakData } from "@/lib/streak-tracker";

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
    
    // Initialize streak data
    await saveStreakData({
      habitId: newHabit.id,
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: null,
      streakStartDate: null,
      totalCompletions: 0,
      badges: [],
    });
    
    setShowAddHabitModal(false);
  } catch (error) {
    console.error("Error creating habit:", error);
    Alert.alert("Error", "Failed to create habit. Please try again.");
  }
};
```

---

## Step 3: Update Timer Tab

**File:** `app/(tabs)/timer.tsx`

Update the `submitTimer` function to update streak data:

```typescript
import { updateStreakOnLog, sendStreakMilestoneNotification } from "@/lib/streak-tracker";

const submitTimer = async () => {
  if (!selectedHabitId) {
    Alert.alert("Error", "Please select a habit first");
    return;
  }

  const habit = habits.find((h) => h.id === selectedHabitId);
  if (!habit) return;

  const elapsedSeconds = timerMode === 'countdown' ? totalTime - timeRemaining : stopwatchTime;
  const elapsedMinutes = elapsedSeconds / 60;
  
  if (elapsedMinutes < 0.1) {
    Alert.alert("Error", "Time spent is too short to log");
    return;
  }

  const completionPercentage = Math.min(
    100,
    Math.round((elapsedMinutes / habit.targetTime) * 100)
  );

  const newLog: ActivityLog = {
    id: Date.now().toString(),
    activityId: selectedHabitId,
    date: new Date().toISOString().split("T")[0],
    duration: Math.round(elapsedMinutes),
    completionPercentage,
    timestamp: Date.now(),
  };

  try {
    const logsData = await AsyncStorage.getItem("habitLogs");
    const logs = logsData ? JSON.parse(logsData) : [];
    const updatedLogs = [...logs, newLog];
    await AsyncStorage.setItem("habitLogs", JSON.stringify(updatedLogs));

    // Update streak
    const streakData = await updateStreakOnLog(selectedHabitId, updatedLogs, habit);
    
    // Check for milestone and send notification
    if (streakData.badges.length > 0) {
      const latestBadge = streakData.badges[streakData.badges.length - 1];
      await sendStreakMilestoneNotification(habit.name, latestBadge.milestone);
    }

    Alert.alert(
      "Success",
      `Logged ${Math.round(elapsedMinutes)}m for "${habit.name}"\nCompletion: ${completionPercentage}%\nStreak: ${streakData.currentStreak} days 🔥`
    );

    stopTimer();
  } catch (error) {
    console.error("Error submitting timer:", error);
  }
};
```

---

## Step 4: Update Calendar Tab

**File:** `app/(tabs)/index.tsx`

Update the `handleLogHabit` function to update streak data:

```typescript
import { updateStreakOnLog, sendStreakMilestoneNotification } from "@/lib/streak-tracker";

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

    // Update streak
    const streakData = await updateStreakOnLog(habitId, updatedLogs, habit);
    
    // Check for milestone and send notification
    if (streakData.badges.length > 0) {
      const latestBadge = streakData.badges[streakData.badges.length - 1];
      await sendStreakMilestoneNotification(habit.name, latestBadge.milestone);
    }

    Alert.alert(
      "Success",
      `${habit.name} logged!\nStreak: ${streakData.currentStreak} days 🔥`
    );
  } catch (error) {
    console.error("Error logging habit:", error);
  }
};
```

---

## Step 5: Initialize Notifications on App Start

**File:** `app/_layout.tsx` or `app/index.tsx`

Add notification initialization:

```typescript
import { useEffect } from "react";
import { scheduleAllHabitReminders, loadNotificationSettings } from "@/lib/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      const settings = await loadNotificationSettings();
      if (settings.enabled) {
        const habitsData = await AsyncStorage.getItem("habits");
        const habits = habitsData ? JSON.parse(habitsData) : [];
        
        if (habits.length > 0) {
          await scheduleAllHabitReminders(habits, settings.reminderTime);
        }
      }
    } catch (error) {
      console.error("Error initializing notifications:", error);
    }
  };

  // ... rest of component
}
```

---

## Step 6: Update Habit Deletion

**File:** `app/(tabs)/index.tsx` or wherever habits are deleted

When deleting a habit, also clean up streak data and notifications:

```typescript
import { cancelHabitReminder } from "@/lib/notifications";

const handleDeleteHabit = async (habitId: string) => {
  try {
    // Cancel notification
    await cancelHabitReminder(habitId);
    
    // Remove streak data
    await AsyncStorage.removeItem(`streak_${habitId}`);
    
    // Remove habit
    const updatedHabits = habits.filter((h) => h.id !== habitId);
    await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));
    setHabits(updatedHabits);
    
    Alert.alert("Success", "Habit deleted");
  } catch (error) {
    console.error("Error deleting habit:", error);
  }
};
```

---

## Step 7: Update Habit Archiving

**File:** `app/(tabs)/index.tsx`

When archiving a habit, cancel its reminder:

```typescript
import { cancelHabitReminder } from "@/lib/notifications";

const handleArchiveActivity = async (activityId: string) => {
  try {
    const updatedHabits = habits.map((h) => {
      if (h.id === activityId) {
        // Cancel notification if archiving
        if (!h.archived) {
          cancelHabitReminder(activityId);
        }
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
```

---

## Step 8: Add Missing Imports

Ensure all files have necessary imports:

```typescript
// For notification features
import * as Notifications from "expo-notifications";
import { NotificationSettings } from "@/lib/notifications";

// For streak features
import { StreakData, Badge } from "@/lib/streak-tracker";
```

---

## Step 9: Update TypeScript Types (if needed)

**File:** `constants/types.ts`

Ensure `Activity` interface includes all required fields:

```typescript
export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  categoryId: string;
  targetTime: number;
  createdAt: number;
  updatedAt: number;
  color: string;
  backgroundColor: string;
  use24HourFormat: boolean;
  startTime: string;
  frequency: FrequencyType;
  frequencyDetails: any;
  archived: boolean;
  pinned: boolean;
  dueDate?: string;
  dueTime?: string;
  isCompleted?: boolean;
  completedAt?: number;
}
```

---

## Step 10: Test the Integration

### Test Notifications:

1. Go to Settings tab
2. Tap "🔔 Notifications"
3. Toggle notifications on
4. Set reminder time to current time + 1 minute
5. Wait for notification to appear
6. Verify notification content

### Test Streaks:

1. Create a new habit
2. Log it for 7 consecutive days
3. Go to Analytics tab
4. Verify current streak shows 7 days
5. Verify "Week Warrior" badge appears
6. Miss a day and verify streak resets
7. Check that longest streak is preserved

### Test Integration:

1. Create multiple habits
2. Log them with timer
3. Verify streaks update
4. Verify notifications schedule correctly
5. Export data and verify CSV includes all info
6. Reset data and verify everything clears

---

## Troubleshooting Integration

### Issue: Notifications not scheduling

**Solution:**
1. Check that `expo-notifications` is installed
2. Verify Android permissions in `app.config.ts`
3. Ensure `requestNotificationPermissions()` is called
4. Check device notification settings

### Issue: Streaks not calculating

**Solution:**
1. Verify logs are saved with correct date format (YYYY-MM-DD)
2. Check that `updateStreakOnLog` is called after logging
3. Ensure habit frequency is set correctly
4. Clear AsyncStorage and recalculate

### Issue: Badges not unlocking

**Solution:**
1. Verify streak calculation is working
2. Check that milestone threshold is met
3. Ensure `saveStreakData` is called
4. Try refreshing the Analytics tab

### Issue: Compilation errors

**Solution:**
1. Ensure all imports are correct
2. Check TypeScript types match
3. Verify file paths are correct
4. Run `pnpm check` to verify types

---

## Performance Optimization

### For Notifications:
- Batch schedule operations
- Reuse notification IDs
- Clean up old notification IDs

### For Streaks:
- Cache streak calculations
- Use AsyncStorage efficiently
- Avoid recalculating on every render

### General:
- Use React.memo for components
- Implement proper cleanup in useEffect
- Avoid unnecessary re-renders

---

## Rollback Instructions

If you need to revert to the original version:

```bash
# Restore original files
cp app/(tabs)/settings-backup.tsx app/(tabs)/settings.tsx
cp app/(tabs)/analytics-backup.tsx app/(tabs)/analytics.tsx

# Remove new files
rm lib/notifications.ts
rm lib/streak-tracker.ts
rm components/notification-settings.tsx
rm components/streak-badge-display.tsx

# Revert changes to other files
git checkout app/(tabs)/timer.tsx
git checkout app/(tabs)/index.tsx
git checkout components/multi-step-habit-modal.tsx
```

---

## Next Steps After Integration

1. **Test thoroughly** on Android and iOS devices
2. **Gather user feedback** on new features
3. **Monitor performance** and optimize if needed
4. **Plan Phase 20** (Cloud Sync) or **Phase 21** (Social Features)
5. **Document any custom changes** made during integration

---

## Support

For issues during integration:
1. Check the troubleshooting section above
2. Review the PHASE_19_22_IMPLEMENTATION.md guide
3. Verify all files are copied correctly
4. Check console logs for error messages
5. Test with sample data to isolate issues

---

**Last Updated:** December 28, 2025
**Version:** 1.0.0
**Status:** Ready for Integration
