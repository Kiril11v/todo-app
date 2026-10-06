import { put, takeLatest, call } from "typed-redux-saga";
import { supabase } from "../supabaseClient";

import type { Database } from "../types/supabase";
import type { Task } from "../types/task";

import { removeTaskImages } from "../helpers/helperRemoveImage"
import { createTaskWithSubtasks } from "../api/rpc/createTaskWithSubtasks";
import {
  loadTasksRequest,
  loadTasksSuccess,
  loadTasksFailure,
  createTaskRequest,
  createTaskSuccess,
  createTaskFailure,
  completeTaskRequest,
  completeTaskSuccess,
  completeTaskFailure,
  deleteTaskRequest,
  deleteTaskSuccess,
  deleteTaskFailure,
  editTaskRequest,
  editTaskSuccess,
  editTaskFailure,
  clearAllCompletedTaskRequest,
  clearAllCompletedTaskSuccess,
  clearAllCompletedTaskFailure,
  deleteCompletedTaskRequest,
  deleteCompletedTaskSuccess,
  deleteCompletedTaskFailure,
  archiveTaskRequest,
  archiveTaskSuccess,
  archiveTaskFailure,
  deleteArchiveTaskRequest,
  deleteArchiveTaskSuccess,
  deleteArchiveTaskFailure,
  clearArchiveRequest,
  clearArchiveSuccess,
  clearArchiveFailure,
  restoreArchiveRequest,
  restoreArchiveSuccess,
  restoreArchiveFailure,
} from "./taskSlice";
import { createSubtaskSuccess, createSubtaskFailure, loadSubtasksSuccess } from "./subtasksSlice";

const ARCHIVE_MAX_COUNT = 15;

export interface ArchiveTaskResultPayload {
  archivedTaskId: string;
  deletedTaskId: string | null;
}

function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function* loadTasksSaga() {
  try {
    const { data, error } = yield* call(async () => {
      return await supabase.from('tasks').select('*, subtasks(*)')
    });
 
    if (error) throw error;

    const tasks: Task[] = data.map((t) => ({
      id: t.id,
      title: t.title,
      image_url: t.image_url,
      created_at: t.created_at,
      completed_at: t.completed_at,
      archived_at: t.archived_at,
      deadline: t.deadline,
      failed: t.failed,
    }));
    yield* put(loadTasksSuccess(tasks));

    for (const task of data) {
      yield* put(loadSubtasksSuccess({
        taskId: task.id,
        subtasks: task.subtasks || [],
      }));
    }
  } catch (e) {
    yield* put(loadTasksFailure(getErrorMessage(e)));
  }
}

function* createTaskWithSubtasksSaga(action: ReturnType<typeof createTaskRequest>) {
  const { tempId, title, subtasks, imageFile, imagePreview, deadline } = action.payload;

  try {
    let image_url: string | null = null;

    if (imageFile) {
      const { data: { user } } = yield* call(() => supabase.auth.getUser());
      if (!user) throw new Error("Not authenticated");

      const fileExt = imageFile.name.split(".").pop();
      const filePath = `${user.id}/task_${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = yield* call(() => supabase
        .storage
        .from("task-images")
        .upload(filePath, imageFile)
      ); 

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("task-images").getPublicUrl(uploadData.path);

      image_url = urlData.publicUrl;
    }

    const result = yield* call(() => createTaskWithSubtasks({
      p_title: title,
      p_image_url: image_url,
      p_deadline: deadline,
      p_subtasks: subtasks?.length ? subtasks : []
    }));

    yield* put(createTaskSuccess({ tempId, task: result.task }));
    if (result.subtasks?.length || subtasks?.length) {
      yield* put(createSubtaskSuccess({ 
        tempId, 
        taskId: result.task.id, 
        subtasks: result.subtasks
       }));
    }
  } catch (e) {
      const error = getErrorMessage(e);
    yield* put(createTaskFailure({ tempId, error }));
    if (subtasks?.length) {
      yield* put(createSubtaskFailure({ taskId: tempId, error }));
    }
  } finally {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }
}

function* completeTaskSaga(action: ReturnType<typeof completeTaskRequest>) {
  try {
    const taskId = action.payload;

    const { data: existingTask, error: existingTaskError } = yield* call(async () => {
      return await supabase 
        .from('tasks')
        .select('deadline')
        .eq('id', taskId)
        .single()
    });

    if (existingTaskError) throw existingTaskError;

    const updatePayload: Database["public"]["Tables"]["tasks"]["Update"] = {
      completed_at: new Date().toISOString(),
    };

    if (existingTask.deadline !== null) {
      updatePayload.failed = false;
    }

    const { data: task, error: taskError } = yield* call(async () => {
      return await supabase
        .from('tasks')
        .update(updatePayload)
        .eq('id', taskId)
        .select()
        .single()
    });

    if (taskError) throw taskError;

    const { error: subError } = yield* call(async () => {
      return await supabase
      .from("subtasks")
      .update({ completed: true })
      .eq("task_id", taskId)
    }); 

    if (subError) throw subError;

    yield* put(completeTaskSuccess({ task }));
    
  } catch (e) {
    yield* put(completeTaskFailure(getErrorMessage(e)));
  }
}

function* deleteTaskSaga(action: ReturnType<typeof deleteTaskRequest>) {
  try{
    const id = action.payload;

    const { data: deletedTask, error: deletedTaskError } = yield* call(async () => {
      return await supabase
      .from("tasks")
      .delete()
      .eq('id', id)
      .select('image_url')
    }); 

    if (deletedTaskError) throw deletedTaskError;

    yield* call(removeTaskImages, deletedTask);
    yield* put(deleteTaskSuccess(id));
  } catch (e) {
    yield* put(deleteTaskFailure(getErrorMessage(e)))
  }
}

function* editTaskSaga(action: ReturnType<typeof editTaskRequest>) {
  try{
    const { id, newText } = action.payload;
    const { error: editError } = yield* call(async () => {
      return await supabase
      .from('tasks')
      .update({ title: newText })
      .eq('id', id)
      .select()
      .single()
    });

    if (editError) throw editError; 

    yield* put(editTaskSuccess({ id, newText }));
  } catch (e) {
    yield* put(editTaskFailure(getErrorMessage(e)));
  }
}

function* clearAllCompletedTaskSaga() {
  try{
    const { data, error: clearAllCompletedTasksError } = yield* call(async () => {
      return await supabase
      .from('tasks')
      .delete()
      .not('completed_at', 'is', null)
      .is('archived_at', null)
      .select("image_url")
    });

    if (clearAllCompletedTasksError) throw clearAllCompletedTasksError;

    yield* call(removeTaskImages, data);
    yield* put(clearAllCompletedTaskSuccess());
  } catch (e) {
    yield* put(clearAllCompletedTaskFailure(getErrorMessage(e)));
  }
}

function* deleteCompletedTaskSaga(action: ReturnType<typeof deleteCompletedTaskRequest>) {
  try {
    const id = action.payload;
    const { data, error: deleteCompletedTaskError } = yield* call(async () => {
      return await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .select("image_url")
    });

    if (deleteCompletedTaskError) throw deleteCompletedTaskError;

    yield* call(removeTaskImages, data);
    yield* put(deleteCompletedTaskSuccess(id));
  } catch (e) {
    yield* put(deleteCompletedTaskFailure(getErrorMessage(e)));
  }  
}

function* archiveTaskSaga(action: ReturnType<typeof archiveTaskRequest>) {
  try {
    const id = action.payload;
    
    const { error } = yield* call(async () => {
      return await supabase
      .from('tasks')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
    });

    if (error) throw error;

    const { data: archive, error: archiveError } = yield* call(async() =>{
      return await supabase
      .from('tasks')
      .select('id')
      .not('archived_at', 'is', null)
      .order('archived_at', { ascending: true })
    });

    if (archiveError) throw archiveError;

    let deletedTaskId: string | null = null;

    if (archive.length > ARCHIVE_MAX_COUNT) {
      const oldest = archive[0];
      const { data, error: deleteError } = yield* call(async() => {
        return await supabase
        .from('tasks')
        .delete()
        .eq('id', oldest.id)
        .select('image_url')
      });

      if (deleteError) throw deleteError;

      yield* call(removeTaskImages, data);
      deletedTaskId = oldest.id;
    }

    yield* put(archiveTaskSuccess({ archivedTaskId: id, deletedTaskId }));
  } catch (e) {
    yield* put(archiveTaskFailure(getErrorMessage(e)));
  }
}

function* deleteArchiveTaskSaga(action: ReturnType<typeof deleteArchiveTaskRequest>) {
  try{
    const id = action.payload;
    const { data, error: deleteArchiveTaskError } = yield* call(async () => {
      return await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .select("image_url")
    });

    if (deleteArchiveTaskError) throw deleteArchiveTaskError;

    yield* call(removeTaskImages, data);
    yield* put(deleteArchiveTaskSuccess(id));
  } catch (e) {
    yield* put(deleteArchiveTaskFailure(getErrorMessage(e)));
  }  
}

function* clearArchiveTaskSaga() {
  try{
    const { data, error: clearArchiveTaskError } = yield* call(async () => {
      return await supabase
      .from('tasks')
      .delete()
      .not('archived_at', 'is', null)
      .select("image_url")
    });

    if (clearArchiveTaskError) throw clearArchiveTaskError;

    yield* call(removeTaskImages, data);
    yield* put(clearArchiveSuccess());
  } catch (e) {
    yield* put(clearArchiveFailure(getErrorMessage(e)));
  }
}

function* restoreArchiveTaskSaga(action: ReturnType<typeof restoreArchiveRequest>) {
  try {
    const taskId = action.payload;

    const { error: subError } = yield* call(async () => {
      return await supabase
      .from("subtasks")
      .update({ completed: false })
      .eq("task_id", taskId)
    });

    if (subError) throw subError;

    const { data: task, error: taskError } = yield* call(async () => {
      return await supabase
      .from('tasks')
      .update({
        archived_at: null,
        completed_at: null,
        deadline: null,
        failed: null,
        created_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select('*, subtasks(*)')
      .single()
    });

    if (taskError) throw taskError;

    yield* put(restoreArchiveSuccess({ task }));
  } catch (e) {
    yield* put(restoreArchiveFailure(getErrorMessage(e)));
  }
}

export default function* taskSaga() {
  yield* takeLatest(loadTasksRequest.type, loadTasksSaga);
  yield* takeLatest(createTaskRequest.type, createTaskWithSubtasksSaga);
  yield* takeLatest(completeTaskRequest.type, completeTaskSaga);
  yield* takeLatest(deleteTaskRequest.type, deleteTaskSaga);
  yield* takeLatest(editTaskRequest.type, editTaskSaga);
  yield* takeLatest(clearAllCompletedTaskRequest.type, clearAllCompletedTaskSaga);
  yield* takeLatest(deleteCompletedTaskRequest.type, deleteCompletedTaskSaga);
  yield* takeLatest(archiveTaskRequest.type, archiveTaskSaga);
  yield* takeLatest(deleteArchiveTaskRequest.type, deleteArchiveTaskSaga);
  yield* takeLatest(clearArchiveRequest.type, clearArchiveTaskSaga);
  yield* takeLatest(restoreArchiveRequest.type, restoreArchiveTaskSaga);
}