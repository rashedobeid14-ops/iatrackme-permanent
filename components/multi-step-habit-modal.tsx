import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, NeomorphicShadows } from "@/constants/theme";
import { CategoryIcon } from "@/components/category-icon";
import { HABIT_CATEGORIES, type HabitCategory } from "@/constants/categories";
import { ActivityType, FrequencyType } from "@/constants/types";
import suggestionsData from "@/constants/suggestions.json";

interface MultiStepHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateHabit: (habit: {
    name: string;
    categoryId: string;
    targetTime: number;
    startTime: string;
    use24HourFormat: boolean;
    frequency: FrequencyType;
    frequencyDetails: any;
    type: ActivityType;
    dueDate?: string;
    dueTime?: string;
  }) => void;
}

export function MultiStepHabitModal({
  visible,
  onClose,
  onCreateHabit,
}: MultiStepHabitModalProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [activityType, setActivityType] = useState<ActivityType>("habit");
  const [habitName, setHabitName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("health");
  const [targetTime, setTargetTime] = useState("30");
  const [startTime, setStartTime] = useState("09:00");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState("12:00");
  const [use24HourFormat, setUse24HourFormat] = useState(true);
  const [frequency, setFrequency] = useState<FrequencyType>("daily");
  const [selectedWeekDays, setSelectedWeekDays] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [selectedMonthDays, setSelectedMonthDays] = useState<boolean[]>(
    Array(31).fill(false)
  );
  const [yearDays, setYearDays] = useState("");
  const [periodDays, setPeriodDays] = useState("1");
  const [periodUnit, setPeriodUnit] = useState<"week" | "month" | "year">(
    "week"
  );
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleNameChange = (text: string) => {
    setHabitName(text);
    if (text.length > 1) {
      const filtered = suggestionsData.filter(s => 
        s.name.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: any) => {
    setHabitName(suggestion.name);
    setShowSuggestions(false);
    
    // Map suggestion category to app category
    const catMap: { [key: string]: string } = {
      "🍎 Food & Grocery": "cooking",
      "🧼 Cleaning & Hygiene": "productivity",
      "👗 Clothing & Grooming": "socializing",
      "🚗 Cars, Vans & Trucks": "other",
      "📱 Electronics & Gadgets": "learning",
      "🎮 Gaming & Entertainment": "gaming",
      "🏡 Home & Furniture": "other",
      "🌿 Gardening & Tools": "hobby",
      "🧸 Toys & Kids": "socializing",
      "💻 Software & Apps": "work",
      "💊 Health & Wellness": "health",
      "🧳 Travel & Outdoors": "travel"
    };
    
    const mappedCat = catMap[suggestion.category];
    if (mappedCat) {
      setSelectedCategory(mappedCat);
    }
  };

  const handleWeekDayToggle = (index: number) => {
    const newDays = [...selectedWeekDays];
    newDays[index] = !newDays[index];
    setSelectedWeekDays(newDays);
  };

  const handleMonthDayToggle = (index: number) => {
    const newDays = [...selectedMonthDays];
    newDays[index] = !newDays[index];
    setSelectedMonthDays(newDays);
  };

  const handleFinish = () => {
    const frequencyDetails = {
      weekly: selectedWeekDays,
      monthly: selectedMonthDays,
      yearly: yearDays,
      period: { days: periodDays, unit: periodUnit },
    };

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
    setStep(1);
    setHabitName("");
    setSelectedCategory("health");
    setTargetTime("30");
    setStartTime("09:00");
    setDueDate(new Date().toISOString().split('T')[0]);
    setDueTime("12:00");
    setUse24HourFormat(true);
    setFrequency("daily");
    setSelectedWeekDays([false, false, false, false, false, false, false]);
    setSelectedMonthDays(Array(31).fill(false));
    setYearDays("");
    setPeriodDays("1");
    setPeriodUnit("week");
    onClose();
  };

  const handleNext = () => {
    if (step === 1) {
      if (activityType === 'task') {
        // Skip frequency for single tasks
        handleFinish();
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <ThemedView
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, 20) },
        ]}
      >
        {/* Step 1: Start Time */}
        {step === 1 && (
          <ScrollView
            contentContainerStyle={[
              styles.stepContainer,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText style={styles.stepTitle}>
              What time of the day it starts?
            </ThemedText>

            {/* Activity Type Selection */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Activity Type</ThemedText>
              <View style={styles.typeSelector}>
                {(['habit', 'recurring_task', 'task'] as ActivityType[]).map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setActivityType(type)}
                    style={[
                      styles.typeButton,
                      activityType === type && styles.typeButtonSelected,
                    ]}
                  >
                    <ThemedText style={[
                      styles.typeButtonText,
                      activityType === type && styles.typeButtonTextSelected
                    ]}>
                      {type.replace('_', ' ').toUpperCase()}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Habit Name */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Habit Name</ThemedText>
              <TextInput
                style={styles.textInput}
                placeholder="Enter habit name"
                placeholderTextColor={Colors.dark.textSecondary}
                value={habitName}
                onChangeText={handleNameChange}
                onFocus={() => habitName.length > 1 && setShowSuggestions(filteredSuggestions.length > 0)}
              />
              {showSuggestions && (
                <View style={styles.suggestionsContainer}>
                  {filteredSuggestions.map((s, index) => (
                    <Pressable 
                      key={index} 
                      style={styles.suggestionItem}
                      onPress={() => selectSuggestion(s)}
                    >
                      <ThemedText style={styles.suggestionText}>{s.name}</ThemedText>
                      <ThemedText style={styles.suggestionCategory}>{s.subcategory}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Category Selection */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Category</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {HABIT_CATEGORIES.map((cat: HabitCategory) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={[
                      styles.categoryButton,
                      selectedCategory === cat.id && styles.categoryButtonSelected,
                    ]}
                  >
                    <CategoryIcon
                      icon={cat.icon}
                      backgroundColor={cat.backgroundColor}
                      size="medium"
                    />
                    <ThemedText style={styles.categoryName}>{cat.name}</ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Target Time */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Target Time (minutes)</ThemedText>
              <TextInput
                style={styles.textInput}
                placeholder="30"
                placeholderTextColor={Colors.dark.textSecondary}
                value={targetTime}
                onChangeText={setTargetTime}
                keyboardType="number-pad"
              />
            </View>

            {/* Start Time (Only for Habits and Recurring Tasks) */}
            {activityType !== 'task' && (
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Start Time</ThemedText>
                <TextInput
                  style={styles.textInput}
                  placeholder="HH:MM"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>
            )}

            {/* Due Date and Time (Only for Single Tasks) */}
            {activityType === 'task' && (
              <>
                <View style={styles.formGroup}>
                  <ThemedText style={styles.label}>Due Date (YYYY-MM-DD)</ThemedText>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.dark.textSecondary}
                    value={dueDate}
                    onChangeText={setDueDate}
                  />
                </View>
                <View style={styles.formGroup}>
                  <ThemedText style={styles.label}>Due Time (HH:MM)</ThemedText>
                  <TextInput
                    style={styles.textInput}
                    placeholder="HH:MM"
                    placeholderTextColor={Colors.dark.textSecondary}
                    value={dueTime}
                    onChangeText={setDueTime}
                  />
                </View>
              </>
            )}

            {/* Time Format Toggle */}
            <View style={styles.formGroup}>
              <View style={styles.toggleRow}>
                <ThemedText style={styles.label}>
                  {use24HourFormat ? "24-Hour Format" : "12-Hour Format (AM/PM)"}
                </ThemedText>
                <Switch
                  value={use24HourFormat}
                  onValueChange={setUse24HourFormat}
                  trackColor={{ false: Colors.dark.border, true: Colors.dark.neonSkyBlue }}
                  thumbColor={Colors.dark.neonOrange}
                />
              </View>
            </View>

            {/* Navigation Buttons */}
            <View style={styles.actionButtonRow}>
              <Pressable style={styles.backButton} onPress={handleBack}>
                <ThemedText style={styles.backButtonText}>Back</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.nextButton, !habitName && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={!habitName}
              >
                <ThemedText style={styles.nextButtonText}>
                  {activityType === 'task' ? 'Create Task' : 'Next'}
                </ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {/* Step 2: Frequency */}
        {step === 2 && (
          <ScrollView
            contentContainerStyle={[
              styles.stepContainer,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText style={styles.stepTitle}>
              How often do you want to do it?
            </ThemedText>

            {/* Radio 1: Every Day */}
            <Pressable
              style={styles.radioGroup}
              onPress={() => setFrequency("daily")}
            >
              <View
                style={[
                  styles.radio,
                  frequency === "daily" && styles.radioSelected,
                ]}
              >
                {frequency === "daily" && <View style={styles.radioDot} />}
              </View>
              <ThemedText style={styles.radioLabel}>Every day</ThemedText>
            </Pressable>

            {/* Radio 2: Specific Days of Week */}
            <Pressable
              style={styles.radioGroup}
              onPress={() => setFrequency("weekly")}
            >
              <View
                style={[
                  styles.radio,
                  frequency === "weekly" && styles.radioSelected,
                ]}
              >
                {frequency === "weekly" && <View style={styles.radioDot} />}
              </View>
              <ThemedText style={styles.radioLabel}>
                Specific days of the week
              </ThemedText>
            </Pressable>
            {frequency === "weekly" && (
              <View style={styles.expandedSection}>
                {weekDays.map((day, index) => (
                  <Pressable
                    key={day}
                    style={styles.checkboxRow}
                    onPress={() => handleWeekDayToggle(index)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedWeekDays[index] && styles.checkboxChecked,
                      ]}
                    >
                      {selectedWeekDays[index] && (
                        <ThemedText style={styles.checkmark}>✓</ThemedText>
                      )}
                    </View>
                    <ThemedText style={styles.checkboxLabel}>{day}</ThemedText>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Radio 3: Specific Days of Month */}
            <Pressable
              style={styles.radioGroup}
              onPress={() => setFrequency("monthly")}
            >
              <View
                style={[
                  styles.radio,
                  frequency === "monthly" && styles.radioSelected,
                ]}
              >
                {frequency === "monthly" && <View style={styles.radioDot} />}
              </View>
              <ThemedText style={styles.radioLabel}>
                Specific days of the month
              </ThemedText>
            </Pressable>
            {frequency === "monthly" && (
              <View style={styles.expandedSection}>
                <View style={styles.dayGrid}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <Pressable
                      key={day}
                      style={[
                        styles.dayBox,
                        selectedMonthDays[day - 1] && styles.dayBoxSelected,
                      ]}
                      onPress={() => handleMonthDayToggle(day - 1)}
                    >
                      <ThemedText
                        style={[
                          styles.dayText,
                          selectedMonthDays[day - 1] && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Radio 4: Specific Days of Year */}
            <Pressable
              style={styles.radioGroup}
              onPress={() => setFrequency("yearly")}
            >
              <View
                style={[
                  styles.radio,
                  frequency === "yearly" && styles.radioSelected,
                ]}
              >
                {frequency === "yearly" && <View style={styles.radioDot} />}
              </View>
              <ThemedText style={styles.radioLabel}>
                Specific days of the year
              </ThemedText>
            </Pressable>
            {frequency === "yearly" && (
              <View style={styles.expandedSection}>
                <View style={styles.yearInputRow}>
                  <TextInput
                    style={styles.yearInput}
                    placeholder="Enter at least one day"
                    placeholderTextColor={Colors.dark.textSecondary}
                    value={yearDays}
                    onChangeText={setYearDays}
                  />
                  <Pressable style={styles.addButton}>
                    <ThemedText style={styles.addButtonText}>+</ThemedText>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Radio 5: Some Days Per Period */}
            <Pressable
              style={styles.radioGroup}
              onPress={() => setFrequency("period")}
            >
              <View
                style={[
                  styles.radio,
                  frequency === "period" && styles.radioSelected,
                ]}
              >
                {frequency === "period" && <View style={styles.radioDot} />}
              </View>
              <ThemedText style={styles.radioLabel}>
                Some days per period
              </ThemedText>
            </Pressable>
            {frequency === "period" && (
              <View style={styles.expandedSection}>
                <View style={styles.periodRow}>
                  <TextInput
                    style={styles.periodInput}
                    placeholder="1"
                    placeholderTextColor={Colors.dark.textSecondary}
                    value={periodDays}
                    onChangeText={setPeriodDays}
                    keyboardType="number-pad"
                  />
                  <ThemedText style={styles.periodLabel}>days per</ThemedText>
                  <Pressable style={styles.periodDropdown}>
                    <ThemedText style={styles.periodDropdownText}>
                      {periodUnit}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Radio 6: Repeat */}
            <Pressable
              style={styles.radioGroup}
              onPress={() => setFrequency("repeat")}
            >
              <View
                style={[
                  styles.radio,
                  frequency === "repeat" && styles.radioSelected,
                ]}
              >
                {frequency === "repeat" && <View style={styles.radioDot} />}
              </View>
              <ThemedText style={styles.radioLabel}>Repeat</ThemedText>
            </Pressable>

            {/* Navigation Buttons */}
            <View style={styles.actionButtonRow}>
              <Pressable style={styles.backButton} onPress={handleBack}>
                <ThemedText style={styles.backButtonText}>Back</ThemedText>
              </Pressable>
              <Pressable style={styles.nextButton} onPress={handleNext}>
                <ThemedText style={styles.nextButtonText}>Finish</ThemedText>
              </Pressable>
            </View>      </ScrollView>
        )}
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  stepContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  stepTitle: {
    color: Colors.dark.neonSkyBlue,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.dark.cardBackground,
    borderColor: Colors.dark.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: Colors.dark.text,
    fontSize: 14,
  },
  suggestionsContainer: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: "hidden",
    ...NeomorphicShadows.dark,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  suggestionText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  suggestionCategory: {
    color: Colors.dark.neonSkyBlue,
    fontSize: 10,
    fontWeight: "bold",
  },
  categoryScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryButton: {
    alignItems: "center",
    marginRight: 12,
    paddingHorizontal: 8,
  },
  categoryButtonSelected: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.neonOrange,
  },
  categoryName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: Colors.dark.cardBackground,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: "center",
    justifyContent: "center",
    ...NeomorphicShadows.dark,
  },
  typeButtonSelected: {
    borderColor: Colors.dark.neonSkyBlue,
    backgroundColor: Colors.dark.neonSkyBlue + "20",
  },
  typeButtonText: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.dark.textSecondary,
  },
  typeButtonTextSelected: {
    color: Colors.dark.neonSkyBlue,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: Colors.dark.neonOrange,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.neonOrange,
  },
  radioLabel: {
    color: Colors.dark.text,
    fontSize: 14,
    flex: 1,
  },
  expandedSection: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    marginLeft: 36,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.dark.neonOrange,
    borderColor: Colors.dark.neonOrange,
  },
  checkmark: {
    color: Colors.dark.background,
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    color: Colors.dark.text,
    fontSize: 13,
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayBox: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    justifyContent: "center",
    alignItems: "center",
  },
  dayBoxSelected: {
    backgroundColor: Colors.dark.neonOrange,
    borderColor: Colors.dark.neonOrange,
  },
  dayText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: "600",
  },
  dayTextSelected: {
    color: Colors.dark.background,
  },
  yearInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  yearInput: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    paddingVertical: 8,
    color: Colors.dark.text,
    fontSize: 13,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.dark.neonSkyBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: Colors.dark.background,
    fontSize: 20,
    fontWeight: "bold",
  },
  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  periodInput: {
    width: 50,
    backgroundColor: Colors.dark.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    paddingVertical: 8,
    color: Colors.dark.text,
    fontSize: 13,
    textAlign: "center",
  },
  periodLabel: {
    color: Colors.dark.text,
    fontSize: 13,
  },
  periodDropdown: {
    flex: 1,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  periodDropdownText: {
    color: Colors.dark.text,
    fontSize: 13,
  },
  actionButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.dark.neonSkyBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: Colors.dark.background,
    fontSize: 14,
    fontWeight: "bold",
  },
});
