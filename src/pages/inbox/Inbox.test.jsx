import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";
import Inbox from "./Inbox";
import { createTaskRequest } from "../../store/taskSlice";
import { translations } from "../../context/translations";

// mock dispatch
const dispatchMock = vi.fn();

let mockTasks = [];

vi.mock("react-redux", () => ({
  useDispatch: () => dispatchMock,
  useSelector: (fn) => fn({ tasks: { tasks: mockTasks } }),
}));

// mock language 
vi.mock("../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "en" }),
}));

// mock action
vi.mock("../../store/taskSlice", () => ({
  createTaskRequest: vi.fn(),
}));

// mock popups to not used useNavigate()
vi.mock("../../components/popupCreated/PopupCreated", () => ({
  default: () => <div>PopupCreated</div>,
}));

vi.mock("../../components/popupLimit/PopupLimit", () => ({
  default: () => <div>PopupLimit</div>,
}));

describe("Inbox component", () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    createTaskRequest.mockClear();
  });

  it("task created", () => {
    render(<Inbox />);

    const t = translations.en;

    const input = screen.getByPlaceholderText(t.newTask);
    const saveBtn = screen.getByText(t.save);

    fireEvent.change(input, { target: { value: "My new task" } });
    fireEvent.click(saveBtn);

    expect(dispatchMock).toHaveBeenCalled();
    expect(createTaskRequest).toHaveBeenCalled();

    const dispatchedArg = createTaskRequest.mock.calls[0][0];
    expect(dispatchedArg.title).toBe("My new task");
  });

  it("shows error if less 5 characters", () => {
  render(<Inbox />);

  const t = translations.en;

  const input = screen.getByPlaceholderText(t.newTask);
  const saveBtn = screen.getByText(t.save);

  fireEvent.change(input, { target: { value: "abc" } });
  fireEvent.click(saveBtn);

  expect(screen.getByText(t.validateTaskMin5Characters)).toBeInTheDocument();
  expect(dispatchMock).not.toHaveBeenCalled();
  expect(createTaskRequest).not.toHaveBeenCalled();
});

it("shows error if more 50 characters", () => {
  render(<Inbox />);

  const t = translations.en;

  const input = screen.getByPlaceholderText(t.newTask);
  const saveBtn = screen.getByText(t.save);

  // строка длиной 51 символ
  const longText = "a".repeat(51);

  fireEvent.change(input, { target: { value: longText } });
  fireEvent.click(saveBtn);

  expect(screen.getByText(t.validateTaskMax50Characters)).toBeInTheDocument();
  expect(dispatchMock).not.toHaveBeenCalled();
  expect(createTaskRequest).not.toHaveBeenCalled();
});

it("shows limit popup when tasks >= 15", () => {
  mockTasks = Array.from({ length: 15 }, (_, i) => ({ id: i }));

  render(<Inbox />);

  const t = translations.en;

  const input = screen.getByPlaceholderText(t.newTask);
  const saveBtn = screen.getByText(t.save);

  fireEvent.change(input, { target: { value: "Valid task" } });
  fireEvent.click(saveBtn);

  expect(screen.getByText("PopupLimit")).toBeInTheDocument();

  mockTasks = [];
});

it("subtask created when add button is clicked", () => {
  render(<Inbox />);

  const t = translations.en;

  const addBtn = screen.getByRole("button", { name: "" });

  fireEvent.click(addBtn);

  const subtaskInput = screen.getByPlaceholderText(t.subtaskPlaceholder(1));

  expect(subtaskInput).toBeInTheDocument();
});

it("clears the form", () => {
  vi.useFakeTimers();

  render(<Inbox />);

  const t = translations.en;

  const input = screen.getByPlaceholderText(t.newTask);
  const clearBtn = screen.getByText(t.clear);

  fireEvent.change(input, { target: { value: "Some task" } });
  expect(input.value).toBe("Some task");

  act(() => {
    fireEvent.click(clearBtn);
    vi.runAllTimers();
  });

  act(() => {});

  expect(input.value).toBe("");
});


});
