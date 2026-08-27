import { useCallback } from "react";

export function useTaskValidation() {
    const validateTask = useCallback((value) => {
        const trimmed = value?.trim() ?? ""
        if (!trimmed.trim()) return "validateTaskEmpty";
        if (trimmed.length < 5) return "validateTaskMin5Characters";
        if (trimmed.length > 50) return "validateTaskMax50Characters";
        return undefined;
    }, []);

    const validateSubtask = useCallback((value) => {
        const trimmed = value?.trim() ?? ""
        if (!trimmed.trim()) return undefined;
        if (trimmed.length < 5) return "validateTaskMin5Characters";
        if (trimmed.length > 50) return "validateTaskMax50Characters";
        return undefined;
    }, []);

    return { validateTask, validateSubtask };
}
