import { createSlice } from "@reduxjs/toolkit"
import { createTaskRequest, restoreArchiveSuccess } from "./taskSlice";

const initialState = {
    byTaskId: {},
    loading: false,
    error: null,
    subtaskBackup: null,
};

const subtasksSlice = createSlice({
    name: "subtasks",
    initialState,
    reducers: {
        loadSubtasksRequest: () => {},
        loadSubtasksSuccess: (state, action) => {
            const { taskId, subtasks } = action.payload;

            state.byTaskId[taskId] = {
                items: subtasks.map(s => ({
                    id: s.id,
                    title: s.title,
                    completed: s.completed ?? false
                }))
            }
        },
        loadSubtasksFailure: (state, action) => { 
            state.loading = false;
            state.error = action.payload;
        },

        createSubtaskSuccess: (state, action) => {
            state.loading = false;
            const { tempId, taskId, subtasks } = action.payload;

            if (tempId && tempId !== taskId) {
                delete state.byTaskId[tempId];
            }

            state.byTaskId[taskId] = {
                items: (subtasks || []).map(s => ({
                    id: s.id,
                    title: s.title,
                    completed: s.completed ?? false,
                }))
            };
        },
        createSubtaskFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload.error;

            const { taskId } = action.payload;
            if (taskId && state.byTaskId[taskId]) {
                delete state.byTaskId[taskId];
            }
        },

        toggleSubtaskRequest: (state, action) => {
            const { taskId, subtaskId } = action.payload;

            const list = state.byTaskId[taskId]?.items;
            if (!list) return;

            const subtask = list.find(s => s.id === subtaskId);
            if (subtask) {
                subtask._prevCompleted = subtask.completed;
                subtask.completed = !subtask.completed;
            }
        },
        toggleSubtaskSuccess: (state, action) => {
            const { taskId, subtaskId } = action.payload;

            const list = state.byTaskId[taskId]?.items;
            if (!list) return;

            const subtask = list.find(s => s.id === subtaskId);
            if (subtask) delete subtask._prevCompleted; 
        },
        toggleSubtaskFailure: (state, action) => {
            const { taskId, subtaskId, error } = action.payload;
            state.error = error;

            const subtask = state.byTaskId[taskId]?.items.find(s => s.id === subtaskId);
            if (subtask && subtask._prevCompleted !== undefined) {
                subtask.completed = subtask._prevCompleted; // откатываем при ошибке
                delete subtask._prevCompleted;
            }
        },

        deleteSubtaskRequest: () => {},
        deleteSubtaskSuccess(state, action) {
            state.loading = false;
            const { taskId, subtaskId } = action.payload;

            const task = state.byTaskId[taskId];

            task.items = task.items.filter(s => s.id !== subtaskId);
        },
        deleteSubtaskFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        editSubtaskRequest: (state, action) => {
            state.loading = true;
            const { taskId, subtaskId, newTitle } = action.payload;

            const list = state.byTaskId[taskId]?.items;
            if (!list) {
                state.loading = false;
                return;
            }

            const subtask = list.find(s => s.id === subtaskId);
            if (subtask) {
                state.subtaskBackup = { id: subtaskId, title: subtask.title, taskId }
                subtask.title = newTitle;
            } else {
                state.loading = false;
            }
        },
        editSubtaskSuccess: (state) => {
            state.loading = false;
            state.subtaskBackup = null;
        },
        editSubtaskFailure: (state, action) => { 
            state.loading = false; 
            state.error = action.payload; 
            if (state.subtaskBackup) {
                const list = state.byTaskId[state.subtaskBackup.taskId]?.items;
                if (list) {
                     const subtask = list.find(s => s.id === state.subtaskBackup.id);
                    if (subtask) {
                        subtask.title = state.subtaskBackup.title;
                    }
                }
                state.subtaskBackup = null;
            }
        },

        completeAllSubtasksSuccess: (state, action) => {
            const { taskId, subtasks } = action.payload;

            if (!state.byTaskId[taskId]) return;

            state.byTaskId[taskId].items = subtasks.map(s => ({
                ...s,
                completed: true
            }));
        },
    },
    extraReducers: (builder) => {
        builder.addCase(createTaskRequest, (state, action) => {
            const { tempId, subtasks } = action.payload;
            if (!subtasks?.length) return;

            state.byTaskId[tempId] = {
                items: subtasks.map((s, i) => ({
                    id: `${tempId}_sub_${i}`,
                    title: s.title,
                    is_optimistic: true,
                }))
            };
        });

        builder.addCase(restoreArchiveSuccess, (state, action) => {
            const { task } = action.payload;
            if (!task) return;

            const taskId = task.id;
            if (state.byTaskId[taskId]) {
                state.byTaskId[taskId].items = state.byTaskId[taskId].items.map(s => ({
                    ...s,
                    completed: false
                }));
            }
        });
    }
});

export const {
    loadSubtasksRequest,
    loadSubtasksSuccess,
    loadSubtasksFailure,
    createSubtaskRequest,
    createSubtaskSuccess,
    createSubtaskFailure,
    toggleSubtaskRequest,
    toggleSubtaskSuccess,
    toggleSubtaskFailure,
    allSubtasksCompletedSuccess,
    deleteSubtaskRequest,
    deleteSubtaskSuccess,
    deleteSubtaskFailure,
    editSubtaskRequest,
    editSubtaskSuccess,
    editSubtaskFailure,
} = subtasksSlice.actions;

export default subtasksSlice.reducer;