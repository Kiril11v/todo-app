import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { ReactNode } from "react";
import type { Task } from "../../types/task"; // adjust paths to your project
import type { SubtaskGroup } from "../../types/subtask";

import Tasks from "./Tasks";
import { translations } from "../../context/translations";

/* ------------------------------ mock prop types ---------------------------- */

interface TaskItemProps {
  task: Task;
  checkMarkId: string | null;
  onToggleComplete: (id: string) => void;
  onOpenImage: (src: string) => void;
  onOpenSubtasks: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSaveEdit: (id: string, title: string) => void;
}
interface ModalImageProps {
  src: string | null;
  onClose: () => void;
}
interface SubtasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTask: Task | null;
  subtasksData: SubtaskGroup | null;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
}
interface PopupProps {
  onClose: () => void;
}
interface FailedPanelProps {
  failedTasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

/* --------------------------------- mocks ----------------------------------- */

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  pathname: "/tasks",
  state: {
    tasks: { tasks: [] as Task[] | null, completedTasks: [] as Task[] },
    subtasks: { byTaskId: {} as Record<string, SubtaskGroup> },
  },
}));

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: mocks.pathname }),
}));

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (selector: (s: typeof mocks.state) => unknown) =>
    selector(mocks.state),
}));

vi.mock("../../hooks/useLanguage", () => ({
  useLanguage: () => ({ language: "en" }),
}));

vi.mock("../../store/taskSlice", () => ({
  completeTaskRequest: vi.fn((payload: string) => ({ type: "complete", payload })),
  deleteTaskRequest: vi.fn((payload: string) => ({ type: "delete", payload })),
  editTaskRequest: vi.fn((payload: { id: string; newText: string }) => ({
    type: "edit",
    payload,
  })),
}));

vi.mock("../../store/subtasksSlice", () => ({
  toggleSubtaskRequest: vi.fn((payload: { taskId: string; subtaskId: string }) => ({
    type: "toggleSubtask",
    payload,
  })),
}));

// a task is "failed" when its deadline is earlier than "now"
vi.mock("../../utils/deadline", () => ({
  isTaskFailed: (task: { deadline: string | null }, now: Date) =>
    task.deadline != null && new Date(task.deadline) < now,
}));

vi.mock("../../hooks/useDeleteTask", () => ({
  useDeleteTask: (cb: (id: string) => void) => ({
    requestDelete: cb,
    isLocked: false,
    isDeletingItem: () => false,
  }),
}));

vi.mock("../../components/portal/Portal", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("../../components/taskItem/TaskItem", () => ({
  default: (p: TaskItemProps) => (
    <li data-testid={`task-${p.task.id}`} data-checkmark={String(p.checkMarkId === p.task.id)}>
      <span>{p.task.title}</span>
      <button onClick={() => p.onToggleComplete(p.task.id)}>complete</button>
      <button onClick={() => p.task.image_url && p.onOpenImage(p.task.image_url)}>image</button>
      <button onClick={() => p.onOpenSubtasks(p.task.id)}>subtasks</button>
      <button onClick={() => p.onDeleteTask(p.task.id)}>delete</button>
      <button onClick={() => p.onSaveEdit(p.task.id, "New title")}>save</button>
    </li>
  ),
}));

vi.mock("../../components/modalImage/ModalImage", () => ({
  default: ({ src, onClose }: ModalImageProps) =>
    src ? (
      <div data-testid="modal-image">
        <img src={src} alt="task" />
        <button onClick={onClose}>close-image</button>
      </div>
    ) : null,
}));

vi.mock("../../components/subtasksModal/SubtasksModal", () => ({
  default: ({ isOpen, selectedTask, subtasksData, toggleSubtask }: SubtasksModalProps) =>
    isOpen && selectedTask ? (
      <div role="dialog">
        <h2>{selectedTask.title}</h2>
        {subtasksData?.items.map((s) => (
          <button key={s.id} onClick={() => toggleSubtask(selectedTask.id, s.id)}>
            toggle-{s.id}
          </button>
        ))}
      </div>
    ) : null,
}));

vi.mock("../../components/popupCompleted/PopupCompleted", () => ({
  default: (p: PopupProps) => (
    <div data-testid="popup-completed">
      <button onClick={p.onClose}>close-completed</button>
    </div>
  ),
}));

vi.mock("../../components/popupDoneLimit/PopupDoneLimit", () => ({
  default: () => <div data-testid="popup-done-limit" />,
}));

vi.mock("../../components/failedTasksPanel/FailedTasksPanel", () => ({
  default: (p: FailedPanelProps) => (
    <div data-testid="failed-panel" data-open={String(p.isOpen)}>
      {p.failedTasks.map((task) => (
        <span key={task.id}>failed:{task.title}</span>
      ))}
    </div>
  ),
}));

import { completeTaskRequest, deleteTaskRequest, editTaskRequest } from "../../store/taskSlice";
import { toggleSubtaskRequest } from "../../store/subtasksSlice";

/* --------------------------------- helpers --------------------------------- */

const t = translations.en;

const makeTask = (id: string, overrides: Partial<Task> = {}): Task => ({
  id,
  title: `Task ${id}`,
  image_url: null,
  created_at: "2024-12-01T00:00:00Z",
  completed_at: null,
  archived_at: null,
  deadline: null,
  failed: null,
  ...overrides,
});

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const click = (name: string) => fireEvent.click(screen.getByText(name));
const completedTasks = (n: number) =>
  Array.from({ length: n }, (_, i) => makeTask(`done-${i}`));

/* ---------------------------------- tests ---------------------------------- */

describe("Tasks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T12:00:00Z"));
    vi.clearAllMocks();
    mocks.pathname = "/tasks";
    mocks.state.tasks = { tasks: [makeTask("1")], completedTasks: [] };
    mocks.state.subtasks = { byTaskId: {} };
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("rendering", () => {
    it("renders tasks and hides the empty-state text", () => {
      render(<Tasks />);

      expect(screen.getByRole("heading", { name: t.tasks })).toBeInTheDocument();
      expect(screen.getByTestId("task-1")).toBeInTheDocument();
      expect(screen.queryByText(t.taskText)).not.toBeInTheDocument();
    });

    it("shows the empty-state text and ignores tasks without an id", () => {
      mocks.state.tasks.tasks = [{ ...makeTask("x"), id: null } as unknown as Task];
      render(<Tasks />);

      expect(screen.getByText(t.taskText)).toBeInTheDocument();
      expect(screen.queryAllByTestId(/^task-/)).toHaveLength(0);
    });
  });

  describe("completing a task", () => {
    it("dispatches after the 600ms animation and shows the completed popup", () => {
      render(<Tasks />);

      click("complete");
      expect(screen.getByTestId("task-1")).toHaveAttribute("data-checkmark", "true");
      advance(599);
      expect(mocks.dispatch).not.toHaveBeenCalled();

      advance(1);
      expect(completeTaskRequest).toHaveBeenCalledWith("1");
      expect(mocks.dispatch).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("popup-completed")).toBeInTheDocument();
    });

    it("dispatches only once on a rapid double click", () => {
      render(<Tasks />);

      click("complete");
      advance(300);
      click("complete");
      advance(600);

      expect(mocks.dispatch).toHaveBeenCalledTimes(1);
    });

    it("shows the limit popup instead of completing when 15 tasks are done", () => {
      mocks.state.tasks.completedTasks = completedTasks(15);
      render(<Tasks />);

      click("complete");
      advance(600);

      expect(screen.getByTestId("popup-done-limit")).toBeInTheDocument();
      expect(mocks.dispatch).not.toHaveBeenCalled();
    });
  });

  describe("popups", () => {
    const openPopup = () => {
      render(<Tasks />);
      click("complete");
      advance(600);
    };

    it("hides automatically after 3 seconds", () => {
      openPopup();

      advance(2999);
      expect(screen.getByTestId("popup-completed")).toBeInTheDocument();
      advance(1);
      expect(screen.queryByTestId("popup-completed")).not.toBeInTheDocument();
    });

    it("closes when the overlay is clicked", () => {
      openPopup();

      fireEvent.click(document.querySelector(".bg-black\\/40") as HTMLElement);

      expect(screen.queryByTestId("popup-completed")).not.toBeInTheDocument();
    });
  });

  describe("editing and deleting", () => {
    it("dispatches edit and delete requests", () => {
      render(<Tasks />);

      click("save");
      expect(editTaskRequest).toHaveBeenCalledWith({ id: "1", newText: "New title" });

      click("delete");
      expect(deleteTaskRequest).toHaveBeenCalledWith("1");
      expect(mocks.dispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe("images", () => {
    it("opens and closes the image modal", () => {
      mocks.state.tasks.tasks = [makeTask("1", { image_url: "https://img.test/a.png" })];
      render(<Tasks />);

      click("image");
      expect(within(screen.getByTestId("modal-image")).getByRole("img")).toHaveAttribute(
        "src",
        "https://img.test/a.png",
      );

      click("close-image");
      expect(screen.queryByTestId("modal-image")).not.toBeInTheDocument();
    });
  });

  describe("subtasks", () => {
    const withSubtasks = (items: SubtaskGroup["items"]) => {
      mocks.state.subtasks.byTaskId = { "1": { items } };
    };

    it("opens the modal and toggles a subtask", () => {
      withSubtasks([{ id: "s1", title: "Sub 1" }]);
      render(<Tasks />);

      click("subtasks");
      expect(within(screen.getByRole("dialog")).getByText("Task 1")).toBeInTheDocument();

      click("toggle-s1");
      expect(toggleSubtaskRequest).toHaveBeenCalledWith({ taskId: "1", subtaskId: "s1" });
    });

    it("ignores optimistic temp subtasks", () => {
      withSubtasks([{ id: "temp_1_sub_0", title: "Temp" }]);
      render(<Tasks />);

      click("subtasks");
      click("toggle-temp_1_sub_0");

      expect(mocks.dispatch).not.toHaveBeenCalled();
    });

    it("closes automatically when no subtasks are left", () => {
      withSubtasks([{ id: "s1", title: "Sub 1" }]);
      const { rerender } = render(<Tasks />);

      click("subtasks");
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      withSubtasks([]);
      rerender(<Tasks />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("failed tasks", () => {
    const failedButton = () => screen.queryByRole("button", { name: `${t.btnFailed} (1)` });

    beforeEach(() => {
      mocks.state.tasks.tasks = [
        makeTask("1", { deadline: "2025-01-02T12:00:00Z" }),
        makeTask("2", { deadline: "2024-12-31T12:00:00Z" }),
      ];
    });

    it("moves overdue tasks to the failed panel and opens it via the button", () => {
      render(<Tasks />);

      expect(screen.getByTestId("task-1")).toBeInTheDocument();
      expect(screen.queryByTestId("task-2")).not.toBeInTheDocument();
      expect(screen.getByText("failed:Task 2")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: `${t.btnFailed} (1)` }));
      expect(screen.getByTestId("failed-panel")).toHaveAttribute("data-open", "true");
    });

    it("hides the failed button outside the /tasks route", () => {
      mocks.pathname = "/archive";
      render(<Tasks />);

      expect(failedButton()).not.toBeInTheDocument();
    });

    it("recalculates deadlines when the tab becomes visible again", () => {
      render(<Tasks />);
      expect(screen.getByTestId("task-1")).toBeInTheDocument();

      vi.setSystemTime(new Date("2025-01-03T12:00:00Z"));
      act(() => void document.dispatchEvent(new Event("visibilitychange")));

      expect(screen.queryByTestId("task-1")).not.toBeInTheDocument();
      expect(screen.getByText("failed:Task 1")).toBeInTheDocument();
    });
  });
});