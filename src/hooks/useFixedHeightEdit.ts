import { useState, useCallback } from "react";

interface UseFixedHeightEditResult {
    fixedHeight: string | null;
    lockHeight: (elementId: string) => void;
    unlockHeight: () => void;
}

export function useFixedHeightEdit(): UseFixedHeightEditResult {
    const [fixedHeight, setFixedHeight] = useState<string | null>(null);

    const lockHeight = useCallback((elementId: string) => {
        const el = document.getElementById(elementId);
        if (el) setFixedHeight(el.offsetHeight + "px");
    }, []);

    const unlockHeight = useCallback(() => {
        setFixedHeight(null);
    }, []);

    return {
        fixedHeight,
        lockHeight,
        unlockHeight,
    };
}