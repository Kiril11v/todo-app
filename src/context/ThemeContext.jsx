import { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

const getInitialTheme = () => {
    const themeSaved = localStorage.getItem("theme");
    return themeSaved === "light"? "light" : "dark";
}

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        localStorage.setItem("theme", theme);
        document.documentElement.classList.remove("light-theme", "dark-theme");
        document.documentElement.classList.add(theme === "light" ? "light-theme" : "dark-theme");
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev =>(prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);