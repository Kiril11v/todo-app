import { fork, call, put } from "redux-saga/effects"
import { ensureSession } from "../helper/authHelper"
import { loadTasksRequest } from "./taskSlice"
import taskSaga from "./taskSaga"
import subtaskSaga from "./subtasksSaga"

export default function* rootSaga() {
    yield fork(taskSaga);
    yield fork(subtaskSaga);

    yield call(ensureSession);
    yield put(loadTasksRequest());
}