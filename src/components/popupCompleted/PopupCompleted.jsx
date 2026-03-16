import { useNavigate } from "react-router-dom"
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";

function CompletedPopup ({ onClose }) {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center"
        onClick={onClose}> 
            <div className="popup-window relative bottom-40 right-2  popup-overlay-completed popup-completed-border rounded-xl bg-green-100 text-green-700 " 
            onClick={(e) => e.stopPropagation()}
            >
                <p className="text-lg font-bold">{t.popupCompletedTitle}</p>
                <button
                className="popup-btn popup-btn-tasks-completed btn-style"
                onClick={() => navigate("/done")}
                >
                    {t.popupCompletedBtn}
                </button>
            </div>
        </div>
    );
}

export default CompletedPopup;