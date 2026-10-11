import type { ReactNode } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

import { translations } from "../../context/translations";

import type { Task } from "../../types/task";
import type { SubtaskGroup } from "../../types/subtask";

import Done from "./Done";

interface TestState {
  tasks: {
    completedTasks: Task[];
    archivedTasks: Task[];
  };
  subtasks: {
    byTaskId: Record<string, SubtaskGroup>;
  };
}

interface TaskDoneItemProps {
  task: Task;
  index: number;
  subtasks: SubtaskGroup | undefined;
  isArchiving: boolean;
  onArchive: (id: string) => void;
  onOpenImage: (src: string) => void;
  onDelete: (id: string) => void;
  isLocked: boolean;
  isDeleting: boolean;
}

interface PopupSaveProps {
  onClose: () => void;
}

interface PopupLimitProps {
  onConfirm: () => void;
  onClose: () => void;
}

interface ModalImageProps {
  src: string | null;
  onClose: () => void;
}

/* ---------- hoisted mocks state ---------- */
const h = vi.hoisted(() => ({
  dispatch: vi.fn(),
  state: {} as TestState,
  language: "en" as "en" | "pl",
  requestDelete: vi.fn(),
  isLocked: false,
  deletingId: null as string | null,
  deleteCallback: null as null | ((id: string) => void),
}));

/* ---------- module mocks ---------- */
vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => h.dispatch,
  useAppSelector: <T,>(fn: (s: TestState) => T): T => fn(h.state),
}));

vi.mock("../../hooks/useLanguage", () => ({
  useLanguage: () => ({ language: h.language }),
}));

vi.mock("../../hooks/useDeleteTask", () => ({
  useDeleteTask: (cb: (id: string) => void) => {
    h.deleteCallback = cb;
    return {
      requestDelete: h.requestDelete,
      isLocked: h.isLocked,
      isDeletingItem: (id: string) => id === h.deletingId,
    };
  },
}));

vi.mock("../../store/taskSlice", () => ({
  archiveTaskRequest: vi.fn((id: string) => ({ type: "archive", payload: id })),
  deleteCompletedTaskRequest: vi.fn((id: string) => ({
    type: "deleteCompleted",
    payload: id,
  })),
  clearAllCompletedTaskRequest: vi.fn(() => ({ type: "clearAll" })),
}));

vi.mock("../../components/portal/Portal", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("../../components/taskDoneItem/TaskDoneItem", () => ({
  default: (props: TaskDoneItemProps) => (
    <li
      data-testid={`item-${props.task.id}`}
      data-archiving={String(props.isArchiving)}
      data-locked={String(props.isLocked)}
      data-deleting={String(props.isDeleting)}
      data-subtasks={props.subtasks?.items.length ?? 0}
    >
      {props.task.title}
      <button onClick={() => props.onArchive(props.task.id)}>
        archive-{props.task.id}
      </button>
      <button onClick={() => props.onDelete(props.task.id)}>
        delete-{props.task.id}
      </button>
      <button onClick={() => props.onOpenImage("img.png")}>
        image-{props.task.id}
      </button>
    </li>
  ),
}));

vi.mock("../../components/popupSaveToArchive/PopupSaveToArchive", () => ({
  default: ({ onClose }: PopupSaveProps) => (
    <div data-testid="popup-save">
      <button onClick={onClose}>close-save</button>
    </div>
  ),
}));

vi.mock("../../components/popupArchiveLimit/PopupArchiveLimit", () => ({
  default: ({ onConfirm, onClose }: PopupLimitProps) => (
    <div data-testid="popup-limit">
      <button onClick={onConfirm}>confirm-limit</button>
      <button onClick={onClose}>close-limit</button>
    </div>
  ),
}));

vi.mock("../../components/modalImage/ModalImage", () => ({
  default: ({ src, onClose }: ModalImageProps) =>
    src ? (
      <div data-testid="modal-image">
        {src}
        <button onClick={onClose}>close-image</button>
      </div>
    ) : null,
}));

import {
  archiveTaskRequest,
  deleteCompletedTaskRequest,
  clearAllCompletedTaskRequest,
} from "../../store/taskSlice";

/* ---------- helpers ---------- */
const makeTask = (id: string, title = `Task ${id}`): Task => ({
  id,
  title,
  image_url: null,
  created_at: "2025-01-01T00:00:00Z",
  completed_at: "2025-01-02T00:00:00Z",
  archived_at: null,
  deadline: null,
  failed: false,
});

const ARCHIVE_ANIMATION_MS = 600;
const POPUP_DURATION_MS = 3000;
const ARCHIVE_LIMIT = 15;

interface SetStateOptions {
  completed?: Task[];
  archivedCount?: number;
  byTaskId?: Record<string, SubtaskGroup>;
}

const setState = (opts?: SetStateOptions) => {
  h.state = {
    tasks: {
      completedTasks: opts?.completed ?? [makeTask("1"), makeTask("2")],
      archivedTasks: Array.from({ length: opts?.archivedCount ?? 0 }, (_, i) =>
        makeTask(`a${i}`),
      ),
    },
    subtasks: { byTaskId: opts?.byTaskId ?? {} },
  };
};

const getOverlay = (container: HTMLElement): Element => {
  const overlay = container.querySelector(".bg-black\\/40");
  if (!overlay) throw new Error("Overlay not found");
  return overlay;
};

const t = translations.en;

describe("Done", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    h.language = "en";
    h.isLocked = false;
    h.deletingId = null;
    h.deleteCallback = null;
    setState();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the empty state without a list or the clear button", () => {
    setState({ completed: [] });
    render(<Done />);

    expect(screen.getByText(t.doneText)).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.queryByText(t.doneClearBtn)).toBeNull();
  });

  it("renders the heading and an item for each task, passing subtasks to the matching one", () => {
    setState({
      byTaskId: { "1": { items: [{ id: "s1", title: "sub" }] } },
    });
    render(<Done />);

    expect(screen.getByText(t.done)).toBeTruthy();
    expect(screen.getByTestId("item-1").dataset.subtasks).toBe("1");
    expect(screen.getByTestId("item-2").dataset.subtasks).toBe("0");
  });

  it("uses a smaller heading size for the Polish language", () => {
    h.language = "pl";
    render(<Done />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.className).toContain("text-2xl");
    expect(heading.className).not.toContain("text-4xl");
  });

  it("clears all completed tasks when the clear button is clicked", () => {
    render(<Done />);

    fireEvent.click(screen.getByText(t.doneClearBtn));

    expect(clearAllCompletedTaskRequest).toHaveBeenCalledTimes(1);
    expect(h.dispatch).toHaveBeenCalledWith({ type: "clearAll" });
  });

  it("deletes a task: requestDelete is called and the useDeleteTask callback dispatches the deletion", () => {
    render(<Done />);

    fireEvent.click(screen.getByText("delete-1"));
    expect(h.requestDelete).toHaveBeenCalledWith("1");

    act(() => h.deleteCallback?.("1"));
    expect(deleteCompletedTaskRequest).toHaveBeenCalledWith("1");
    expect(h.dispatch).toHaveBeenCalledWith({
      type: "deleteCompleted",
      payload: "1",
    });
  });

  it("passes isDeleting to the right item and locks items when isLocked is true", () => {
    h.isLocked = true;
    h.deletingId = "2";
    render(<Done />);

    expect(screen.getByTestId("item-1").dataset.deleting).toBe("false");
    expect(screen.getByTestId("item-2").dataset.deleting).toBe("true");
    expect(screen.getByTestId("item-1").dataset.locked).toBe("true");
  });

  it("archives with animation: dispatches only after the delay, then shows the save popup", () => {
    render(<Done />);

    fireEvent.click(screen.getByText("archive-1"));

    expect(screen.getByTestId("item-1").dataset.archiving).toBe("true");
    expect(screen.getByTestId("item-2").dataset.locked).toBe("true");
    expect(archiveTaskRequest).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(ARCHIVE_ANIMATION_MS);
    });

    expect(archiveTaskRequest).toHaveBeenCalledWith("1");
    expect(h.dispatch).toHaveBeenCalledWith({ type: "archive", payload: "1" });
    expect(screen.getByTestId("item-1").dataset.archiving).toBe("false");
    expect(screen.getByTestId("popup-save")).toBeTruthy();
  });

  it("ignores a second archive click while an animation is in progress", () => {
    render(<Done />);

    fireEvent.click(screen.getByText("archive-1"));
    fireEvent.click(screen.getByText("archive-2"));

    act(() => {
      vi.advanceTimersByTime(ARCHIVE_ANIMATION_MS * 2);
    });

    expect(archiveTaskRequest).toHaveBeenCalledTimes(1);
    expect(archiveTaskRequest).toHaveBeenCalledWith("1");
  });

  it("automatically hides the save popup after POPUP_DURATION_MS", () => {
    render(<Done />);

    fireEvent.click(screen.getByText("archive-1"));
    act(() => {
      vi.advanceTimersByTime(ARCHIVE_ANIMATION_MS);
    });
    expect(screen.getByTestId("popup-save")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(POPUP_DURATION_MS);
    });
    expect(screen.queryByTestId("popup-save")).toBeNull();
  });

  it("closes the save popup via its close button", () => {
    render(<Done />);

    fireEvent.click(screen.getByText("archive-1"));
    act(() => {
      vi.advanceTimersByTime(ARCHIVE_ANIMATION_MS);
    });
    expect(screen.getByTestId("popup-save")).toBeTruthy();

    fireEvent.click(screen.getByText("close-save"));
    expect(screen.queryByTestId("popup-save")).toBeNull();
  });

  it("shows the limit popup and does not archive immediately when the archive is full", () => {
    setState({ archivedCount: ARCHIVE_LIMIT });
    render(<Done />);

    fireEvent.click(screen.getByText("archive-1"));

    expect(screen.getByTestId("popup-limit")).toBeTruthy();
    expect(screen.getByTestId("item-1").dataset.archiving).toBe("false");

    act(() => {
      vi.advanceTimersByTime(ARCHIVE_ANIMATION_MS);
    });
    expect(archiveTaskRequest).not.toHaveBeenCalled();
  });

  it("confirming in the limit popup archives the pending task", () => {
    setState({ archivedCount: ARCHIVE_LIMIT });
    render(<Done />);

    fireEvent.click(screen.getByText("archive-2"));
    fireEvent.click(screen.getByText("confirm-limit"));

    expect(screen.queryByTestId("popup-limit")).toBeNull();
    expect(screen.getByTestId("item-2").dataset.archiving).toBe("true");

    act(() => {
      vi.advanceTimersByTime(ARCHIVE_ANIMATION_MS);
    });
    expect(archiveTaskRequest).toHaveBeenCalledWith("2");
  });

  it("closing the limit popup via the overlay cancels archiving", () => {
    setState({ archivedCount: ARCHIVE_LIMIT });
    const { container } = render(<Done />);

    fireEvent.click(screen.getByText("archive-1"));
    expect(screen.getByTestId("popup-limit")).toBeTruthy();

    fireEvent.click(getOverlay(container));

    expect(screen.queryByTestId("popup-limit")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(ARCHIVE_ANIMATION_MS);
    });
    expect(archiveTaskRequest).not.toHaveBeenCalled();
  });

  it("opens the image modal with the selected image and closes it", () => {
    render(<Done />);

    expect(screen.queryByTestId("modal-image")).toBeNull();

    fireEvent.click(screen.getByText("image-1"));
    expect(screen.getByTestId("modal-image").textContent).toContain("img.png");

    fireEvent.click(screen.getByText("close-image"));
    expect(screen.queryByTestId("modal-image")).toBeNull();
  });
});