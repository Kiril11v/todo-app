import type { Task } from "../types/task";

export function toDateInputValue(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isTaskFailed(
  task: Pick<Task, "failed" | "deadline">,
  now: Date,
): boolean {
  if (task.failed) return true;
  if (!task.deadline) return false;
  return task.deadline < toDateInputValue(now);
}

export function formatDeadline(dateStr: string): string {
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}.${mm}.${yyyy}`;
}
