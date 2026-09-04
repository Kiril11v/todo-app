import { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";

const ThemeContext = createContext();

const getInitialTheme = () => {
    if (typeof window === "undefined") return "dark";

    const themeSaved = localStorage.getItem("theme");
    if (themeSaved === "light" || themeSaved === "dark") return themeSaved;

    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
    return prefersLight ? "light" : "dark";
}

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        localStorage.setItem("theme", theme);
        document.documentElement.classList.remove("light-theme", "dark-theme");
        document.documentElement.classList.add(`${theme}-theme`);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    }, []);

    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);