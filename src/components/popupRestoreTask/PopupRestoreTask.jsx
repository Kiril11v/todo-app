import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";

function PopupRestoreTask ({ onClose }) {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];

    const goToTask = () => {
        onClose();
        navigate("/tasks");
    }

    return (
        <div className="popup-overplay popup-restore-tasks popup-overplay-restore rounded-xl bg-amber-300 text-black"
        onClick={onClose}>
            <div className="popup-window p-4"
            onClick={(e) => e.stopPropagation()}
            >
                <p className="text-lg font-bold">{t.popupRestoreTaskTitle}</p>
                <p className="my-1 whitespace-pre-line">{t.popupRestoreTaskText}</p>
                <button
                    className="popup-btn popup-btn-restore btn-style"
                    onClick={goToTask}
                >
                    {t.popupRestoreTaskBtn}
                </button>
            </div>
        </div>
    );
}

export default PopupRestoreTask;