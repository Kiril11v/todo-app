import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";

function PopupSaveToArchive ({ onClose }) {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];

    const goToArchive = () => {
        onClose();
        navigate("/archive");
    }

    return (
        <div className="popup-overplay popup-archive-border rounded-xl bg-gray-400 text-black"
        onClick={onClose}>
            <div className="popup-window p-4"
            onClick={(e) => e.stopPropagation()}
            >
                <p className="text-lg font-bold">{t.popupSaveToArchiveTitle}</p>
                <p className="my-1 whitespace-pre-line">{t.popupSaveToArchiveText}</p>
                <button
                    className="popup-btn popup-btn-archive btn-style"
                    onClick={goToArchive}
                >
                    {t.popupSaveToArchiveBtn}
                </button>
            </div>
        </div>
    );
}

export default PopupSaveToArchive;