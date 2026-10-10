import { translations } from "../../context/translations";

import { useLanguage } from "../../hooks/useLanguage";
import { useAnimatedDelay } from "../../hooks/useAnimatedDelay";

import IconClosePlus from "../../icons/IconClosePlus";

interface PopupArchiveLimitProps {
  onConfirm: () => void;
  onClose: () => void;
}

const ANIMATION_DELAY_MS = 350;

function PopupArchiveLimit({ onConfirm, onClose }: PopupArchiveLimitProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const { ref: closeIconRef, trigger: triggerClose } = useAnimatedDelay(
    "closingModal",
    ANIMATION_DELAY_MS,
  );
  const { ref: confirmRef, trigger: triggerConfirm } = useAnimatedDelay(
    "btn-style",
    ANIMATION_DELAY_MS,
  );
  const { ref: cancelRef, trigger: triggerCancel } = useAnimatedDelay(
    "btn-style",
    ANIMATION_DELAY_MS,
  );

  return (
    <div className="flex justify-center items-center">
      <div className="fixed top-1/3 z-40 popup-window text-black bg-gray-400 border-red-500 border-4">
        <button
          type="button"
          ref={closeIconRef}
          onClick={() => triggerClose(onClose)}
          className="absolute top-2 right-2 z-41 closeIconPlus-btn bg-gray-500"
        >
          <IconClosePlus />
        </button>
        <p className="text-red-700">{t.popupArchiveLimitTitle}</p>
        <p className="my-1">{t.popupArchiveLimitText}</p>
        <div className="flex gap-5">
          <button
            type="button"
            ref={confirmRef}
            onClick={() => triggerConfirm(onConfirm)}
            className="btn-style bg-amber-400 hover:bg-amber-500 border-button"
          >
            {t.popupArchiveLimitConfirm}
          </button>
          <button
            type="button"
            ref={cancelRef}
            onClick={() => triggerCancel(onClose)}
            className="btn-style bg-red-300 hover:bg-red-400 border-button"
          >
            {t.popupArchiveLimitCancel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PopupArchiveLimit;
