import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

export function useImageAttachment() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);

  const replacePreview = useCallback((file: File | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = file ? URL.createObjectURL(file) : null;
    setImagePreview(urlRef.current);
  }, []);

  const clearInput = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleImageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImageFile(file);
      replacePreview(file);
    },
    [replacePreview],
  );

  const handleRemoveImage = useCallback(() => {
    replacePreview(null);
    setImageFile(null);
    clearInput();
  }, [replacePreview, clearInput]);

  const resetFormOnly = useCallback(() => {
    urlRef.current = null;
    setImagePreview(null);
    setImageFile(null);
    clearInput();
  }, [clearInput]);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
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
