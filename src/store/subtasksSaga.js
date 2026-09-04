import { put, takeLatest, select } from "redux-saga/effects";
import { supabase } from "../supabaseClient";
import {
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

function* toggleSubtaskSaga(action) {
  const { taskId, subtaskId } = action.payload;

  const newCompleted = yield select(
   state => state.subtasks.byTaskId[taskId]?.items.find(s => s.id === subtaskId).completed
  )

  if (newCompleted === undefined) return;

  const { error } = yield supabase
    .from("subtasks")
    .update({ completed: newCompleted })
    .eq("id", subtaskId)

  if (error) {
    yield put(toggleSubtaskFailure({ taskId, subtaskId ,error: error.message }));
    return;
  }

  yield put(toggleSubtaskSuccess({ taskId, subtaskId, completed: newCompleted }));
}

function* editSubtaskSaga(action) {
  const { taskId, subtaskId, newTitle } = action.payload;

  const { data, error } = yield supabase
    .from("subtasks")
    .update({ title: newTitle })
    .eq("id", subtaskId)
    .select()
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
    yield takeLatest(toggleSubtaskRequest.type, toggleSubtaskSaga);
    yield takeLatest(editSubtaskRequest.type, editSubtaskSaga);
    yield takeLatest(deleteSubtaskRequest.type, deleteSubtaskSaga);
}