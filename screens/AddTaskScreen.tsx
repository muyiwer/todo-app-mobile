import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Pressable,
  Keyboard,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTasks } from "../hooks/useTasks";
import { RootStackParamList } from "../types";
import { ThemeContext } from "../contexts/ThemeContext";
import { formatDate } from "../lib/utils";

type Props = NativeStackScreenProps<RootStackParamList, "AddTask">;

const AddTaskScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const { addTask } = useTasks();
  const { theme } = useContext(ThemeContext);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Task title cannot be empty");
      return;
    }

    await addTask({
      id: Date.now().toString(),
      title,
      description,
      dueDate: dueDate || undefined,
      completed: false,
    });

    navigation.goBack();
  };

  const showPicker = () => {
    Keyboard.dismiss();
    setShowDatePicker(true);
  };

  const onDateChange = (_event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    if (currentDate) {
      setDueDate(currentDate);
    }
  };

  return (
    <View
      style={[
        styles.container,
        theme === "dark" ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <Text style={[styles.label, theme === "dark" && styles.darkLabel]}>
        Title
      </Text>
      <TextInput
        style={[styles.input, theme === "dark" && styles.darkInput]}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter task title"
        placeholderTextColor={theme === "dark" ? "#aaa" : "#666"}
      />
      <Text style={[styles.label, theme === "dark" && styles.darkLabel]}>
        Description (Optional)
      </Text>
      <TextInput
        style={[
          styles.input,
          styles.textArea,
          theme === "dark" && styles.darkInput,
        ]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter task description"
        multiline
      />
      <Text style={[styles.label, theme === "dark" && styles.darkLabel]}>
        Due Date (Optional, YYYY-MM-DD)
      </Text>
      <Pressable
        style={[styles.dateButton, theme === "dark" && styles.darkDateButton]}
        onPress={showPicker}
        testID="date-picker-button"
      >
        <Text
          style={[
            styles.dateButtonText,
            theme === "dark" && styles.darkDateButtonText,
          ]}
        >
          {dueDate ? formatDate(dueDate) : "Select Due Date"}
        </Text>
      </Pressable>
      {showDatePicker && (
        <View
          style={[
            styles.datePickerContainer,
            theme === "dark" && styles.darkDatePickerContainer,
          ]}
        >
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={onDateChange}
            testID="date-picker"
            textColor={theme === "dark" ? "#fff" : "#000"} 
          />
        </View>
      )}
      <TouchableOpacity
        style={[styles.saveButton, theme === "dark" && styles.darkSaveButton]}
        onPress={handleAddTask}
      >
        <Text style={styles.saveButtonText}>Save Task</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  lightContainer: { backgroundColor: "#f5f5f5" },
  darkContainer: { backgroundColor: "#333" },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  darkLabel: { color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  darkInput: { backgroundColor: "#444", borderColor: "#666", color: "#fff" },
  textArea: { height: 100, textAlignVertical: "top" },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  darkSaveButton: { backgroundColor: "#005BB5" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  dateButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  darkDateButton: { borderColor: "#666", backgroundColor: "#333" },
  dateButtonText: { fontSize: 16, color: "#007AFF" },
  darkDateButtonText: { color: "#4DA8FF" },
  datePickerContainer: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  darkDatePickerContainer: {
    backgroundColor: "#333",
  },
});

export default AddTaskScreen;
