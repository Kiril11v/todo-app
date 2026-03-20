import { createSlice } from "@reduxjs/toolkit"

const saved = JSON.parse(localStorage.getItem("subtasksState"));

const initialState = {
    completed: saved?.completed || {}
};

const subtasksSlice = createSlice({
    name: "subtasks",
    initialState,
    reducers: {
        toggleSubtaskRequest: () => {},

        toggleSubtaskSuccess: (state, action) => {
            const { taskId, index } = action.payload;

            if (!state.completed[taskId]) {
                state.completed[taskId] = {};
            }

            state.completed[taskId][index] = 
                !state.completed[taskId][index];
        },

        clearSubtasksForTask: (state, action) => {
            const taskId = action.payload;
            delete state.completed[taskId];
        }
    }
});

export const {
    toggleSubtaskRequest,
    toggleSubtaskSuccess,
    clearSubtasksForTask
} = subtasksSlice.actions;

export default subtasksSlice.reducer;