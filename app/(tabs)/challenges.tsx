import React from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, NeomorphicShadows } from "@/constants/theme";
import { LOCAL_CHALLENGES, Challenge } from "@/constants/challenges";
import { Activity, FrequencyType } from "@/constants/types";
import { getCategoryById } from "@/constants/categories";
import { CategoryIcon } from "@/components/category-icon";

export default function ChallengesScreen() {
  const insets = useSafeAreaInsets();

  const handleJoinChallenge = async (challenge: Challenge) => {
    Alert.alert(
      "Join Challenge",
      `Do you want to start the "${challenge.title}" challenge? This will create a new daily habit.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Join",
          onPress: async () => {
            try {
              const habitsData = await AsyncStorage.getItem("habits");
              const habits: Activity[] = habitsData ? JSON.parse(habitsData) : [];

              const newHabit: Activity = {
                id: `challenge_${challenge.id}_${Date.now()}`,
                name: challenge.title,
                type: 'habit',
                categoryId: challenge.categoryId,
                targetTime: challenge.targetTime,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                color: getCategoryById(challenge.categoryId)?.color || "#fff",
                backgroundColor: getCategoryById(challenge.categoryId)?.backgroundColor || "#252525",
                use24HourFormat: true,
                startTime: "09:00",
                frequency: "daily" as FrequencyType,
                frequencyDetails: {},
                archived: false,
                pinned: true,
              };

              const updatedHabits = [...habits, newHabit];
              await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));
              
              Alert.alert(
                "Challenge Started! 🚀",
                `"${challenge.title}" has been added to your habits. Good luck!`
              );
            } catch (error) {
              console.error("Error joining challenge:", error);
              Alert.alert("Error", "Failed to join challenge.");
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 80) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Challenges
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Join local challenges to build consistency
          </ThemedText>
        </View>

        <View style={styles.challengesGrid}>
          {LOCAL_CHALLENGES.map((challenge) => (
            <Pressable
              key={challenge.id}
              style={[styles.challengeCard, NeomorphicShadows.dark]}
              onPress={() => handleJoinChallenge(challenge)}
            >
              <View style={styles.cardHeader}>
                <CategoryIcon
                  icon={challenge.icon}
                  backgroundColor={getCategoryById(challenge.categoryId)?.backgroundColor || "#333"}
                  size="medium"
                />
                <View style={styles.difficultyBadge}>
                  <ThemedText style={styles.difficultyText}>
                    {challenge.difficulty}
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={styles.challengeTitle}>{challenge.title}</ThemedText>
              <ThemedText style={styles.challengeDesc}>{challenge.description}</ThemedText>
              
              <View style={styles.cardFooter}>
                <ThemedText style={styles.durationText}>
                  ⏱️ {challenge.durationDays} Days
                </ThemedText>
                <ThemedText style={styles.joinText}>JOIN →</ThemedText>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={[styles.infoBox, NeomorphicShadows.dark]}>
          <ThemedText style={styles.infoIcon}>💡</ThemedText>
          <ThemedText style={styles.infoText}>
            Challenges are local-only. Joining a challenge creates a pre-configured habit for you to track.
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
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  challengesGrid: {
    gap: 16,
  },
  challengeCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  difficultyBadge: {
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.dark.neonSkyBlue,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.dark.text,
    marginBottom: 8,
  },
  challengeDesc: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
  joinText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.dark.neonOrange,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 12,
    alignItems: "center",
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
