import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import {
    restoreArchiveRequest,
    deleteArchiveTaskRequest,
    clearArchiveRequest
} from "../../store/taskSlice";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";

import { useDeleteTask } from "../../hooks/useDeleteTask";

import TaskArchiveItem from "../taskArchiveItem/TaskArchiveItem";
import PopupLimit from "../popupLimit/PopupLimit";
import PopupRestoreTask from "../popupRestoreTask/PopupRestoreTask";
import ModalImage from "../modalImage/ModalImage";

import "./archive.css"

const RESTORE_ANIMATION_MS = 600;
const POPUP_DURATION_MS = 3000;
const MAX_TASKS = 20;

export default function Archive() {
    const dispatch = useDispatch();
    const archivedTasks = useSelector(s => s.tasks.archivedTasks);
    const tasksCount = useSelector(s => s.tasks.tasks.length);
    const subtasksByTaskId = useSelector(s => s.subtasks.byTaskId);

    const [popup, setPopup] = useState(null);
    const [restoringAnimationId, setRestoringAnimationId] = useState(null);
    const [openImage, setOpenImage] = useState(null);

    // language
    const { language } = useLanguage();
    const t = translations[language];

    // restore tasks 
    const handleRestore = useCallback((id) => {
        dispatch(restoreArchiveRequest(id));
        setPopup("restore");
    }, [dispatch]);

    // clear tasks
    const handleClearArchive = useCallback(() => {
        dispatch(clearArchiveRequest())
    }, [dispatch]);

    // delete Task
    const { requestDelete, isLocked, isDeletingItem } = useDeleteTask(
        (id) => dispatch(deleteArchiveTaskRequest(id))
    );

    // animation
    const handleRestoreClick = useCallback((id) => {
        if(tasksCount >= MAX_TASKS) {
            setPopup("limit");
            return;
        };

        setRestoringAnimationId(id);
        setTimeout(() => {
            setRestoringAnimationId(null);
            handleRestore(id);
        }, RESTORE_ANIMATION_MS);
    }, [tasksCount, handleRestore]);

    // timer popups
    useEffect(() => {
        if (!popup) return;

        const timer = setTimeout(() => setPopup(null), POPUP_DURATION_MS);
        return () => clearTimeout(timer);
    }, [popup]);

    return (
        <div className="ubuntu-regular">

            {popup && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-40"
                        onClick={() => setPopup(null)}
                    />
                    {popup === "limit" && <PopupLimit onClose={() => setPopup(null)} />}
                    {popup === "restore" && <PopupRestoreTask onClose={() => setPopup(null)} />}
                </>
            )}

            <h2 
            lang={language === "ua" ? "uk" : "en"}
            className="sekuya-regular text-3xl sm:text-5xl">{t.archive}</h2>

            {archivedTasks.length === 0 && <p>{t.archiveText}</p>}

            <ul className="flex flex-col mt-4">
                {archivedTasks.map((task, index) => (
                    <TaskArchiveItem
                        key={task.id}
                        task={task}
                        index={index}
                        subtasks={subtasksByTaskId[task.id]}
                        t={t}
                        isRestoring={restoringAnimationId === task.id}
                        onRestore={handleRestoreClick}
                        onOpenImage={setOpenImage}
                        isLocked={isLocked}
                        isDeleting={isDeletingItem(task.id)}
                        onDelete={requestDelete}
                    />
                ))}
            </ul>

            <ModalImage src={openImage} onClose={() => setOpenImage(null)} />

            {archivedTasks.length > 0 && (
                <div className="flex justify-end">
                    {/* btn clear */}
                    <button onClick={handleClearArchive}
                        className="text-red-60 mt-5 mr-2 px-7 py-3 rounded-lg error-border cursor-pointer"
                    >
                        {t.archiveClearBtn}
                    </button>
                </div>
            )}
        </div>
    );
}