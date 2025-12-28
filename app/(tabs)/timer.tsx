import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Alert,
  Dimensions,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, NeomorphicShadows } from "@/constants/theme";
import { Activity, ActivityLog } from "@/constants/types";
import { getCategoryById } from "@/constants/categories";
import { CategoryIcon } from "@/components/category-icon";
import { FilledProgressCircle } from "@/components/filled-progress-circle";
import { updateStreakOnLog, sendStreakMilestoneNotification } from "@/lib/streak-tracker";

const { width } = Dimensions.get("window");

type TimerMode = "countdown" | "stopwatch" | "loops";

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Activity[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [timerMode, setTimerMode] = useState<TimerMode>("countdown");
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0); // in seconds
  const [totalTime, setTotalTime] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [loopCount, setLoopCount] = useState(0);
  const [targetLoops, setTargetLoops] = useState(5);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const morphAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadHabits();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    Animated.timing(morphAnim, {
      toValue: isActive ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const loadHabits = async () => {
    try {
      const habitsData = await AsyncStorage.getItem("habits");
      if (habitsData) {
        const parsedHabits = JSON.parse(habitsData);
        const activeHabits = parsedHabits.filter((h: Activity) => !h.archived);
        setHabits(activeHabits);
        if (activeHabits.length > 0) {
          setSelectedHabitId(activeHabits[0].id);
          const initialTime = activeHabits[0].targetTime * 60;
          setTime(initialTime);
          setTotalTime(initialTime);
        }
      }
    } catch (error) {
      console.error("Error loading habits:", error);
    }
  };

  const toggleTimer = () => {
    if (isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsActive(false);
    } else {
      if (!selectedHabitId) {
        Alert.alert("Error", "Please select a habit first");
        return;
      }
      setIsActive(true);
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (timerMode === "countdown") {
            if (prevTime <= 1) {
              handleTimerComplete();
              return 0;
            }
            return prevTime - 1;
          } else {
            return prevTime + 1;
          }
        });
      }, 1000);
    }
  };

  const handleTimerComplete = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    Alert.alert("Goal Reached!", "You've completed your target session.", [
      { text: "Log Activity", onPress: submitTimer },
      { text: "Dismiss" }
    ]);
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    const habit = habits.find(h => h.id === selectedHabitId);
    if (timerMode === "countdown") {
      const initialTime = habit ? habit.targetTime * 60 : 0;
      setTime(initialTime);
      setTotalTime(initialTime);
    } else {
      setTime(0);
      setTotalTime(0);
    }
    setLaps([]);
    setLoopCount(0);
  };

  const addLap = () => {
    if (timerMode === "stopwatch") {
      setLaps([time, ...laps]);
    } else if (timerMode === "loops") {
      setLoopCount(prev => prev + 1);
      if (loopCount + 1 >= targetLoops) {
        handleTimerComplete();
      }
    }
  };

  const submitTimer = async () => {
    if (!selectedHabitId) return;
    const habit = habits.find(h => h.id === selectedHabitId);
    if (!habit) return;

    const elapsedSeconds = timerMode === "countdown" 
      ? (totalTime - time) 
      : time;
    
    const elapsedMinutes = elapsedSeconds / 60;

    if (elapsedMinutes < 0.1) {
      Alert.alert("Error", "Time spent is too short to log");
      return;
    }

    const completionPercentage = Math.min(100, Math.round((elapsedMinutes / habit.targetTime) * 100));

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

      const streakData = await updateStreakOnLog(selectedHabitId, updatedLogs, habit);
      if (streakData.badges.length > 0) {
        const latestBadge = streakData.badges[streakData.badges.length - 1];
        await sendStreakMilestoneNotification(habit.name, latestBadge.milestone);
      }

      Alert.alert("Success", `Logged ${Math.round(elapsedMinutes)}m for "${habit.name}"`);
      resetTimer();
    } catch (error) {
      console.error("Error submitting timer:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ":" : ""}${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
  };

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  return (
    <ThemedView style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>Timer</ThemedText>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          {(["countdown", "stopwatch", "loops"] as TimerMode[]).map((mode) => (
            <Pressable
              key={mode}
              style={[styles.modeButton, timerMode === mode && styles.modeButtonActive]}
              onPress={() => {
                setTimerMode(mode);
                resetTimer();
              }}
            >
              <ThemedText style={[styles.modeButtonText, timerMode === mode && styles.modeButtonTextActive]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Timer Display */}
        <View style={styles.mainDisplay}>
          <FilledProgressCircle
            progress={
              timerMode === "countdown" 
                ? (totalTime > 0 ? (totalTime - time) / totalTime : 0) 
                : 1
            }
            size={240}
            strokeWidth={15}
            fillColor={Colors.dark.neonOrange}
            backgroundColor={Colors.dark.cardBackground}
            centerText={formatTime(time)}
            centerTextColor={Colors.dark.text}
          />
          {timerMode === "loops" && (
            <ThemedText style={styles.loopText}>Loop: {loopCount} / {targetLoops}</ThemedText>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable style={[styles.controlButton, NeomorphicShadows.dark]} onPress={resetTimer}>
            <ThemedText style={styles.controlButtonText}>Reset</ThemedText>
          </Pressable>

          <Pressable style={[styles.mainButton, NeomorphicShadows.dark]} onPress={toggleTimer}>
            <ThemedText style={styles.mainButtonText}>{isActive ? "Pause" : "Start"}</ThemedText>
          </Pressable>

          {(timerMode === "stopwatch" || timerMode === "loops") && (
            <Pressable style={[styles.controlButton, NeomorphicShadows.dark]} onPress={addLap}>
              <ThemedText style={styles.controlButtonText}>{timerMode === "stopwatch" ? "Lap" : "Next"}</ThemedText>
            </Pressable>
          )}
          
          {timerMode === "countdown" && (
            <Pressable style={[styles.controlButton, NeomorphicShadows.dark]} onPress={submitTimer}>
              <ThemedText style={styles.controlButtonText}>Log</ThemedText>
            </Pressable>
          )}
        </View>

        {/* Habit Selector */}
        <View style={styles.habitSelectorSection}>
          <ThemedText style={styles.selectorLabel}>Select Habit to Track</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.habitList}>
            {habits.map((habit) => (
              <Pressable
                key={habit.id}
                style={[styles.habitItem, selectedHabitId === habit.id && styles.habitItemSelected]}
                onPress={() => {
                  setSelectedHabitId(habit.id);
                  if (timerMode === "countdown") {
                    const newTime = habit.targetTime * 60;
                    setTime(newTime);
                    setTotalTime(newTime);
                  }
                }}
              >
                <CategoryIcon 
                  icon={getCategoryById(habit.categoryId)?.icon || "⭐"} 
                  backgroundColor={habit.backgroundColor} 
                  size="small" 
                />
                <ThemedText style={styles.habitItemName}>{habit.name}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Laps List */}
        {timerMode === "stopwatch" && laps.length > 0 && (
          <View style={styles.lapsContainer}>
            <ThemedText style={styles.lapsTitle}>Laps</ThemedText>
            {laps.map((lapTime, index) => (
              <View key={index} style={styles.lapItem}>
                <ThemedText style={styles.lapLabel}>Lap {laps.length - index}</ThemedText>
                <ThemedText style={styles.lapValue}>{formatTime(lapTime)}</ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Submit Button for Stopwatch/Loops */}
        {(timerMode !== "countdown" && time > 0) && (
          <Pressable style={[styles.submitBtn, NeomorphicShadows.dark]} onPress={submitTimer}>
            <ThemedText style={styles.submitBtnText}>Submit & Log Activity</ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  scrollContent: { padding: 20 },
  title: { marginBottom: 24, color: Colors.dark.text },
  modeSelector: { flexDirection: "row", backgroundColor: Colors.dark.cardBackground, borderRadius: 12, padding: 4, marginBottom: 30 },
  modeButton: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8 },
  modeButtonActive: { backgroundColor: "rgba(233, 30, 99, 0.1)" },
  modeButtonText: { color: Colors.dark.textSecondary, fontWeight: "600" },
  modeButtonTextActive: { color: "#E91E63" },
  mainDisplay: { height: 280, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  loopText: { fontSize: 18, color: Colors.dark.textSecondary, marginTop: 12, fontWeight: "bold" },
  controls: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", marginBottom: 40 },
  mainButton: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.dark.cardBackground, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: Colors.dark.border },
  mainButtonText: { fontSize: 18, fontWeight: "bold", color: Colors.dark.neonOrange },
  controlButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.dark.cardBackground, borderWidth: 1, borderColor: Colors.dark.border },
  controlButtonText: { fontSize: 14, color: Colors.dark.text },
  habitSelectorSection: { marginBottom: 30 },
  selectorLabel: { color: Colors.dark.textSecondary, fontSize: 12, marginBottom: 10 },
  habitList: { flexDirection: "row" },
  habitItem: { alignItems: 'center', marginRight: 15, padding: 10, borderRadius: 12, backgroundColor: Colors.dark.cardBackground, width: 90, borderWidth: 1, borderColor: Colors.dark.border },
  habitItemSelected: { borderColor: Colors.dark.neonSkyBlue, backgroundColor: "rgba(0, 184, 212, 0.05)" },
  habitItemName: { color: Colors.dark.text, fontSize: 10, marginTop: 5, textAlign: 'center', fontWeight: "600" },
  lapsContainer: { marginTop: 20, backgroundColor: Colors.dark.cardBackground, borderRadius: 12, padding: 16 },
  lapsTitle: { fontSize: 18, fontWeight: "bold", color: Colors.dark.text, marginBottom: 12 },
  lapItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  lapLabel: { color: Colors.dark.textSecondary },
  lapValue: { color: Colors.dark.text, fontWeight: "bold" },
  submitBtn: { backgroundColor: Colors.dark.neonSkyBlue, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 20 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
