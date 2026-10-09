import { useState, useRef, useCallback } from "react";

type DeleteAction = (id: string) => void;

interface UseDeleteTaskResult {
    requestDelete: (id: string) => void;
    isLocked: boolean;
    isDeletingItem: (id: string) => boolean;
}

export function useDeleteTask(deleteAction: DeleteAction, animationDuration = 500): UseDeleteTaskResult {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const isDeletingRef = useRef(false);

    const requestDelete = useCallback((id: string) => {
        if (isDeletingRef.current) return;

        isDeletingRef.current = true;
        setDeletingId(id);

        setTimeout(() => {
            deleteAction(id);
            setDeletingId(null);
            isDeletingRef.current = false;
        }, animationDuration);
    }, [deleteAction, animationDuration]);

    const isLocked = deletingId !== null;
    const isDeletingItem = useCallback((id: string) => deletingId === id, [deletingId]);

    return { requestDelete, isLocked, isDeletingItem }
};