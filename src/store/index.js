import { configureStore } from "@reduxjs/toolkit"
import createSagaMiddleware from "redux-saga"
import tasksReducer from "./taskSlice"
import SubtasksReducer from "./subtasksSlice"
import rootSaga from "./rootSaga"

const saga = createSagaMiddleware();

export const store = configureStore({
    reducer: {
        tasks: tasksReducer,
        subtasks: SubtasksReducer
    },
    middleware: (getDefault) => getDefault({thunk: false}).concat(saga),
});

saga.run(rootSaga);