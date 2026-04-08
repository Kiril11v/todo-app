export interface Task {
    id: string;
    title: string;
    completedAt?: string;
}

export interface TasksState {
    tasks: Task[];
    completedTasks: Task[];
    archivedTasks: Task[];
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completedAt?: string;
}

export interface SubtasksState {
  subtasks: Subtask[];
  completedSubtasks: Subtask[];
}

export interface RootState {
    tasks: TasksState;
    subtasks: SubtasksState;
}