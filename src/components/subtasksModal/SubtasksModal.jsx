import { useState, useRef, useCallback } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useDispatch } from "react-redux";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";

import { deleteSubtaskRequest, editSubtaskRequest } from "../../store/subtasksSlice";

import { useFixedHeightEdit } from "../../hooks/useFixedHeightEdit"
import { useAnimatedDelay } from "../../hooks/useAnimatedDelay"

import ButtonDelete from "../buttonDelete/ButtonDelete";

import IconClosePlus from "../../icons/IconClosePlus";

import './SubtasksModal.css'

const CLOSE_ANIMATION_CLASS = 'closingModal';
const CLOSE_ANIMATION_MS = 350;
const DELETE_ANIMATION_MS = 500;
const ERROR_DISPLAY_MS = 3000;


export default function SubtasksModal({ 
    isOpen,
    onClose,
    selectedTask,
    subtasksData,
    validateSubtask,
    toggleSubtask,
})
    {
    const dispatch = useDispatch();  
    const { language } = useLanguage();
    const { fixedHeight, lockHeight, unlockHeight } = useFixedHeightEdit();
    const { ref: btnRef, trigger: btnTrigger } = useAnimatedDelay(CLOSE_ANIMATION_CLASS, CLOSE_ANIMATION_MS);
    const { ref: btnRefBottom, trigger: triggerBottom } = useAnimatedDelay(CLOSE_ANIMATION_CLASS, CLOSE_ANIMATION_MS);

    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [error, setError] = useState(null);
    const [deletingSubtaskId, setDeletingSubtaskId] = useState(null);
    const isDeletingRef = useRef(false);

    const deleteSubtask = useCallback((subtaskId) => {
        if (isDeletingRef.current) return;

        isDeletingRef.current = true;
        setDeletingSubtaskId(subtaskId);

        setTimeout(() => {
            dispatch(deleteSubtaskRequest({ taskId: selectedTask.id, subtaskId }));
            setDeletingSubtaskId(null);
            isDeletingRef.current = false;
        }, DELETE_ANIMATION_MS);
    }, [dispatch, selectedTask?.id]);

    const startEdit = useCallback((sub) => {
        lockHeight(`sub-${sub.id}`);
        setEditingId(sub.id);
        setEditValue(sub.title);
        setError(null);
    }, [lockHeight]);

    const finishEdit = useCallback((taskId, subtaskId) => {
        unlockHeight();
 
        if (!editValue.trim()) {
            setEditingId(null);
            setEditValue("");
            return;
        }
 
        const errorKey = validateSubtask(editValue);
        if (errorKey) {
            setError(errorKey);
            setEditingId(null);
            setEditValue('');
            setTimeout(() => {
                setError(null);
            }, ERROR_DISPLAY_MS);
            return;
        }
 
        dispatch(
            editSubtaskRequest({
                taskId,
                subtaskId,
                newTitle: editValue.trim()
            })
        );
        setEditingId(null);
    }, [dispatch, editValue, unlockHeight, validateSubtask]);

    const isDeleteLocked = deletingSubtaskId !== null;

    if (!selectedTask || !subtasksData) return null;

    const t = translations[language];
    
    const { items } = subtasksData;
    const isCompletedTask = Boolean(selectedTask?.completedAt);

    return (
        <Dialog open={isOpen} onClose = {onClose} className="relative z-50 ubuntu-regular">
            <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4 text-white">
                <DialogPanel className="flex flex-col justify-center relative glow-panel-subtask glow-card-subtask panel-block-subtask rounded-xl shadow-lg py-6 w-75 max-h-[496px]">
                    <DialogTitle 
                    lang={language === "ua" ? "uk" : "en"}
                    className={"sekuya-regular text-center mt-3"}>{t.modalSubtasksTitle}</DialogTitle>
                    <button
                    ref={btnRef}
                    onClick={() => btnTrigger(onClose)}
                    className="absolute top-2 right-2 closeIconPlus-btn">
                        <IconClosePlus />
                    </button>
                        <div className="flex-1 overflow-y-auto no-scrollbar subtasks-scroll-fade pb-4">
                            <ul className="flex flex-col gap-1 justify-start items-start mt-5">
                            {items.map((sub, index) => (
                                <li 
                                key={sub.id} 
                                id={`sub-${sub.id}`}
                                style={editingId === sub.id ? { height: fixedHeight } : {}}
                                className={`flex gap-2 items-start justify-between w-full border relative list-item-subtask p-2 text-white break-words-hyphens ${
                                    sub.completed
                                    ? "glow-card-subtask-done"
                                    : "glow-card-subtask"
                                }`}>
                                    <label className="space-x-2 cursor-pointer mt-0.5">
                                        <input 
                                            type="checkbox" 
                                            checked={sub.completed || false} 
                                            onChange={() => toggleSubtask(selectedTask.id, sub.id)}
                                            className="peer sr-only"
                                        />
                                        <span className="w-5 h-5 border-2 border-gray-300 style-btn
                                        rounded-md flex items-center justify-center peer-checked:bg-green-500 peer-checked:border-green-500">
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
                                    <div className="flex-1">
                                        {editingId === sub.id ? (
                                            <textarea
                                                autoFocus
                                                className={`input-edit edit-expand list-item-subtask p-2 pl-3 ${editingId === sub.id ? "active" : ""}`}
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => finishEdit(selectedTask.id, sub.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") finishEdit(selectedTask.id, sub.id);
                                                    if (e.key === "Escape") setEditingId(null);
                                                }}
                                            />
                                        ) : (
                                            <p className="">{index + 1}.<span className="ml-1">{sub.title}</span></p>
                                        )}
                                    </div>
                                        {/* btn rename */}
                                    <div className="flex gap-3 pl-3">
                                        <button 
                                        disabled={isCompletedTask}
                                        className="style-btn"
                                        onClick={() => startEdit(sub)}
                                        >
                                            <svg viewBox="0 0 6.3499998 6.3499998" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="currentColor">
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
                                        <ButtonDelete
                                            onDelete={() => deleteSubtask(sub.id)}
                                            isLocked={isDeleteLocked}
                                            isShaking={deletingSubtaskId === sub.id}
                                        />
                                    </div>    
                                </li>
                            ))}
                        </ul>
                        </div>
                        
                        <div className="flex justify-center items-center relative mb-4">
                            {/* error */}
                            {error && (
                                <p className="text-red-500 text-sm absolute top-0 whitespace-nowrap shrink-0">{t[error]}</p>
                            )}
                        </div>
                        <div className="flex justify-center items-center">
                            <button
                            ref={btnRefBottom}
                            onClick={() => triggerBottom(onClose)}
                            className="mt-3 border-gray-300 border-2 px-3 py-1 rounded-xl closeModal-btn"
                            >
                                {t.modalSubtasksBtn}
                            </button>
                        </div>
                </DialogPanel>
            </div>
        </Dialog> 
    )}