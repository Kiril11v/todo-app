import type { ReactNode } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

import { translations } from "../../context/translations";

import type { Task } from "../../types/task";

import Inbox from "./Inbox";

const t = translations.en;

// ---------- mock types ----------
interface CreateTaskPayload {
  tempId: string;
  title: string;
  subtasks: { title: string }[];
  imageFile: File | null;
  imagePreview: string | null;
  deadline: string | null;
}

interface ImageMock {
  imageFile: File | null;
  imagePreview: string | null;
  fileInputRef: { current: HTMLInputElement | null };
  handleImageChange: () => void;
  handleRemoveImage: () => void;
  resetFormOnly: () => void;
}

// ---------- shared mock state (vi.mock is hoisted, hence vi.hoisted) ----------
const mocks = vi.hoisted(() => {
  const createImage = (): ImageMock => ({
    imageFile: null,
    imagePreview: null,
    fileInputRef: { current: null },
    handleImageChange: vi.fn(),
    handleRemoveImage: vi.fn(),
    resetFormOnly: vi.fn(),
  });

  return {
    dispatch: vi.fn(),
    createTask: vi.fn((payload: CreateTaskPayload) => ({
      type: "tasks/createTaskRequest",
      payload,
    })),
    tasks: [] as unknown[],
    createImage,
    image: createImage(),
  };
});

// ---------- module mocks ----------
vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (fn: (state: unknown) => unknown) =>
    fn({ tasks: { tasks: mocks.tasks } }),
}));

vi.mock("../../store/taskSlice", () => ({
  createTaskRequest: mocks.createTask,
}));

vi.mock("../../hooks/useLanguage", () => ({
  useLanguage: () => ({ language: "en" }),
}));

vi.mock("../../hooks/useImageAttachment", () => ({
  useImageAttachment: () => mocks.image,
}));

vi.mock("../../components/portal/Portal", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("../../components/popupCreated/PopupCreated", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div>
      PopupCreated
      <button onClick={onClose}>close-created</button>
    </div>
  ),
}));

vi.mock("../../components/popupLimit/PopupLimit", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div>
      PopupLimit
      <button onClick={onClose}>close-limit</button>
    </div>
  ),
}));

vi.mock("../../components/imagePreview/ImagePreview", () => ({
  default: ({
    imagePreview,
    handleRemoveImage,
  }: {
    imagePreview: string | null;
    handleRemoveImage: () => void;
  }) =>
    imagePreview ? (
      <div>
        <img src={imagePreview} alt="preview" />
        <button type="button" onClick={handleRemoveImage}>
          remove-image
        </button>
      </div>
    ) : null,
}));

// Timer/deadline: a plain input bound to the form field
vi.mock("../../components/timerCreateTasks/TimerCreateTasks", async () => {
  const { Field } = await import("react-final-form");
  return {
    default: ({ name }: { name: string }) => (
      <Field name={name}>
        {({ input }) => <input data-testid="deadline" {...input} />}
      </Field>
    ),
  };
});

// Subtask: input + remove button
vi.mock("../../components/subtaskField/SubtaskField", async () => {
  const { Field } = await import("react-final-form");
  return {
    default: ({
      name,
      index,
      fields,
    }: {
      name: string;
      index: number;
      fields: { remove: (i: number) => void };
    }) => (
      <div>
        <Field name={`${name}.title`}>
          {({ input }) => <input {...input} placeholder={`subtask-${index}`} />}
        </Field>
        <button type="button" onClick={() => fields.remove(index)}>
          {`remove-subtask-${index}`}
        </button>
      </div>
    ),
  };
});

// ---------- helpers ----------
const makeTasks = (count: number): Task[] =>
  Array.from({ length: count }, (_, i) => ({
    id: String(i),
    title: `Task ${i}`,
    image_url: null,
    created_at: "2030-01-01T00:00:00Z",
    completed_at: null,
    archived_at: null,
    deadline: null,
    failed: null,
  }));

const queryOrThrow = <T extends HTMLElement>(
  root: ParentNode,
  selector: string,
): T => {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
};

const getTaskInput = () => screen.getByPlaceholderText<HTMLInputElement>(t.newTask);

const typeTask = (value: string) =>
  fireEvent.change(getTaskInput(), { target: { value } });

const clickSave = () => fireEvent.click(screen.getByText(t.save));

const submitTask = (value = "My new task") => {
  typeTask(value);
  clickSave();
};

const getAddSubtaskBtn = (container: HTMLElement) =>
  queryOrThrow<HTMLButtonElement>(container, ".add-btn");

const lastPayload = (): CreateTaskPayload => {
  const call = mocks.createTask.mock.calls.at(-1);
  if (!call) throw new Error("createTaskRequest was not called");
  return call[0];
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.tasks = [];
  mocks.image = mocks.createImage();
});

afterEach(() => {
  vi.useRealTimers();
});

// ======================================================================
describe("Inbox: task creation", () => {
  it("creates a task and dispatches createTaskRequest", () => {
    render(<Inbox />);
    submitTask("My new task");

    expect(mocks.createTask).toHaveBeenCalledTimes(1);
    expect(mocks.dispatch).toHaveBeenCalledTimes(1);

    const payload = lastPayload();
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: "tasks/createTaskRequest",
      payload,
    });

    expect(payload.tempId).toMatch(/^temp_/);
    expect(payload).toMatchObject({
      title: "My new task",
      subtasks: [],
      deadline: null,
      imageFile: null,
      imagePreview: null,
    });
  });

  it("trims whitespace in the title", () => {
    render(<Inbox />);
    submitTask("   Trimmed title   ");

    expect(lastPayload().title).toBe("Trimmed title");
  });

  it("resets the form after successful creation", () => {
    render(<Inbox />);
    submitTask("My new task");

    expect(getTaskInput().value).toBe("");
    expect(mocks.image.resetFormOnly).toHaveBeenCalledTimes(1);
  });

  it("Clear button resets the field and removes the image", () => {
    render(<Inbox />);

    typeTask("Some task");
    expect(getTaskInput().value).toBe("Some task");

    fireEvent.click(screen.getByText(t.clear));

    expect(getTaskInput().value).toBe("");
    expect(mocks.image.handleRemoveImage).toHaveBeenCalledTimes(1);
  });

  it("Clear button is disabled while the form is pristine and no image is attached", () => {
    render(<Inbox />);
    const clearBtn = screen.getByText(t.clear);

    expect(clearBtn).toBeDisabled();

    typeTask("abc");
    expect(clearBtn).toBeEnabled();
  });

  it("Clear button is enabled when an image is attached", () => {
    mocks.image.imageFile = new File(["x"], "a.png", { type: "image/png" });
    render(<Inbox />);

    expect(screen.getByText(t.clear)).toBeEnabled();
  });
});

// ======================================================================
describe("Inbox: subtasks", () => {
  it("adds a subtask when the + button is clicked", () => {
    const { container } = render(<Inbox />);

    fireEvent.click(getAddSubtaskBtn(container));

    expect(screen.getByPlaceholderText("subtask-0")).toBeInTheDocument();
  });

  it("triggers the spin animation on the icon", () => {
    const { container } = render(<Inbox />);

    fireEvent.click(getAddSubtaskBtn(container));

    expect(queryOrThrow(container, ".add-btn-icon")).toHaveClass("spin");
  });

  it("does not allow more than 10 subtasks", () => {
    const { container } = render(<Inbox />);

    for (let i = 0; i < 12; i++) {
      fireEvent.click(getAddSubtaskBtn(container));
    }

    expect(screen.getAllByPlaceholderText(/^subtask-\d+$/)).toHaveLength(10);
  });

  it("removes a subtask", () => {
    const { container } = render(<Inbox />);

    fireEvent.click(getAddSubtaskBtn(container));
    fireEvent.click(getAddSubtaskBtn(container));
    expect(screen.getAllByPlaceholderText(/^subtask-\d+$/)).toHaveLength(2);

    fireEvent.click(screen.getByText("remove-subtask-0"));

    expect(screen.getAllByPlaceholderText(/^subtask-\d+$/)).toHaveLength(1);
  });

  it("sends subtasks in the correct order (unshift on add, reverse on submit)", () => {
    const { container } = render(<Inbox />);

    fireEvent.click(getAddSubtaskBtn(container));
    fireEvent.change(screen.getByPlaceholderText("subtask-0"), {
      target: { value: "first" },
    });

    // a new subtask is inserted at the start of the list (index 0)
    fireEvent.click(getAddSubtaskBtn(container));
    fireEvent.change(screen.getByPlaceholderText("subtask-0"), {
      target: { value: "second" },
    });

    submitTask("Task with subtasks");

    expect(lastPayload().subtasks).toEqual([
      { title: "first" },
      { title: "second" },
    ]);
  });

  it("drops empty subtasks and trims whitespace", () => {
    const { container } = render(<Inbox />);

    fireEvent.click(getAddSubtaskBtn(container));
    fireEvent.click(getAddSubtaskBtn(container));

    fireEvent.change(screen.getByPlaceholderText("subtask-0"), {
      target: { value: "   " },
    });
    fireEvent.change(screen.getByPlaceholderText("subtask-1"), {
      target: { value: "  keep me  " },
    });

    submitTask("Task with subtasks");

    expect(lastPayload().subtasks).toEqual([{ title: "keep me" }]);
  });
});

// ======================================================================
describe("Inbox: validation", () => {
  it("shows an error if the title is shorter than 5 characters", () => {
    render(<Inbox />);
    submitTask("abc");

    expect(screen.getByText(t.validateTaskMin5Characters)).toBeInTheDocument();
    expect(mocks.dispatch).not.toHaveBeenCalled();
    expect(mocks.createTask).not.toHaveBeenCalled();
  });

  it("shows an error if the title is longer than 50 characters", () => {
    render(<Inbox />);
    submitTask("a".repeat(51));

    expect(screen.getByText(t.validateTaskMax50Characters)).toBeInTheDocument();
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("accepts boundary lengths of 5 and 50 characters", () => {
    render(<Inbox />);

    submitTask("a".repeat(5));
    expect(mocks.createTask).toHaveBeenCalledTimes(1);

    submitTask("b".repeat(50));
    expect(mocks.createTask).toHaveBeenCalledTimes(2);
  });

  it("does not submit an empty title", () => {
    render(<Inbox />);
    clickSave();

    expect(mocks.dispatch).not.toHaveBeenCalled();
    expect(mocks.createTask).not.toHaveBeenCalled();
  });

  it("does not show the error before a submit attempt", () => {
    render(<Inbox />);
    typeTask("abc");

    expect(
      screen.queryByText(t.validateTaskMin5Characters),
    ).not.toBeInTheDocument();
  });

  it("does not show the created popup for invalid data", () => {
    render(<Inbox />);
    submitTask("abc");

    expect(screen.queryByText("PopupCreated")).not.toBeInTheDocument();
  });
});

// ======================================================================
describe("Inbox: image", () => {
  it("attach button opens the file picker", () => {
    const { container } = render(<Inbox />);

    const fileInput = queryOrThrow<HTMLInputElement>(
      container,
      'input[type="file"]',
    );
    const clickSpy = vi.spyOn(fileInput, "click");

    fireEvent.click(queryOrThrow(container, ".attach-image"));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("file input accepts images only", () => {
    const { container } = render(<Inbox />);

    expect(queryOrThrow(container, 'input[type="file"]')).toHaveAttribute(
      "accept",
      "image/*",
    );
  });

  it("selecting a file calls handleImageChange", () => {
    const { container } = render(<Inbox />);
    const fileInput = queryOrThrow<HTMLInputElement>(
      container,
      'input[type="file"]',
    );

    const file = new File(["x"], "photo.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mocks.image.handleImageChange).toHaveBeenCalledTimes(1);
  });

  it("does not show a preview without an image", () => {
    render(<Inbox />);

    expect(screen.queryByAltText("preview")).not.toBeInTheDocument();
  });

  it("shows the preview and removes the image", () => {
    mocks.image.imagePreview = "blob:preview-url";
    render(<Inbox />);

    expect(screen.getByAltText("preview")).toHaveAttribute(
      "src",
      "blob:preview-url",
    );

    fireEvent.click(screen.getByText("remove-image"));
    expect(mocks.image.handleRemoveImage).toHaveBeenCalledTimes(1);
  });

  it("passes the image to createTaskRequest", () => {
    const file = new File(["x"], "photo.png", { type: "image/png" });
    mocks.image.imageFile = file;
    mocks.image.imagePreview = "blob:preview-url";

    render(<Inbox />);
    submitTask("Task with image");

    expect(lastPayload().imageFile).toBe(file);
    expect(lastPayload().imagePreview).toBe("blob:preview-url");
  });
});

// ======================================================================
describe("Inbox: deadline", () => {
  it("deadline defaults to null", () => {
    render(<Inbox />);
    submitTask("Task no deadline");

    expect(lastPayload().deadline).toBeNull();
  });

  it("passes the selected deadline to createTaskRequest", () => {
    render(<Inbox />);

    fireEvent.change(screen.getByTestId("deadline"), {
      target: { value: "2030-01-01T12:00" },
    });
    submitTask("Task with deadline");

    expect(lastPayload().deadline).toBe("2030-01-01T12:00");
  });

  it("resets the deadline after submit", () => {
    render(<Inbox />);

    fireEvent.change(screen.getByTestId("deadline"), {
      target: { value: "2030-01-01T12:00" },
    });
    submitTask("Task with deadline");

    expect(screen.getByTestId<HTMLInputElement>("deadline").value).toBe("");
  });

  it("Clear resets the deadline", () => {
    render(<Inbox />);

    fireEvent.change(screen.getByTestId("deadline"), {
      target: { value: "2030-01-01T12:00" },
    });
    fireEvent.click(screen.getByText(t.clear));

    expect(screen.getByTestId<HTMLInputElement>("deadline").value).toBe("");
  });
});

// ======================================================================
describe("Inbox: popups", () => {
  it("shows no popups on first render", () => {
    render(<Inbox />);

    expect(screen.queryByText("PopupCreated")).not.toBeInTheDocument();
    expect(screen.queryByText("PopupLimit")).not.toBeInTheDocument();
  });

  it("shows PopupCreated after a task is created", () => {
    render(<Inbox />);
    submitTask();

    expect(screen.getByText("PopupCreated")).toBeInTheDocument();
    expect(screen.queryByText("PopupLimit")).not.toBeInTheDocument();
  });

  it("PopupCreated closes automatically after 3 seconds", () => {
    vi.useFakeTimers();
    render(<Inbox />);
    submitTask();

    expect(screen.getByText("PopupCreated")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(screen.getByText("PopupCreated")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText("PopupCreated")).not.toBeInTheDocument();
  });

  it("PopupCreated closes via onClose", () => {
    render(<Inbox />);
    submitTask();

    fireEvent.click(screen.getByText("close-created"));

    expect(screen.queryByText("PopupCreated")).not.toBeInTheDocument();
  });

  it("popup closes when the overlay is clicked", () => {
    render(<Inbox />);
    submitTask();

    fireEvent.click(queryOrThrow(document, "div.fixed.inset-0"));

    expect(screen.queryByText("PopupCreated")).not.toBeInTheDocument();
  });

  it("shows PopupLimit when there are already 20 tasks and does not create a task", () => {
    mocks.tasks = makeTasks(20);

    render(<Inbox />);
    submitTask("Valid task");

    expect(screen.getByText("PopupLimit")).toBeInTheDocument();
    expect(screen.queryByText("PopupCreated")).not.toBeInTheDocument();
    expect(mocks.dispatch).not.toHaveBeenCalled();
    expect(mocks.createTask).not.toHaveBeenCalled();
  });

  it("still allows creating a task when there are 19", () => {
    mocks.tasks = makeTasks(19);

    render(<Inbox />);
    submitTask("Valid task");

    expect(screen.queryByText("PopupLimit")).not.toBeInTheDocument();
    expect(mocks.createTask).toHaveBeenCalledTimes(1);
  });

  it("PopupLimit closes automatically and via onClose", () => {
    vi.useFakeTimers();
    mocks.tasks = makeTasks(20);

    render(<Inbox />);
    submitTask("Valid task");
    expect(screen.getByText("PopupLimit")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText("PopupLimit")).not.toBeInTheDocument();

    clickSave();
    expect(screen.getByText("PopupLimit")).toBeInTheDocument();

    fireEvent.click(screen.getByText("close-limit"));
    expect(screen.queryByText("PopupLimit")).not.toBeInTheDocument();
  });
});