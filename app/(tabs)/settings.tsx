import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Alert,
  Switch,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, NeomorphicShadows } from "@/constants/theme";
import { Activity, ActivityLog } from "@/constants/types";
import { NotificationSettingsComponent } from "@/components/notification-settings";
import { clearAllNotifications } from "@/lib/notifications";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [darkMode, setDarkMode] = useState(true);
  const [totalHabits, setTotalHabits] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [habits, setHabits] = useState<Activity[]>([]);
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const darkModeSetting = await AsyncStorage.getItem("darkMode");
      if (darkModeSetting !== null) setDarkMode(JSON.parse(darkModeSetting));
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const loadStats = async () => {
    try {
      const habitsData = await AsyncStorage.getItem("habits");
      const logsData = await AsyncStorage.getItem("habitLogs");

      const parsedHabits = habitsData ? JSON.parse(habitsData) : [];
      const parsedLogs = logsData ? JSON.parse(logsData) : [];

      setHabits(parsedHabits);
      setTotalHabits(parsedHabits.length);
      setTotalLogs(parsedLogs.length);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const saveDarkMode = async (value: boolean) => {
    try {
      await AsyncStorage.setItem("darkMode", JSON.stringify(value));
      setDarkMode(value);
    } catch (error) {
      console.error("Error saving dark mode setting:", error);
    }
  };

  const handleExportData = async () => {
    try {
      const habitsData = await AsyncStorage.getItem("habits");
      const logsData = await AsyncStorage.getItem("habitLogs");

      const habits: Activity[] = habitsData ? JSON.parse(habitsData) : [];
      const logs: ActivityLog[] = logsData ? JSON.parse(logsData) : [];

      if (habits.length === 0 && logs.length === 0) {
        Alert.alert("No Data", "There is no data to export yet.");
        return;
      }

      const exportObj = {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        data: {
          habits,
          logs,
        }
      };

      const jsonString = JSON.stringify(exportObj, null, 2);

      // Share the JSON content
      await Share.share({
        message: jsonString,
        title: "IATrackMe Data Backup",
      });

    } catch (error) {
      console.error("Error exporting data:", error);
      Alert.alert("Error", "Failed to export data");
    }
  };

  const handleImportData = async () => {
    Alert.alert(
      "Import Data",
      "To import data, please paste the backup JSON content here. (Note: This is a simplified import for local-first version)",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Instructions", 
          onPress: () => Alert.alert("How to Import", "Currently, the import feature requires pasting the JSON backup. In a future update, we will add a file picker.") 
        }
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      "Reset All Data",
      "Are you sure you want to delete all habits and logs? This cannot be undone.",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete Everything",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("habits");
              await AsyncStorage.removeItem("habitLogs");
              await AsyncStorage.removeItem("notificationIds");
              await clearAllNotifications();

              setHabits([]);
              setTotalHabits(0);
              setTotalLogs(0);

              Alert.alert("Success", "All data has been reset");
            } catch (error) {
              console.error("Error resetting data:", error);
              Alert.alert("Error", "Failed to reset data");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ThemedView
      style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}
    >
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
            Settings
          </ThemedText>
        </View>

        {/* Theme Settings */}
        <View style={[styles.section, NeomorphicShadows.dark]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <IconSymbol name="house.fill" size={20} color={Colors.dark.neonSkyBlue} />
              <ThemedText style={styles.sectionTitle}>Dark Mode</ThemedText>
            </View>
            <Switch
              value={darkMode}
              onValueChange={saveDarkMode}
              trackColor={{
                false: Colors.dark.border,
                true: Colors.dark.neonSkyBlue,
              }}
              thumbColor={
                darkMode ? Colors.dark.neonOrange : "#f4f3f4"
              }
            />
          </View>
        </View>

        {/* Notification Settings Toggle */}
        <Pressable
          style={[styles.section, NeomorphicShadows.dark]}
          onPress={() => setShowNotificationSettings(!showNotificationSettings)}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <ThemedText style={styles.sectionIcon}>🔔</ThemedText>
              <ThemedText style={styles.sectionTitle}>
                Notifications
              </ThemedText>
            </View>
            <ThemedText style={styles.toggleIcon}>
              {showNotificationSettings ? "▼" : "▶"}
            </ThemedText>
          </View>
          <ThemedText style={styles.sectionDescription}>
            Manage push notifications and reminders
          </ThemedText>
        </Pressable>

        {/* Notification Settings Component */}
        {showNotificationSettings && (
          <View style={styles.notificationSettingsContainer}>
            <NotificationSettingsComponent
              habits={habits}
              onSettingsChange={() => {
                loadStats();
              }}
            />
          </View>
        )}

        {/* Statistics */}
        <View style={[styles.section, NeomorphicShadows.dark]}>
          <View style={styles.sectionTitleContainer}>
            <ThemedText style={styles.sectionIcon}>📊</ThemedText>
            <ThemedText style={styles.sectionTitle}>Statistics</ThemedText>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>Total Habits</ThemedText>
              <ThemedText style={styles.statValue}>{totalHabits}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>Total Logs</ThemedText>
              <ThemedText style={styles.statValue}>{totalLogs}</ThemedText>
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View style={[styles.section, NeomorphicShadows.dark]}>
          <View style={styles.sectionTitleContainer}>
            <ThemedText style={styles.sectionIcon}>💾</ThemedText>
            <ThemedText style={styles.sectionTitle}>Data Management</ThemedText>
          </View>
          
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.actionButton, styles.exportButton]}
              onPress={handleExportData}
            >
              <ThemedText style={styles.buttonIcon}>📤</ThemedText>
              <ThemedText style={styles.actionButtonText}>Export</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.importButton]}
              onPress={handleImportData}
            >
              <ThemedText style={styles.buttonIcon}>📥</ThemedText>
              <ThemedText style={styles.actionButtonText}>Import</ThemedText>
            </Pressable>
          </View>

          <Pressable
            style={[styles.resetButtonFull]}
            onPress={handleResetData}
          >
            <ThemedText style={styles.resetButtonText}>🗑️ Reset All App Data</ThemedText>
          </Pressable>
        </View>

        {/* About */}
        <View style={[styles.section, NeomorphicShadows.dark]}>
          <View style={styles.sectionTitleContainer}>
            <ThemedText style={styles.sectionIcon}>ℹ️</ThemedText>
            <ThemedText style={styles.sectionTitle}>About</ThemedText>
          </View>
          <View style={styles.aboutContent}>
            <ThemedText style={styles.appName}>IATrackMe</ThemedText>
            <ThemedText style={styles.appVersion}>Version 1.0.0</ThemedText>
            <ThemedText style={styles.appDescription}>
              Track your daily habits with style. Combine beautiful design with
              powerful habit tracking features.
            </ThemedText>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Made with ❤️ for habit builders
          </ThemedText>
        </View>
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
  },
  section: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionIcon: {
    fontSize: 18,
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
    marginLeft: 28,
  },
  toggleIcon: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  notificationSettingsContainer: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark.neonSkyBlue,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 8,
  },
  exportButton: {
    borderColor: Colors.dark.neonSkyBlue + "40",
  },
  importButton: {
    borderColor: Colors.dark.neonOrange + "40",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  buttonIcon: {
    fontSize: 16,
  },
  resetButtonFull: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ff444440",
    marginTop: 4,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff4444",
  },
  aboutContent: {
    marginTop: 16,
    alignItems: "center",
  },
  appName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.dark.neonSkyBlue,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
});
