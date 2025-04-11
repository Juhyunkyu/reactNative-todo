"use client"

import type React from "react"
import { useContext, useMemo, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Feather } from "@expo/vector-icons"
import { TodoContext } from "../context/TodoContext"
import type { RootStackParamList } from "../types"
import TodoItem from "../components/TodoItem"
import FilterBar from "../components/FilterBar"

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">

type FilterType = "all" | "active" | "completed"
type SortType = "date" | "priority" | "dueDate"

const HomeScreen: React.FC = () => {
  const { todos, loading } = useContext(TodoContext)
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const [filter, setFilter] = useState<FilterType>("all")
  const [sortBy, setSortBy] = useState<SortType>("date")

  // Memoize filtered and sorted todos to prevent unnecessary calculations
  const filteredAndSortedTodos = useMemo(() => {
    // First filter todos
    let result = [...todos]

    if (filter === "active") {
      result = result.filter((todo) => !todo.completed)
    } else if (filter === "completed") {
      result = result.filter((todo) => todo.completed)
    }

    // Then sort todos
    return result.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      } else if (sortBy === "dueDate") {
        // Handle todos without due dates
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1

        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      return 0
    })
  }, [todos, filter, sortBy])

  const handleAddTodo = () => {
    navigation.navigate("AddEditTodo")
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FilterBar filter={filter} setFilter={setFilter} sortBy={sortBy} setSortBy={setSortBy} />

      {filteredAndSortedTodos.length > 0 ? (
        <FlatList
          data={filteredAndSortedTodos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TodoItem todo={item} />}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No todos found</Text>
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={handleAddTodo}>
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
  },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    backgroundColor: "#2196F3",
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
})

export default HomeScreen
