import { useCallback, useEffect, useRef, useState } from "react";

export function useImageAttachment() {
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageFile(file);
        setImagePreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(file);
        });
    }, []);

    const handleRemoveImage = useCallback(() => {
        setImagePreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    useEffect(() => {
        return () => {
            setImagePreview((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return prev;
            });
        };
    }, []);

    const resetFormOnly = useCallback(() => {
        setImageFile(null);
        setImagePreview(null); // без revokeObjectURL — стор теперь владеет этим URL
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);


    return {
        imageFile,
        imagePreview,
        fileInputRef,
        handleImageChange,
        handleRemoveImage,
        resetFormOnly,
    };
}