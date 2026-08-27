import { useState, useRef, useCallback } from "react";

export function useDeleteTask(deleteAction, animationDuration = 500) {
    const [deletingId, setDeletingId] = useState(null);
    const isDeletingRef = useRef(false);

    const requestDelete = useCallback((id) => {
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
    const isDeletingItem = useCallback((id) => deletingId === id, [deletingId]);

    return { requestDelete, isLocked, isDeletingItem }
}