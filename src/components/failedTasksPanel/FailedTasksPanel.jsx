import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { deleteTaskRequest } from "../../store/taskSlice";

import { useDeleteTask } from "../../hooks/useDeleteTask.js";

import ButtonDelete from "../../components/buttonDelete/ButtonDelete.jsx";

import IconRecycleBin from "../../icons/IconRecycleBin";
import IconClockFailedTasks from "../../icons/IconClockFailedTasks";
import IconClosePlus from "../../icons/IconClosePlus";

import './failedTasksPanel.css'

function FailedTasksPanel({ failedTasks, t, isOpen, onClose }) {
    const dispatch = useDispatch();

    const [deletingAnimationId, setDeletingAnimationId] = useState(null);
    const isDeletingRef = useRef(false);

    const { requestDelete, isLocked, isDeletingItem } = useDeleteTask(
        (id) => dispatch(deleteTaskRequest(id))
    );

    return (
        <>
            <div
                className="fixed inset-y-0 right-0 z-50 w-73 glow-panel panel-block shadow-xl"
                style={{
                    transition: "opacity 300ms ease-out, transform 300ms ease-out",
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "translateX(0)" : "translateX(100%)",
                    pointerEvents: isOpen ? "auto" : "none",
                }}
            >
                <div className="flex items-start justify-between border-b pb-2 mt-5 relative">
                    <h2 className="text-lg font-semibold">{t.failedTasksTitle}</h2>
                    <button onClick={onClose} className="absolute bottom-10 right-0">
                        <IconClosePlus />
                    </button>
                </div>

                <ul className="flex flex-col gap-2 pt-3 pb-3 no-scrollbar failed-tasks-scroll-fade">
                    {failedTasks.map((task) => (
                        <li key={task.id} className="rounded-3xl border-2 text-white glow-card p-3">
                            <div className="flex justify-between items-start">
                                <div className="">
                                    <IconClockFailedTasks />
                                </div>
                                <div className="">
                                    <p className="break-words-hyphens">{task.title}</p>
                                </div>
                                {/* btn delete */}
                                    <ButtonDelete
                                        onDelete={() => requestDelete(task.id)}
                                        isLocked={isLocked}
                                        isShaking={isDeletingItem(task.id)}
                                    />
                            </div>
                            <p className="mt-1 text-xs text-red-500"><span className="text-white">{t.deadlineFailedTasks}:</span> {task.deadline}</p>
                        </li>
                    ))}
                </ul>
            </div>

            <div
                className="fixed inset-0 z-40 bg-black/30"
                style={{
                    transition: "opacity 300ms ease-out",
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? "auto" : "none",
                }}
                onClick={onClose}
            />
        </>
    );
}

export default FailedTasksPanel;