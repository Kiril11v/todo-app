import { put, takeLatest, select } from "redux-saga/effects";
import { toggleSubtaskRequest, toggleSubtaskSuccess } from "./subtasksSlice";

function saveToLocalStorage(subtasks) {
    localStorage.setItem("subtasksState", JSON.stringify({ completed: subtasks }));
}

function* toggleSubtaskSaga(action) {
    yield put(toggleSubtaskSuccess(action.payload));

    const completed = yield select(s => s.subtasks.completed);

    saveToLocalStorage(completed);
}

export default function* subtasksSaga() {
    yield takeLatest(toggleSubtaskRequest.type, toggleSubtaskSaga);
}