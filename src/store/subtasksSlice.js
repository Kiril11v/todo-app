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
        }
    }
});

export const {
    toggleSubtaskRequest,
    toggleSubtaskSuccess
} = subtasksSlice.actions;

export default subtasksSlice.reducer;