import { all, call } from "redux-saga/effects"
import { ensureSession } from "../helpers/authHelpers"
import taskSaga from "./taskSaga"
import subtaskSaga from "./subtasksSaga"

export default function* rootSaga() {
    yield call(ensureSession);
    yield all([
        taskSaga(),
        subtaskSaga(),
    ]);
}