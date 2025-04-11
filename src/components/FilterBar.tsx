import type React from "react"
import { memo } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Feather } from "@expo/vector-icons"

type FilterType = "all" | "active" | "completed"
type SortType = "date" | "priority" | "dueDate"

type FilterBarProps = {
  filter: FilterType
  setFilter: (filter: FilterType) => void
  sortBy: SortType
  setSortBy: (sortBy: SortType) => void
}

// Using memo to prevent unnecessary re-renders
const FilterBar: React.FC<FilterBarProps> = memo(({ filter, setFilter, sortBy, setSortBy }) => {
  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.activeFilter]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "active" && styles.activeFilter]}
          onPress={() => setFilter("active")}
        >
          <Text style={[styles.filterText, filter === "active" && styles.activeFilterText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "completed" && styles.activeFilter]}
          onPress={() => setFilter("completed")}
        >
          <Text style={[styles.filterText, filter === "completed" && styles.activeFilterText]}>Completed</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            const nextSort: SortType = sortBy === "date" ? "priority" : sortBy === "priority" ? "dueDate" : "date"
            setSortBy(nextSort)
          }}
        >
          <Text style={styles.sortText}>
            {sortBy === "date" ? "Date Created" : sortBy === "priority" ? "Priority" : "Due Date"}
          </Text>
          <Feather name="chevron-down" size={16} color="#757575" />
        </TouchableOpacity>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterContainer: {
    flexDirection: "row",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: "#e3f2fd",
  },
  filterText: {
    fontSize: 14,
    color: "#757575",
  },
  activeFilterText: {
    color: "#2196F3",
    fontWeight: "600",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortLabel: {
    fontSize: 14,
    color: "#757575",
    marginRight: 4,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  sortText: {
    fontSize: 14,
    color: "#2196F3",
    marginRight: 4,
  },
})

export default FilterBar
