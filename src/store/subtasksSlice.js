import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    subtasks: {},
    loading: false,
    error: null
};

const subtasksSlice = createSlice({
    name: "subtasks",
    initialState,
    reducers: {
        loadSubtasksRequest: (state) => { state.loading = true; },
        loadSubtasksSuccess: (state, action) => {
            state.loading = false;
            const { taskId, subtasks } = action.payload;
            state.subtasks[taskId] = subtasks;
        },
        loadSubtasksFailure: (state, action) => { 
            state.loading = false;
            state.error = action.payload;
        },

        createSubtaskRequest: (state) => { state.loading = true; },
        createSubtaskSuccess: (state, action) => {
            state.loading = false;
            const { taskId, subtask } = action.payload;

            if (!state.subtasks[taskId]) {
                state.subtasks[taskId] = [];
            }

            state.subtasks[taskId].push(subtask);
        },
        createSubtaskFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        toggleSubtaskRequest: (state) => { state.loading = true; },
        toggleSubtaskSuccess: (state, action) => {
            state.loading = false;
            const { taskId, subtask } = action.payload;

            const list = state.subtasks[taskId];
            if (!list) return;
            
            const index = list.findIndex(s => s.id === subtask.id);
            if (index !== -1) {
                list[index] = subtask;
            }
        },
        toggleSubtaskFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        deleteSubtaskRequest: (state) => { state.loading = true; },
        deleteSubtaskSuccess(state, action) {
            state.loading = false;
            const { taskId, subtaskId } = action.payload;
            state.subtasks[taskId] =
            state.subtasks[taskId].filter(s => s.id !== subtaskId);
        },
        deleteSubtaskFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        editSubtaskRequest: (state) => { state.loading = true; },
        editSubtaskSuccess: (state, action) => {
            state.loading = false;
            const { taskId, subtask } = action.payload;

            const list = state.subtasks[taskId];
            if (!list) return;

            const index = list.findIndex(s => s.id === subtask.id);
            if (index !== -1) {
                list[index] = subtask;
            }
        },
        editSubtaskFailure: (state, action) => { 
            state.loading = false; 
            state.error = action.payload; 
        },
    }
});

export const {
    createSubtaskRequest,
    createSubtaskSuccess,
    createSubtaskFailure,
    loadSubtasksRequest,
    loadSubtasksSuccess,
    loadSubtasksFailure,
    toggleSubtaskRequest,
    toggleSubtaskSuccess,
    toggleSubtaskFailure,
    deleteSubtaskRequest,
    deleteSubtaskSuccess,
    deleteSubtaskFailure,
    editSubtaskRequest,
    editSubtaskSuccess,
    editSubtaskFailure
} = subtasksSlice.actions;

export default subtasksSlice.reducer;