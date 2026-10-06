import { fork, call, put } from "typed-redux-saga"
import { ensureSession } from "../helpers/helperAuth.ts"
import { loadTasksRequest } from "./taskSlice.ts"
import taskSaga from "./taskSaga.ts"
import subtaskSaga from "./subtasksSaga.ts"

export default function* rootSaga() {
    yield* fork(taskSaga);
    yield* fork(subtaskSaga);

    yield* call(ensureSession);
    yield* put(loadTasksRequest());
}