import { useNavigate } from "react-router-dom"
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";

function PopupCreated ({ onClose }) {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <div className="popup-overlay-created rounded-xl bg-blue-100 text-blue-700"
        onClick={onClose}> 
            <div className="popup-window p-4" 
            onClick={(e) => e.stopPropagation()}
            >
                <p className="text-lg font-bold">{t.popupCreatedTitle}</p>
                <p className="text-black my-1">{t.popupCreatedText}</p>
                <button
                className="popup-btn-tasks-create btn-style"
                onClick={() => navigate("/tasks")}
                >
                    {t.popupCreatedBtn}
                </button>
            </div>
        </div>
    );
}

export default PopupCreated;