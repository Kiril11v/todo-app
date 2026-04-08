import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  completedTasks: [],
  archivedTasks: [],
  loading: false,
  error: null
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    loadTasksRequest: (state) => { state.loading = true; },
    loadTasksSuccess: (state, action) => {
      state.loading = false;
      state.tasks = action.payload.filter(t => !t.completed_at && !t.archived);
      state.completedTasks = action.payload.filter(t => t.completed_at && !t.archived)
        .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
      state.archivedTasks = action.payload.filter(t => t.completed_at && t.archived)
        .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
    },
    loadTasksFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    createTaskRequest: (state) => { state.loading = true; },
    createTaskSuccess: (state, action) => {
      state.loading = false;
      state.tasks.push(action.payload);
    },
    createTaskFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    completeTaskRequest: (state) => { state.loading = true; },
    completeTaskSuccess: (state, action) => {
      state.loading = false;
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (task) {
        state.tasks = state.tasks.filter(t => t.id !== action.payload.id);
        state.completedTasks.push(action.payload);
        state.completedTasks.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      }
    },
    completeTaskFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    deleteTaskRequest: (state) => { state.loading = true; },
    deleteTaskSuccess: (state, action) => {
      state.loading = false;
      const id = action.payload;
      state.tasks = state.tasks.filter(t => t.id !== id);
    },
    deleteTaskFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    editTaskRequest: (state) => { state.loading = true; },
    editTaskSuccess: (state, action) => {
      state.loading = false;
      const { id, newText } = action.payload;
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        task.title = newText;
      }
    },
    editTaskFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    deleteCompletedTaskRequest: (state) => { state.loading = true; },
    deleteCompletedTaskSuccess: (state, action) => {
      state.loading = false;
      const id = action.payload;
      state.completedTasks = state.completedTasks.filter(t => t.id !== id)
    },
    deleteCompletedTaskFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    clearAllCompletedTaskRequest: (state) => { state.loading = true; },
    clearAllCompletedTaskSuccess: (state) => {
      state.loading = false;
      state.completedTasks = [];
    },
    clearAllCompletedTaskFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    archiveOldestTaskRequest : (state) => { state.loading = true; },
    archiveOldestTaskSuccess: (state) => {
      state.loading = false;
      if (state.completedTasks.length > 15) {
        const oldestTask = state.completedTasks.shift();
        state.archivedTasks.push(oldestTask); 
        state.archivedTasks.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

        if (state.archivedTasks.length > 15) {
          state.archivedTasks.shift();
        }
      }
    },
    archiveOldestTaskFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    archiveTaskRequest: (state) => { state.loading = true; },
    archiveTaskSuccess: (state, action) => {
      state.loading = false;
      const id = action.payload;
      const task = state.completedTasks.find(t => t.id === id);
      if (!task) return;
      state.completedTasks = state.completedTasks.filter(t => t.id !== id);
      state.archivedTasks.push(task);
      state.archivedTasks.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

      if (state.archivedTasks.length > 15) {
        state.archivedTasks.shift();
      }
    },
    archiveTaskFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    deleteArchiveTaskRequest: (state) => { state.loading = true; },
    deleteArchiveTaskSuccess: (state, action) => {
      state.loading = false;
      const id = action.payload;
      state.archivedTasks = state.archivedTasks.filter(t => t.id !== id);
    },
    deleteArchiveTaskFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    clearArchiveRequest: (state) => { state.loading = true; },
    clearArchiveSuccess: (state) => {
      state.loading = false;
      state.archivedTasks = [];
    },
    clearArchiveFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    restoreArchiveRequest: (state) => { state.loading = true; },
    restoreArchiveSuccess: (state, action) => {
      state.loading = false;
      const id = action.payload;
      const task = state.archivedTasks.find(t => t.id === id);
      if(!task) return;

      state.archivedTasks = state.archivedTasks.filter(t => t.id !== id);
      const restoredTask = { ...task, completed_at: null, archived: false };
      state.tasks.push(restoredTask);
    },
    restoreArchiveFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    // editSubtaskRequest: (state) => { state.loading = true; },
    // editSubtaskSuccess(state, action) {
    //   state.loading = false;
    //   const { taskId, index, newTitle } = action.payload;
    //   const task = state.tasks.find(t => t.id === taskId);
    //   if (!task) return;
    //   task.subtasks[index].title = newTitle;
    // },
    // editSubtaskFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    // deleteSubtaskRequest: (state) => { state.loading = true; },
    // deleteSubtaskSuccess(state, action) {
    //   state.loading = false;
    //   const { taskId, index } = action.payload;
    //   const task = state.tasks.find(t => t.id === taskId);
    //   if (!task) return;
    //   task.subtasks.splice(index, 1);
    // },
    // deleteSubtaskFailure: (state, action) => { state.loading = false; state.error = action.payload; }
  }
});

export const {
  loadTasksRequest,
  loadTasksSuccess,
  loadTasksFailure,
  createTaskRequest,
  createTaskSuccess,
  createTaskFailure,
  completeTaskRequest,
  completeTaskSuccess,
  completeTaskFailure,
  deleteTaskRequest,
  deleteTaskSuccess,
  deleteTaskFailure,
  editTaskRequest,
  editTaskSuccess,
  editTaskFailure,
  clearAllCompletedTaskRequest,
  clearAllCompletedTaskSuccess,
  clearAllCompletedTaskFailure,
  deleteCompletedTaskRequest,
  deleteCompletedTaskSuccess,
  deleteCompletedTaskFailure,
  archiveOldestTaskRequest,
  archiveOldestTaskSuccess,
  archiveOldestTaskFailure,
  archiveTaskRequest,
  archiveTaskSuccess,
  archiveTaskFailure,
  deleteArchiveTaskRequest,
  deleteArchiveTaskSuccess,
  deleteArchiveTaskFailure,
  clearArchiveRequest,
  clearArchiveSuccess,
  clearArchiveFailure,
  restoreArchiveRequest,
  restoreArchiveSuccess,
  restoreArchiveFailure,
  // editSubtaskRequest,
  // editSubtaskSuccess,
  // editSubtaskFailure,
  // deleteSubtaskRequest,
  // deleteSubtaskSuccess,
  // deleteSubtaskFailure
} = tasksSlice.actions;

export default tasksSlice.reducer;