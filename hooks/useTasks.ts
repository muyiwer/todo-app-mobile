import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, FilterType } from "../types";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem("tasks");
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
      } catch (error) {
        console.error("Error saving tasks:", error);
      }
    };
    saveTasks();
  }, [tasks]);

  const addTask = (task: Task) => {
    setTasks((prev) =>
      [...prev, task].sort((a, b) =>
        a.dueDate && b.dueDate ? a.dueDate.localeCompare(b.dueDate) : 0
      )
    );
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filter === "completed") return matchesSearch && task.completed;
    if (filter === "incomplete") return matchesSearch && !task.completed;
    return matchesSearch;
  });

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
  };
};
