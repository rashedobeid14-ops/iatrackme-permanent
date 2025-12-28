import {
  StyleSheet,
  View,
  Pressable,
  FlatList,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, NeomorphicShadows } from "@/constants/theme";
import { HABIT_CATEGORIES, type HabitCategory } from "@/constants/categories";
import { CategoryIcon } from "@/components/category-icon";
import { Activity } from "@/constants/types";

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const data = await AsyncStorage.getItem("habits");
      if (data) setActivities(JSON.parse(data));
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  const getCategoryCount = (categoryId: string) => {
    return activities.filter(a => a.categoryId === categoryId && !a.archived).length;
  };

  const renderCategory = ({ item }: { item: HabitCategory }) => {
    const count = getCategoryCount(item.id);
    
    return (
      <Pressable style={[styles.categoryCard, NeomorphicShadows.dark]}>
        <CategoryIcon
          icon={item.icon}
          backgroundColor={item.backgroundColor}
          size="medium"
        />
        <View style={styles.categoryInfo}>
          <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
          <ThemedText style={styles.categoryCount}>{count} activities</ThemedText>
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Categories</ThemedText>
        <ThemedText style={styles.subtitle}>Manage your activity groups</ThemedText>
      </View>

      <FlatList
        data={HABIT_CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    color: Colors.dark.neonSkyBlue,
  },
  subtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  categoryInfo: {
    marginTop: 12,
    alignItems: "center",
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
});
