import { put, takeLatest, select } from "redux-saga/effects";
import {
  createTaskRequest,
  createTaskSuccess,
  completeTaskRequest,
  completeTaskSuccess,
  deleteTaskRequest,
  deleteTaskSuccess,
  editTaskRequest,
  editTaskSuccess,
  clearAllCompletedTaskRequest,
  clearAllCompletedTaskSuccess,
  deleteCompletedTaskRequest,
  deleteCompletedTaskSuccess,
  archiveOldestTaskRequest,
  archiveOldestTaskSuccess,
  archiveTaskRequest,
  archiveTaskSuccess,
  deleteArchiveTaskRequest,
  deleteArchiveTaskSuccess,
  clearArchiveRequest,
  clearArchiveSuccess,
  restoreArchiveRequest,
  restoreArchiveSuccess
} from "./taskSlice";

import { clearSubtasksForTask } from "./subtasksSlice";

function saveToLocalStorage(tasks, completedTasks, archivedTasks) {
  localStorage.setItem("tasksState", JSON.stringify({ tasks, completedTasks, archivedTasks }));
}

function* createTaskSaga(action) {
  yield put(createTaskSuccess(action.payload));

  const state = yield select((s) => s.tasks);
  saveToLocalStorage(state.tasks, state.completedTasks, state.archivedTasks);
}

function* completeTaskSaga(action) {
  yield put(completeTaskSuccess(action.payload));

  const state = yield select((s) => s.tasks);

  if(state.completedTasks.length > 15) {
    yield put(archiveOldestTaskRequest());
  }

  saveToLocalStorage(state.tasks, state.completedTasks, state.archivedTasks);
}

function* archiveOldestTaskSaga() {
  yield put(archiveOldestTaskSuccess());

  const state = yield select((s) => s.tasks);
  saveToLocalStorage(state.tasks, state.completedTasks, state.archivedTasks);
}

function* deleteTaskSaga(action) {
  yield put(deleteTaskSuccess(action.payload));
  
  const state = yield select((s) => s.tasks);
  saveToLocalStorage(state.tasks, state.completedTasks, state.archivedTasks);
}

function* editTaskSaga(action) {
  yield put(editTaskSuccess(action.payload));

  const state = yield select((s) => s.tasks);
  saveToLocalStorage(state.tasks, state.completedTasks, state.archivedTasks);
}

function* clearAllCompletedTaskSaga() {
  yield put(clearAllCompletedTaskSuccess());

  const state = yield select((s) => s.tasks);
  saveToLocalStorage(state.tasks, state.completedTasks, state.archivedTasks);
}

function* deleteCompletedTaskSaga(action) {
  yield put(deleteCompletedTaskSuccess(action.payload));

  const state = yield select((s) => s.tasks)
  saveToLocalStorage(state.tasks, state.completedTasks, state.archivedTasks);
}

function* archiveTaskSaga(action) {
  yield put(archiveTaskSuccess(action.payload));

  const state = yield select(s => s.tasks);
  saveToLocalStorage(state.tasks, state.completedTasks, state.archivedTasks);
}

function* deleteArchiveTaskSaga(action) {
  yield put(deleteArchiveTaskSuccess(action.payload));

  const state = yield select(s => s.tasks);
  saveToLocalStorage(state.tasks, state.completedTasks, state.archivedTasks);
}

function* clearArchiveTaskSaga() {
  yield put(clearArchiveSuccess());
  
  const state = yield select((s) => s.tasks);
  saveToLocalStorage(state.tasks, state.completedTasks, state.archivedTasks);
}

function* restoreArchiveTaskSaga(action) {
  const id = action.payload;

  yield put(restoreArchiveSuccess(id));

  yield put(clearSubtasksForTask(id));
  
  const state = yield select(s => s.tasks);
  saveToLocalStorage(state.tasks, state.completedTasks, state.archivedTasks);
}

export default function* rootSaga() {
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
}