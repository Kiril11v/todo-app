import { put, takeEvery, call, select } from "typed-redux-saga";
import type { RootState } from "./index";
import { supabase } from "../supabaseClient";
import {
  toggleSubtaskRequest,
  toggleSubtaskSuccess,
  toggleSubtaskFailure,
  editSubtaskRequest,
  editSubtaskSuccess,
  editSubtaskFailure,
  deleteSubtaskRequest,
  deleteSubtaskSuccess,
  deleteSubtaskFailure,
} from "./subtasksSlice";

function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function* toggleSubtaskSaga(action: ReturnType<typeof toggleSubtaskRequest>) {
  const { taskId, subtaskId } = action.payload;

  try {
    const completed = yield* select(
      (state: RootState) =>
        state.subtasks.byTaskId[taskId]?.items.find((s) => s.id === subtaskId)
          ?.completed,
    );

    if (completed === undefined) return;

    const { error: toggleSubtaskError } = yield* call(async () => {
      return await supabase
        .from("subtasks")
        .update({ completed })
        .eq("id", subtaskId);
    });

    if (toggleSubtaskError) throw toggleSubtaskError;

    yield* put(toggleSubtaskSuccess({ taskId, subtaskId }));
  } catch (e) {
    yield* put(
      toggleSubtaskFailure({ taskId, subtaskId, error: getErrorMessage(e) }),
    );
  }
}

function* editSubtaskSaga(action: ReturnType<typeof editSubtaskRequest>) {
  const { subtaskId, newTitle } = action.payload;
  try {
    const { error: editSubtaskError } = yield* call(async () => {
      return await supabase
        .from("subtasks")
        .update({ title: newTitle })
        .eq("id", subtaskId);
    });
    if (editSubtaskError) throw editSubtaskError;

    yield* put(editSubtaskSuccess());
  } catch (e) {
    yield* put(editSubtaskFailure(getErrorMessage(e)));
  }
}

function* deleteSubtaskSaga(action: ReturnType<typeof deleteSubtaskRequest>) {
  const { taskId, subtaskId } = action.payload;

  try {
    const { error: deleteSubtaskError } = yield* call(async () => {
      return await supabase.from("subtasks").delete().eq("id", subtaskId);
    });

    if (deleteSubtaskError) throw deleteSubtaskError;

    yield* put(deleteSubtaskSuccess({ taskId, subtaskId }));
  } catch (e) {
    yield* put(deleteSubtaskFailure(getErrorMessage(e)));
  }
}

export default function* subtaskSaga() {
  yield* takeEvery(toggleSubtaskRequest.type, toggleSubtaskSaga);
  yield* takeEvery(editSubtaskRequest.type, editSubtaskSaga);
  yield* takeEvery(deleteSubtaskRequest.type, deleteSubtaskSaga);
}
