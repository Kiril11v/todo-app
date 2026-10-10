import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import { translations } from "../../context/translations";

interface PopupRestoreTaskProps {
  onClose: () => void;
}

function PopupRestoreTask({ onClose }: PopupRestoreTaskProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div
      className="popup-overplay popup-overplay-restore rounded-xl bg-amber-300 text-black"
      onClick={onClose}
    >
      <div className="popup-window p-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-lg font-bold">{t.popupRestoreTaskTitle}</p>
        <p className="my-1 whitespace-pre-line">{t.popupRestoreTaskText}</p>
        <button
          className="popup-btn popup-btn-restore btn-style"
          onClick={() => {
            onClose();
            void navigate("/tasks");
          }}
        >
          {t.popupRestoreTaskBtn}
        </button>
      </div>
    </div>
  );
}

export default PopupRestoreTask;
