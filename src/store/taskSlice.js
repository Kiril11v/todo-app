import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  completedTasks: [],
  archivedTasks: [],
  loading: false,
  error: null,
  lastCompletedTask: null,
  taskBackup: null,
  lastRestoredTask: null,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    loadTasksRequest: (state) => { state.loading = true; },
    loadTasksSuccess: (state, action) => {
      state.loading = false;

      const tasks = action.payload;

      state.tasks = tasks
      .filter(t => !t.completed_at && !t.archived_at)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      state.completedTasks = tasks
      .filter(t => t.completed_at && !t.archived_at)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
      
      state.archivedTasks = tasks
      .filter(t => t.archived_at)
      .sort((a, b) => new Date(b.archived_at) - new Date(a.archived_at));
    },
    loadTasksFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    createTaskRequest: (state, action) => { 
      state.loading = true;

      const tempId = action.payload.tempId;

      const optimisticTask = {
        id: tempId,
        title: action.payload.title,
        deadline: action.payload.deadline,
        image_url: action.payload.imagePreview ?? null,
        subtasks: (action.payload.subtasks || []).map((s, i) => ({
          id: `${tempId}_sub_${i}`,
          title: s.title,
          is_optimistic: true,
        })),
        is_optimistic: true, // флаг для UI (спиннер/затемнение на карточке)
        created_at: new Date().toISOString(),
      };

      state.tasks.unshift(optimisticTask);
    },

    createTaskSuccess: (state, action) => {
      state.loading = false;
      const { tempId, task, subtasks } = action.payload;

      const index = state.tasks.findIndex(t => t.id === tempId);
      const realTask = { ...task, subtasks: subtasks || [] };

      if (index !== -1) {
        state.tasks[index] = realTask;
      } else {
        state.tasks.unshift(realTask);
      }
    },
    createTaskFailure: (state, action) => { 
      state.loading = false;
      state.error = action.payload.error;

      state.tasks = state.tasks.filter(t => t.id !== action.payload.tempId);
    },

    completeTaskRequest: (state, action) => {
      state.loading = true;

      const id = action.payload;
      const task = state.tasks.find(t => t.id === id);

      if (!task) {
        state.loading = false;
        return;
      }

      state.tasks = state.tasks.filter(t => t.id !== id);
      state.lastCompletedTask = task;
    },
    completeTaskSuccess: (state, action) => {
      state.loading = false;
      state.lastCompletedTask = null;
      
      const task = action.payload.task;
    
      state.completedTasks.unshift(task);
    },
    completeTaskFailure: (state, action) => { 
      state.loading = false;
      state.error = action.payload;

      if (state.lastCompletedTask) {
        state.tasks.unshift(state.lastCompletedTask);
        state.lastCompletedTask = null;
      }
    },

    deleteTaskRequest: (state, action) => { 
      state.loading = true;

      const id = action.payload;
      const task = state.tasks.find(t => t.id === id);

      if (!task) {
        state.loading = false;
        return;
      }

      state.tasks = state.tasks.filter(t => t.id !== id);
      state.lastCompletedTask = task;
    },
    deleteTaskSuccess: (state) => {
      state.loading = false;
      state.lastCompletedTask = null;
    },
    deleteTaskFailure: (state, action) => { 
      state.loading = false;
      state.error = action.payload;

      if (state.lastCompletedTask) {
        state.tasks.unshift(state.lastCompletedTask);
        state.lastCompletedTask = null;
      }
    },

    editTaskRequest: (state, action) => { 
      state.loading = true;
      const { id, newText } = action.payload;

      const task = state.tasks.find(t => t.id === id);

      if (task) {
        state.taskBackup = { id: task.id, title: task.title };
        task.title = newText;
      } else {
        state.loading = false;
      } 
    },
    editTaskSuccess: (state) => {
      state.loading = false;
      state.taskBackup = null;
    },
    editTaskFailure: (state, action) => { 
      state.loading = false;
      state.error = action.payload;
      if (state.taskBackup) {
        const task = state.tasks.find(t => t.id === state.taskBackup.id);
        if (task) {
          task.title = state.taskBackup.title;
        }
        state.taskBackup = null;
      }
    },

    deleteCompletedTaskRequest: (state, action) => { 
      state.loading = true;
      const id = action.payload;
      const task = state.completedTasks.find(t => t.id === id);
      
      if (!task) {
        state.loading = false;
        return;
      }

      state.completedTasks = state.completedTasks.filter(t => t.id !== id);
      state.lastCompletedTask = task;
    },
    deleteCompletedTaskSuccess: (state) => {
      state.loading = false;
      state.lastCompletedTask = null;
    },
    deleteCompletedTaskFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      if (state.lastCompletedTask) {
        state.completedTasks.unshift(state.lastCompletedTask);
        state.lastCompletedTask = null;
      }
    },
    clearAllCompletedTaskRequest: (state) => { state.loading = true; },
    clearAllCompletedTaskSuccess: (state) => {
      state.loading = false;
      state.completedTasks = [];
    },
    clearAllCompletedTaskFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    archiveOldestTaskRequest : (state) => { state.loading = true; },
    archiveOldestTaskSuccess: (state) => { state.loading = false; },
    archiveOldestTaskFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    archiveTaskRequest: (state) => { state.loading = true; },
    archiveTaskSuccess: (state, action) => {
      state.loading = false;
      const id = action.payload;
      const task = state.completedTasks.find(t => t.id === id);
      if (!task) return;
      state.completedTasks = state.completedTasks.filter(t => t.id !== id);
      state.archivedTasks.unshift(task);
    },
    archiveTaskFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    deleteArchiveTaskRequest: (state, action) => { 
      state.loading = true;
      const id = action.payload;
      const task = state.archivedTasks.find(t => t.id === id);
      
      if (!task) {
        state.loading = false;
        return;
      }

      state.archivedTasks = state.archivedTasks.filter(t => t.id !== id);
      state.lastCompletedTask = task;
    },
    deleteArchiveTaskSuccess: (state) => {
      state.loading = false;
      state.lastCompletedTask = null;
    },
    deleteArchiveTaskFailure: (state, action) => { 
      state.loading = false; 
      state.error = action.payload;

      if (state.lastCompletedTask) {
        state.archivedTasks.unshift(state.lastCompletedTask);
        state.lastCompletedTask = null;
      }
    },

    clearArchiveRequest: (state) => { state.loading = true; },
    clearArchiveSuccess: (state) => {
      state.loading = false;
      state.archivedTasks = [];
    },
    clearArchiveFailure: (state, action) => { state.loading = false; state.error = action.payload; },

    restoreArchiveRequest: (state, action) => { 
      state.loading = true;
      
      const taskId = action.payload;
      const idx = state.archivedTasks.findIndex(t => t.id === taskId);

      if(idx === -1) {
        state.loading = false;
        return;
      }

      const [archivedTask] = state.archivedTasks.splice(idx, 1);

      const optimisticTask = {
        ...archivedTask,
        archived_at: null,
        completed_at: null,
        deadline: null,
        failed: null,
      };

      state.tasks.unshift(optimisticTask);
      state.lastRestoredTask = { task: archivedTask, idx };
    },
    restoreArchiveSuccess: (state, action) => {
      state.loading = false;
      state.lastRestoredTask = null;

      const { task } = action.payload;
      if(!task) return;

      const indexRestoredTask = state.tasks.findIndex(t => t.id === task.id);
      if (indexRestoredTask !== -1) state.tasks[indexRestoredTask] = task;
    },
    restoreArchiveFailure: (state, action) => { 
      state.loading = false; 
      state.error = action.payload;

      if (state.lastRestoredTask) {
        const { task, idx } = state.lastRestoredTask;
        state.tasks = state.tasks.filter(t => t.id !== task.id);
        state.archivedTasks.splice(idx, 0, task);
        state.lastRestoredTask = null;
      }
    },
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
} = tasksSlice.actions;

export default tasksSlice.reducer;