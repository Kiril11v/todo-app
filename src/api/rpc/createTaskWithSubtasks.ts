import { supabase } from "../../supabaseClient";
import type { Task, Subtask } from "../../types/task";
import type { Database } from "../../types/supabase";

type CreateTaskArgsRaw =
  Database["public"]["Functions"]["create_task_with_subtasks"]["Args"];

type CreateTaskArgs = Omit<
  CreateTaskArgsRaw,
  "p_image_url" | "p_deadline" | "p_subtasks"
> & {
  p_image_url: string | null;
  p_deadline: string | null;
  p_subtasks: { title: string; completed?: boolean; is_optimistic?: boolean }[];
};

interface CreateTaskWithSubtasksResult {
  task: Task;
  subtasks: Subtask[];
}

export async function createTaskWithSubtasks(args: CreateTaskArgs) {
  const rpcArgs: CreateTaskArgsRaw = {
    ...args,
    p_image_url: args.p_image_url ?? undefined,
    p_deadline: args.p_deadline ?? undefined,
    p_subtasks: args.p_subtasks as unknown as CreateTaskArgsRaw["p_subtasks"],
  };

  const { data, error } = await supabase.rpc(
    "create_task_with_subtasks",
    rpcArgs,
  );

  if (error) throw error;

  return data as unknown as CreateTaskWithSubtasksResult;
}
