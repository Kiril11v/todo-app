import { useRef } from "react"
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";
import { useAnimatedDelay } from "../../hooks/useAnimatedDelay";
import IconClosePlus from "../../icons/IconClosePlus";

function PopupDoneLimit({ onConfirm, onClose }) {
    const { language } = useLanguage();
    const t = translations[language];
    const { ref: btnRef, trigger } = useAnimatedDelay('closingModal', 350);
    const { ref: btnRefClose, trigger: triggerBtn } = useAnimatedDelay('btn-style', 350);

    return (
        <div className="flex justify-center items-center">
            <div 
            className="fixed top-1/3 z-40 popup-window text-black bg-amber-50 border-red-500 border-4"
            >
                <button
                        ref={btnRef}
                        onClick={() => trigger(onClose)}
                        className="absolute top-2 right-2 z-41 closeIconPlus-btn bg-gray-500">
                            <IconClosePlus />
                        </button>
                <p className="text-red-700">{t.popupDoneLimitTitle}</p>
                <p className="my-1">{t.popupDoneLimitText}</p>
                <div className="flex gap-5">
                    <button
                    ref={btnRefClose}
                    onClick={() => triggerBtn(onConfirm)}
                    className="btn-style bg-amber-400 hover:bg-amber-500 border-button"
                    >{t.popupDoneLimitConfirm}</button>
                    <button
                    ref={btnRefClose}
                    onClick={() => triggerBtn(onClose)}
                    className="btn-style bg-red-300 hover:bg-red-400 border-button"
                    >{t.popupDoneLimitCancel}</button>
                </div>  
            </div>
        </div>
        
    );
}

export default PopupDoneLimit;