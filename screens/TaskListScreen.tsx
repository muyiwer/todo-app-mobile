import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTasks } from "../hooks/useTasks";
import { FilterType } from "../types";
import TaskItem from "../components/TaskItem";
import VoiceInputButton from "../components/VoiceInputButton";
import { RootStackParamList } from "../types";
import { ThemeContext } from "../contexts/ThemeContext";

type Props = NativeStackScreenProps<RootStackParamList, "TaskList">;

const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const {
    tasks,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    toggleTaskCompletion,
    deleteTask,
    addTask,
  } = useTasks();

  const { theme, toggleTheme } = useContext(ThemeContext);

  // Handle voice-detected tasks
  const handleVoiceTasksDetected = async (taskTitles: string[]) => {
    // Add each task from voice input
    for (const title of taskTitles) {
      await addTask({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title,
        completed: false,
      });
    }
  };

  return (
    <View
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <TouchableOpacity style={styles.themeToggleButton} onPress={toggleTheme}>
        <Text style={styles.themeToggleText}>
          Switch to {theme === "light" ? "Dark" : "Light"} Theme
        </Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.searchInput, theme === "dark" && styles.darkInput]}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search tasks..."
        placeholderTextColor={theme === "dark" ? "#aaa" : "#666"}
      />

      <View style={styles.filterContainer}>
        {(["all", "completed", "incomplete"] as FilterType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filter === type && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(type)}
          >
            <Text style={styles.filterButtonText}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tasks.length === 0 ? (
        <Text
          style={[styles.emptyText, theme === "dark" && styles.darkEmptyText]}
        >
          No tasks found. Add a new task or use voice input!
        </Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggle={() => toggleTaskCompletion(item.id)}
              onDelete={() => deleteTask(item.id)}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.addButton, theme === "dark" && styles.darkAddButton]}
        onPress={() => navigation.navigate("AddTask")}
      >
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>

      {/* Voice Input FAB */}
      <VoiceInputButton onTasksDetected={handleVoiceTasksDetected} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  lightContainer: { backgroundColor: "#f5f5f5" },
  darkContainer: { backgroundColor: "#333" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  darkInput: {
    backgroundColor: "#444",
    borderColor: "#666",
    color: "#fff",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#ddd",
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#666",
  },
  darkEmptyText: { color: "#ccc" },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  darkAddButton: { backgroundColor: "#005BB5" },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  themeToggleButton: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  themeToggleText: { color: "#fff", fontSize: 14 },
});

export default TaskListScreen;