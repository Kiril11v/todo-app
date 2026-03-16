import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";
import Done from "./Done";
import { translations } from "../../context/translations";

const dispatchMock = vi.fn();

let mockCompletedTasks = [
  {
    id: 1,
    title: "Completed task",
    completedAt: Date.now(),
    subtasks: [],
  },
];

vi.mock("react-redux", () => ({
  useDispatch: () => dispatchMock,
  useSelector: (fn) =>
    fn({
      tasks: { completedTasks: mockCompletedTasks },
    }),
}));

vi.mock("../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "en" }),
}));

vi.mock("../../store/taskSlice", () => ({
  deleteCompletedTaskRequest: vi.fn((id) => ({ type: "deleteCompleted", payload: id })),
  archiveTaskRequest: vi.fn((id) => ({ type: "archive", payload: id })),
  clearAllCompletedTaskRequest: vi.fn(() => ({ type: "clearAll" })),
  archiveOldestTaskRequest: vi.fn(() => ({ type: "archiveOldest" })),
}));

vi.mock("../../components/popupSaveToArchive/PopupSaveToArchive", () => ({
  default: () => <div>PopupSaveToArchive</div>,
}));

import {
  deleteCompletedTaskRequest,
  archiveTaskRequest,
  clearAllCompletedTaskRequest,
} from "../../store/taskSlice";

describe("Done component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    dispatchMock.mockClear();
    deleteCompletedTaskRequest.mockClear();
    archiveTaskRequest.mockClear();
    clearAllCompletedTaskRequest.mockClear();
  });

  it("deletes a completed task", () => {
    render(<Done />);

    const deleteBtn = screen.getAllByRole("button")[1];

    act(() => {
      fireEvent.click(deleteBtn);
    });

    expect(dispatchMock).toHaveBeenCalled();
    expect(deleteCompletedTaskRequest).toHaveBeenCalledWith(1);
  });

  it("archives a completed task", () => {
    render(<Done />);

    const archiveBtn = screen.getAllByRole("button")[0];

    act(() => {
      fireEvent.click(archiveBtn);
    });

    expect(dispatchMock).toHaveBeenCalled();
    expect(archiveTaskRequest).toHaveBeenCalledWith(1);
  });

  it("clears all completed tasks", () => {
    render(<Done />);

    const t = translations.en;
    const clearBtn = screen.getByText(t.doneClearBtn);

    act(() => {
      fireEvent.click(clearBtn);
    });

    expect(dispatchMock).toHaveBeenCalled();
    expect(clearAllCompletedTaskRequest).toHaveBeenCalled();
  });
});