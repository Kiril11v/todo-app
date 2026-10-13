# TodoApp

A task manager for people who plan their day and set goals for themselves: tasks with deadlines, images and subtasks, plus archive and restore.

[Live demo](https://todo-app-gamma-nine-52.vercel.app/)

<p align="center">
  <img src="docs/screenshots/main-desktop.png" width="600" alt="Desktop view" />
  <img src="docs/screenshots/main-mobile.png" width="200" alt="Mobile view" />
</p>

## About

This app is built for everyday tasks. Each task can have a deadline, an image for visual context, and subtasks, which helps users break a bigger goal into clear, structured steps. It supports three languages and a light/dark theme, and gives instant feedback through popups and smooth animations.

## Features

- Create tasks with a deadline, an image and subtasks
- Edit tasks and subtasks
- Complete tasks, archive them and restore them to their original position
- Deadline and completion date tracking
- Overdue tasks are automatically moved to the "failed" list
- Task limits (20 active, 15 completed) with a warning popup
- Multilanguage: English, Polish, Ukrainian
- Light / dark theme
- Popups for different interactions (created, completed, restored, limit reached)

## Demo

### Creating a task


## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| State management | Redux Toolkit, Redux-Saga, typed-redux-saga |
| Backend | Supabase (Postgres, Auth, Storage) |
| Styling | Tailwind CSS 4 |
| Forms | React Final Form, Final Form Arrays |
| UI | Headless UI, react-calendar, Embla Carousel |
| Testing | Vitest, React Testing Library |
| Deployment | Vercel |

## Architecture

- **Redux Toolkit + Redux-Saga.** Slices hold the state (`tasks`, `completedTasks`, `archivedTasks`, subtasks grouped by task id). Sagas handle all side effects: requests to Supabase, loading, and error handling.
- **Optimistic updates.** The UI updates immediately and the server request runs in the background. New items are marked with an `is_optimistic` flag until the server confirms them, and the previous state is kept as a backup so it can be rolled back if the request fails.
- **Typed end to end.** The project was migrated from JavaScript to TypeScript, with typed store state, actions and sagas.
- **Component tests.** Pages and components are tested in isolation with mocked children and hooks (restore flow, limits, popups, validation).
- **Supabase** is used as the backend (database for tasks and subtasks, image storage). Access is restricted per user with Row Level Security.
