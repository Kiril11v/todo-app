import { memo, useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";

import ButtonDelete from "../buttonDelete/ButtonDelete";

import { useFixedHeightEdit } from "../../hooks/useFixedHeightEdit";

import IconRename from "../../icons/IconRename";
import IconImageTask from "../../icons/IconImageTask";

import { formatDeadline } from "../../utils/deadline";

function TaskItem({
    task,
    index,
    t,
    checkMarkId,
    validateTask,
    onToggleComplete,
    onSaveEdit,
    onOpenImage,
    onOpenSubtasks,
    onDeleteTask,
    isLocked,
    isDeletingItem,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editError, setEditError] = useState({ id: null, message: null });
    const [editValue, setEditValue] = useState(task.title);
    const { fixedHeight, lockHeight, unlockHeight } = useFixedHeightEdit();

    const isSavingRef = useRef(false);

    // helper for start edit
    const handleStartEdit = () => {
        lockHeight(`task-${task.id}`);
        setIsEditing(true);
        setEditValue(task.title);
    };

    // helper for cancel edit
    const handleCancelEdit = () => {
        unlockHeight();
        setIsEditing(false);
        setEditValue(task.title);
        setEditError({ id: null, message: null });
    };
    // helper for validation and save edit task 
    const handleSaveEdit = () => {
        if (!isEditing || isSavingRef.current) return;
        isSavingRef.current = true;
        
        unlockHeight();

        const errorKey = validateTask(editValue);
        
        if (errorKey) {
            setEditError({ id: task.id, message: errorKey });
            setIsEditing(false);
            setTimeout(() => setEditError({ id: null, message: null }), 2000);
            isSavingRef.current = false;
            return;
        }

        onSaveEdit(task.id, editValue.trim());
        setIsEditing(false);
        setEditError({ id: null, message: null });
        isSavingRef.current = false;
    }

    const taskSub = useSelector((s) => s.subtasks.byTaskId[task.id]);

    const { completedCount, totalCount } = useMemo(() => {
        const items = taskSub?.items ?? [];
        return {
            completedCount: items.filter((s) => s?.completed).length,
            totalCount: items.length,
        };
    }, [taskSub]);

    return (
        <li
            id={`task-${task.id}`}
            style={isEditing ? { height: fixedHeight } : {}}
            className="p-3 relative task-border"
        >
            {/* deadline */}
            {task.deadline && (
                <div className="mb-3">
                    <p className="flex items-center justify-center text-sm text-red-700 whitespace-nowrap absolute top-1 left-5 lg:right-30 lg:left-auto lg:top-7">
                        {t.deadlineTasks} {formatDeadline(task.deadline)}
                    </p>
                </div>
            )}
            <div className="flex justify-between items-start">
                {/* checkbox */}
                <label className="cursor-pointer style-btn">
                    <input
                        type="checkbox"
                        onChange={() => onToggleComplete(task.id)}
                        className="sr-only"
                    />
                    <svg width="35" height="35" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fill="#00a803"
                            fillRule="evenodd"
                            d="M4,4 L9,4 C9.55228,4 10,3.55228 10,3 C10,2.44772 9.55228,2 9,2 L4,2 C2.89543,2 2,2.89543 2,4 L2,12 C2,13.1046 2.89543,14 4,14 L12,14 C13.1046,14 14,13.1046 14,12 L14,10 C14,9.44771 13.5523,9 13,9 C12.4477,9 12,9.44771 12,10 L12,12 L4,12 L4,4 Z"
                        />
                        {checkMarkId === task.id && (
                            <path
                                className="checkmark-animate"
                                fill="#00a803"
                                fillRule="evenodd"
                                d="M15.2071,2.29289 C14.8166,1.90237 14.1834,1.90237 13.7929,2.29289 L8.5,7.58579 L7.70711,6.79289 C7.31658,6.40237 6.68342,6.40237 6.29289,6.79289 C5.90237,7.18342 5.90237,7.81658 6.29289,8.20711 L7.79289,9.70711 C7.98043,9.89464 8.23478,10 8.5,10 C8.76522,10 9.01957,9.89464 9.20711,9.70711 L15.2071,3.70711 C15.5976,3.31658 15.5976,2.68342 15.2071,2.29289 Z"
                            />
                        )}
                    </svg>
                </label>
                <div className="mx-2 mb-4 flex gap-2 w-full">
                    <span>{index + 1}.</span>
                    {/* task inline edit */}
                    {isEditing ? (
                        <textarea
                            autoFocus
                            className={`input-edit px-5 pt-3 edit-expand ${isEditing ? "active" : ""}`}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { 
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                }
                                if (e.key === "Escape") handleCancelEdit();
                            }}
                        />
                    ) : (
                        // task
                        <h3 onDoubleClick={handleStartEdit} className="break-words-hyphens text-left">
                            {task.title}
                        </h3>
                    )}
                </div>
                <div className="flex gap-3 flex-col sm:flex-row items-center justify-center">
                    {/* btn image */}
                    {task.image_url && (
                        <button className="style-btn" onClick={() => onOpenImage(task.image_url)}>
                            <IconImageTask />
                        </button>
                    )}
                    {/* btn rename */}
                    <button className="style-btn" onClick={handleStartEdit}>
                        <IconRename />
                    </button>
                    {/* btn delete */}
                    <ButtonDelete
                        onDelete={() => onDeleteTask(task.id)}
                        isLocked={isLocked}
                        isShaking={isDeletingItem(task.id)}
                    />
                </div>
            </div>
            <div className="flex flex-col items-center relative right-4">
                <div className="flex justify-center items-center relative">
                    {/* error */}
                    {editError.id === task.id && (
                        <p className="text-red-500 text-sm absolute bottom-0 whitespace-nowrap shrink-0">
                            {t[editError.message]}
                        </p>
                    )}
                </div>
                {/* btn subtasks */}
                {totalCount > 0 && (
                    <div className="flex gap-3 justify-center items-center">
                        <p className="text-gray-600">
                            {completedCount}/{totalCount}
                        </p>
                        <button
                            onClick={() => onOpenSubtasks(task.id)}
                            className="px-3 py-1 rounded-lg transition sub-btn"
                        >
                            {t.subtasksBtn}
                        </button>
                    </div>
                )}
            </div>
        </li>
    );
}

export default memo(TaskItem);