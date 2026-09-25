export interface Subtask {
  id: string;
  title: string;
  completed?: boolean;
  is_optimistic?: boolean;
}

export interface Task {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
  completed_at: string | null;
  archived_at: string | null;
  deadline: string | null;
  failed: boolean | null;
  subtasks?: Subtask[];
  is_optimistic?: boolean;
}

export interface TasksState {
  tasks: Task[];
  completedTasks: Task[];
  archivedTasks: Task[];
  loading: boolean;
  error: string | null;
  lastCompletedTask: Task | null;
  taskBackup: { id: string; title: string } | null;
  lastRestoredTask: { task: Task; idx: number } | null;
}