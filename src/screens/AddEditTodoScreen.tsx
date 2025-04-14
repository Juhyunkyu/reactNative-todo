"use client";

import type React from "react";
import { useState, useContext } from "react";
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
} from "react-native";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { TodoContext } from "../context/TodoContext";
import type { RootStackParamList } from "../types";
import { formatDate } from "../utils/dateUtils";

type AddEditTodoScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AddEditTodo"
>;
type AddEditTodoScreenRouteProp = RouteProp<RootStackParamList, "AddEditTodo">;

const AddEditTodoScreen: React.FC = () => {
  const { addTodo, updateTodo } = useContext(TodoContext);
  const navigation = useNavigation<AddEditTodoScreenNavigationProp>();
  const route = useRoute<AddEditTodoScreenRouteProp>();

  const editingTodo = route.params?.todo;
  const isEditing = !!editingTodo;

  const [title, setTitle] = useState(editingTodo?.title || "");
  const [description, setDescription] = useState(
    editingTodo?.description || ""
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    editingTodo?.priority || "medium"
  );
  const [dueDate, setDueDate] = useState<Date | null>(
    editingTodo?.dueDate ? new Date(editingTodo.dueDate) : null
  );
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("date");

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("오류", "제목을 입력해주세요");
      return;
    }

    try {
      const todoData = {
        id:
          editingTodo?.id ||
          `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        description: description.trim(),
        completed: editingTodo?.completed || false,
        priority: priority,
        dueDate: dueDate?.toISOString() || undefined,
        createdAt: editingTodo?.createdAt || new Date().toISOString(),
      };

      if (editingTodo) {
        await updateTodo(todoData);
      } else {
        await addTodo(todoData);
      }

      navigation.goBack();
    } catch (error) {
      console.error("할일 저장 중 오류 발생:", error);
      Alert.alert("오류", "할일을 저장하는 중 오류가 발생했습니다.");
    }
  };

  const handleDateTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDateTimePicker(false);
    }

    if (selectedDate) {
      if (mode === "date") {
        setDueDate(selectedDate);
        if (Platform.OS === "android") {
          setMode("time");
          setShowDateTimePicker(true);
        }
      } else {
        const currentDate = dueDate || new Date();
        currentDate.setHours(selectedDate.getHours());
        currentDate.setMinutes(selectedDate.getMinutes());
        setDueDate(currentDate);
        setMode("date");
      }
    }
  };

  const renderDatePicker = () => {
    if (Platform.OS === "ios") {
      return (
        <View style={styles.dateTimeContainer}>
          <DateTimePicker
            value={dueDate || new Date()}
            mode="datetime"
            display="spinner"
            onChange={handleDateTimeChange}
            minimumDate={new Date()}
            locale="ko"
          />
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setDueDate(null)}
          >
            <Text style={styles.resetButtonText}>초기화</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        <View style={styles.dateSelectorContainer}>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => {
              setMode("date");
              setShowDateTimePicker(true);
            }}
          >
            <Text style={styles.dateText}>
              {dueDate
                ? `${dueDate.getFullYear()}년 ${
                    dueDate.getMonth() + 1
                  }월 ${dueDate.getDate()}일 ${dueDate.getHours()}시 ${dueDate.getMinutes()}분`
                : "날짜와 시간을 선택하세요"}
            </Text>
            <Feather name="calendar" size={20} color="#757575" />
          </TouchableOpacity>
          {dueDate && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => setDueDate(null)}
            >
              <Text style={styles.resetButtonText}>초기화</Text>
            </TouchableOpacity>
          )}
        </View>
        {showDateTimePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode={mode}
            display="default"
            onChange={handleDateTimeChange}
            minimumDate={new Date()}
            locale="ko"
          />
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="할 일의 제목을 입력하세요"
            maxLength={100}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>설명 (선택사항)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="할 일에 대한 설명을 입력하세요"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>우선순위</Text>
          <View style={styles.priorityContainer}>
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === "low" && styles.priorityButtonActive,
                {
                  backgroundColor:
                    priority === "low" ? "#e8f5e9" : "transparent",
                },
              ]}
              onPress={() => setPriority("low")}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === "low" && { color: "#66bb6a" },
                ]}
              >
                낮음
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === "medium" && styles.priorityButtonActive,
                {
                  backgroundColor:
                    priority === "medium" ? "#fff3e0" : "transparent",
                },
              ]}
              onPress={() => setPriority("medium")}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === "medium" && { color: "#ffa726" },
                ]}
              >
                중간
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === "high" && styles.priorityButtonActive,
                {
                  backgroundColor:
                    priority === "high" ? "#ffebee" : "transparent",
                },
              ]}
              onPress={() => setPriority("high")}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === "high" && { color: "#ef5350" },
                ]}
              >
                높음
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>알람 (선택사항)</Text>
          {renderDatePicker()}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>취소</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>저장</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
  dateTimeContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  dateSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: "#757575",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#2196F3",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  saveButton: {
    backgroundColor: "#2196F3",
  },
  resetButton: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  resetButtonText: {
    color: "#757575",
    fontSize: 14,
  },
});

export default AddEditTodoScreen;
