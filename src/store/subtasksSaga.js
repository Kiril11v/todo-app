import { put, takeLatest } from "redux-saga/effects";
import { supabase } from "../supabaseClient";
import {
  loadSubtasksRequest,
  loadSubtasksSuccess,
  loadSubtasksFailure,
  createSubtaskRequest,
  createSubtaskSuccess,
  createSubtaskFailure,
  toggleSubtaskRequest,
  toggleSubtaskSuccess,
  toggleSubtaskFailure,
  editSubtaskRequest,
  editSubtaskSuccess,
  editSubtaskFailure,
  deleteSubtaskRequest,
  deleteSubtaskSuccess,
  deleteSubtaskFailure
} from "./subtasksSlice";

function* loadSubtasksSaga(action) {
  const taskId = action.payload;

  const { data, error } = yield supabase
    .from("subtasks")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) {
    return yield put(loadSubtasksFailure(error.message));
  }

  yield put(loadSubtasksSuccess({ taskId, subtasks: data }));
}

function* createSubtaskSaga(action) {
  const { taskId, title } = action.payload;

  const { data, error } = yield supabase
    .from("subtasks")
    .insert({ task_id: taskId, title, completed: false })
    .single();

  if (error) {
    return yield put(createSubtaskFailure(error.message));
  }

  yield put(createSubtaskSuccess({ taskId, subtask: data }));
}

function* toggleSubtaskSaga(action) {
  const { taskId, subtaskId, completed } = action.payload;

  const { data, error } = yield supabase
    .from("subtasks")
    .update({ completed })
    .eq("id", subtaskId)
    .single();

  if (error) {
    return yield put(toggleSubtaskFailure(error.message));
  }

  yield put(toggleSubtaskSuccess({ taskId, subtask: data }));
}

function* editSubtaskSaga(action) {
  const { taskId, subtaskId, newTitle } = action.payload;

  const { data, error } = yield supabase
    .from("subtasks")
    .update({ title: newTitle })
    .eq("id", subtaskId)
    .single();

  if (error) {
    return yield put(editSubtaskFailure(error.message));
  }

  yield put(editSubtaskSuccess({ taskId, subtask: data }));
}

function* deleteSubtaskSaga(action) {
  const { taskId, subtaskId } = action.payload;

  const { error } = yield supabase
    .from("subtasks")
    .delete()
    .eq("id", subtaskId);

  if (error) {
    return yield put(deleteSubtaskFailure(error.message));
  }

  yield put(deleteSubtaskSuccess({ taskId, subtaskId }));
}

export default function* subtasksSaga() {
    yield takeLatest(loadSubtasksRequest.type, loadSubtasksSaga);
    yield takeLatest(createSubtaskRequest.type, createSubtaskSaga);
    yield takeLatest(toggleSubtaskRequest.type, toggleSubtaskSaga);
    yield takeLatest(editSubtaskRequest.type, editSubtaskSaga);
    yield takeLatest(deleteSubtaskRequest.type, deleteSubtaskSaga);
}