// TaskListScreen.tsx: A screen for displaying and managing a list of tasks with search, filter, and theme toggle functionality.

// Import React and useContext for accessing context data.
import React, { useContext } from "react";

// Import React Native components for UI rendering and interactions.
import {
  View, // Container for layout
  Text, // Display text for empty state or labels
  FlatList, // List for rendering tasks
  StyleSheet, // Styles for components
  TouchableOpacity, // Buttons for theme toggle, filters, and adding tasks
  TextInput, // Input field for search
} from "react-native";

// Import navigation props for type-safe navigation.
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Import custom hook for task management from TaskContext.
import { useTasks } from "../hooks/useTasks";

// Import FilterType for task filtering options.
import { FilterType } from "../types";

// Import TaskItem component for rendering individual tasks.
import TaskItem from "../components/TaskItem";

// Import navigation types for type-safe routing.
import { RootStackParamList } from "../types";

// Import ThemeContext for light/dark theme support.
import { ThemeContext } from "../contexts/ThemeContext";

// Define props type using NativeStackScreenProps for the TaskList screen.
type Props = NativeStackScreenProps<RootStackParamList, "TaskList">;

// Define the TaskListScreen component as a functional component.
const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  // Destructure task management functions and state from TaskContext.
  const {
    tasks, // Filtered list of tasks (based on search and filter)
    searchQuery, // Current search query
    setSearchQuery, // Update search query
    filter, // Current filter type (all, completed, incomplete)
    setFilter, // Update filter type
    toggleTaskCompletion, // Toggle task completion status
    deleteTask, // Delete a task
  } = useTasks();

  // Destructure theme and toggleTheme from ThemeContext for light/dark mode.
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Render the TaskList screen UI.
  return (
    // Main container with theme-aware background
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
      {/* // Search input for filtering tasks by title or description */}
      <TextInput
        style={[styles.searchInput, theme === "dark" && styles.darkInput]}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search tasks..."
        placeholderTextColor={theme === "dark" ? "#aaa" : "#666"} // Theme-aware placeholder
      />
      {/* // Container for filter buttons (All, Completed, Incomplete) */}
      <View style={styles.filterContainer}>
        {(["all", "completed", "incomplete"] as FilterType[]).map((type) => (
          // Button for each filter type
          <TouchableOpacity
            key={type} // Unique key for each filter button
            style={[
              styles.filterButton,
              filter === type && styles.filterButtonActive, // Highlight active filter
            ]}
            onPress={() => setFilter(type)} // Set filter type on press
          >
            <Text style={styles.filterButtonText}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* // Conditionally render empty state or task list */}
      {tasks.length === 0 ? (
        // Display message when no tasks are found
        <Text
          style={[styles.emptyText, theme === "dark" && styles.darkEmptyText]}
        >
          No tasks found. Add a new task!
        </Text>
      ) : (
        // Render list of tasks using FlatList
        <FlatList
          data={tasks} // Filtered tasks from TaskContext
          keyExtractor={(item) => item.id} // Unique key for each task
          renderItem={({ item }) => (
            // Render each task using TaskItem component
            <TaskItem
              task={item} // Pass task data
              onToggle={() => toggleTaskCompletion(item.id)} // Toggle completion status
              onDelete={() => deleteTask(item.id)} // Delete task
            />
          )}
        />
      )}
      {/* // Button to navigate to AddTask screen */}
      <TouchableOpacity
        style={[styles.addButton, theme === "dark" && styles.darkAddButton]}
        onPress={() => navigation.navigate("AddTask")} // Navigate to AddTask screen
      >
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>
    </View>
  );
};

// Define styles for the component using StyleSheet
const styles = StyleSheet.create({
  // Main container with padding
  container: { flex: 1, padding: 16 },
  // Light theme background
  lightContainer: { backgroundColor: "#f5f5f5" },
  // Dark theme background
  darkContainer: { backgroundColor: "#333" },
  // Search input style
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  // Dark theme search input
  darkInput: {
    backgroundColor: "#444",
    borderColor: "#666",
    color: "#fff",
  },
  // Container for filter buttons
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  // Filter button style
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#ddd",
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  // Active filter button style
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  // Filter button text style
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  // Empty state text style
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#666",
  },
  // Dark theme empty state text
  darkEmptyText: { color: "#ccc" },
  // Add task button style
  addButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  // Dark theme add task button
  darkAddButton: { backgroundColor: "#005BB5" },
  // Add task button text style
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  // Theme toggle button style
  themeToggleButton: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  // Theme toggle button text style
  themeToggleText: { color: "#fff", fontSize: 14 },
});

// Export the component as the default export
export default TaskListScreen;