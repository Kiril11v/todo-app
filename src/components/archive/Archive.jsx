import { useDispatch, useSelector } from "react-redux";
import {
    restoreArchiveRequest,
    deleteArchiveTaskRequest,
    clearArchiveRequest
} from "../../store/taskSlice";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";
import PopupRestoreTask from "../popupRestoreTask/PopupRestoreTask";
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
                            <h3 className=" text-left break-words-hyphens pr-1">{index + 1}. {task.title}</h3>
                            <div className="flex items- gap-2 mb-3 relative">
                                {/* restore btn */}
                                <button className="style-btn p-0" onClick={() => handleRestore(task.id)}>
                                    <svg viewBox="0 0 25 25" fill="none" className="w-8 h-8"  xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
                                        <g id="SVGRepo_bgCarrier" strokeWidth="0"/>
                                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"/>
                                        <g id="SVGRepo_iconCarrier"> <path d="M5.88468 17C7.32466 19.1128 9.75033 20.5
                                        12.5 20.5C16.9183 20.5 20.5 16.9183 20.5 12.5C20.5 8.08172 16.9183 4.5 12.5 
                                        4.5C8.08172 4.5 4.5 8.08172 4.5 12.5V13.5M12.5 8V12.5L15.5 15.5" 
                                        strokeWidth="1.2"/> <path d="M7 11L4.5 13.5L2 11" strokeWidth="1.2"/>
                                        </g>
                                    </svg>
                                </button>
                                {/* btn delete */}
                                <button onClick={() => handleDelete(task.id)}
                                    className="style-btn p-0">
                                    <svg 
                                        fill="currentColor"
                                        viewBox="0 0 512 512"
                                        className="w-6 h-6 text-red-500 hover:text-red-700">
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
                                {task.completedAt && (
                                    <div className="absolute right-0 top-8 sm:right-20 sm:top-1.5">
                                        <p className="text-sm text-gray-600">{new Date(task.completedAt).toLocaleDateString("pl-PL")}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {task.subtasks?.length > 0 && (
                        <>
                            <h6>{t.archiveSubtasks}</h6>
                            <ul>
                                {task.subtasks.map((sub, i) => (
                                    <li key={i}>✔ {sub.title}</li>
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