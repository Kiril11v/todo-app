import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";
import Tasks from "./Tasks";
import { translations } from "../../context/translations"

// mock dispatch
const dispatchMock = vi.fn();

let mockTasks = [
  { 
    id: 1,
    title: "Test task",
    subtasks: [{}, {}, {}],
  }
];

let mockSubCompleted = {
  1: { 0: true, 1: false, 2: true },
};

// mock react-redux
vi.mock("react-redux", () => ({
  useDispatch: () => dispatchMock,
  useSelector: (fn) =>
    fn({
      tasks: { tasks: mockTasks },
      subtasks: { completed: mockSubCompleted }
    }),
}));

// mock language
vi.mock("../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "en" }),
}));

// mock actions
vi.mock("../../store/taskSlice", () => ({
  deleteTaskRequest: vi.fn(),
  editTaskRequest: vi.fn(),
  completeTaskRequest: vi.fn(),
}));

vi.mock("../../store/subtasksSlice", () => ({
  toggleSubtaskRequest: vi.fn(),
}));

vi.mock("../../components/subtasksModal/SubtasksModal", () => ({
  default: () => <div>SubtasksModal</div>,
}));

vi.mock("../../components/popupCompleted/PopupCompleted", () => ({
  default: () => <div>PopupCompleted</div>,
}));

import { 
    completeTaskRequest,
    deleteTaskRequest,
    editTaskRequest,
 } from "../../store/taskSlice";

describe("Tasks component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    dispatchMock.mockClear();
    completeTaskRequest.mockClear();
    deleteTaskRequest.mockClear();
    editTaskRequest.mockClear();
  });

  it("task completed", () => {
    render(<Tasks />);

    const checkbox = screen.getByRole("checkbox", { hidden: true });

    act(() => {
        fireEvent.click(checkbox);
        vi.runAllTimers();
    })
    
    expect(dispatchMock).toHaveBeenCalled();
    expect(completeTaskRequest).toHaveBeenCalledWith(1);
  });
  
  it("task deleted", () => {
    render(<Tasks />);

    const deleteBtn = screen.getAllByRole("button")[1];

    act(() => {
        fireEvent.click(deleteBtn);
    })
    
    expect(dispatchMock).toHaveBeenCalled();
    expect(deleteTaskRequest).toHaveBeenCalledWith(1);
  });

  it("task has been edited", () => {
  render(<Tasks />);

  const editBtn = screen.getAllByRole("button")[0];

  act(() => {
    fireEvent.click(editBtn);
  });

  const textarea = screen.getByDisplayValue("Test task");

  expect(textarea).toBeInTheDocument();
});

it("shows error if less than 5 characters", () => {
  render(<Tasks />);

  const t = translations.en;

  const editBtn = screen.getAllByRole("button")[0];

  act(() => {
    fireEvent.click(editBtn);
  });

  const textarea = screen.getByDisplayValue("Test task");

  act(() => {
    fireEvent.change(textarea, { target: { value: "abc" } });
    fireEvent.blur(textarea);
  });

  expect(screen.getByText(t.validateTaskMin5Characters)).toBeInTheDocument();

  expect(editTaskRequest).not.toHaveBeenCalled();
});

it("shows error if more than 50 characters", () => {
  render(<Tasks />);

  const t = translations.en;

  const editBtn = screen.getAllByRole("button")[0];

  act(() => {
    fireEvent.click(editBtn);
  });

  const textarea = screen.getByDisplayValue("Test task");

  const longText = "a".repeat(51);

  act(() => {
    fireEvent.change(textarea, { target: { value: longText } });
    fireEvent.blur(textarea);
  });

  expect(screen.getByText(t.validateTaskMax50Characters)).toBeInTheDocument();
  expect(editTaskRequest).not.toHaveBeenCalled();
});

});