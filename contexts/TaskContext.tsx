import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, FilterType, TaskAction } from "../types";

// Define the state shape
interface TaskState {
  tasks: Task[];
  searchQuery: string;
  filter: FilterType;
}

// Define the context shape
interface TaskContextType {
  tasks: Task[];
  allTasks: Task[];
  addTask: (task: Task) => Promise<void>;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

// Create the context
export const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Reducer to manage state
const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case "SET_TASKS":
      return { ...state, tasks: action.payload };
      case 'ADD_TASK':
        return {
          ...state,
          tasks: [...state.tasks, action.payload].sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1; 
            if (!b.dueDate) return -1; 
            return a.dueDate.getTime() - b.dueDate.getTime();
          }),
        };
    case "TOGGLE_TASK_COMPLETION":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, completed: !task.completed }
            : task
        ),
      };
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "SET_FILTER":
      return { ...state, filter: action.payload };
    default:
      return state;
  }
};

// Task Provider component
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    searchQuery: "",
    filter: "all",
  });

  // Load tasks from AsyncStorage on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem("tasks");
        if (storedTasks) {
          dispatch({ type: "SET_TASKS", payload: JSON.parse(storedTasks) });
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    };
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage when tasks change
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem("tasks", JSON.stringify(state.tasks));
      } catch (error) {
        console.error("Error saving tasks:", error);
      }
    };
    saveTasks();
  }, [state.tasks]);

  // Actions
  const addTask = async (task: Task) => {
    dispatch({ type: "ADD_TASK", payload: task });
  };

  const toggleTaskCompletion = (id: string) => {
    dispatch({ type: "TOGGLE_TASK_COMPLETION", payload: id });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: "DELETE_TASK", payload: id });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  };

  const setFilter = (filter: FilterType) => {
    dispatch({ type: "SET_FILTER", payload: filter });
  };

  // Filtered tasks using useMemo
  const filteredTasks = useMemo(
    () =>
      state.tasks.filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          (task.description &&
            task.description
              .toLowerCase()
              .includes(state.searchQuery.toLowerCase()));
        if (state.filter === "completed")
          return matchesSearch && task.completed;
        if (state.filter === "incomplete")
          return matchesSearch && !task.completed;
        return matchesSearch;
      }),
    [state.tasks, state.searchQuery, state.filter]
  );

  return (
    <TaskContext.Provider
      value={{
        tasks: filteredTasks,
        allTasks: state.tasks,
        addTask,
        toggleTaskCompletion,
        deleteTask,
        searchQuery: state.searchQuery,
        setSearchQuery,
        filter: state.filter,
        setFilter,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

