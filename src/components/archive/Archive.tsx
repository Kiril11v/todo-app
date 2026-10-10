import { useEffect, useState, useCallback, useRef } from "react";
import {
  restoreArchiveRequest,
  deleteArchiveTaskRequest,
  clearArchiveRequest,
} from "../../store/taskSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

import { translations } from "../../context/translations";

import { useDeleteTask } from "../../hooks/useDeleteTask";
import { useLanguage } from "../../hooks/useLanguage";

import TaskArchiveItem from "../taskArchiveItem/TaskArchiveItem";
import PopupLimit from "../popupLimit/PopupLimit";
import PopupRestoreTask from "../popupRestoreTask/PopupRestoreTask";
import ModalImage from "../modalImage/ModalImage";
import Portal from "../portal/Portal";

import "./archive.css";

const RESTORE_ANIMATION_MS = 600;
const POPUP_DURATION_MS = 3000;
const MAX_TASKS = 20;

type PopupType = "limit" | "restore" | null;

export default function Archive() {
  const dispatch = useAppDispatch();
  const archivedTasks = useAppSelector((s) => s.tasks.archivedTasks);
  const tasksCount = useAppSelector((s) => s.tasks.tasks.length);
  const subtasksByTaskId = useAppSelector((s) => s.subtasks.byTaskId);

  const [popup, setPopup] = useState<PopupType>(null);
  const [restoringAnimationId, setRestoringAnimationId] = useState<string | null>(null);
  const [openImage, setOpenImage] = useState<string | null>(null);

  // language
  const { language } = useLanguage();
  const t = translations[language];

  // prevent duplicate dispatch on rapid double-click
  const restoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
    };
  }, []);

  // restore tasks
  const handleRestore = useCallback(
    (id: string) => {
      dispatch(restoreArchiveRequest(id));
      setPopup("restore");
    },
    [dispatch],
  );

  // clear tasks
  const handleClearArchive = useCallback(() => {
    dispatch(clearArchiveRequest());
  }, [dispatch]);

  // delete Task
  const { requestDelete, isLocked, isDeletingItem } = useDeleteTask((id: string) => {
    dispatch(deleteArchiveTaskRequest(id));
  });

  // trigger restore animation
  const handleRestoreClick = useCallback(
    (id: string) => {
      if (restoreTimerRef.current) return;

      if (tasksCount >= MAX_TASKS) {
        setPopup("limit");
        return;
      }

      setRestoringAnimationId(id);
      restoreTimerRef.current = setTimeout(() => {
        setRestoringAnimationId(null);
        restoreTimerRef.current = null;
        handleRestore(id);
      }, RESTORE_ANIMATION_MS);
    },
    [tasksCount, handleRestore],
  );

  const closePopup = useCallback(() => setPopup(null), []);
  const closeImage = useCallback(() => setOpenImage(null), []);

  // timer popups
  useEffect(() => {
    if (!popup) return;

    const timer = setTimeout(() => setPopup(null), POPUP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [popup]);

  return (
    <div className="ubuntu-regular p-8 min-h-[75vh]">
      {popup && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closePopup}
          />
          {popup === "limit" && <PopupLimit onClose={closePopup} />}
          {popup === "restore" && <PopupRestoreTask onClose={closePopup} />}
        </Portal>
      )}

      <h2 className="sekuya-regular text-3xl sm:text-5xl">{t.archive}</h2>

      {archivedTasks.length === 0 && <p>{t.archiveText}</p>}

      <ul className="flex flex-col mt-4">
        {archivedTasks.map((task, index) => (
          <TaskArchiveItem
            key={task.id}
            task={task}
            index={index}
            subtasks={subtasksByTaskId[task.id]}
            isRestoring={restoringAnimationId === task.id}
            onRestore={handleRestoreClick}
            onOpenImage={setOpenImage}
            isLocked={isLocked}
            isDeleting={isDeletingItem(task.id)}
            onDelete={requestDelete}
          />
        ))}
      </ul>

      <ModalImage src={openImage} onClose={closeImage} />

      {archivedTasks.length > 0 && (
        <div className="flex justify-end">
          {/* btn clear */}
          <button
            type="button"
            onClick={handleClearArchive}
            className="text-red-60 mt-5 mr-2 px-7 py-3 rounded-lg error-border cursor-pointer"
          >
            {t.archiveClearBtn}
          </button>
        </div>
      )}
    </div>
  );
}
