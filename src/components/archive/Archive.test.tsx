import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ComponentProps } from "react";

import { translations } from "../../context/translations";
import {
  restoreArchiveRequest,
  deleteArchiveTaskRequest,
  clearArchiveRequest,
} from "../../store/taskSlice";

import type { Task } from "../../types/task";
import type { SubtaskGroup } from "../../types/subtask";

import Archive from "./Archive";
import type TaskArchiveItem from "../taskArchiveItem/TaskArchiveItem";

type MockState = {
  tasks: { archivedTasks: Task[]; tasks: Task[] };
  subtasks: { byTaskId: Record<string, SubtaskGroup> };
};

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  state: {
    tasks: { archivedTasks: [], tasks: [] },
    subtasks: { byTaskId: {} },
  } as MockState,
  deletingId: null as string | null,
  isLocked: false,
}));

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (selector: (s: MockState) => unknown) => selector(mocks.state),
}));

vi.mock("../../hooks/useLanguage", () => ({
  useLanguage: () => ({ language: "en" }),
}));

vi.mock("../../hooks/useDeleteTask", () => ({
  useDeleteTask: (onConfirm: (id: string) => void) => ({
    requestDelete: (id: string) => onConfirm(id),
    isLocked: mocks.isLocked,
    isDeletingItem: (id: string) => id === mocks.deletingId,
  }),
}));

vi.mock("../../store/taskSlice", () => ({
  restoreArchiveRequest: vi.fn((id: string) => ({ type: "restore", payload: id })),
  deleteArchiveTaskRequest: vi.fn((id: string) => ({ type: "delete", payload: id })),
  clearArchiveRequest: vi.fn(() => ({ type: "clear" })),
}));

vi.mock("../taskArchiveItem/TaskArchiveItem", () => ({
  default: (props: ComponentProps<typeof TaskArchiveItem>) => (
    <li data-testid={`item-${props.task.id}`}>
      <span>{props.task.title}</span>
      <span data-testid={`subtasks-${props.task.id}`}>
        {props.subtasks?.items.length ?? 0}
      </span>
      <span data-testid={`restoring-${props.task.id}`}>
        {String(props.isRestoring)}
      </span>
      <span data-testid={`deleting-${props.task.id}`}>
        {String(props.isDeleting)}
      </span>
      <span data-testid={`locked-${props.task.id}`}>
        {String(props.isLocked)}
      </span>
      <button onClick={() => props.onRestore(props.task.id)}>
        restore-{props.task.id}
      </button>
      <button onClick={() => props.onDelete(props.task.id)}>
        delete-{props.task.id}
      </button>
      <button onClick={() => props.onOpenImage("https://img.test/a.png")}>
        open-image-{props.task.id}
      </button>
    </li>
  ),
}));

vi.mock("../popupRestoreTask/PopupRestoreTask", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div>
      PopupRestoreTask
      <button onClick={onClose}>close-restore</button>
    </div>
  ),
}));

vi.mock("../popupLimit/PopupLimit", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div>
      PopupLimit
      <button onClick={onClose}>close-limit</button>
    </div>
  ),
}));

vi.mock("../modalImage/ModalImage", () => ({
  default: ({ src }: { src: string | null }) => (
    <div data-testid="modal-image">{src ?? "closed"}</div>
  ),
}));

vi.mock("../portal/Portal", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

/* -------------------------------------------------------------------------- */
/*                                  Fixtures                                  */
/* -------------------------------------------------------------------------- */

const t = translations.en;

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: "1",
  title: "Archived task",
  image_url: null,
  created_at: "2026-01-01T00:00:00Z",
  completed_at: "2026-01-02T00:00:00Z",
  archived_at: "2026-01-03T00:00:00Z",
  deadline: null,
  failed: false,
  ...overrides,
});

const setState = ({
  archived = [createTask()],
  activeCount = 0,
  subtasks = {},
}: {
  archived?: Task[];
  activeCount?: number;
  subtasks?: Record<string, SubtaskGroup>;
} = {}) => {
  mocks.state = {
    tasks: {
      archivedTasks: archived,
      tasks: Array.from({ length: activeCount }, (_, i) =>
        createTask({ id: `active-${i}`, archived_at: null }),
      ),
    },
    subtasks: { byTaskId: subtasks },
  };
};

const RESTORE_ANIMATION_MS = 600;
const POPUP_DURATION_MS = 3000;

/* -------------------------------------------------------------------------- */
/*                                    Tests                                   */
/* -------------------------------------------------------------------------- */

describe("Archive component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.deletingId = null;
    mocks.isLocked = false;
    setState();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("rendering", () => {
    it("renders the archive title", () => {
      render(<Archive />);
      expect(screen.getByText(t.archive)).toBeTruthy();
    });

    it("renders an item for each archived task", () => {
      setState({
        archived: [
          createTask({ id: "1", title: "First" }),
          createTask({ id: "2", title: "Second" }),
        ],
      });

      render(<Archive />);

      expect(screen.getByTestId("item-1")).toBeTruthy();
      expect(screen.getByTestId("item-2")).toBeTruthy();
      expect(screen.getByText("First")).toBeTruthy();
      expect(screen.getByText("Second")).toBeTruthy();
    });

    it("passes subtasks from the store to the matching item", () => {
      setState({
        archived: [createTask({ id: "1" }), createTask({ id: "2" })],
        subtasks: {
          "1": {
            items: [
              { id: "s1", title: "sub1" },
              { id: "s2", title: "sub2" },
            ],
          },
        },
      });

      render(<Archive />);

      expect(screen.getByTestId("subtasks-1").textContent).toBe("2");
      expect(screen.getByTestId("subtasks-2").textContent).toBe("0");
    });

    it("shows the empty text and hides the clear button when the archive is empty", () => {
      setState({ archived: [] });

      render(<Archive />);

      expect(screen.getByText(t.archiveText)).toBeTruthy();
      expect(screen.queryByText(t.archiveClearBtn)).toBeNull();
    });

    it("hides the empty text when there are archived tasks", () => {
      render(<Archive />);
      expect(screen.queryByText(t.archiveText)).toBeNull();
    });

    it("does not render any popup initially", () => {
      render(<Archive />);
      expect(screen.queryByText("PopupRestoreTask")).toBeNull();
      expect(screen.queryByText("PopupLimit")).toBeNull();
    });
  });

  describe("restoring a task", () => {
    it("starts the restore animation without dispatching immediately", () => {
      render(<Archive />);

      fireEvent.click(screen.getByText("restore-1"));

      expect(screen.getByTestId("restoring-1").textContent).toBe("true");
      expect(mocks.dispatch).not.toHaveBeenCalled();
      expect(restoreArchiveRequest).not.toHaveBeenCalled();
    });

    it("dispatches restoreArchiveRequest after the animation finishes", () => {
      render(<Archive />);

      fireEvent.click(screen.getByText("restore-1"));
      act(() => {
        vi.advanceTimersByTime(RESTORE_ANIMATION_MS);
      });

      expect(restoreArchiveRequest).toHaveBeenCalledWith("1");
      expect(mocks.dispatch).toHaveBeenCalledWith({
        type: "restore",
        payload: "1",
      });
    });

    it("resets the animation state after restoring", () => {
      render(<Archive />);

      fireEvent.click(screen.getByText("restore-1"));
      act(() => {
        vi.advanceTimersByTime(RESTORE_ANIMATION_MS);
      });

      expect(screen.getByTestId("restoring-1").textContent).toBe("false");
    });

    it("shows the restore popup after restoring", () => {
      render(<Archive />);

      fireEvent.click(screen.getByText("restore-1"));
      act(() => {
        vi.advanceTimersByTime(RESTORE_ANIMATION_MS);
      });

      expect(screen.getByText("PopupRestoreTask")).toBeTruthy();
    });

    it("ignores repeated clicks while the restore animation is running", () => {
      setState({
        archived: [createTask({ id: "1" }), createTask({ id: "2" })],
      });

      render(<Archive />);

      fireEvent.click(screen.getByText("restore-1"));
      fireEvent.click(screen.getByText("restore-1"));
      fireEvent.click(screen.getByText("restore-2"));

      act(() => {
        vi.advanceTimersByTime(RESTORE_ANIMATION_MS);
      });

      expect(restoreArchiveRequest).toHaveBeenCalledTimes(1);
      expect(restoreArchiveRequest).toHaveBeenCalledWith("1");
      expect(mocks.dispatch).toHaveBeenCalledTimes(1);
    });

    it("allows restoring another task after the previous restore completed", () => {
      setState({
        archived: [createTask({ id: "1" }), createTask({ id: "2" })],
      });

      render(<Archive />);

      fireEvent.click(screen.getByText("restore-1"));
      act(() => {
        vi.advanceTimersByTime(RESTORE_ANIMATION_MS);
      });

      fireEvent.click(screen.getByText("restore-2"));
      act(() => {
        vi.advanceTimersByTime(RESTORE_ANIMATION_MS);
      });

      expect(restoreArchiveRequest).toHaveBeenCalledTimes(2);
      expect(restoreArchiveRequest).toHaveBeenLastCalledWith("2");
    });

    it("does not dispatch if the component unmounts during the animation", () => {
      const { unmount } = render(<Archive />);

      fireEvent.click(screen.getByText("restore-1"));
      unmount();

      act(() => {
        vi.advanceTimersByTime(RESTORE_ANIMATION_MS * 2);
      });

      expect(restoreArchiveRequest).not.toHaveBeenCalled();
      expect(mocks.dispatch).not.toHaveBeenCalled();
    });
  });

  describe("task limit", () => {
    it("shows the limit popup when the active tasks limit is reached", () => {
      setState({ activeCount: 20 });

      render(<Archive />);

      fireEvent.click(screen.getByText("restore-1"));

      expect(screen.getByText("PopupLimit")).toBeTruthy();
    });

    it("does not start the animation or dispatch when the limit is reached", () => {
      setState({ activeCount: 20 });

      render(<Archive />);

      fireEvent.click(screen.getByText("restore-1"));
      act(() => {
        vi.advanceTimersByTime(RESTORE_ANIMATION_MS);
      });

      expect(screen.getByTestId("restoring-1").textContent).toBe("false");
      expect(restoreArchiveRequest).not.toHaveBeenCalled();
      expect(mocks.dispatch).not.toHaveBeenCalled();
    });

    it("allows restoring when the active tasks count is just below the limit", () => {
      setState({ activeCount: 19 });

      render(<Archive />);

      fireEvent.click(screen.getByText("restore-1"));
      act(() => {
        vi.advanceTimersByTime(RESTORE_ANIMATION_MS);
      });

      expect(screen.queryByText("PopupLimit")).toBeNull();
      expect(restoreArchiveRequest).toHaveBeenCalledWith("1");
    });
  });

  describe("popups", () => {
    it("closes the limit popup automatically after the timeout", () => {
      setState({ activeCount: 20 });

      render(<Archive />);

      fireEvent.click(screen.getByText("restore-1"));
      expect(screen.getByText("PopupLimit")).toBeTruthy();

      act(() => {
        vi.advanceTimersByTime(POPUP_DURATION_MS);
      });

      expect(screen.queryByText("PopupLimit")).toBeNull();
    });

    it("closes the restore popup automatically after the timeout", () => {
      render(<Archive />);

      fireEvent.click(screen.getByText("restore-1"));
      act(() => {
        vi.advanceTimersByTime(RESTORE_ANIMATION_MS);
      });
      expect(screen.getByText("PopupRestoreTask")).toBeTruthy();

      act(() => {
        vi.advanceTimersByTime(POPUP_DURATION_MS);
      });

      expect(screen.queryByText("PopupRestoreTask")).toBeNull();
    });

    it("closes the popup when its close handler is called", () => {
      setState({ activeCount: 20 });

      render(<Archive />);

      fireEvent.click(screen.getByText("restore-1"));
      fireEvent.click(screen.getByText("close-limit"));

      expect(screen.queryByText("PopupLimit")).toBeNull();
    });

    it("closes the popup when the overlay is clicked", () => {
      setState({ activeCount: 20 });

      const { container } = render(<Archive />);

      fireEvent.click(screen.getByText("restore-1"));

      const overlay = container.querySelector(".fixed.inset-0");
      expect(overlay).not.toBeNull();

      fireEvent.click(overlay as Element);

      expect(screen.queryByText("PopupLimit")).toBeNull();
    });
  });

  describe("deleting a task", () => {
    it("dispatches deleteArchiveTaskRequest with the task id", () => {
      render(<Archive />);

      fireEvent.click(screen.getByText("delete-1"));

      expect(deleteArchiveTaskRequest).toHaveBeenCalledWith("1");
      expect(mocks.dispatch).toHaveBeenCalledWith({
        type: "delete",
        payload: "1",
      });
    });

    it("deletes only the selected task", () => {
      setState({
        archived: [createTask({ id: "1" }), createTask({ id: "2" })],
      });

      render(<Archive />);

      fireEvent.click(screen.getByText("delete-2"));

      expect(deleteArchiveTaskRequest).toHaveBeenCalledTimes(1);
      expect(deleteArchiveTaskRequest).toHaveBeenCalledWith("2");
    });

    it("passes the deleting flag only to the task being deleted", () => {
      mocks.deletingId = "2";
      setState({
        archived: [createTask({ id: "1" }), createTask({ id: "2" })],
      });

      render(<Archive />);

      expect(screen.getByTestId("deleting-1").textContent).toBe("false");
      expect(screen.getByTestId("deleting-2").textContent).toBe("true");
    });

    it("passes the locked flag to items", () => {
      mocks.isLocked = true;

      render(<Archive />);

      expect(screen.getByTestId("locked-1").textContent).toBe("true");
    });
  });

  describe("clearing the archive", () => {
    it("dispatches clearArchiveRequest when the clear button is clicked", () => {
      render(<Archive />);

      fireEvent.click(screen.getByText(t.archiveClearBtn));

      expect(clearArchiveRequest).toHaveBeenCalledTimes(1);
      expect(mocks.dispatch).toHaveBeenCalledWith({ type: "clear" });
    });
  });

  describe("image modal", () => {
    it("is closed by default", () => {
      render(<Archive />);
      expect(screen.getByTestId("modal-image").textContent).toBe("closed");
    });

    it("opens the image modal with the selected image", () => {
      render(<Archive />);

      fireEvent.click(screen.getByText("open-image-1"));

      expect(screen.getByTestId("modal-image").textContent).toBe(
        "https://img.test/a.png",
      );
    });
  });
});