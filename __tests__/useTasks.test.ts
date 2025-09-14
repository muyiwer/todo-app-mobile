import { renderHook, act } from "@testing-library/react-native";
import { TaskProvider } from "../contexts/TaskContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../types";
import { useTasks } from "../hooks/useTasks";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe("useTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads tasks from AsyncStorage", async () => {
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Test Task",
        completed: false,
        dueDate: new Date("2025-12-31"),
      },
    ];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(mockTasks)
    );

    const { result } = renderHook(() => useTasks(), { wrapper: TaskProvider });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for useEffect
    });

    expect(result.current.allTasks).toEqual(mockTasks);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith("tasks");
  });

  it("adds a task with title and due date", async () => {
    const newTask: Task = {
      id: "1",
      title: "New Task",
      dueDate: new Date("2025-12-31"),
      completed: false,
    };
    const { result } = renderHook(() => useTasks(), { wrapper: TaskProvider });

    await act(async () => {
      await result.current.addTask(newTask);
    });

    expect(result.current.allTasks).toContainEqual(newTask);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "tasks",
      JSON.stringify([newTask])
    );
  });

  it("sorts tasks by due date", async () => {
    const task1: Task = {
      id: "1",
      title: "Task 1",
      dueDate: new Date("2025-12-31"),
      completed: false,
    };
    const task2: Task = {
      id: "2",
      title: "Task 2",
      dueDate: new Date("2025-01-01"),
      completed: false,
    };
    const task3: Task = {
      id: "3",
      title: "Task 3",
      completed: false,
    }; // No dueDate
    const { result } = renderHook(() => useTasks(), { wrapper: TaskProvider });

    await act(async () => {
      await result.current.addTask(task1);
      await result.current.addTask(task2);
      await result.current.addTask(task3);
    });

    expect(result.current.allTasks[0].dueDate).toBe("2025-01-01"); // task2 (earliest)
    expect(result.current.allTasks[1].dueDate).toBe("2025-12-31"); // task1
    expect(result.current.allTasks[2].dueDate).toBeUndefined(); // task3 (no dueDate)
  });

  it("toggles task completion", async () => {
    const task: Task = { id: "1", title: "Test Task", completed: false };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([task])
    );
    const { result } = renderHook(() => useTasks(), { wrapper: TaskProvider });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for useEffect
    });

    await act(async () => {
      result.current.toggleTaskCompletion("1");
    });

    expect(result.current.allTasks[0].completed).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "tasks",
      JSON.stringify([{ ...task, completed: true }])
    );
  });

  it("deletes a task", async () => {
    const task: Task = { id: "1", title: "Test Task", completed: false };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([task])
    );
    const { result } = renderHook(() => useTasks(), { wrapper: TaskProvider });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for useEffect
    });

    await act(async () => {
      result.current.deleteTask("1");
    });

    expect(result.current.allTasks).toHaveLength(0);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "tasks",
      JSON.stringify([])
    );
  });

  it("filters tasks by search query", async () => {
    const tasks: Task[] = [
      {
        id: "1",
        title: "Test Task",
        description: "Description",
        completed: false,
      },
      { id: "2", title: "Other Task", completed: false },
    ];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(tasks)
    );
    const { result } = renderHook(() => useTasks(), { wrapper: TaskProvider });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for useEffect
    });

    await act(async () => {
      result.current.setSearchQuery("Test");
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe("Test Task");
  });

  it("filters tasks by completion status", async () => {
    const tasks: Task[] = [
      { id: "1", title: "Task 1", completed: true },
      { id: "2", title: "Task 2", completed: false },
    ];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(tasks)
    );
    const { result } = renderHook(() => useTasks(), { wrapper: TaskProvider });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for useEffect
    });

    await act(async () => {
      result.current.setFilter("completed");
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].completed).toBe(true);

    await act(async () => {
      result.current.setFilter("incomplete");
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].completed).toBe(false);
  });
});
