import { useNavigate } from "react-router-dom"
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";

function CompletedPopup ({ onClose }) {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <div className="popup-overlay-completed rounded-xl bg-green-100 text-green-700"
        onClick={onClose}> 
            <div className="popup-window p-4" 
            onClick={(e) => e.stopPropagation()}
            >
                <p className="text-lg font-bold">{t.popupCompletedTitle}</p>
                <button
                className="popup-btn-tasks-completed btn-style"
                onClick={() => {
                    onClose()
                    navigate("/done")
                }}
                >
                    {t.popupCompletedBtn}
                </button>
            </div>
        </div>
    );
}

export default CompletedPopup;