import type { Subtask } from './task.ts';

export interface SubtaskItem extends Subtask {
  _prevCompleted?: boolean;
}

export interface SubtaskGroup {
  items: SubtaskItem[];
}

export interface SubtasksState {
  byTaskId: Record<string, SubtaskGroup>;
  loading: boolean;
  error: string | null;
  subtaskBackup: { id: string; title: string; taskId: string } | null;
}