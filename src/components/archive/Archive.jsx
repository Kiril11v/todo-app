import { useDispatch, useSelector } from "react-redux";
import {
    restoreArchiveRequest,
    deleteArchiveTaskRequest,
    clearArchiveRequest
} from "../../store/taskSlice";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";
import PopupRestoreTask from "../popupRestoreTask/PopupRestoreTask";
import RestoreButtonIcon from "../../icons/IconRestoreButton"
import IconRecycleBin from "../../icons/IconRecycleBin";
import { useEffect, useState, useCallback } from "react";
import "./archive.css"

export default function Archive() {
    const dispatch = useDispatch();
    const archivedTasks = useSelector(s => s.tasks.archivedTasks);

    // language
    const { language } = useLanguage();
    const t = translations[language];

    const [showPopupRestore, setShowPopupRestore] = useState(false);

    const handleRestore = useCallback((id) => {
        dispatch(restoreArchiveRequest(id));
        setShowPopupRestore(true);
    }, [dispatch]);

    const handleDelete = useCallback((id) => {
        dispatch(deleteArchiveTaskRequest(id));
    }, [dispatch]);

    const handleClearArchive = useCallback(() => {
        dispatch(clearArchiveRequest())
    }, [dispatch]);

    useEffect(() => {
        if (!showPopupRestore) return;

        const timer = setTimeout(() => setShowPopupRestore(false), 5000);
        return () => clearTimeout(timer);
    }, [showPopupRestore]);

    return (
        <div className="ubuntu-regular">

            {showPopupRestore && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-40"
                        onClick={() => setShowPopupRestore(false)}
                    />
                    <PopupRestoreTask onClose={() => setShowPopupRestore(false)} />
                </>
            )}

            <h2 
            lang={language === "ua" ? "uk" : "en"}
            className="sekuya-regular mb-5 text-3xl sm:text-5xl">{t.archive}</h2>

            {archivedTasks.length === 0 && <p>{t.archiveText}</p>}

            <ul className="flex flex-col mt-4">
                {archivedTasks.map((task, index) => (
                    <li
                    key={task.id}
                    className="border text-left rounded-md p-3 archive-border"
                    >
                        <div className="flex justify-between items-start gap-2">
                            <div>
                                <span className=" text-left pr-1 ">{index + 1}.</span><span className="break-words-hyphens">{task.title}</span>
                            </div>
                            <div className="flex justify-center items-center gap-2 mb-3 relative">
                                {/* restore btn */}
                                <button className="style-btn" onClick={() => handleRestore(task.id)}>
                                    <RestoreButtonIcon />
                                </button>
                                {/* btn delete */}
                                <button onClick={() => handleDelete(task.id)}
                                    className="style-btn p-0">
                                    <IconRecycleBin />
                                </button>
                                {task.completedAt && (
                                    <div className="absolute right-0 top-8 sm:right-20 sm:top-1.5">
                                        <p className="text-sm text-gray-600">{new Date(task.completedAt).toLocaleDateString("pl-PL")}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {task.subtasks?.length > 0 && (
                        <>
                            <h6 className="sekuya-regular">{t.archiveSubtasks}</h6>
                            <ul>
                                {task.subtasks.map((sub, i) => (
                                    <li key={i} className="break-words-hyphens flex gap-2"><span>✔</span><span>{sub.title}</span></li>
                                ))}
                            </ul>
                        </>
                        )}
                    </li>
                ))}
            </ul>

            {archivedTasks.length > 0 && (
                <div className="flex justify-end">
                    {/* btn clear */}
                    <button onClick={handleClearArchive}
                        className="text-red-60 mt-5 px-7 py-3 rounded-lg error-border cursor-pointer"
                    >
                        {t.archiveClearBtn}
                    </button>
                </div>
            )}
        </div>
    );
}