import { createSlice } from "@reduxjs/toolkit";

const saved = JSON.parse(localStorage.getItem("tasksState"));

const initialState = {
  tasks: Array.isArray(saved?.tasks) ? saved.tasks : [],
  completedTasks: Array.isArray(saved?.completedTasks) ? saved.completedTasks : [],
  archivedTasks: Array.isArray(saved?.archivedTasks) ? saved.archivedTasks : []
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    createTaskRequest: () => {},
    createTaskSuccess: (state, action) => {
      const newTask = action.payload;

      state.tasks.push(newTask)
    },

    completeTaskRequest: () => {},
    completeTaskSuccess: (state, action) => {
      const id = action.payload;
      
      const task = state.tasks.find(t => t.id === id);
      if (!task) return;

      state.tasks = state.tasks.filter(t => t.id !== id);

      const completedTask = {
        ...task,
        completedAt: new Date().toISOString()
      };

      state.completedTasks.push(completedTask)
    },

    deleteTaskRequest: () => {},
    deleteTaskSuccess: (state, action) => {
      const id = action.payload;
      
      state.tasks = state.tasks.filter(t => t.id !== id);
    },

    editTaskRequest: () => {},
    editTaskSuccess: (state, action) => {
      const { id, newText } = action.payload;
      const task = state.tasks.find(t => t.id === id);
      if (task) task.title = newText;
    },

    deleteCompletedTaskRequest: () => {},
    deleteCompletedTaskSuccess: (state, action) => {
      const id = action.payload;
      state.completedTasks = state.completedTasks.filter(t => t.id !== id)
    },

    clearAllCompletedTaskRequest: () => {},
    clearAllCompletedTaskSuccess: (state) => {
      state.completedTasks = [];
    },

    archiveOldestTaskRequest : () => {},
    archiveOldestTaskSuccess: (state) => {
      if (state.completedTasks.length > 15) {
        const oldestTask = state.completedTasks.shift();
        state.archivedTasks.push(oldestTask); 

        if (state.archivedTasks.length > 15) {
          state.archivedTasks.shift();
        }
      }
    },

    archiveTaskRequest: () => {},
    archiveTaskSuccess: (state, action) => {
      const id = action.payload;
      const task = state.completedTasks.find(t => t.id === id);
      if (!task) return;

      state.completedTasks = state.completedTasks.filter(t => t.id !== id);
      state.archivedTasks.push(task);

      if (state.archivedTasks.length > 15) {
        state.archivedTasks.shift();
      }
    },

    deleteArchiveTaskRequest: () => {},
    deleteArchiveTaskSuccess: (state, action) => {
      const id = action.payload;
      state.archivedTasks = state.archivedTasks.filter(t => t.id !== id);
    },

    clearArchiveRequest: () => {},
    clearArchiveSuccess: (state) => {
      state.archivedTasks = [];
    },

    restoreArchiveRequest: () => {},
    restoreArchiveSuccess: (state, action) => {
      const id = action.payload;
      const task = state.archivedTasks.find(t => t.id === id);
      if(!task) return;

      state.archivedTasks = state.archivedTasks.filter(t => t.id !== id);
      state.tasks.push(task);
    }
  }
});

export const {
  createTaskRequest,
  createTaskSuccess,
  completeTaskRequest,
  completeTaskSuccess,
  deleteTaskRequest,
  deleteTaskSuccess,
  editTaskRequest,
  editTaskSuccess,
  clearAllCompletedTaskRequest,
  clearAllCompletedTaskSuccess,
  deleteCompletedTaskRequest,
  deleteCompletedTaskSuccess,
  archiveOldestTaskRequest,
  archiveOldestTaskSuccess,
  archiveTaskRequest,
  archiveTaskSuccess,
  deleteArchiveTaskRequest,
  deleteArchiveTaskSuccess,
  clearArchiveRequest,
  clearArchiveSuccess,
  restoreArchiveRequest,
  restoreArchiveSuccess
} = tasksSlice.actions;

export default tasksSlice.reducer;