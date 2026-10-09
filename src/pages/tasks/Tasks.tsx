import { useLocation } from "react-router-dom";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";

import {completeTaskRequest, deleteTaskRequest, editTaskRequest } from "../../store/taskSlice";
import { toggleSubtaskRequest } from "../../store/subtasksSlice";

import { useDeleteTask } from "../../hooks/useDeleteTask";
import { useAppSelector, useAppDispatch } from "../../store/hooks";

import { useLanguage } from "../../hooks/useLanguage";
import { translations } from "../../context/translations";

import { isTaskFailed } from "../../utils/deadline";

import TaskItem from "../../components/taskItem/TaskItem";
import ModalImage from "../../components/modalImage/ModalImage";
import SubtasksModal from "../../components/subtasksModal/SubtasksModal";
import PopupCompleted from "../../components/popupCompleted/PopupCompleted";
import PopupDoneLimit from "../../components/popupDoneLimit/PopupDoneLimit";
import FailedTasksPanel from "../../components/failedTasksPanel/FailedTasksPanel";
import Portal from "../../components/portal/Portal";

import "./tasks.css"

const DONE_ANIMATION_MS = 600;
const POPUP_DURATION_MS = 3000;
const DONE_LIMIT = 15;

type PopupType = "completed" | "doneLimit" | null;

function Tasks() {
    const dispatch = useAppDispatch();

    const rawTasks = useAppSelector((s) => s.tasks.tasks);
    const listTasks = useMemo(
        () => (rawTasks ?? []).filter((task) => task?.id != null),
        [rawTasks]
    );

    const subtasksByTaskId = useAppSelector((s) => s.subtasks.byTaskId);
    const completedTasksCount = useAppSelector((s) => s.tasks.completedTasks.length);
     
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const selectedTask = useMemo(
        () => listTasks.find((t) => t.id === selectedTaskId) ?? null,
        [listTasks, selectedTaskId]
    );
    
    const subtasksData = selectedTaskId ? subtasksByTaskId[selectedTaskId] ?? null : null;
    const [checkMarkId, setCheckMarkId] = useState<string | null>(null);
    const [popup, setPopup] = useState<PopupType>(null);
    const [nowTime, setNowTime] = useState<Date>(() => new Date());

    const [isOpenSubModal, setIsOpenSubModal] = useState(false);
    const [openImage, setOpenImage] = useState<string | null>(null);
    const [isFailedTasksOpen, setIsFailedTasksOpen] = useState(false);
    
    const { activeTasks, failedTasks } = useMemo(() => {
        const active: typeof listTasks = [];
        const failed: typeof listTasks = [];
        for (const task of listTasks ) {
            (isTaskFailed(task, nowTime) ? failed : active).push(task);
        }
        return { activeTasks: active, failedTasks: failed };
    }, [listTasks, nowTime]);

    // refresh deadline time when tab regains visibility
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                setNowTime(new Date());
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, []);

    // prevent duplicate dispatch on rapid double-click
    const toggleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        return () => {
            if (toggleTimerRef.current) clearTimeout(toggleTimerRef.current);
        };
    }, []);

    // language
    const { language } = useLanguage();
    const t = translations[language];

    // location for btn failed
    const location = useLocation();
    const isActive = location.pathname === '/tasks';

    // subtask completed
    const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
        if (subtaskId.includes("_sub_") && subtaskId.startsWith("temp_")) return;
        dispatch(toggleSubtaskRequest({ taskId, subtaskId }));
    }, [dispatch]);

    // open modal
    const openSubtasks = useCallback((taskId: string) => {
        setSelectedTaskId(taskId);
        setIsOpenSubModal(true);
    }, []);

    // close modal
    const onClose = useCallback(() => {
        setSelectedTaskId(null);
        setIsOpenSubModal(false);
    }, []);

    // task completed
    const toggleTask = useCallback((taskId: string) => {
        if (toggleTimerRef.current) clearTimeout(toggleTimerRef.current);

        setCheckMarkId(taskId);
        toggleTimerRef.current = setTimeout(() => {
            dispatch(completeTaskRequest(taskId));
            toggleTimerRef.current = null;
            setCheckMarkId(null);
            setPopup("completed");
        }, DONE_ANIMATION_MS);
    }, [dispatch]);

    // task edit
    const handleSaveEdit = useCallback((taskId: string, newTitle: string) => {
        dispatch(editTaskRequest({ id: taskId, newText: newTitle }));
    }, [dispatch]);

    // delete Task
    const { requestDelete, isLocked, isDeletingItem } = useDeleteTask(
        (id) => dispatch(deleteTaskRequest(id))
    );

    // done limit
    const doneLimitTask = useCallback((taskId: string) => {
        if (completedTasksCount >= DONE_LIMIT) {
            setPopup("doneLimit");
            return;
        }
        toggleTask(taskId);
    }, [completedTasksCount, toggleTask]);

    // timer popup
    useEffect(() => {
        if (!popup) return;
        const timer = setTimeout(() => setPopup(null), POPUP_DURATION_MS);
        return () => clearTimeout(timer);
    }, [popup]);

    // close subModal if not subtasks
    useEffect(() => {
        if (!selectedTaskId) return;

        const subtasks = subtasksByTaskId[selectedTaskId];

        if (subtasks && subtasks.items && subtasks.items.length === 0) {
            onClose();
        }
    }, [subtasksByTaskId, selectedTaskId, onClose]);

    const handleOpenImage = useCallback((src: string) => setOpenImage(src), []);
    const handleCloseImage = useCallback(() => setOpenImage(null), []);

    return (
        <div className="ubuntu-regular">
            {/* popups */}
            {popup && (
                <Portal>
                    <div 
                        className="fixed inset-0 bg-black/40 z-40"
                        onClick={() => setPopup(null)} 
                    />
                    {popup === "doneLimit"  && <PopupDoneLimit onClose={() => setPopup(null)} />}
                    {popup ==="completed" && <PopupCompleted onClose={() => setPopup(null)} />}
                </Portal>
            )}
            <h1
                className="sekuya-regular mb-5 text-4xl sm:text-5xl"
            >
                {t.tasks}
            </h1>

            {activeTasks.length === 0 && <p>{t.taskText}</p>}

            <div className="tasks-croll-area">
                <ul className="flex flex-col">
                    {activeTasks.map((task, index) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            index={index}
                            checkMarkId={checkMarkId}
                            onToggleComplete={doneLimitTask}
                            onOpenImage={handleOpenImage}
                            onOpenSubtasks={openSubtasks}
                            onDeleteTask={requestDelete}
                            isLocked={isLocked}
                            isDeletingItem={isDeletingItem}
                            onSaveEdit={handleSaveEdit}
                        />
                    ))}
                </ul>
            </div>

            <ModalImage src={openImage} onClose={handleCloseImage} />

            {isActive && failedTasks.length > 0 && (
                <Portal>
                    <button
                        onClick={() => setIsFailedTasksOpen(true)}
                        className="fixed bottom-6 right-6 z-30 rounded-full bg-red-600 px-4 py-2 text-sm text-black shadow-lg hover:bg-red-700 ubuntu-regular"
                    >
                        {t.btnFailed} ({failedTasks.length})
                    </button>
                </Portal>
            )}

            <SubtasksModal
                isOpen={isOpenSubModal}
                onClose={onClose}
                selectedTask={selectedTask}
                subtasksData={subtasksData}
                toggleSubtask={toggleSubtask}
            />

            <FailedTasksPanel 
                failedTasks={failedTasks}
                isOpen={isFailedTasksOpen}
                onClose={() => setIsFailedTasksOpen(false)}
            />
        </div>
    )
}

export default Tasks; 