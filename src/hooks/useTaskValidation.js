import { useCallback } from "react";

export function useTaskValidation() {
    const validateTask = useCallback((value) => {
        if (!value?.trim()) return "validateTaskEmpty";
        if (value.length < 5) return "validateTaskMin5Characters";
        if (value.length > 50) return "validateTaskMax50Characters";
        return undefined;
    }, []);

    const validateSubtask = useCallback((value) => {
        if (!value?.trim()) return undefined;
        if (value.length < 5) return "validateTaskMin5Characters";
        if (value.length > 50) return "validateTaskMax50Characters";
        return undefined;
    }, []);

    return { validateTask, validateSubtask };
}
