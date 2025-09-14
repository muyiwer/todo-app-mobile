import React, { useContext } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TaskListScreen from "./screens/TaskListScreen";
import AddTaskScreen from "./screens/AddTaskScreen";
import { ThemeProvider, ThemeContext } from "./contexts/ThemeContext";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const { theme } = useContext(ThemeContext); // Access theme from ThemeContext

  // Select navigation theme based on app theme
  const navigationTheme = theme === "light" ? DefaultTheme : DarkTheme;

  return (
    <ThemeProvider>
      <NavigationContainer theme={navigationTheme}>
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
    </ThemeProvider>
  );
};

export default App;
