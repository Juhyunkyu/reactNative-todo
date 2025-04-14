"use client";

import type React from "react";
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import type { Todo, TodoContextType } from "../types";

// Create context with default values
export const TodoContext = createContext<TodoContextType>({
  todos: [],
  addTodo: async () => {},
  updateTodo: async () => {},
  deleteTodo: async () => {},
  toggleTodoStatus: async () => {},
  loading: true,
});

interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // Load todos from AsyncStorage on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem("todos");
        if (storedTodos) {
          setTodos(JSON.parse(storedTodos));
        }
      } catch (error) {
        console.error("Failed to load todos from storage", error);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  // Save todos to AsyncStorage whenever they change
  useEffect(() => {
    const saveTodos = async () => {
      try {
        if (!loading) {
          await AsyncStorage.setItem("todos", JSON.stringify(todos));
        }
      } catch (error) {
        console.error("Failed to save todos to storage", error);
      }
    };

    saveTodos();
  }, [todos, loading]);

  // Schedule notification for a todo
  const scheduleTodoNotification = useCallback(async (todo: Todo) => {
    if (todo.dueDate) {
      const dueDate = new Date(todo.dueDate);
      const now = new Date();

      // Only schedule if due date is in the future
      if (dueDate > now && !todo.completed) {
        // Cancel any existing notification for this todo
        await Notifications.cancelScheduledNotificationAsync(todo.id);

        // Schedule new notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Todo Reminder",
            body: todo.title,
            data: { todoId: todo.id },
          },
          trigger: {
            date: dueDate,
          },
          identifier: todo.id,
        });
      }
    }
  }, []);

  // Cancel notification for a todo
  const cancelTodoNotification = useCallback(async (todoId: string) => {
    await Notifications.cancelScheduledNotificationAsync(todoId);
  }, []);

  // Add a new todo
  const addTodo = useCallback(
    async (todoData: Omit<Todo, "id" | "createdAt">) => {
      const newTodo: Todo = {
        ...todoData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      setTodos((prevTodos) => [...prevTodos, newTodo]);
      await scheduleTodoNotification(newTodo);
    },
    [scheduleTodoNotification]
  );

  // Update an existing todo
  const updateTodo = useCallback(
    async (updatedTodo: Todo) => {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        )
      );

      await scheduleTodoNotification(updatedTodo);
    },
    [scheduleTodoNotification]
  );

  // Delete a todo
  const deleteTodo = useCallback(
    async (id: string) => {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      await cancelTodoNotification(id);
    },
    [cancelTodoNotification]
  );

  // Toggle todo completion status
  const toggleTodoStatus = useCallback(
    async (id: string) => {
      setTodos((prevTodos) =>
        prevTodos.map((todo) => {
          if (todo.id === id) {
            const updatedTodo = {
              ...todo,
              completed: !todo.completed,
            };

            // If completed, cancel notification; otherwise reschedule
            if (updatedTodo.completed) {
              cancelTodoNotification(id);
            } else if (updatedTodo.dueDate) {
              scheduleTodoNotification(updatedTodo);
            }

            return updatedTodo;
          }
          return todo;
        })
      );
    },
    [cancelTodoNotification, scheduleTodoNotification]
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      todos,
      addTodo,
      updateTodo,
      deleteTodo,
      toggleTodoStatus,
      loading,
    }),
    [todos, addTodo, updateTodo, deleteTodo, toggleTodoStatus, loading]
  );

  return (
    <TodoContext.Provider value={contextValue}>{children}</TodoContext.Provider>
  );
};
