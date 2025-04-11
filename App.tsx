"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { SafeAreaView, StatusBar, StyleSheet, AppState, type AppStateStatus } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { TodoProvider } from "./src/context/TodoContext"
import HomeScreen from "./src/screens/HomeScreen"
import AddEditTodoScreen from "./src/screens/AddEditTodoScreen"
import type { RootStackParamList } from "./src/types"

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

const Stack = createNativeStackNavigator<RootStackParamList>()

function App(): React.JSX.Element {
  const [appIsReady, setAppIsReady] = useState(false)

  // Request notification permissions
  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync()
      if (status !== "granted") {
        console.log("Notification permissions not granted")
      }
    }

    requestPermissions()
  }, [])

  // Handle app state changes to reschedule notifications
  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange)
    return () => subscription.remove()
  }, [])

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === "active") {
      // Reschedule notifications when app becomes active
      schedulePendingNotifications()
    }
  }, [])

  // Schedule notifications for pending todos
  const schedulePendingNotifications = useCallback(async () => {
    try {
      // Cancel all scheduled notifications first
      await Notifications.cancelAllScheduledNotificationsAsync()

      // Get todos from storage
      const todosJson = await AsyncStorage.getItem("todos")
      if (todosJson) {
        const todos = JSON.parse(todosJson)

        // Schedule notifications for todos with due dates in the future
        const now = new Date()
        todos.forEach(async (todo) => {
          if (todo.dueDate && !todo.completed) {
            const dueDate = new Date(todo.dueDate)
            if (dueDate > now) {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "Todo Reminder",
                  body: todo.title,
                  data: { todoId: todo.id },
                },
                trigger: {
                  date: dueDate
                },
              })
            }
          }
        })
      }
    } catch (error) {
      console.error("Error scheduling notifications:", error)
    }
  }, [])

  // Initialize app
  useEffect(() => {
    async function prepare() {
      try {
        // Any initialization logic here
        await schedulePendingNotifications()
      } catch (e) {
        console.warn(e)
      } finally {
        setAppIsReady(true)
      }
    }

    prepare()
  }, [schedulePendingNotifications])

  if (!appIsReady) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TodoProvider>
        <NavigationContainer>
          <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Stack.Navigator initialRouteName="Home">
              <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Todo List" }} />
              <Stack.Screen
                name="AddEditTodo"
                component={AddEditTodoScreen}
                options={({ route }) => ({
                  title: route.params?.todo ? "Edit Todo" : "Add Todo",
                })}
              />
            </Stack.Navigator>
          </SafeAreaView>
        </NavigationContainer>
      </TodoProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default App
