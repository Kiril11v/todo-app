import { configureStore } from "@reduxjs/toolkit"
import createSagaMiddleware from "redux-saga"
import tasksReducer from "./taskSlice"
import subtasksReducer from "./subtasksSlice"
import rootSaga from "./rootSaga"

const saga = createSagaMiddleware();

export const store = configureStore({
    reducer: {
        tasks: tasksReducer,
        subtasks: subtasksReducer
    },
    middleware: (getDefault) => 
        getDefault({thunk: false,  serializableCheck: false })
            .concat(saga),
});

saga.run(rootSaga);