import { useState, useCallback } from "react"

export function useFixedHeightEdit() {
    const [fixedHeight, setFixedHeight] = useState(null);

    const lockHeight = useCallback((elementId) => {
        const el = document.getElementById(elementId);
        if (el) setFixedHeight(el.offsetHeight + "px");
    }, []);

    const unlockHeight = useCallback(() => {
        setFixedHeight(null);
    }, []);

    return {
        fixedHeight,
        lockHeight,
        unlockHeight
    }
}