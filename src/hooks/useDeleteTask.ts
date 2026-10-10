import { useState, useRef, useEffect, useCallback } from "react";

type DeleteAction = (id: string) => void;

interface UseDeleteTaskResult {
  requestDelete: (id: string) => void;
  isLocked: boolean;
  isDeletingItem: (id: string) => boolean;
}

export function useDeleteTask(
  deleteAction: DeleteAction,
  animationDuration = 500,
): UseDeleteTaskResult {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isDeletingRef = useRef(false);

  const deleteActionRef = useRef(deleteAction);
  useEffect(() => {
    deleteActionRef.current = deleteAction;
  });

  const requestDelete = useCallback(
    (id: string) => {
      if (isDeletingRef.current) return;

      isDeletingRef.current = true;
      setDeletingId(id);

      setTimeout(() => {
        deleteActionRef.current(id);
        setDeletingId(null);
        isDeletingRef.current = false;
      }, animationDuration);
    },
    [animationDuration],
  );

  const isLocked = deletingId !== null;
  const isDeletingItem = useCallback(
    (id: string) => deletingId === id,
    [deletingId],
  );

  return { requestDelete, isLocked, isDeletingItem };
}
