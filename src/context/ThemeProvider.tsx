import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./ThemeContext";

const getInitialTheme = (): Theme => {
    if (typeof window === "undefined") return "dark";

    const themeSaved = localStorage.getItem("theme");
    if (themeSaved === "light" || themeSaved === "dark") return themeSaved;

    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
    return prefersLight ? "light" : "dark";
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        localStorage.setItem("theme", theme);
        document.documentElement.classList.remove("light-theme", "dark-theme");
        document.documentElement.classList.add(`${theme}-theme`);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    }, []);

    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};