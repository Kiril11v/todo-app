import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import { translations } from "../../context/translations";

interface PopupSaveToArchiveProps {
  onClose: () => void;
}

function PopupSaveToArchive({ onClose }: PopupSaveToArchiveProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div
      className="popup-overplay popup-overplay-archive rounded-xl bg-gray-400 text-black"
      onClick={onClose}
    >
      <div className="popup-window p-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-lg font-bold">{t.popupSaveToArchiveTitle}</p>
        <p className="my-1 whitespace-pre-line">{t.popupSaveToArchiveText}</p>
        <button
          className="popup-btn popup-btn-archive btn-style"
          onClick={() => {
            onClose();
            void navigate("/archive");
          }}
        >
          {t.popupSaveToArchiveBtn}
        </button>
      </div>
    </div>
  );
}

export default PopupSaveToArchive;
