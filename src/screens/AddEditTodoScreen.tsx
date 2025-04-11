"use client"

import type React from "react"
import { useState, useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Feather } from "@expo/vector-icons"
import { TodoContext } from "../context/TodoContext"
import type { RootStackParamList } from "../types"
import { formatDate } from "../utils/dateUtils"

type AddEditTodoScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "AddEditTodo">
type AddEditTodoScreenRouteProp = RouteProp<RootStackParamList, "AddEditTodo">

const AddEditTodoScreen: React.FC = () => {
  const { addTodo, updateTodo } = useContext(TodoContext)
  const navigation = useNavigation<AddEditTodoScreenNavigationProp>()
  const route = useRoute<AddEditTodoScreenRouteProp>()

  const editingTodo = route.params?.todo
  const isEditing = !!editingTodo

  const [title, setTitle] = useState(editingTodo?.title || "")
  const [description, setDescription] = useState(editingTodo?.description || "")
  const [priority, setPriority] = useState<"low" | "medium" | "high">(editingTodo?.priority || "medium")
  const [dueDate, setDueDate] = useState<Date | null>(editingTodo?.dueDate ? new Date(editingTodo.dueDate) : null)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your todo")
      return
    }

    try {
      if (isEditing && editingTodo) {
        await updateTodo({
          ...editingTodo,
          title,
          description,
          priority,
          dueDate: dueDate ? dueDate.toISOString() : undefined,
        })
      } else {
        await addTodo({
          title,
          description,
          completed: false,
          priority,
          dueDate: dueDate ? dueDate.toISOString() : undefined,
        })
      }
      navigation.goBack()
    } catch (error) {
      Alert.alert("Error", "Failed to save todo")
      console.error(error)
    }
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios')
    if (selectedDate) {
      setDueDate(selectedDate)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter todo title"
            maxLength={100}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description (optional)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === "low" && styles.priorityButtonActive,
                { backgroundColor: priority === "low" ? "#e8f5e9" : "transparent" },
              ]}
              onPress={() => setPriority("low")}
            >
              <Text style={[styles.priorityText, priority === "low" && { color: "#66bb6a" }]}>Low</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === "medium" && styles.priorityButtonActive,
                { backgroundColor: priority === "medium" ? "#fff3e0" : "transparent" },
              ]}
              onPress={() => setPriority("medium")}
            >
              <Text style={[styles.priorityText, priority === "medium" && { color: "#ffa726" }]}>Medium</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === "high" && styles.priorityButtonActive,
                { backgroundColor: priority === "high" ? "#ffebee" : "transparent" },
              ]}
              onPress={() => setPriority("high")}
            >
              <Text style={[styles.priorityText, priority === "high" && { color: "#ff5252" }]}>High</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Due Date (Optional)</Text>
          {Platform.OS === 'web' ? (
            <input
              type="datetime-local"
              value={dueDate ? dueDate.toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                setDueDate(selectedDate);
              }}
              style={{
                width: '100%',
                padding: 12,
                fontSize: 16,
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#e0e0e0',
                borderRadius: 8,
                marginTop: 8
              }}
            />
          ) : (
            <TouchableOpacity 
              style={[styles.dateButton, { backgroundColor: dueDate ? '#e3f2fd' : 'white' }]} 
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {dueDate ? formatDate(dueDate.toISOString()) : "Set due date"}
              </Text>
              <Feather name="calendar" size={20} color="#757575" />
            </TouchableOpacity>
          )}

          {dueDate && (
            <TouchableOpacity style={styles.clearDateButton} onPress={() => setDueDate(null)}>
              <Text style={styles.clearDateText}>Clear date</Text>
            </TouchableOpacity>
          )}

          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="datetime"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{isEditing ? "Update" : "Add"} Todo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
  },
  priorityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  priorityButtonActive: {
    borderColor: "transparent",
  },
  priorityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  clearDateButton: {
    marginTop: 8,
    alignSelf: "flex-end",
  },
  clearDateText: {
    fontSize: 14,
    color: "#ff5252",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 14,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#757575",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    borderRadius: 8,
    padding: 14,
    marginLeft: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
})

export default AddEditTodoScreen
