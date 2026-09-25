import { put, takeLatest, call } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../supabaseClient";
import type { Task, Subtask } from "../types/task";
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
  archiveOldestTaskRequest,
  archiveOldestTaskSuccess,
  archiveOldestTaskFailure,
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

interface RpcCreateTaskResult {
  task: Task;
  subtasks: Subtask[];
}

interface ArchiveOldestResultPayload {
  archivedTaskId: string | null;
  deletedTaskId: string | null;
}

function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function* loadTasksSaga() {
  try {
    const { data, error } = yield call(() => supabase
      .from('tasks')
      .select('*, subtasks(*)')
    );
 
    if (error) throw error;

    const tasks: Task[] = data.map((t: any) => ({
      id: t.id,
      title: t.title,
      image_url: t.image_url,
      created_at: t.created_at,
      completed_at: t.completed_at,
      archived_at: t.archived_at,
      deadline: t.deadline,
      failed: t.failed,
    }));
    yield put(loadTasksSuccess(tasks));

    for (const task of data) {
      yield put(loadSubtasksSuccess({
        taskId: task.id,
        subtasks: task.subtasks || [],
      }));
    }
  } catch (e) {
    yield put(loadTasksFailure(getErrorMessage(e)));
  }
}

function* createTaskWithSubtasksSaga(action: ReturnType<typeof createTaskRequest>) {
  const { tempId, title, subtasks, imageFile, imagePreview, deadline } = action.payload;

  try {
    let image_url: string | null = null;

    if (imageFile) {
      const fileName = `task_${Date.now()}.${imageFile.name.split(".").pop()}`;

      const { data: uploadData, error: uploadError } = yield call(() => supabase
        .storage
        .from("task-images")
        .upload(fileName, imageFile)
      ); 

      if (uploadError) throw uploadError;

      const { data: urlData } = yield call(() => supabase
        .storage
        .from("task-images")
        .getPublicUrl(uploadData.path)
      );

      image_url = urlData.publicUrl;
    }

    const { data, error: taskError } = yield call(() => supabase
      .rpc('create_task_with_subtasks', {
        p_title: title,
        p_image_url: image_url,
        p_deadline: deadline,
        p_subtasks: subtasks?.length ? subtasks : []
      })
    );

    if (taskError) throw taskError;

    const result = data as RpcCreateTaskResult;

    yield put(createTaskSuccess({ tempId, task: result.task }));
    if (result.subtasks?.length || subtasks?.length) {
      yield put(createSubtaskSuccess({ 
        tempId, 
        taskId: result.task.id, 
        subtasks: result.subtasks
       }));
    }
  } catch (e) {
      const error = getErrorMessage(e);
    yield put(createTaskFailure({ tempId, error }));
    if (subtasks?.length) {
      yield put(createSubtaskFailure({ taskId: tempId, error }));
    }
  } finally {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }
}

function* completeTaskSaga(action: ReturnType<typeof completeTaskRequest>) {
  try {
    const taskId = action.payload;

    const { data: existingTask, error: existingTaskError } = yield call(() => supabase 
      .from('tasks')
      .select('deadline')
      .eq('id', taskId)
      .single()
    );

    if (existingTaskError) throw existingTaskError;

    const updatePayload = {
      completed_at: new Date().toISOString(),
    };

    if (existingTask.deadline !== null) {
      updatePayload.failed = false;
    }

    const { data: task, error: taskError } = yield call(() => supabase
      .from('tasks')
      .update(updatePayload)
      .eq('id', taskId)
      .select()
      .single()
    );

    if (taskError) throw taskError;

    const { error: subError } = yield call(() => supabase
      .from("subtasks")
      .update({ completed: true })
      .eq("task_id", taskId)
      .select()
    ); 

    if (subError) throw subError;

    yield put(completeTaskSuccess({ task }));

    yield put(archiveOldestTaskRequest());
    
  } catch (e) {
    yield put(completeTaskFailure(getErrorMessage(e)));
  }
}

function* archiveOldestTaskSaga() {
  try {
    const MAX_COUNT = 15;

    const { data: completed, error } = yield call(() => supabase
      .from('tasks')
      .select('id, completed_at')
      .not('completed_at', 'is', null)
      .is('archived_at', null)
      .order('completed_at', { ascending: true })
    ); 

    if (error) throw error;

    let archivedTaskId: string | null = null;

    if (completed.length > MAX_COUNT) {
      const oldest = completed[0];
      const { error: completedError } = yield call(() => supabase
        .from('tasks')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', oldest.id)
      );

      archivedTaskId = oldest.id;

      if (completedError) throw completedError;
    }

    const { data: archive, error: archiveError } = yield call(() => supabase
      .from('tasks')
      .select('id, completed_at')
      .not('archived_at', 'is', null)
      .order('archived_at', { ascending: true })
    );

    if (archiveError) throw archiveError;

    let deletedTaskId: string | null = null;

    if (archive.length > MAX_COUNT) {
      const taskToDelete = archive[0];
      const { error: deleteError } = yield call(() => supabase
        .from('tasks')
        .delete()
        .eq('id', taskToDelete.id)
      ); 

      if (deleteError) throw deleteError
      deletedTaskId = taskToDelete.id;
    }

    const payload: ArchiveOldestResultPayload = { archivedTaskId, deletedTaskId };

    yield put(archiveOldestTaskSuccess(payload));

    yield put(loadTasksRequest());

  } catch (e) {
    yield put(archiveOldestTaskFailure(getErrorMessage(e)));
  }
}

function* deleteTaskSaga(action: ReturnType<typeof deleteTaskRequest>) {
  try{
    const id = action.payload;

    const { data: deletedTask, error: deletedTaskError } = yield call(() => supabase
      .from("tasks")
      .delete()
      .eq('id', id)
      .select('image_url')
      .single()
    ); 

    if (deletedTaskError) throw deletedTaskError;

    if (deletedTask?.image_url) {
      const fileName = deletedTask.image_url.split('/').pop();
      yield call(() => supabase
        .storage
        .from('task-images')
        .remove([fileName])
      ); 
    }

    yield put(deleteTaskSuccess(id));
  } catch (e) {
    yield put(deleteTaskFailure(getErrorMessage(e)))
  }
}

function* editTaskSaga(action: ReturnType<typeof editTaskRequest>) {
  const { id, newText } = action.payload;
  const { error } = yield call(() => supabase
    .from('tasks')
    .update({ title: newText })
    .eq('id', id)
    .select()
    .single()
  ); 
  if (error) return yield put(editTaskFailure(error.message));
  yield put(editTaskSuccess({ id, newText }));
}

function* clearAllCompletedTaskSaga() {
  const { error } = yield call(() => supabase
    .from('tasks')
    .delete()
    .not('completed_at', 'is', null)
    .is('archived_at', null))

  if (error) {
    yield put(clearAllCompletedTaskFailure(error.message));
  } 
  else {
    yield put(clearAllCompletedTaskSuccess());
  }
}

function* deleteCompletedTaskSaga(action: ReturnType<typeof deleteCompletedTaskRequest>) {
  const id = action.payload;
  const { error } = yield call(() => supabase
    .from('tasks')
    .delete()
    .eq('id', id)
  );
  if (error) return yield put(deleteCompletedTaskFailure(error.message));
  yield put(deleteCompletedTaskSuccess(id));
}

function* archiveTaskSaga(action: ReturnType<typeof archiveTaskRequest>) {
  try {
    const id = action.payload;
    const { error } = yield call(() => supabase
      .from('tasks')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    )

    if (error) throw error;

    yield put(archiveTaskSuccess(id));
 
    yield put(archiveOldestTaskRequest());

  } catch (e) {
    yield put(archiveTaskFailure(getErrorMessage(e)));
  }
}

function* deleteArchiveTaskSaga(action: ReturnType<typeof deleteArchiveTaskRequest>) {
  const id = action.payload;
  const { error } = yield call(() => supabase
    .from('tasks')
    .delete()
    .eq('id', id)
  );
  if (error) return yield put(deleteArchiveTaskFailure(error.message));
    yield put(deleteArchiveTaskSuccess(id));
}

function* clearArchiveTaskSaga() {
  const { error } = yield call(() => supabase
    .from('tasks')
    .delete()
    .not('archived_at', 'is', null)
  );

  if (error) return yield put(clearArchiveFailure(error.message));
  yield put(clearArchiveSuccess());
}

function* restoreArchiveTaskSaga(action: ReturnType<typeof restoreArchiveRequest>) {
  try {
    const taskId = action.payload;
    const { error: subError } = yield call(() =>supabase
      .from("subtasks")
      .update({ completed: false })
      .eq("task_id", taskId)
    );
    if (subError) throw subError;
    const { data: task, error: taskError } = yield call(() => supabase
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
    );
    if (taskError) throw taskError;
    yield put(restoreArchiveSuccess({ task }));
  } catch (e) {
    yield put(restoreArchiveFailure(getErrorMessage(e)));
  }
}

export default function* taskSaga() {
  yield takeLatest(loadTasksRequest.type, loadTasksSaga);
  yield takeLatest(createTaskRequest.type, createTaskWithSubtasksSaga);
  yield takeLatest(completeTaskRequest.type, completeTaskSaga);
  yield takeLatest(deleteTaskRequest.type, deleteTaskSaga);
  yield takeLatest(editTaskRequest.type, editTaskSaga);
  yield takeLatest(clearAllCompletedTaskRequest.type, clearAllCompletedTaskSaga);
  yield takeLatest(deleteCompletedTaskRequest.type, deleteCompletedTaskSaga);
  yield takeLatest(archiveOldestTaskRequest.type, archiveOldestTaskSaga);
  yield takeLatest(archiveTaskRequest.type, archiveTaskSaga);
  yield takeLatest(deleteArchiveTaskRequest.type, deleteArchiveTaskSaga);
  yield takeLatest(clearArchiveRequest.type, clearArchiveTaskSaga);
  yield takeLatest(restoreArchiveRequest.type, restoreArchiveTaskSaga);
}