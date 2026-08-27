import { useCallback } from "react";

export function useButtonPress(delay = 200) {
    const handlePress = useCallback((e) => {
        const btn = e.currentTarget;
        btn.classList.add("pressed");

        setTimeout(() => {
            btn.classList.remove("pressed");
        }, delay);
    }, [delay]);

    return { 
        onMouseDown: handlePress,
        onTouchStart: handlePress,
    };
}