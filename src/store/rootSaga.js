import { all } from "redux-saga/effects"
import taskSaga from "./taskSaga"
import subtaskSaga from "./subtasksSaga"

export default function* rootSaga() {
    yield all([
        taskSaga(),
        subtaskSaga(),
    ]);
}