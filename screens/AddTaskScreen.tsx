// AddTaskScreen.tsx: A screen for adding new tasks with title, description, and optional due date.

// Import React and hooks for state management and context usage.
import React, { useContext, useState } from "react";

// Import React Native components for UI rendering and interactions.
import {
  View, // Container for layout
  Text, // Display text labels
  TextInput, // Input fields for title and description
  TouchableOpacity, // Button for saving tasks
  StyleSheet, // Styles for components
  Alert, // Display error messages
  Platform, // Platform-specific logic (iOS/Android)
  Pressable, // Button for date picker
  Keyboard, // Dismiss keyboard when opening date picker
} from "react-native";

// Import navigation props for type-safe navigation.
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Import DateTimePicker for selecting due dates.
import DateTimePicker from "@react-native-community/datetimepicker";

// Import custom hook for task management from TaskContext.
import { useTasks } from "../hooks/useTasks";

// Import navigation types for type-safe routing.
import { RootStackParamList } from "../types";

// Import ThemeContext for light/dark theme support.
import { ThemeContext } from "../contexts/ThemeContext";

// Import utility function to format dates (YYYY-MM-DD).
import { formatDate } from "../lib/utils";

// Define props type using NativeStackScreenProps for the AddTask screen.
type Props = NativeStackScreenProps<RootStackParamList, "AddTask">;

// Define the AddTaskScreen component as a functional component.
const AddTaskScreen: React.FC<Props> = ({ navigation }) => {
  // State for task title input.
  const [title, setTitle] = useState("");
  // State for task description input (optional).
  const [description, setDescription] = useState("");
  // State for due date, initially null (optional).
  const [dueDate, setDueDate] = useState<Date | null>(null);
  // Access addTask function from TaskContext to add new tasks.
  const { addTask } = useTasks();
  // Access theme (light/dark) from ThemeContext for styling.
  const { theme } = useContext(ThemeContext);
  // State to control visibility of DateTimePicker.
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Handle adding a new task with validation and navigation.
  const handleAddTask = async () => {
    // Prevent adding tasks with empty title.
    if (!title.trim()) {
      Alert.alert("Error", "Task title cannot be empty");
      return;
    }

    // Create and add task object with unique ID, title, description, and due date.
    await addTask({
      id: Date.now().toString(), // Generate unique ID using timestamp
      title,
      description,
      dueDate: dueDate || undefined, // Set dueDate or undefined if null
      completed: false, // New tasks are incomplete by default
    });

    // Navigate back to TaskList screen after adding task.
    navigation.goBack();
  };

  // Show DateTimePicker and dismiss keyboard for better UX.
  const showPicker = () => {
    Keyboard.dismiss(); // Close keyboard to prevent overlap with DateTimePicker
    setShowDatePicker(true); // Display DateTimePicker
  };

  // Handle date selection from DateTimePicker.
  const onDateChange = (_event: any, selectedDate?: Date) => {
    // Use selected date or fallback to current dueDate
    const currentDate = selectedDate || dueDate;
    // Keep picker open on iOS, close on Android after selection
    setShowDatePicker(Platform.OS === "ios");
    // Update dueDate state if a valid date is selected
    if (currentDate) {
      setDueDate(currentDate);
    }
  };

  // Render the AddTask screen UI.
  return (
    // Main container with theme-aware background
    <View
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      {/* // Label for title input */}
      <Text style={[styles.label, theme === "dark" && styles.darkLabel]}>
        Title
      </Text>
      {/* // Input field for task title */}
      <TextInput
        style={[styles.input, theme === "dark" && styles.darkInput]}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter task title"
        placeholderTextColor={theme === "dark" ? "#aaa" : "#666"} // Theme-aware placeholder
      />
      {/* // Label for description input */}
      <Text style={[styles.label, theme === "dark" && styles.darkLabel]}>
        Description (Optional)
      </Text>
      {/* // Input field for task description (multiline) */}
      <TextInput
        style={[
          styles.input,
          styles.textArea,
          theme === "dark" && styles.darkInput,
        ]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter task description"
        multiline // Allow multiple lines for description
      />
      {/* // Label for due date */}
      <Text style={[styles.label, theme === "dark" && styles.darkLabel]}>
        {/* Due Date (Optional, YYYY-MM-DD) */}
      </Text>
      {/* // Button to show DateTimePicker */}
      <Pressable
        style={[styles.dateButton, theme === "dark" && styles.darkDateButton]}
        onPress={showPicker}
        testID="date-picker-button" // Test ID for unit testing
      >
        {/* // Display selected date or placeholder */}
        <Text
          style={[
            styles.dateButtonText,
            theme === "dark" && styles.darkDateButtonText,
          ]}
        >
          {dueDate ? formatDate(dueDate) : "Select Due Date"}
        </Text>
      </Pressable>
      {/* // Conditionally render DateTimePicker when showDatePicker is true */}
      {showDatePicker && (
        // Container for DateTimePicker with theme-aware background
        <View
          style={[
            styles.datePickerContainer,
            theme === "dark" && styles.darkDatePickerContainer,
          ]}
        >
          {/* // DateTimePicker for selecting due date */}
          <DateTimePicker
            value={dueDate || new Date()} // Use current date if no dueDate
            mode="date" // Date-only picker
            display={Platform.OS === "ios" ? "inline" : "default"} // Inline on iOS, default on Android
            onChange={onDateChange} // Handle date changes
            testID="date-picker" // Test ID for unit testing
            textColor={theme === "dark" ? "#fff" : "#000"} // Theme-aware text color (iOS only)
          />
        </View>
      )}
      {/* // Button to save the task */}
      <TouchableOpacity
        style={[styles.saveButton, theme === "dark" && styles.darkSaveButton]}
        onPress={handleAddTask}
      >
        <Text style={styles.saveButtonText}>Save Task</Text>
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
  // Label style for input fields
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  // Dark theme label color
  darkLabel: { color: "#fff" },
  // Input field style
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  // Dark theme input style
  darkInput: { backgroundColor: "#444", borderColor: "#666", color: "#fff" },
  // Style for multiline description input
  textArea: { height: 100, textAlignVertical: "top" },
  // Save button style
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  // Dark theme save button
  darkSaveButton: { backgroundColor: "#005BB5" },
  // Save button text style
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  // Date picker button style
  dateButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  // Dark theme date button
  darkDateButton: { borderColor: "#666", backgroundColor: "#333" },
  // Date button text style
  dateButtonText: { fontSize: 16, color: "#007AFF" },
  // Dark theme date button text
  darkDateButtonText: { color: "#4DA8FF" },
  // DateTimePicker container style
  datePickerContainer: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  // Dark theme DateTimePicker container
  darkDatePickerContainer: {
    backgroundColor: "#333",
  },
});

// Export the component as the default export
export default AddTaskScreen;
