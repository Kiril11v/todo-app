import { put, takeLatest, call } from "redux-saga/effects";
import { supabase } from "../supabaseClient";
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
import { createSubtaskSuccess, loadSubtasksSuccess } from "./subtasksSlice";

function* loadTasksSaga() {
  try {
    const { data, error } = yield call(() => supabase
      .from('tasks')
      .select('*, subtasks(*)')
    );
 
    if (error) throw error;

    const tasks = data.map(t => ({
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
        subtasks: task.subtasks || []
      }));
    }
  } catch (e) {
    yield put(loadTasksFailure(e.message));
  }
}

function* createTaskWithSubtasksSaga(action) {
  const { tempId, title, subtasks, imageFile, imagePreview, deadline } = action.payload;

  try {
    let image_url = null;

    if (imageFile) {
      const fileName = `task_${Date.now()}.${imageFile.name.split(".").pop()}`;

      const { data: uploadData, error: uploadError } = yield supabase.storage
      .from("task-images")
      .upload(fileName, imageFile)

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
      .from("task-images")
      .getPublicUrl(uploadData.path);

      image_url = urlData.publicUrl;
    }

    const { data, error: taskError } = yield supabase.rpc('create_task_with_subtasks', {
      p_title: title,
      p_image_url: image_url,
      p_deadline: deadline,
      p_subtasks: subtasks?.length ? subtasks : []
    });

    if (taskError) throw taskError;

    yield put(createTaskSuccess({ tempId, task: data.task }));
    if (data.subtasks?.length || subtasks?.length) {
      yield put(createSubtaskSuccess({ tempId, taskId: data.task.id, subtasks: data.subtasks }));
    }
  } catch (e) {
    yield put(createTaskFailure({ tempId, error: e.message }));
    if (subtasks?.length) {
      yield put(createSubtaskFailure({ taskId: tempId, error: e.message }));
    }
  } finally {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }
}

function* completeTaskSaga(action) {
  try {
    const taskId = action.payload;

    const { data: existingTask, error: existingTaskError } = yield supabase
    .from('tasks')
    .select('deadline')
    .eq('id', taskId)
    .single();

    if (existingTaskError) throw existingTaskError;

    const updatePayload = {
      completed_at: new Date().toISOString(),
    };

    if (existingTask.deadline !== null) {
      updatePayload.failed = false;
    }

    const { data: task, error: taskError } = yield supabase.from('tasks')
    .update(updatePayload)
    .eq('id', taskId)
    .select()
    .single();

    if (taskError) throw taskError;

    const {data: updatedSubtaks, error: subError } = yield supabase
      .from("subtasks")
      .update({ completed: true })
      .eq("task_id", taskId)
      .select();

    if (subError) throw subError;

    yield put(completeTaskSuccess({ task }));

    yield put(archiveOldestTaskRequest());
    
  } catch (e) {
    yield put(completeTaskFailure(e.message));
  }
}

function* archiveOldestTaskSaga() {
  try {
    const MAX_COUNT = 15;

    const { data: completed, error } = yield supabase.from('tasks')
    .select('id, completed_at')
    .not('completed_at', 'is', null)
    .is('archived_at', null)
    .order('completed_at', { ascending: true }); // от старых к новым

    if (error) throw error;

    let archivedTaskId = null;

    if (completed.length > MAX_COUNT) {
      const oldest = completed[0];
      const { error: completedError } = yield supabase.from('tasks')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', oldest.id);

      archivedTaskId = oldest.id;

      if (completedError) throw completedError;
    }

    const { data: archive, error: archiveError } = yield supabase.from('tasks')
    .select('id, completed_at')
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: true }); 

    if (archiveError) throw archiveError;

    let deletedTaskId = null;

    if (archive.length > MAX_COUNT) {
      const taskToDelete = archive[0];
      const { error: deleteError } = yield supabase.from('tasks')
      .delete()
      .eq('id', taskToDelete.id)

      if (deleteError) throw deleteError
      deletedTaskId = taskToDelete.id;
    }

    yield put(archiveOldestTaskSuccess({
      archivedTaskId,
      deletedTaskId
    }));

    yield put(loadTasksRequest());

  } catch (e) {
    yield put(archiveOldestTaskFailure(e.message));
  }
}

function* deleteTaskSaga(action) {
  try{
    const id = action.payload;

    const { data: deletedTask, error: deletedTaskError } = yield supabase
    .from("tasks")
    .delete()
    .eq('id', id)
    .select('image_url')
    .single();

    if (deletedTaskError) throw deletedTaskError;

    if (deletedTask?.image_url) {
      const fileName = deletedTask.image_url.split('/').pop();
      yield supabase.storage
      .from('task-images')
      .remove([fileName]);
    }

    yield put(deleteTaskSuccess(id));
  } catch (e) {
    yield put(deleteTaskFailure(e.message))
  }
}

function* editTaskSaga(action) {
  const { id, newText } = action.payload;
  const { error } = yield supabase
  .from('tasks')
  .update({ title: newText })
  .eq('id', id)
  .select()
  .single();
  if (error) return yield put(editTaskFailure(error.message));
  yield put(editTaskSuccess({ id, newText }));
}

function* clearAllCompletedTaskSaga() {
  const { error } = yield supabase.from('tasks')
    .delete()
    .not('completed_at', 'is', null)
    .is('archived_at', null)

  if (error) {
    yield put(clearAllCompletedTaskFailure(error.message));
  } 
  else {
    yield put(clearAllCompletedTaskSuccess());
  }
}

function* deleteCompletedTaskSaga(action) {
  const id = action.payload;
  const { error } = yield supabase.from('tasks').delete()
    .eq('id', id);
  if (error) return yield put(deleteCompletedTaskFailure(error.message));
  yield put(deleteCompletedTaskSuccess(id));
}

function* archiveTaskSaga(action) {
  try {
    const id = action.payload;
    const { error } = yield supabase.from('tasks')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

    if (error) throw error;

    yield put(archiveTaskSuccess(id));
 
    yield put(archiveOldestTaskRequest());

  } catch (e) {
    yield put(archiveTaskFailure(e.message));
  }
}

function* deleteArchiveTaskSaga(action) {
  const id = action.payload;
  const { error } = yield supabase.from('tasks').delete()
  .eq('id', id);
  if (error) return yield put(deleteArchiveTaskFailure(error.message));
    yield put(deleteArchiveTaskSuccess(id));
}

function* clearArchiveTaskSaga() {
  const { error } = yield supabase.from('tasks')
    .delete()
    .not('archived_at', 'is', null)

  if (error) return yield put(clearArchiveFailure(error.message));
  yield put(clearArchiveSuccess());
}

function* restoreArchiveTaskSaga(action) {
  try {
    const taskId = action.payload;
    const { error: subError } = yield supabase
      .from("subtasks")
      .update({ completed: false })
      .eq("task_id", taskId);
    if (subError) throw subError;
    const { data: task, error: taskError } = yield supabase.from('tasks')
      .update({
        archived_at: null,
        completed_at: null,
        deadline: null,
        failed: null,
        created_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select('*, subtasks(*)')
      .single();
    if (taskError) throw taskError;
    yield put(restoreArchiveSuccess({ task }));
  } catch (e) {
    yield put(restoreArchiveFailure(e.message));
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