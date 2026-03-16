import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useCallback } from "react";
import { completeTaskRequest, deleteTaskRequest, editTaskRequest } from "../../store/taskSlice";
import { toggleSubtaskRequest } from "../../store/subtasksSlice";
import SubtasksModal from "../../components/subtasksModal/SubtasksModal";
import PopupCompleted from "../../components/popupCompleted/PopupCompleted";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";

import "./Tasks.css"

function Tasks() {
    const dispatch = useDispatch();
    // redux state
    const listTasks = useSelector((s) => s.tasks.tasks || []);
    const subCompletedMap = useSelector(s => s.subtasks.completed);
    // local ui state 
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskEditingId, setTaskEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [editError, setEditError] = useState({ id: null, message: null });
    const [closeTimerPopupCompleted, setCloseTimerPopupCompleted] = useState(null);
    const [showCompletedPopup, setShowCompletedPopup] = useState(false);
    const [isOpenSubModal, setIsOpenSubModal] = useState(false);
    const [fixedHeight, setFixedHeight] = useState(null);

    const { language } = useLanguage();
    const t = translations[language];

    // validate task
    const validateTask = useCallback((value) => {
        if (!value || value.trim() === "") return "validateTaskEmpty";
        if (value.length < 5) return "validateTaskMin5Characters";
        if (value.length > 50) return "validateTaskMax50Characters";
        return null;
    }, []);

    // Edit task
    const startEdit = useCallback((task) => {
        const el = document.getElementById(`task-${task.id}`);
        if (el) setFixedHeight(el.offsetHeight);

        setTaskEditingId(task.id);
        setEditValue(task.title);
    }, []);

    const finishEdit = useCallback(() => {
        setFixedHeight(null);

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
    const openSubtasks = (task) => {
        setSelectedTask(task);
        setIsOpenSubModal(true);
    };

    // close modal
    const onClose = () => {
        setSelectedTask(null);
        setIsOpenSubModal(false);
    }

    // subtask completed
    const toggleSubtask = (taskId, index) => {
        dispatch(toggleSubtaskRequest({ taskId, index }));
    };
    
    // task done if all subs completed 
    useEffect(() => {
        if (!selectedTask) return;
        
        const subs = subCompletedMap[selectedTask.id] || {};
        const totalSubs = selectedTask.subtasks?.length || 0;

        const completedCount = Object.values(subs).filter(Boolean).length;

        if (totalSubs > 0 && completedCount === totalSubs) {
            dispatch(completeTaskRequest(selectedTask.id));
            setShowCompletedPopup(true);
            onClose();
        }
    }, [subCompletedMap, selectedTask, dispatch]);

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
                                    <button className="" onClick={() => startEdit(task)}>
                                        <svg viewBox="0 0 6.3499998 6.3499998" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-400 hover:text-blue-700" fill="currentColor">
                                            <path d="M 4.5135398,1.4550781 2.9354148,3.0351563 A 0.26460978,0.26460978 0 0 0 2.8592429,3.1972657 
                                            L 2.7791649,4.0664063 A 0.26460978,0.26460978 0 0 0 3.0662742,4.3535157 L 3.9354149,4.2753906 
                                            A 0.26460978,0.26460978 0 0 0 4.0994775,4.1992187 L 5.6776024,2.6191405 c 0.1878881,-0.1878871 0.1878873,
                                            -0.5015659 0,-0.6894532 L 5.2029929,1.4550781 c -0.187887,-0.1878881 -0.5015659,-0.1878873 -0.6894531,0 z M 4.8592428,
                                            1.859375 5.2733054,2.2753906 3.7928368,3.7558595 3.3358053,3.7968751 3.376821,3.3398439 Z"/>
                                            <path d="m 0.76744594,4.498047 a 0.26495279,0.26495279 0 0 0 0.0253906,0.5292968 
                                            H 3.4393209 a 0.26464844,0.26464844 0 1 0 0,-0.5292968 H 0.79283657 a 0.26460978,0.26460978 0 0 0 -0.0253906,0 z"/>
                                        </svg>
                                    </button>
                                    {/* btn delete */}
                                    <button className="" onClick={() => dispatch(deleteTaskRequest(task.id))}>
                                        <svg 
                                        fill="currentColor"
                                        viewBox="0 0 512 512"
                                        className="w-6 h-6 text-red-500 hover:text-red-700"
                                        >
                                            <path d="M439.114,69.747c0,0,2.977,2.1-43.339-11.966c-41.52-12.604-80.795-15.309-80.795-15.309l-2.722-19.297
                                                C310.387,9.857,299.484,0,286.642,0h-30.651h-30.651c-12.825,0-23.729,9.857-25.616,23.175l-2.722,19.297
                                                c0,0-39.258,2.705-80.778,15.309C69.891,71.848,72.868,69.747,72.868,69.747c-10.324,2.849-17.536,12.655-17.536,23.864v16.695
                                                h200.66h200.677V93.611C456.669,82.402,449.456,72.596,439.114,69.747z"/>
                                            <path d="M88.593,464.731C90.957,491.486,113.367,512,140.234,512h231.524c26.857,0,49.276-20.514,51.64-47.269
                                                l25.642-327.21H62.952L88.593,464.731z M342.016,209.904c0.51-8.402,7.731-14.807,16.134-14.296
                                                c8.402,0.51,14.798,7.731,14.296,16.134l-14.492,239.493c-0.51,8.402-7.731,14.798-16.133,14.288
                                                c-8.403-0.51-14.806-7.722-14.296-16.125L342.016,209.904z M240.751,210.823c0-8.42,6.821-15.241,15.24-15.241
                                                c8.42,0,15.24,6.821,15.24,15.241v239.492c0,8.42-6.821,15.24-15.24,15.24c-8.42,0-15.24-6.821-15.24-15.24V210.823z
                                                M153.833,195.608c8.403-0.51,15.624,5.894,16.134,14.296l14.509,239.492c0.51,8.403-5.894,15.615-14.296,16.125
                                                c-8.403,0.51-15.624-5.886-16.134-14.288l-14.509-239.493C139.026,203.339,145.43,196.118,153.833,195.608z"/>
                                        </svg>
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
                                    <button onClick={() => setTimeout(() => openSubtasks(task),  200)}
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
            />  
        </div>
    )
}

export default Tasks; 