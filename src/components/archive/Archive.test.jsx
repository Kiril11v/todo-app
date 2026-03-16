import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";
import Archive from "./Archive";
import { translations } from "../../context/translations";

const dispatchMock = vi.fn();

let mockArchivedTasks = [
  {
    id: 1,
    title: "Archived task",
    completedAt: Date.now(),
    subtasks: [{ title: "sub1" }],
  },
];

vi.mock("react-redux", () => ({
  useDispatch: () => dispatchMock,
  useSelector: (fn) =>
    fn({
      tasks: { archivedTasks: mockArchivedTasks },
    }),
}));

vi.mock("../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "en" }),
}));

vi.mock("../../store/taskSlice", () => ({
  restoreArchiveRequest: vi.fn((id) => ({ type: "restore", payload: id })),
  deleteArchiveTaskRequest: vi.fn((id) => ({ type: "delete", payload: id })),
  clearArchiveRequest: vi.fn(() => ({ type: "clear" })),
}));

vi.mock("../popupRestoreTask/PopupRestoreTask", () => ({
  default: () => <div>PopupRestoreTask</div>,
}));

import {
  restoreArchiveRequest,
  deleteArchiveTaskRequest,
  clearArchiveRequest,
} from "../../store/taskSlice";

describe("Archive component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    dispatchMock.mockClear();
    restoreArchiveRequest.mockClear();
    deleteArchiveTaskRequest.mockClear();
    clearArchiveRequest.mockClear();
  });

  it("restores an archived task", () => {
    render(<Archive />);

    const restoreBtn = screen.getAllByRole("button")[0];

    act(() => {
      fireEvent.click(restoreBtn);
    });

    expect(dispatchMock).toHaveBeenCalled();
    expect(restoreArchiveRequest).toHaveBeenCalledWith(1);

    expect(screen.getByText("PopupRestoreTask")).toBeTruthy();
  });

  it("deletes an archived task", () => {
    render(<Archive />);

    const deleteBtn = screen.getAllByRole("button")[1];

    act(() => {
      fireEvent.click(deleteBtn);
    });

    expect(dispatchMock).toHaveBeenCalled();
    expect(deleteArchiveTaskRequest).toHaveBeenCalledWith(1);
  });

  it("clears all archived tasks", () => {
    render(<Archive />);

    const t = translations.en;
    const clearBtn = screen.getByText(t.archiveClearBtn);

    act(() => {
      fireEvent.click(clearBtn);
    });

    expect(dispatchMock).toHaveBeenCalled();
    expect(clearArchiveRequest).toHaveBeenCalled();
  });
});
