import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import { translations } from "../../context/translations";

interface PopupProps {
    onClose: () => void;
}

function PopupLimit({ onClose }: PopupProps) {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <div className="popup-overlay popup-overlay-limit rounded-xl bg-red-100 text-red-500"
        onClick={onClose}>
            <div className="popup-window p-4"
            onClick={(e) => e.stopPropagation()}
            >
                <p className="text-lg font-bold">{t.popupLimitTitle}</p>
                <p className="text-black my-1">{t.popupLimitText}</p>
                <button
                    className="popup-btn popup-btn-tasks-limit btn-style"
                    onClick={() => {
                        onClose()
                        navigate("/tasks")
                    }}
                >
                    {t.popupLimitBtn}
                </button>
            </div>
        </div>
    );
};

export default PopupLimit;
        