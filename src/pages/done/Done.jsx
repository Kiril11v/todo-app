import { useDispatch, useSelector } from "react-redux";
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
                                            <svg className="w-7 h-7 btn-send-archive" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path fill="currentColor" d="M12.558 17.502a.75.75 0 0 1-1.116 0l-3-3.333a.75.75 0 1 1 1.116-1.004l1.692
                                                1.88V7H4c-.15 0-.355 0-.5-.002V13c0 3.771 0 5.657 1.172 6.828C5.843 21 7.729 21 11.5 21h1c3.771 0 5.657 0 
                                                6.828-1.172C20.5 18.657 20.5 16.771 20.5 13V6.998c-.145.002-.35.002-.5.002h-7.25v8.045l1.692-1.88a.75.75 0 
                                                1 1 1.116 1.004l-3 3.333Z"/>
                                                <path fill="currentColor" fillOpacity=".5" d="M2 5c0-.943 0-1.414.293-1.707C2.586 3 3.057 3 4 3h16c.943 0 1.414 0
                                                 1.707.293C22 3.586 22 4.057 22 5c0 .943 0 1.414-.293 1.707C21.414 7 20.943 7 20 7H4c-.943 0-1.414
                                                0-1.707-.293C2 6.414 2 5.943 2 5Z"/>
                                            </svg>
                                        </button>
                                        {/* btn delete */}
                                        <button className="style-btn" onClick={() => handleDelete(task.id)}>
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
                                    <li key={i}>✔ {sub.title}</li>
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