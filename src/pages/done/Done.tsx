import { useEffect, useState, useCallback, useRef } from "react";

import {
  clearAllCompletedTaskRequest,
  archiveTaskRequest,
  deleteCompletedTaskRequest,
} from "../../store/taskSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

import { translations } from "../../context/translations";

import { useDeleteTask } from "../../hooks/useDeleteTask";
import { useLanguage } from "../../hooks/useLanguage";

import TaskDoneItem from "../../components/taskDoneItem/TaskDoneItem";
import PopupSaveToArchive from "../../components/popupSaveToArchive/PopupSaveToArchive";
import PopupArchiveLimit from "../../components/popupArchiveLimit/PopupArchiveLimit";
import ModalImage from "../../components/modalImage/ModalImage";

import Portal from "../../components/portal/Portal";

import "./done.css";

const ARCHIVE_ANIMATION_MS = 600;
const POPUP_DURATION_MS = 3000;
const ARCHIVE_LIMIT = 15;

type PopupType = "saveToArchive" | "archiveLimit" | null;

function Done() {
  const dispatch = useAppDispatch();
  const completedTasks = useAppSelector((s) => s.tasks.completedTasks);
  const archivedTasksCount = useAppSelector(
    (s) => s.tasks.archivedTasks.length,
  );
  const subtasksByTaskId = useAppSelector((s) => s.subtasks.byTaskId);

  const [popup, setPopup] = useState<PopupType>(null);
  const [pendingArchivedId, setPendingArchivedId] = useState<string | null>(
    null,
  );
  const [archivingAnimationId, setArchivingAnimationId] = useState<
    string | null
  >(null);
  const [openImage, setOpenImage] = useState<string | null>(null);

  // language
  const { language } = useLanguage();
  const t = translations[language];

  // timer popup
  useEffect(() => {
    if (popup !== "saveToArchive") return;

    const timer = setTimeout(() => setPopup(null), POPUP_DURATION_MS);

    return () => clearTimeout(timer);
  }, [popup]);

  // prevent duplicate dispatch on rapid double-click
  const archiveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (archiveTimeoutRef.current) clearTimeout(archiveTimeoutRef.current);
    };
  }, []);

  // dispatch task in archive
  const handleArchive = useCallback(
    (id: string) => {
      dispatch(archiveTaskRequest(id));
      setPopup("saveToArchive");
    },
    [dispatch],
  );

  // trigger archive animation
  const runArchiveWithAnimation = useCallback(
    (id: string) => {
      if (archiveTimeoutRef.current) return;

      setArchivingAnimationId(id);
      archiveTimeoutRef.current = setTimeout(() => {
        handleArchive(id);
        setArchivingAnimationId(null);
        archiveTimeoutRef.current = null;
      }, ARCHIVE_ANIMATION_MS);
    },
    [handleArchive],
  );

  // shows popup by limit task
  const archiveLimitTask = useCallback(
    (id: string) => {
      if (archiveTimeoutRef.current) return;

      if (archivedTasksCount >= ARCHIVE_LIMIT) {
        setPendingArchivedId(id);
        setPopup("archiveLimit");
        return;
      }
      runArchiveWithAnimation(id);
    },
    [archivedTasksCount, runArchiveWithAnimation],
  );

  const closePopup = useCallback(() => {
    setPopup(null);
    setPendingArchivedId(null);
  }, []);

  const handleArchiveLimitConfirm = useCallback(() => {
    setPopup(null);
    if (pendingArchivedId !== null) runArchiveWithAnimation(pendingArchivedId);
    setPendingArchivedId(null);
  }, [pendingArchivedId, runArchiveWithAnimation]);

  // delete Task
  const { requestDelete, isLocked, isDeletingItem } = useDeleteTask(
    (id: string) => {
      dispatch(deleteCompletedTaskRequest(id));
    },
  );

  // clear all tasks
  const handleClearAll = useCallback(() => {
    dispatch(clearAllCompletedTaskRequest());
  }, [dispatch]);

  return (
    <div className="ubuntu-regular">
      {/* popups */}
      {popup && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closePopup}
          />

          {popup === "archiveLimit" && (
            <PopupArchiveLimit
              onConfirm={handleArchiveLimitConfirm}
              onClose={closePopup}
            />
          )}
          {popup === "saveToArchive" && (
            <PopupSaveToArchive onClose={closePopup} />
          )}
        </Portal>
      )}

      <h1
        className={`sekuya-regular mb-5 ${language === "pl" ? "text-2xl sm:text-5xl" : "text-4xl sm:text-5xl"}`}
      >
        {t.done}
      </h1>

      {completedTasks.length === 0 ? (
        <p className="text-center">{t.doneText}</p>
      ) : (
        <>
          <ul className="flex flex-col">
            {completedTasks.map((task, index) => (
              <TaskDoneItem
                key={task.id}
                task={task}
                index={index}
                subtasks={subtasksByTaskId[task.id]}
                isArchiving={archivingAnimationId === task.id}
                onArchive={archiveLimitTask}
                onOpenImage={setOpenImage}
                onDelete={requestDelete}
                isLocked={isLocked || archivingAnimationId !== null}
                isDeleting={isDeletingItem(task.id)}
              />
            ))}
          </ul>

          <ModalImage src={openImage} onClose={() => setOpenImage(null)} />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClearAll}
              className="text-red-60 mt-5 mr-2 px-7 py-3 rounded-lg error-border cursor-pointer"
            >
              {t.doneClearBtn}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Done;
