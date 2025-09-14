import React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TaskListScreen from "./screens/TaskListScreen";
import AddTaskScreen from "./screens/AddTaskScreen";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TaskProvider } from "./contexts/TaskContext";
import { RootStackParamList } from "./types";
import "react-native-reanimated";

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TaskProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="TaskList">
            <Stack.Screen
              name="TaskList"
              component={TaskListScreen}
              options={{ title: "To-Do List" }}
            />
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

export default App;
