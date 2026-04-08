import { useSelector, useDispatch } from "react-redux";
import { useState, useCallback } from "react";
import { completeTaskRequest, deleteTaskRequest, editTaskRequest } from "../../store/taskSlice";
import { toggleSubtaskRequest } from "../../store/subtasksSlice";
import { useFixedHeightEdit } from "../../hooks/useFixedHeightEdit";
import SubtasksModal from "../../components/subtasksModal/SubtasksModal";
import PopupCompleted from "../../components/popupCompleted/PopupCompleted";
import IconRecycleBin from "../../icons/IconRecycleBin";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";
import { useTaskValidation } from "../../hooks/useTaskValidation";
import IconRename from "../../icons/IconRename";
import "./Tasks.css"

function Tasks() {
    const dispatch = useDispatch();
    // redux state
    const listTasks = useSelector((s) => s.tasks.tasks || []);
    const subCompletedMap = useSelector(s => s.subtasks.completed);
     
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    const selectedTask = useSelector(
        s => s.tasks.tasks.find(t => t.id === selectedTaskId) || null
    );
    // local ui state
    const [taskEditingId, setTaskEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [editError, setEditError] = useState({ id: null, message: null });
    const [closeTimerPopupCompleted, setCloseTimerPopupCompleted] = useState(null);
    const [showCompletedPopup, setShowCompletedPopup] = useState(false);
    const [isOpenSubModal, setIsOpenSubModal] = useState(false);
    const { fixedHeight, lockHeight, unlockHeight } = useFixedHeightEdit();

    const { language } = useLanguage();
    const t = translations[language];

    // validation
    const { validateTask, validateSubtask } = useTaskValidation(t);

    // Edit task
    const startEdit = useCallback((task) => {
        lockHeight(`task-${task.id}`);
        setTaskEditingId(task.id);
        setEditValue(task.title);
    }, []);

    const finishEdit = useCallback(() => {
        unlockHeight();

        const errorKey = validateTask(editValue)
        if (errorKey) {
            setEditError({ id: taskEditingId, message: errorKey });
            setTaskEditingId(null);

            setTimeout(() => setEditError({ id: null, message: null }), 2000);
            return;
        }

        dispatch(editTaskRequest({ id: taskEditingId, newText: editValue }));
        setTaskEditingId(null);
        setEditError({ id: null, message: null });
    }, [editValue, taskEditingId, validateTask, dispatch])
    
    const cancelEdit = () => {
        setTaskEditingId(null);
        setEditValue("");
    };

    // open modal
    const openSubtasks = (taskId) => {
        setSelectedTaskId(taskId);
        setIsOpenSubModal(true);
    };

    // close modal
    const onClose = () => {
        setSelectedTaskId(null);
        setIsOpenSubModal(false);
    }

    // subtask completed
    const toggleSubtask = (taskId, index) => {
        dispatch(toggleSubtaskRequest({ taskId, index }));
    };

    // task completed
    const toggleTask = (taskId) => {
        dispatch(completeTaskRequest(taskId));
        setShowCompletedPopup(true);

        if (closeTimerPopupCompleted) clearTimeout(closeTimerPopupCompleted);

        const timer = setTimeout(() => {
            setShowCompletedPopup(false);
            setCloseTimerPopupCompleted(null);
        }, 5000);

        setCloseTimerPopupCompleted(timer);
    }

    return (
        <div className="ubuntu-regular">

            {showCompletedPopup && (
                <>
                    <div onClick={() => setShowCompletedPopup(false)} />
                    <PopupCompleted onClose={() => setShowCompletedPopup(false)} />
                </>
            )}

            <h1 
            lang={language === "ua" ? "uk" : "en"}
            className="sekuya-regular mb-5 text-4xl sm:text-5xl"
            >
                {t.tasks}
            </h1>

            {listTasks.length === 0 && <p>{t.taskText}</p>}

            <ul className="flex flex-col">
                {listTasks.map((task, index) => {
                    // counter 0/3
                    const subState = subCompletedMap[task.id] || [];
                    const completedCount = Object.values(subState).filter(Boolean).length;
                    const totalCount = task.subtasks.length || 0;

                    return (
                        <li 
                        id={`task-${task.id}`} 
                        style={taskEditingId === task.id ? { height: fixedHeight } : {}} 
                        key={task.id} 
                        className="p-3 border rounded-md min-h-19 relative task-border"
                        >
                            <div className="flex justify-between items-start">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    {/* checkbox */}
                                    <input
                                        type="checkbox"
                                        onChange={() => setTimeout(() => toggleTask(task.id), 200)}
                                        className="peer sr-only"
                                    />
                                    <span className="style-btn w-7 h-7 border-2 border-green-500 rounded-md flex items-center justify-center
                                    transition-all duration-200 peer-checked:bg-green-500 peer-checked:border-green-500">
                                        <svg className="hidden peer-checked:block w-3 h-3 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                </label>

                                {/* task inline edit */}
                                <div className="mx-2 flex gap-2 place-items-start w-full">
                                    <span>{index + 1}.</span>

                                    {taskEditingId === task.id ? (
                                        <textarea 
                                        autoFocus
                                        className={`rounded-md input-edit edit-expand ${taskEditingId === task.id ? "active" : ""}`}
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={finishEdit}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") finishEdit();
                                            if (e.key === "Escape") cancelEdit();
                                        }}
                                        />
                                    
                                    ) : (   // task
                                        <h3 onDoubleClick={() => startEdit(task)} className="break-words-hyphens text-left">
                                            {task.title}
                                        </h3>
                                    )}
                                </div>

                                {/* btn rename */}
                                <div className="flex gap-3">
                                    <button className="style-btn" onClick={() => startEdit(task)}>
                                        <IconRename />
                                    </button>
                                    {/* btn delete */}
                                    <button className="style-btn" onClick={() => dispatch(deleteTaskRequest(task.id))}>
                                        <IconRecycleBin/>
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-center flex-col items-center relative right-4">
                                <div className="flex justify-center items-center relative mb-2">
                                    {/* error */}
                                    {editError.id === task.id && (
                                        <p className="text-red-500 text-sm absolute top-1 mt-1 whitespace-nowrap shrink-0">{t[editError.message]}</p>
                                    )}
                                </div>

                                <div className="flex gap-3 justify-center items-center my-3">
                                    {/* counter */}
                                    { totalCount > 0 && (
                                    <p className="mt-3 text-gray-600">
                                    {completedCount}/{totalCount}
                                    </p>
                                    )}
                                    {/* btn subtasks */}
                                    {task.subtasks?.length > 0 && (
                                    <button onClick={() => setTimeout(() => openSubtasks(task.id),  200)}
                                    className="mt-3 px-3 py-1 rounded-lg transition sub-btn">
                                        {t.subtasksBtn}
                                    </button>
                                    )}
                                </div> 
                            </div>
                        </li>
                    );
                })}
            </ul>
            <SubtasksModal
                isOpen={isOpenSubModal}
                onClose={onClose}
                selectedTask={selectedTask}
                subCompletedMap={subCompletedMap}
                toggleSubtask={toggleSubtask}
                t={t}
                validateSubtask={validateSubtask}
            />  
        </div>
    )
}

export default Tasks; 