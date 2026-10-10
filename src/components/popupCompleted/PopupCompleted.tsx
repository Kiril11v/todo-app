import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import { translations } from "../../context/translations";

interface PopupCompletedProps {
  onClose: () => void;
}

function CompletedPopup({ onClose }: PopupCompletedProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div
      className="popup-overlay-completed rounded-xl bg-green-100 text-green-700"
      onClick={onClose}
    >
      <div className="popup-window p-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-lg font-bold">{t.popupCompletedTitle}</p>
        <button
          className="popup-btn-tasks-completed btn-style"
          onClick={() => {
            onClose();
            void navigate("/done");
          }}
        >
          {t.popupCompletedBtn}
        </button>
      </div>
    </div>
  );
}

export default CompletedPopup;
