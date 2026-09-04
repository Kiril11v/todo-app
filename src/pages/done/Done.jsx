import { useDispatch, useSelector } from "react-redux";

import { useEffect, useState, useCallback, useRef } from "react";
import { 
    clearAllCompletedTaskRequest,
    archiveTaskRequest,
    deleteCompletedTaskRequest
} from "../../store/taskSlice"
import PopupSaveToArchive from "../../components/popupSaveToArchive/PopupSaveToArchive";
import PopupArchiveLimit from "../../components/popupArchiveLimit/PopupArchiveLimit";
import ModalImage from "../../components/modalImage/ModalImage"
import ButtonDelete from "../../components/buttonDelete/ButtonDelete.jsx";
import TaskDoneItem from "../../components/taskDoneItem/TaskDoneItem.jsx";
import Portal from "../../components/portal/Portal.jsx";

import { useDeleteTask } from "../../hooks/useDeleteTask.js";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";

import "./done.css"

const ARCHIVE_ANIMATION_MS = 600;
const POPUP_DURATION_MS = 3000;
const ARCHIVE_LIMIT = 15;

function Done() {
    const dispatch = useDispatch();
    const completedTasks = useSelector((s) => s.tasks.completedTasks);
    const archivedTasksCount = useSelector(s => s.tasks.archivedTasks.length);
    const subtasksByTaskId = useSelector(s => s.subtasks.byTaskId);
    
    const [popup, setPopup] = useState(null)
    const [pendingArchivedId, setPendingArchivedId] = useState(null);
    const [archivingAnimationId, setArchivingAnimationId] = useState(null);
    const [openImage, setOpenImage] = useState(null);

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
    const archiveTimeoutRef = useRef(null);
    useEffect(() => {
        return () => {
            if (archiveTimeoutRef.current) clearTimeout(archiveTimeoutRef.current);
        };
    }, []);

    // dispatch task in archive
    const handleArchive = useCallback(
        (id) => {
            dispatch(archiveTaskRequest(id));
            setPopup("saveToArchive")
        },
        [dispatch]
    );

    // trigger archive animation
    const runArchiveWithAnimation = useCallback(
        (id) => {
            if (archiveTimeoutRef.current) clearTimeout(archiveTimeoutRef.current);

            setArchivingAnimationId(id);
            archiveTimeoutRef.current = setTimeout(() => {
                handleArchive(id);
                setArchivingAnimationId(null);
                archiveTimeoutRef.current = null;
            }, ARCHIVE_ANIMATION_MS);
        },
        [handleArchive]
    );

    // shows popup by limit task
    const archiveLimitTask = useCallback(
        (id) => {
            if (archivedTasksCount >= ARCHIVE_LIMIT) {
                setPendingArchivedId(id);
                setPopup("archiveLimit");
                return;
            }
            runArchiveWithAnimation(id);
        },
        [archivedTasksCount, runArchiveWithAnimation]
    );

     const handleArchiveLimitConfirm = useCallback(() => {
        setPopup(null);
        setPendingArchivedId((id) => {
            if (id != null) runArchiveWithAnimation(id);
            return null;
        });
    }, [runArchiveWithAnimation]);
 
    const handleArchiveLimitClose = useCallback(() => {
        setPopup(null);
        setPendingArchivedId(null);
    }, []);

    // delete Task
    const { requestDelete, isLocked, isDeletingItem } = useDeleteTask(
        (id) => dispatch(deleteCompletedTaskRequest(id))
    );

    // clear all tasks
    const handleClearAll = useCallback(() => dispatch(clearAllCompletedTaskRequest()), [dispatch]);

    return (
        <div className="ubuntu-regular">
            {/* popups */}
            {popup && (
                <Portal>
                    <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => {
                        if (popup === "archiveLimit") {
                            handleArchiveLimitClose();
                        } else {
                            setPopup(null);
                        }
                    }}
                    />

                    {popup === "archiveLimit" && (
                        <PopupArchiveLimit
                            onConfirm={handleArchiveLimitConfirm}
                            onClose={handleArchiveLimitClose}
                        />
                    )}
                    {popup === "saveToArchive" && (
                        <PopupSaveToArchive onClose={() => setPopup(null)} />
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
                                t={t}
                                isArchiving={archivingAnimationId === task.id}
                                onArchive={archiveLimitTask}
                                onOpenImage={setOpenImage}
                                onDelete={requestDelete}
                                isLocked={isLocked}
                                isDeleting={isDeletingItem(task.id)}
                            />
                        ))}
                    </ul>

                    <ModalImage src={openImage} onClose={() => setOpenImage(null)}/>

                    <div className="flex justify-end">
                        <button onClick={handleClearAll}
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