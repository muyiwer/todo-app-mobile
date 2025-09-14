export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
}

export type FilterType = "all" | "completed" | "incomplete";

export type RootStackParamList = {
  TaskList: undefined;
  AddTask: undefined;
};
