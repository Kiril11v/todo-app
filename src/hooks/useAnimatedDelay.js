import { useRef } from "react";

export function useAnimatedDelay (className, delay) {
    const ref = useRef(null);

    const trigger = (callback) => {
        ref.current?.classList.add(className);
        setTimeout(() => {
            callback();
            ref.current?.classList.remove(className);
        }, delay);
    };

    return { ref, trigger };
}