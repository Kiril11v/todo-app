import Portal from "../portal/Portal";

function ModalImage({ src, onClose }) {
    if (!src) return null;

    return (
        <Portal>
            <div 
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
                onClick={onClose}
            >
                <button
                    className="absolute top-4 right-4 text-white text-2xl"
                    onClick={onClose}
                >
                    ✕
                </button>
                <img 
                    src={src}
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
                />
            </div>
        </Portal> 
    );
}

export default ModalImage;