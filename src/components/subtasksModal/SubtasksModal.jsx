import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";
import { deleteSubtaskRequest, editSubtaskRequest } from "../../store/subtasksSlice";
import IconCloseModalSubtasks from "../../icons/IconCloseModalSubtasks";
import IconRecycleBin from "../../icons/IconRecycleBin";
import IconRename from "../../icons/IconRename";
import { useDispatch } from "react-redux";
import { useFixedHeightEdit } from "../../hooks/useFixedHeightEdit"


export default function SubtasksModal({ 
    isOpen,
    onClose,
    selectedTask,
    subCompletedMap,
    validateSubtask, 
    toggleSubtask })
        {
        const dispatch = useDispatch();  
        const { language } = useLanguage();
        const t = translations[language];

        const isCompletedTask = Boolean(selectedTask?.completedAt);

        const [editingIndex, setEditingIndex] = useState(null);
        const [editValue, setEditValue] = useState("");
        const { fixedHeight, lockHeight, unlockHeight } = useFixedHeightEdit(null);
        const [error, setError] = useState(null);

        const startEdit = (i, title) => {  
            lockHeight(`sub-${i}`);
            setEditingIndex(i);
            setEditValue(title);
            setError(null);
        };

        const finishEdit = (taskId, index) => {
            unlockHeight();
            
            const errorKey = validateSubtask(editValue);
            if (errorKey) {
                setError(errorKey);
                setEditingIndex(null);
                setEditValue(selectedTask.subtasks[index].title);
                setTimeout(() => {
                    setError(null);
                }, 5000);

                return;
            }

            if (!editValue.trim()) {
                setEditingIndex(null);
                return;
            }

            dispatch(
                editSubtaskRequest({
                    taskId,
                    index,
                    newTitle: editValue.trim()
                })
            );

            setEditingIndex(null);
            setError(null);
        };

        const deleteSubtask = (taskId, index) => {
            dispatch(deleteSubtaskRequest({ taskId, index }));
        };

        return (
            <Dialog open={isOpen} onClose = {onClose} className="relative z-50 ubuntu-regular">
                <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4 text-white">
                    <DialogPanel className="flex flex-col justify-center relative bg-gray-700 rounded-xl shadow-lg py-6 w-75 max-h-[496px]">
                        <DialogTitle 
                        lang={language === "ua" ? "uk" : "en"}
                        className={"sekuya-regular text-center"}>{t.modalSubtasksTitle}</DialogTitle>
                        <button
                        onClick={() => onClose()}
                        className="absolute top-2 right-2 closeIconPlus-btn">
                            <IconCloseModalSubtasks />
                        </button>
                            <div className=" flex-1 overflow-y-auto">
                                <ul className="flex flex-col gap-1 justify-start items-start mt-3 px-2">
                                {selectedTask?.subtasks?.map((sub, i) => (
                                    <li 
                                    key={i} 
                                    id={`sub-${i}`}
                                    style={editingIndex === i ? { height: fixedHeight } : {}}
                                    className={`flex gap-2 items-start justify-between w-full border relative rounded-md p-1  text-white break-words-hyphens ` +
                                        (subCompletedMap[selectedTask.id]?.[i]
                                        ? "border-green-500"
                                        : "border-blue-500")
                                    }>
                                        <label className="space-x-2 cursor-pointer mt-0.5">
                                            <input 
                                                type="checkbox" 
                                                checked={subCompletedMap[selectedTask.id]?.[i] || false} 
                                                onChange={() => toggleSubtask(selectedTask.id, i)}
                                                className="peer sr-only"
                                            />
                                            <span className="w-5 h-5 border-2 border-gray-300 style-btn
                                            rounded-md flex items-center justify-center peer-checked:bg-blue-500 peer-checked:border-blue-500">
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
                                            <span className="">{i + 1}.</span>

                                            {editingIndex === i ? (
                                                <textarea
                                                    autoFocus
                                                    className={`rounded-md input-edit edit-expand ${editingIndex === i ? "active" : ""}`}
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={() => finishEdit(selectedTask.id, i)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") finishEdit(selectedTask.id, i);
                                                        if (e.key === "Escape") setEditingIndex(null);
                                                    }}
                                                />
                                            ) : (
                                                <span className="ml-1">{sub.title}</span>
                                            )}
                                        </div>
                                            {/* btn rename */}
                                        <div className="flex gap-3 pl-3">
                                            <button 
                                            disabled={isCompletedTask}
                                            className="style-btn"
                                            onClick={() => startEdit(i, sub.title)}
                                            >
                                                <IconRename />
                                            </button>
                                            {/* btn delete */}
                                            <button 
                                            className="style-btn"
                                             onClick={() => deleteSubtask(selectedTask.id, i)}
                                            >
                                                <IconRecycleBin />
                                            </button>
                                        </div>    
                                    </li>
                                ))}
                            </ul>
                            </div>
                            <div className="flex justify-center items-center relative mb-4">
                                {/* error */}
                                {error && (
                                    <p className="text-red-500 text-sm absolute top-1 mt-1 whitespace-nowrap shrink-0">{t[error]}</p>
                                )}
                            </div>
                            <div className="flex justify-center items-center">
                                <button
                                onClick={() => {
                                    setTimeout(() => onClose(), 200) }}
                                className="mt-3 border-gray-300 border-2 px-3 py-1 rounded-xl closeModal-btn"
                                >
                                    {t.modalSubtasksBtn}
                                </button>
                            </div>
                    </DialogPanel>
                </div>
            </Dialog> 
        )}