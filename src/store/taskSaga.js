import { put, takeLatest } from "redux-saga/effects";
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
  // editSubtaskRequest,
  // editSubtaskSuccess,
  // editSubtaskFailure,
  // deleteSubtaskRequest,
  // deleteSubtaskSuccess,
  // deleteSubtaskFailure
} from "./taskSlice";

function* loadTasksSaga() {
  const { data, error } = yield supabase.from('tasks').select('*');
  if (error) return yield put(loadTasksFailure(error.message));
  yield put(loadTasksSuccess(data));
}

function* createTaskSaga(action) {
  const { title } = action.payload
  const { data, error } = yield supabase
  .from('tasks')
  .insert({ title })
  .select()
  .single();
  
  if (error) return yield put(createTaskFailure(error.message));
  yield put(createTaskSuccess(data));
}

function* completeTaskSaga(action) {
  const id = action.payload;
  const { data, error } = yield supabase.from('tasks').update({ completed_at: new Date().toISOString(), archived: false }).eq('id', id).single();
  if (error) return yield put(completeTaskFailure(error.message));
  yield put(completeTaskSuccess(data));

  const { data: completed } = yield supabase.from('tasks').select('*').not('completed_at', 'is', null).eq('archived', false);
  if (completed.length > 15) {
    yield call (archiveOldestTaskRequest());
  }
}

function* archiveOldestTaskSaga() {
  const { data: completed, error } = yield supabase.from('tasks').select('*')
  .not('completed_at', 'is', null).eq('archived', false).order('completed_at', { ascending: true }).limit(1);

  if (error) return yield put(archiveOldestTaskFailure(error.message));
  if (completed.length > 0) {
    const oldest = completed[0];
    const { error: updateError } = yield supabase.from('tasks').update({ archived: true }).eq('id', oldest.id);
    if (updateError) return yield put(archiveOldestTaskFailure(updateError.message));
  } 
  yield put(archiveOldestTaskSuccess());
}

function* deleteTaskSaga(action) {
  const id = action.payload;
  const{ error } = yield supabase.from('tasks').delete().eq('id', id);
  if ( error ) return yield put(deleteTaskFailure(error.message));
  yield put(deleteTaskSuccess(id));
}

function* editTaskSaga(action) {
  const { id, newText } = action.payload;
  const { data, error } = yield supabase.from('tasks').update({ title: newText }).eq('id', id).single();
  if (error) return yield put(editTaskFailure(error.message));
  yield put(editTaskSuccess({ id, newText }));
}

function* clearAllCompletedTaskSaga() {
  const { data: completedTasks } = yield supabase.from('tasks')
  .select('id')
  .not('completed_at', 'is', null)
  .eq('archived', false);

  const { error } = yield supabase.from('tasks')
    .delete()
    .not('completed_at', 'is', null)
    .eq('archived', false);
  if (error) return yield put(clearAllCompletedTaskFailure(error.message));
  for( const task of completedTasks) {
    yield put(clearSubtasksForTask(task.id))
  }
  yield put(clearAllCompletedTaskSuccess());
}

function* deleteCompletedTaskSaga(action) {
  const id = action.payload;
  const { error } = yield supabase.from('tasks').delete()
    .eq('id', id);
  if (error) return yield put(deleteCompletedTaskFailure(error.message));
  yield put(deleteCompletedTaskSuccess(id));
}

function* archiveTaskSaga(action) {
  const id = action.payload;
  const { data, error } = yield supabase.from('tasks').update({ archived: true })
    .eq('id', id)
    .single();
  if (error) return yield put(archiveTaskFailure(error.message));
  yield put(archiveTaskSuccess(id));
}

function* deleteArchiveTaskSaga(action) {
  const id = action.payload;
  const { error } = yield supabase.from('tasks').delete()
  .eq('id', id);
  if (error) return yield put(deleteArchiveTaskFailure(error.message));
  yield put(deleteArchiveTaskSuccess(id));
}

function* clearArchiveTaskSaga() {
  const { data: archivedTasks } = yield supabase.from('tasks')
    .select('id')
    .eq('archived', true);
  const { error } = yield supabase.from('tasks')
    .delete()
    .eq('archived', true);

  if (error) return yield put(clearArchiveFailure(error.message));
  for (const task of archivedTasks) {
    yield put(clearSubtasksForTask(task.id));
  }
  yield put(clearArchiveSuccess());
}

function* restoreArchiveTaskSaga(action) {
  const id = action.payload;
  const { data, error } = yield supabase.from('tasks')
  .update({ archived: false, completed_at: null })
  .eq('id', id)
  .single();
  if (error) return yield put(restoreArchiveFailure(error.message));
  yield put(restoreArchiveSuccess(id));
}

// function* editSubtaskSaga(action) {
//   yield put(editSubtaskSuccess(action.payload));

// }

export default function* taskSaga() {
  yield takeLatest(loadTasksRequest.type, loadTasksSaga);
  yield takeLatest(createTaskRequest.type, createTaskSaga);
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
  // yield takeLatest(editSubtaskRequest.type, editSubtaskSaga);
}