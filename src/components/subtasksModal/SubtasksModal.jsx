import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";

export default function SubtasksModal({ 
    isOpen,
    onClose,
    selectedTask,
    subCompletedMap, 
    toggleSubtask })
        {
        const { language } = useLanguage();
        const t = translations[language];

        return (
            <Dialog open={isOpen} onClose = {onClose} className="relative z-50 ubuntu-regular">
                <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4 text-white">
                    <DialogPanel className="flex flex-col justify-center relative bg-gray-700 w-70 rounded-xl shadow-lg py-4">
                        <DialogTitle 
                        lang={language === "ua" ? "uk" : "en"}
                        className={"sekuya-regular text-center"}>{t.modalSubtasksTitle}</DialogTitle>
                        <button
                        onClick={() => { setTimeout(() => onClose(), 200) }}
                        className="absolute top-2 right-2 closeIconPlus-btn">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929
                                 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976
                                 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976
                                 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="white"/>
                            </svg>
                        </button>
                            <ul className="flex flex-col gap-1 justify-start items-start mt-3 px-2">
                                {selectedTask?.subtasks?.map((sub, i) => (
                                    <li key={i} className={`flex items-center border rounded-md p-1 w-full space-x-2 text-white break-words-hyphens ` +
                                        (subCompletedMap[selectedTask.id]?.[i]
                                        ? "border-green-500"
                                        : "border-blue-500")
                                    }>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={subCompletedMap[selectedTask.id]?.[i] || false} 
                                                    onChange={() => { setTimeout (() => toggleSubtask(selectedTask.id, i), 200); }}
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
                                            <span>{i + 1}. {sub.title}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-center">
                                <button
                                onClick={() => {
                                    setTimeout(() => onClose(), 200) }}
                                className="mt-4 border-gray-300 border-2 px-3 py-1 rounded-xl closeModal-btn"
                                >
                                    {t.modalSubtasksBtn}
                                </button>
                            </div>
                    </DialogPanel>
                </div>
            </Dialog> 
        )}