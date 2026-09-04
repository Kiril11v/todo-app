import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";

function PopupDoneLimit({ onClose }) {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <div className="ubuntu-regular popup-overlay popup-overlay-limit rounded-xl bg-red-100 text-red-500"
        onClick={onClose}>
            <div className="popup-window p-4"
            onClick={(e) => e.stopPropagation()}
            >
                <p className="text-lg font-bold"><span className="text-green-800">{t.popupDoneLimitTitleComponent}</span>{t.popupDoneLimitTitle}</p>
                <p className="text-black my-1">{t.popupDoneLimitText}</p>
                <button
                    className="popup-btn popup-btn-tasks-limit btn-style"
                    onClick={() => {
                        onClose()
                        navigate("/done")
                    }}
                >
                    {t.popupDoneLimitBtn}
                </button>
            </div>
        </div>
    );
};

export default PopupDoneLimit;
        