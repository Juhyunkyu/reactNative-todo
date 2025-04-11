"use client"

import type React from "react"
import { useContext, memo } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Feather } from "@expo/vector-icons"
import { Swipeable } from "react-native-gesture-handler"
import { TodoContext } from "../context/TodoContext"
import type { RootStackParamList, Todo } from "../types"
import { formatDate } from "../utils/dateUtils"

type TodoItemProps = {
  todo: Todo
}

type TodoItemNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">

// Using memo to prevent unnecessary re-renders
const TodoItem: React.FC<TodoItemProps> = memo(({ todo }) => {
  const { toggleTodoStatus, deleteTodo } = useContext(TodoContext)
  const navigation = useNavigation<TodoItemNavigationProp>()

  const handleToggleStatus = () => {
    toggleTodoStatus(todo.id)
  }

  const handleEdit = () => {
    navigation.navigate("AddEditTodo", { todo })
  }

  const handleDelete = () => {
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => deleteTodo(todo.id),
        style: "destructive",
      },
    ])
  }

  const renderRightActions = () => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
          <Feather name="edit-2" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
          <Feather name="trash-2" size={20} color="white" />
        </TouchableOpacity>
      </View>
    )
  }

  // Determine priority color
  const getPriorityColor = () => {
    switch (todo.priority) {
      case "high":
        return "#ff5252"
      case "medium":
        return "#ffa726"
      case "low":
        return "#66bb6a"
      default:
        return "#66bb6a"
    }
  }

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={[styles.container, todo.completed && styles.completedContainer]}>
        <TouchableOpacity style={styles.checkbox} onPress={handleToggleStatus}>
          {todo.completed ? (
            <Feather name="check-circle" size={24} color="#2196F3" />
          ) : (
            <Feather name="circle" size={24} color="#757575" />
          )}
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, todo.completed && styles.completedText]} numberOfLines={1}>
              {todo.title}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
              <Text style={styles.priorityText}>{todo.priority}</Text>
            </View>
          </View>

          {todo.description ? (
            <Text style={[styles.description, todo.completed && styles.completedText]} numberOfLines={2}>
              {todo.description}
            </Text>
          ) : null}

          <View style={styles.dateContainer}>
            {todo.dueDate && (
              <Text
                style={[
                  styles.date,
                  todo.completed && styles.completedText,
                  new Date(todo.dueDate) < new Date() && !todo.completed && styles.overdue,
                ]}
              >
                Due: {formatDate(todo.dueDate)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Swipeable>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  completedContainer: {
    opacity: 0.7,
  },
  checkbox: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#757575",
  },
  description: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  date: {
    fontSize: 12,
    color: "#757575",
  },
  overdue: {
    color: "#ff5252",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  rightActions: {
    flexDirection: "row",
    width: 120,
    height: "100%",
  },
  actionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#ff5252",
  },
})

export default TodoItem
