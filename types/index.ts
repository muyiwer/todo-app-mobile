export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
  completed: boolean;
}

export type FilterType = "all" | "completed" | "incomplete";

export type RootStackParamList = {
  TaskList: undefined;
  AddTask: undefined;
};

// Define action types for the reducer
export type TaskAction =
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "TOGGLE_TASK_COMPLETION"; payload: string }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_FILTER"; payload: FilterType };
