import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { createTaskRequest, restoreArchiveSuccess } from "./taskSlice";
import { SubtasksState, SubtaskItem } from "../types/task";

const initialState: SubtasksState = {
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
        loadSubtasksSuccess: (state, action: PayloadAction<{ taskId: string; subtasks: SubtaskItem[] }>) => {
            const { taskId, subtasks } = action.payload;

            state.byTaskId[taskId] = {
                items: subtasks.map(s => ({
                    id: s.id,
                    title: s.title,
                    completed: s.completed ?? false
                }))
            }
        },
        loadSubtasksFailure: (state, action: PayloadAction<string>) => { 
            state.loading = false;
            state.error = action.payload;
        },

        createSubtaskSuccess: (state, action: PayloadAction<{ tempId?: string; taskId: string; subtasks: SubtaskItem[] }>) => {
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
        createSubtaskFailure: (state, action: PayloadAction<{ taskId?: string; error: string }>) => {
            state.loading = false;
            state.error = action.payload.error;

            const { taskId } = action.payload;
            if (taskId && state.byTaskId[taskId]) {
                delete state.byTaskId[taskId];
            }
        },

        toggleSubtaskRequest: (state, action: PayloadAction<{ taskId?: string; subtaskId: string }>) => {
            const { taskId, subtaskId } = action.payload;

            const list = state.byTaskId[taskId]?.items;
            if (!list) return;

            const subtask = list.find(s => s.id === subtaskId);
            if (subtask) {
                subtask._prevCompleted = subtask.completed;
                subtask.completed = !subtask.completed;
            }
        },
        toggleSubtaskSuccess: (state, action: PayloadAction<{ taskId?: string; subtaskId: string }>) => {
            const { taskId, subtaskId } = action.payload;

            const list = state.byTaskId[taskId]?.items;
            if (!list) return;

            const subtask = list.find(s => s.id === subtaskId);
            if (subtask) delete subtask._prevCompleted; 
        },
        toggleSubtaskFailure: (state, action: PayloadAction<{ taskId: string; subtaskId: string; error: string }>) => {
            const { taskId, subtaskId, error } = action.payload;
            state.error = error;

            const subtask = state.byTaskId[taskId]?.items.find(s => s.id === subtaskId);
            if (subtask && subtask._prevCompleted !== undefined) {
                subtask.completed = subtask._prevCompleted;
                delete subtask._prevCompleted;
            }
        },

        deleteSubtaskRequest: () => {},
        deleteSubtaskSuccess(state, action: PayloadAction<{ taskId?: string; subtaskId: string }>) {
            state.loading = false;
            const { taskId, subtaskId } = action.payload;

            const task = state.byTaskId[taskId];
            if (!task) return;
            task.items = task.items.filter(s => s.id !== subtaskId);
        },
        deleteSubtaskFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        editSubtaskRequest: (state, action: PayloadAction<{ taskId: string; subtaskId: string; newTitle: string }>) => {
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
        editSubtaskFailure: (state, action: PayloadAction<string>) => { 
            state.loading = false; 
            state.error = action.payload; 
            if (state.subtaskBackup) {
                const list = state.byTaskId[state.subtaskBackup.taskId]?.items;
                if (list) {
                     const subtask = list.find(s => s.id === state.subtaskBackup!.id);
                    if (subtask) {
                        subtask.title = state.subtaskBackup!.title;
                    }
                }
                state.subtaskBackup = null;
            }
        },

        completeAllSubtasksSuccess: (state, action: PayloadAction<{ taskId: string; subtasks: SubtaskItem[] }>) => {
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
    createSubtaskSuccess,
    createSubtaskFailure,
    toggleSubtaskRequest,
    toggleSubtaskSuccess,
    toggleSubtaskFailure,
    completeAllSubtasksSuccess,
    deleteSubtaskRequest,
    deleteSubtaskSuccess,
    deleteSubtaskFailure,
    editSubtaskRequest,
    editSubtaskSuccess,
    editSubtaskFailure,
} = subtasksSlice.actions;

export default subtasksSlice.reducer;