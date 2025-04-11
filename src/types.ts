export type Todo = {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  dueDate?: string
  createdAt: string
}

export type TodoContextType = {
  todos: Todo[]
  addTodo: (todo: Omit<Todo, "id" | "createdAt">) => Promise<void>
  updateTodo: (todo: Todo) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  toggleTodoStatus: (id: string) => Promise<void>
  loading: boolean
}

export type RootStackParamList = {
  Home: undefined
  AddEditTodo: { todo?: Todo }
}
  