import { useDispatch, useSelector } from "react-redux";
import IconRecycleBin from "../../icons/IconRecycleBin"; 
import IconSaveToArchive from "../../icons/iconSaveToArchive";
import { useEffect, useState, useCallback } from "react"
import { 
    clearAllCompletedTaskRequest,
    archiveTaskRequest,
    deleteCompletedTaskRequest,
    archiveOldestTaskRequest
} from "../../store/taskSlice"
import PopupSaveToArchive from "../../components/popupSaveToArchive/PopupSaveToArchive";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";

import "./Done.css"

function Done() {
    const dispatch = useDispatch();
    const completedTasks = useSelector((s) => s.tasks.completedTasks);

    const [showPopupSaveToArchive, setShowPopupSaveToArchive] = useState(false);

    // language
    const { language } = useLanguage();
    const t = translations[language];

    // the task sends to archive > 15
    useEffect(() => {
        if (completedTasks.length > 15) {
            dispatch(archiveOldestTaskRequest());
        }
    }, [completedTasks, dispatch]);

    // timer popup
    useEffect(() => {
        if (!showPopupSaveToArchive) return;

        const timer = setTimeout(() => setShowPopupSaveToArchive(false), 5000);
        return () => clearTimeout(timer);
    }, [showPopupSaveToArchive]);

    const handleArchive = useCallback(
        (id) => {
            dispatch(archiveTaskRequest(id));
            setShowPopupSaveToArchive(true)
        },
        [dispatch]
    )

    const handleDelete = useCallback(
        (id) => dispatch(deleteCompletedTaskRequest(id)),
        [dispatch]
    );

    const handleClearAll = () => dispatch(clearAllCompletedTaskRequest());

    return (
        <div className="ubuntu-regular">

            {showPopupSaveToArchive && (
                <>
                    <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setShowPopupSaveToArchive(false)}
                    />
                    <PopupSaveToArchive onClose={() => setShowPopupSaveToArchive(false)} />
                </>
                
            )}

            <h1 
            lang={language === "ua" ? "uk" : "en"}
            className={`sekuya-regular mb-5 ${language === "pl" ? "text-2xl sm:text-5xl" : "text-4xl sm:text-5xl"}`}
            >
                {t.done}
            </h1> 

            {completedTasks.length === 0 ? (
                <p className="text-center">{t.doneText}</p>
            ) : (
                <>
                    <ul className="flex flex-col">
                        {completedTasks.map((task) => (
                        <li key={task.id}
                        className="border rounded-lg flex flex-col p-4 shadow-sm space-y-1 done-border relative">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-1">
                                        <svg className="w-6 h-6 shrink-0 done-icon absolute left-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.24"/>
                                        <path d="M8.5 11L10.7929 13.2929C11.1834 13.6834 11.8166 13.6834 12.2071 13.2929L19.5 6"
                                            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                        </svg>
                                        <h3 className=" pl-4 pr-1 text-left break-words-hyphens">{task.title}</h3>
                                    </div>
                                    <div className="flex gap-3 mb-2 relative">
                                        {/* btn save to archive */}
                                        <button className="style-btn" onClick={() => handleArchive(task.id)}>
                                            <IconSaveToArchive />
                                        </button>
                                        {/* btn delete */}
                                        <button className="style-btn" onClick={() => handleDelete(task.id)}>
                                            <IconRecycleBin/>
                                        </button>
                                        {task.completedAt && (
                                            <div className="absolute right-0 top-7 sm:right-20 sm:top-1">
                                                <p className="text-sm text-gray-600">{new Date(task.completedAt).toLocaleDateString("pl-PL")}</p>
                                            </div>
                                        )}
                                </div>
                            </div>
                            {task.subtasks?.length > 0 && (
                            <div className="text-left">
                                <h6 className="sekuya-regular">{t.doneSubtasks}</h6>
                                <ul>
                                    {task.subtasks.map((sub, i) => (
                                    <li key={i} className="break-words-hyphens flex gap-2"><span>✔</span><span>{sub.title}</span></li>
                                    ))}
                                </ul>
                            </div>
                            )}
                    </li>
                    ))}
                </ul>

                <div className="flex justify-end">
                    <button onClick={handleClearAll}
                        className="text-red-60 mt-5 px-7 py-3 rounded-lg error-border cursor-pointer"
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