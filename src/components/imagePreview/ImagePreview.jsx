import { useState } from "react";

import Portal from "../portal/Portal";

import IconRecycleBin from "../../icons/IconRecycleBin";
import IconClosePlus from "../../icons/IconClosePlus";

function ImagePreview({ imagePreview, handleRemoveImage }) {
    const [isOpenImage, setIsOpenImage] = useState(false);

    if (!imagePreview) return null;

    return (
        <>
            <div className="absolute w-fit top-20">
                <div className="flex flex-col items-center justify-center">
                    <img
                        src={imagePreview}
                        onClick={() => setIsOpenImage(true)}
                        alt="preview"
                        className="w-24 h-24 object-cover rounded-lg my-2 cursor-pointer"
                    />
                    <button
                        type="button"
                        className="style-btn"
                        onClick={handleRemoveImage}
                    >
                        <IconRecycleBin />
                    </button>
                </div>
            </div>

            {isOpenImage && (
                <Portal>
                    <div
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
                        onClick={() => setIsOpenImage(false)}
                    >
                        <button
                            className="absolute top-4 right-5 text-white"
                            onClick={() => setIsOpenImage(false)}
                        >
                            <IconClosePlus />
                        </button>

                        <img
                            src={imagePreview}
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
                        />
                    </div>
                </Portal>
            )}
        </>
    );
}

export default ImagePreview;