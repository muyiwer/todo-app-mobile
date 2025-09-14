import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { ThemeContext } from "../contexts/ThemeContext";
import { Task } from "../types";

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const { theme } = useContext(ThemeContext);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const handleToggle = () => {
    scale.value = 0.95;
    setTimeout(() => (scale.value = 1), 100);
    onToggle();
  };

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[
        styles.container,
        animatedStyle,
        theme === "dark" && styles.darkContainer,
      ]}
    >
      <TouchableOpacity
        testID="task-toggle"
        onPress={handleToggle}
        style={styles.task}
      >
        <View
          style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
        >
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View>
          <Text
            style={[
              styles.title,
              task.completed && styles.titleCompleted,
              theme === "dark" && styles.darkTitle,
            ]}
          >
            {task.title}
          </Text>
          {task.description && (
            <Text
              style={[
                styles.description,
                theme === "dark" && styles.darkDescription,
              ]}
            >
              {task.description}
            </Text>
          )}
          {task.dueDate && (
            <Text
              style={[styles.dueDate, theme === "dark" && styles.darkDueDate]}
            >
              Due: {task.dueDate}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDelete}
        style={[
          styles.deleteButton,
          theme === "dark" && styles.darkDeleteButton,
        ]}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  darkContainer: { backgroundColor: "#444" },
  task: { flexDirection: "row", alignItems: "center", flex: 1 },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 6,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: { backgroundColor: "#007AFF" },
  checkmark: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  title: { fontSize: 18, fontWeight: "600" },
  darkTitle: { color: "#fff" },
  titleCompleted: { textDecorationLine: "line-through", color: "#666" },
  description: { fontSize: 14, color: "#666", marginTop: 4 },
  darkDescription: { color: "#ccc" },
  dueDate: { fontSize: 14, color: "#007AFF", marginTop: 4 },
  darkDueDate: { color: "#4DA8FF" },
  deleteButton: {
    padding: 8,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
  },
  darkDeleteButton: { backgroundColor: "#D32F2F" },
  deleteButtonText: { color: "#fff", fontWeight: "bold" },
});

export default TaskItem;
