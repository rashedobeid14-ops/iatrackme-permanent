import AsyncStorage from "@react-native-async-storage/async-storage";

export const migrateData = async () => {
  try {
    const habitsData = await AsyncStorage.getItem("habits");
    const logsData = await AsyncStorage.getItem("habitLogs");

    if (habitsData) {
      const habits = JSON.parse(habitsData);
      const migratedHabits = habits.map((habit: any) => ({
        ...habit,
        type: habit.type || 'habit',
        archived: habit.archived || false,
        pinned: habit.pinned || false,
        updatedAt: habit.updatedAt || habit.createdAt || Date.now(),
      }));
      await AsyncStorage.setItem("habits", JSON.stringify(migratedHabits));
    }

    if (logsData) {
      const logs = JSON.parse(logsData);
      const migratedLogs = logs.map((log: any) => ({
        ...log,
        activityId: log.activityId || log.habitId,
      }));
      await AsyncStorage.setItem("habitLogs", JSON.stringify(migratedLogs));
    }
    
    console.log("Data migration completed successfully");
  } catch (error) {
    console.error("Error during data migration:", error);
  }
};
