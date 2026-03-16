import { createContext, useState, useContext } from "react";
import { useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("theme", theme);

        document.body.classList.remove("light-theme", "dark-theme");
        document.body.classList.add(theme === "light" ? "light-theme" : "dark-theme");
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