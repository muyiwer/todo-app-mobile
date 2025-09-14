import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import AddTaskScreen from "../screens/AddTaskScreen";
import { TaskProvider } from "../contexts/TaskContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { RootStackParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();

// Type-safe mock navigation
type AddTaskNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AddTask"
>;
type AddTaskRouteProp = RouteProp<RootStackParamList, "AddTask">;

const createMockNavigation = (): AddTaskNavigationProp => ({
  goBack: jest.fn(),
  navigate: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(() => ({} as any)),
  getId: jest.fn(),
  addListener: jest.fn(() => () => {}),
  removeListener: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
});

const createMockRoute = (): AddTaskRouteProp => ({
  key: "AddTask-123",
  name: "AddTask",
  params: undefined,
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <TaskProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="AddTask" component={AddTaskScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </TaskProvider>
    </ThemeProvider>
  );
};

describe("AddTaskScreen", () => {
  it("renders correctly", () => {
    const mockNavigation = createMockNavigation();
    const mockRoute = createMockRoute();
    const { getByPlaceholderText, getByTestId } = renderWithProviders(
      <AddTaskScreen navigation={mockNavigation} route={mockRoute} />
    );
    expect(getByPlaceholderText("Task Title")).toBeTruthy();
    expect(getByPlaceholderText("Description (optional)")).toBeTruthy();
    expect(getByTestId("date-picker-button")).toBeTruthy();
    expect(getByTestId("add-task-button")).toBeTruthy();
  });

  it("adds a task with title and date", async () => {
    const mockNavigation = createMockNavigation();
    const mockRoute = createMockRoute();
    const { getByPlaceholderText, getByTestId } = renderWithProviders(
      <AddTaskScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.changeText(getByPlaceholderText("Task Title"), "Test Task");
    fireEvent.press(getByTestId("date-picker-button"));
    fireEvent(
      getByTestId("date-picker"),
      "onChange",
      { type: "set" },
      new Date("2025-12-31")
    );
    fireEvent.press(getByTestId("add-task-button"));

    await waitFor(() => {
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  it("does not add a task with empty title", async () => {
    const mockNavigation = createMockNavigation();
    const mockRoute = createMockRoute();
    const { getByTestId } = renderWithProviders(
      <AddTaskScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.press(getByTestId("add-task-button"));

    await waitFor(() => {
      expect(mockNavigation.goBack).not.toHaveBeenCalled();
    });
  });
});
