import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Modal,
  Dimensions,
  ScrollView,
} from "react-native";
import { ThemedText } from "./themed-text";
import { Colors, NeomorphicShadows } from "@/constants/theme";

const { width, height } = Dimensions.get("window");

interface TimePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (hours: number, minutes: number, seconds: number) => void;
  habitName?: string;
  currentProgress?: number; // in minutes
  targetTime?: number; // in minutes
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  habitName = "H",
  currentProgress = 0,
  targetTime = 0,
  initialHours = 0,
  initialMinutes = 0,
  initialSeconds = 0,
}) => {
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (isVisible) {
      setHours(initialHours);
      setMinutes(initialMinutes);
      setSeconds(initialSeconds);
    }
  }, [isVisible, initialHours, initialMinutes, initialSeconds]);

  const renderPickerColumn = (
    value: number,
    setValue: (v: number) => void,
    max: number,
    label: string
  ) => {
    const values = [];
    for (let i = -1; i <= 1; i++) {
      let val = value + i;
      if (val < 0) val = max;
      if (val > max) val = 0;
      values.push(val);
    }

    return (
      <View style={styles.pickerColumn}>
        <Pressable onPress={() => setValue(values[0])}>
          <ThemedText style={styles.pickerValueInactive}>
            {values[0].toString().padStart(2, "0")}
          </ThemedText>
        </Pressable>
        <View style={styles.activeValueContainer}>
          <ThemedText style={styles.pickerValueActive}>
            {value.toString().padStart(2, "0")}
          </ThemedText>
        </View>
        <Pressable onPress={() => setValue(values[2])}>
          <ThemedText style={styles.pickerValueInactive}>
            {values[2].toString().padStart(2, "0")}
          </ThemedText>
        </Pressable>
        <ThemedText style={styles.pickerLabel}>{label}</ThemedText>
      </View>
    );
  };

  const formatProgressTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, NeomorphicShadows.dark]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.habitInitial}>{habitName}</ThemedText>
              <ThemedText style={styles.dateText}>
                {new Date().toISOString().split("T")[0]}
              </ThemedText>
            </View>
            <Pressable style={styles.cancelIconContainer}>
              <ThemedText style={styles.cancelIcon}>🚫</ThemedText>
            </Pressable>
          </View>

          {/* Picker */}
          <View style={styles.pickerWrapper}>
            {renderPickerColumn(hours, setHours, 23, "hours")}
            <ThemedText style={styles.separator}>:</ThemedText>
            {renderPickerColumn(minutes, setMinutes, 59, "minutes")}
            <ThemedText style={styles.separator}>:</ThemedText>
            {renderPickerColumn(seconds, setSeconds, 59, "seconds")}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <ThemedText style={styles.progressLabel}>Today</ThemedText>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(
                      100,
                      (currentProgress / Math.max(1, targetTime)) * 100
                    )}%`,
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.progressValue}>
              {formatProgressTime(currentProgress)} /{" "}
              {formatProgressTime(targetTime)}
            </ThemedText>
          </View>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <Pressable style={styles.footerButton} onPress={onClose}>
              <ThemedText style={styles.footerButtonText}>CLOSE</ThemedText>
            </Pressable>
            <View style={styles.timerIconContainer}>
              <ThemedText style={styles.timerIcon}>⏱️</ThemedText>
            </View>
            <Pressable
              style={styles.footerButton}
              onPress={() => onConfirm(hours, minutes, seconds)}
            >
              <ThemedText style={[styles.footerButtonText, styles.okButtonText]}>
                OK
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: "#121212",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  habitInitial: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  dateText: {
    fontSize: 12,
    color: "#ff4d4d",
    marginTop: 4,
    backgroundColor: "rgba(255, 77, 77, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  cancelIconContainer: {
    backgroundColor: "#ff4d4d",
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelIcon: {
    fontSize: 16,
  },
  pickerWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  pickerColumn: {
    alignItems: "center",
    width: 60,
  },
  pickerValueInactive: {
    fontSize: 24,
    color: "#444",
    marginVertical: 10,
  },
  activeValueContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#333",
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
  },
  pickerValueActive: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  pickerLabel: {
    fontSize: 10,
    color: "#444",
    textTransform: "uppercase",
    marginTop: 10,
  },
  separator: {
    fontSize: 32,
    color: "#fff",
    marginHorizontal: 10,
    marginBottom: 30,
  },
  progressSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  progressLabel: {
    fontSize: 10,
    color: "#444",
    marginBottom: 8,
  },
  progressBarBackground: {
    width: "100%",
    height: 40,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#222",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  progressValue: {
    position: "absolute",
    top: 28,
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#222",
    paddingTop: 20,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  footerButton: {
    flex: 1,
    alignItems: "center",
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  okButtonText: {
    color: "#ff4d4d",
  },
  timerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  timerIcon: {
    fontSize: 20,
  },
});
