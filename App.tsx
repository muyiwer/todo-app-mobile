// App.tsx: The main entry point of the To-Do List app, setting up navigation and context providers.

// Import React to define the functional component.
import React from "react";

// Import NavigationContainer to wrap the navigation stack and manage navigation state.
import { NavigationContainer } from "@react-navigation/native";

// Import createNativeStackNavigator to create a stack navigator for screen transitions.
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screen components for the Task List and Add Task screens.
import TaskListScreen from "./screens/TaskListScreen";
import AddTaskScreen from "./screens/AddTaskScreen";

// Import ThemeProvider to provide light/dark theme context across the app.
import { ThemeProvider } from "./contexts/ThemeContext";

// Import TaskProvider to provide task management context (CRUD, search, filter, sorting).
import { TaskProvider } from "./contexts/TaskContext";

// Import RootStackParamList to define the navigation stack's type-safe route parameters.
import { RootStackParamList } from "./types";

// Import react-native-reanimated for animations (e.g., task addition/deletion effects).
// This import ensures the library is loaded for components using animations.
import "react-native-reanimated";

// Create a stack navigator instance with type-safe route parameters.
const Stack = createNativeStackNavigator<RootStackParamList>();

// Define the main App component as a functional component.
const App: React.FC = () => {
  return (
    // Wrap the app in ThemeProvider to enable light/dark theme support.
    // Theme is persisted via AsyncStorage and accessible to all components.
    <ThemeProvider>
      {/* // Wrap the app in TaskProvider to manage task state (CRUD, search,
      filter, sorting). // Tasks are persisted via AsyncStorage and sorted by
      due date. */}
      <TaskProvider>
        {/* // Wrap the navigation stack in NavigationContainer to manage navigation
        state. // This enables screen transitions and navigation-related
        features. */}
        <NavigationContainer>
          {/* // Define the stack navigator with an initial route of TaskList. */}
          <Stack.Navigator initialRouteName="TaskList">
            {/* // Define the TaskList screen, which displays the list of tasks. //
            Set the title to "To-Do List" for the navigation bar. */}
            <Stack.Screen
              name="TaskList"
              component={TaskListScreen}
              options={{ title: "To-Do List" }}
            />
            {/* Define the AddTask screen, which allows adding new tasks with
            title, description, and due date. // Set the title to "Add Task" for
            the navigation bar. */}
            <Stack.Screen
              name="AddTask"
              component={AddTaskScreen}
              options={{ title: "Add Task" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </TaskProvider>
    </ThemeProvider>
  );
};

// Export the App component as the default export for use as the app's entry point.
export default App;
